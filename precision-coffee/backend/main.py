import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
from dataclasses import asdict
from coffee_engine import (
    BeanProfile,
    FeedbackType,
    BrewRecipe,
    PourStage,
    Grinder,
    generate_recipe,
    apply_feedback,
    BARISTA_PRESETS,
    match_presets_by_taste,
)

app = FastAPI(title="Seduhin", version="2.6.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BeanInput(BaseModel):
    origin: str = Field(..., min_length=1, max_length=100, description="Coffee origin (e.g., Ethiopia Yirgacheffe)")
    process: Literal["Washed", "Natural", "Anaerobic"] = Field(..., description="Processing method")
    roast_level: Literal["Light", "Medium", "Dark"] = Field(..., description="Roast level")
    equipment: Literal["V60", "Aeropress", "Chemex", "French Press", "Espresso", "Moka Pot", "Tubruk", "Cold Brew", "Kalita Wave", "Turkish", "Clever Dripper", "Siphon"] = Field(..., description="Brewing equipment")
    grinder: str = Field("Generic (Tanpa Referensi)", description="Grinder model for setting guidance")
    custom_dose: int | None = Field(None, ge=5, le=200, description="Custom coffee dose in grams (5-200)")
    custom_water: int | None = Field(None, ge=10, le=5000, description="Custom water/yield in grams (10-5000)")
    custom_ratio: float | None = Field(None, ge=1.0, le=30.0, description="Custom brew ratio (e.g., 16 for 1:16)")


class PourStageOut(BaseModel):
    label: str
    start_second: int
    duration_seconds: int
    target_water_g: int
    instruction: str


class RecipeOutput(BaseModel):
    dose_g: int
    water_temp_c: int
    grind_size: int
    total_water_g: int
    total_time_s: int
    ratio: float
    equipment: str
    roast_level: str
    stages: list[PourStageOut]
    adjustments: dict = Field(default_factory=dict)
    grinder_info: dict = Field(default_factory=dict)
    is_custom: bool = False


class FeedbackInput(BaseModel):
    feedback: Literal["SOUR", "BITTER"] = Field(..., description="Taste feedback from user")
    current_recipe: RecipeOutput


class RecipeResponse(BaseModel):
    status: str = "success"
    profile: dict
    recipe: RecipeOutput


class FeedbackResponse(BaseModel):
    status: str = "success"
    feedback: str
    original_recipe: RecipeOutput
    adjusted_recipe: RecipeOutput
    recommendation: str


def _profile_to_dict(p: BeanProfile) -> dict:
    return {"origin": p.origin, "process": p.process, "roast_level": p.roast_level, "equipment": p.equipment}


def _recipe_to_output(r: BrewRecipe) -> RecipeOutput:
    return RecipeOutput(
        dose_g=r.dose_g,
        water_temp_c=r.water_temp_c,
        grind_size=r.grind_size,
        total_water_g=r.total_water_g,
        total_time_s=r.total_time_s,
        ratio=r.ratio,
        equipment=r.equipment,
        roast_level=r.roast_level,
        stages=[PourStageOut(**asdict(s)) for s in r.stages],
        adjustments=r.adjustments,
        grinder_info=r.grinder_info,
        is_custom=r.is_custom,
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Seduhin"}


@app.get("/api/presets")
async def get_presets():
    return {"status": "success", "presets": BARISTA_PRESETS}


@app.get("/api/taste-match")
async def taste_match(q: str = ""):
    results = match_presets_by_taste(q)
    return {"status": "success", "query": q, "results": results}


@app.post("/api/recipe", response_model=RecipeResponse)
async def create_recipe(bean_input: BeanInput):
    profile = BeanProfile(
        origin=bean_input.origin.strip(),
        process=bean_input.process,
        roast_level=bean_input.roast_level,
        equipment=bean_input.equipment,
        grinder=bean_input.grinder,
        custom_dose=bean_input.custom_dose,
        custom_water=bean_input.custom_water,
        custom_ratio=bean_input.custom_ratio,
    )
    try:
        recipe = generate_recipe(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {e}")
    return RecipeResponse(profile=_profile_to_dict(profile), recipe=_recipe_to_output(recipe))


@app.post("/api/feedback", response_model=FeedbackResponse)
async def process_feedback(fb: FeedbackInput):
    current = BrewRecipe(
        dose_g=fb.current_recipe.dose_g,
        water_temp_c=fb.current_recipe.water_temp_c,
        grind_size=fb.current_recipe.grind_size,
        total_water_g=fb.current_recipe.total_water_g,
        total_time_s=fb.current_recipe.total_time_s,
        ratio=fb.current_recipe.ratio,
        equipment=fb.current_recipe.equipment,
        roast_level=fb.current_recipe.roast_level,
        stages=[PourStage(**s.model_dump()) for s in fb.current_recipe.stages],
        grinder_info=fb.current_recipe.grinder_info,
        is_custom=fb.current_recipe.is_custom,
    )
    adjusted = apply_feedback(current, fb.feedback)
    return FeedbackResponse(
        feedback=fb.feedback,
        original_recipe=_recipe_to_output(current),
        adjusted_recipe=_recipe_to_output(adjusted),
        recommendation=adjusted.adjustments.get("reason", ""),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
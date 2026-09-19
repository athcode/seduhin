"""Shared Pydantic models + converters. Dipakai backend/main.py (localhost + Vercel service 'api')."""
from dataclasses import asdict
from typing import Literal

from pydantic import BaseModel, Field

from coffee_engine import (
    BeanProfile,
    BrewRecipe,
    PourStage,
    apply_feedback,
    generate_recipe,
)

EquipmentLiteral = Literal[
    "V60", "Aeropress", "Chemex", "French Press", "Espresso", "Moka Pot",
    "Tubruk", "Cold Brew", "Kalita Wave", "Turkish", "Clever Dripper", "Siphon",
]


class BeanInput(BaseModel):
    origin: str = Field(..., min_length=1, max_length=100, description="Coffee origin (e.g., Ethiopia Yirgacheffe)")
    process: Literal["Washed", "Natural", "Anaerobic"] = Field(..., description="Processing method")
    roast_level: Literal["Light", "Medium", "Dark"] = Field(..., description="Roast level")
    equipment: EquipmentLiteral = Field(..., description="Brewing equipment")
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


def profile_to_dict(p: BeanProfile) -> dict:
    return {"origin": p.origin, "process": p.process, "roast_level": p.roast_level, "equipment": p.equipment}


def recipe_to_output(r: BrewRecipe) -> RecipeOutput:
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


def output_to_recipe(o: RecipeOutput) -> BrewRecipe:
    return BrewRecipe(
        dose_g=o.dose_g,
        water_temp_c=o.water_temp_c,
        grind_size=o.grind_size,
        total_water_g=o.total_water_g,
        total_time_s=o.total_time_s,
        ratio=o.ratio,
        equipment=o.equipment,
        roast_level=o.roast_level,
        stages=[PourStage(**s.model_dump()) for s in o.stages],
        grinder_info=o.grinder_info,
        is_custom=o.is_custom,
    )


def build_bean_profile(bean_input: BeanInput) -> BeanProfile:
    return BeanProfile(
        origin=bean_input.origin.strip(),
        process=bean_input.process,
        roast_level=bean_input.roast_level,
        equipment=bean_input.equipment,
        grinder=bean_input.grinder,
        custom_dose=bean_input.custom_dose,
        custom_water=bean_input.custom_water,
        custom_ratio=bean_input.custom_ratio,
    )

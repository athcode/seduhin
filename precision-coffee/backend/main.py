import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from coffee_engine import (
    BARISTA_PRESETS,
    apply_feedback,
    generate_recipe,
    match_presets_by_taste,
)
from models import (
    BeanInput,
    FeedbackInput,
    FeedbackResponse,
    RecipeResponse,
    build_bean_profile,
    output_to_recipe,
    profile_to_dict,
    recipe_to_output,
)

app = FastAPI(title="Seduhin", version="2.11.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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
    profile = build_bean_profile(bean_input)
    try:
        recipe = generate_recipe(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {e}")
    return RecipeResponse(profile=profile_to_dict(profile), recipe=recipe_to_output(recipe))


@app.post("/api/feedback", response_model=FeedbackResponse)
async def process_feedback(fb: FeedbackInput):
    current = output_to_recipe(fb.current_recipe)
    adjusted = apply_feedback(current, fb.feedback)
    return FeedbackResponse(
        feedback=fb.feedback,
        original_recipe=recipe_to_output(current),
        adjusted_recipe=recipe_to_output(adjusted),
        recommendation=adjusted.adjustments.get("reason", ""),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

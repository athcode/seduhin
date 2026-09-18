import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi import FastAPI, HTTPException

from coffee_engine import generate_recipe
from models import (
    BeanInput,
    RecipeResponse,
    build_bean_profile,
    profile_to_dict,
    recipe_to_output,
)

app = FastAPI()


@app.api_route("/{path:path}", methods=["POST"], include_in_schema=False)
async def create_recipe(path: str, bean_input: BeanInput) -> RecipeResponse:
    profile = build_bean_profile(bean_input)
    try:
        recipe = generate_recipe(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {e}")
    return RecipeResponse(profile=profile_to_dict(profile), recipe=recipe_to_output(recipe))

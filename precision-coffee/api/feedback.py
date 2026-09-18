import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi import FastAPI

from coffee_engine import apply_feedback
from models import (
    FeedbackInput,
    FeedbackResponse,
    output_to_recipe,
    recipe_to_output,
)

app = FastAPI()


@app.api_route("/{path:path}", methods=["POST"], include_in_schema=False)
async def process_feedback(path: str, fb: FeedbackInput) -> FeedbackResponse:
    current = output_to_recipe(fb.current_recipe)
    adjusted = apply_feedback(current, fb.feedback)
    return FeedbackResponse(
        feedback=fb.feedback,
        original_recipe=recipe_to_output(current),
        adjusted_recipe=recipe_to_output(adjusted),
        recommendation=adjusted.adjustments.get("reason", ""),
    )

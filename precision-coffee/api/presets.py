import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi import FastAPI

from coffee_engine import BARISTA_PRESETS

app = FastAPI()


@app.api_route("/{path:path}", methods=["GET"], include_in_schema=False)
async def get_presets(path: str):
    return {"status": "success", "presets": BARISTA_PRESETS}

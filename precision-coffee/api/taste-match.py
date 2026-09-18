import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from fastapi import FastAPI

from coffee_engine import match_presets_by_taste

app = FastAPI()


@app.api_route("/{path:path}", methods=["GET"], include_in_schema=False)
async def taste_match(path: str, q: str = ""):
    results = match_presets_by_taste(q)
    return {"status": "success", "query": q, "results": results}

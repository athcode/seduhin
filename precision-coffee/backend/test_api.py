"""API-layer smoke test via FastAPI TestClient. Run: python test_api.py"""
import sys

sys.path.insert(0, ".")

try:
    from fastapi.testclient import TestClient
except ImportError:
    print("SKIP: httpx not installed (TestClient unavailable)")
    sys.exit(0)

from main import app

client = TestClient(app)
failures = []


def check(name, cond, extra=""):
    print(f"{'PASS' if cond else 'FAIL'}  {name} {extra}")
    if not cond:
        failures.append(name)


# health
r = client.get("/api/health")
check("health", r.status_code == 200 and r.json()["status"] == "ok")

# presets
r = client.get("/api/presets")
check("presets", r.status_code == 200 and len(r.json()["presets"]) == 18)

# taste-match
r = client.get("/api/taste-match?q=fruity")
check("taste-match", r.status_code == 200 and len(r.json()["results"]) > 0)

# recipe with real grinder
payload = {
    "origin": "Ethiopia Yirgacheffe",
    "process": "Washed",
    "roast_level": "Light",
    "equipment": "V60",
    "grinder": "Comandante C40",
}
r = client.post("/api/recipe", json=payload)
check("recipe 200", r.status_code == 200, str(r.status_code))
rec = r.json()["recipe"]
check("recipe grinder set", rec["grinder_info"]["grinder"] == "Comandante C40", rec["grinder_info"]["grinder"])
check("recipe stages", len(rec["stages"]) == 3)

# feedback — does the grinder survive a round-trip through the API?
r2 = client.post("/api/feedback", json={"feedback": "SOUR", "current_recipe": rec})
check("feedback 200", r2.status_code == 200, str(r2.status_code))
adj = r2.json()["adjusted_recipe"]
check("grinder survives feedback API", adj["grinder_info"]["grinder"] == "Comandante C40",
      f"after={adj['grinder_info']['grinder']}")
check("is_custom survives feedback API", adj.get("is_custom") == rec.get("is_custom"),
      f"after={adj.get('is_custom')} before={rec.get('is_custom')}")

# validation: bad enum
r = client.post("/api/recipe", json={**payload, "roast_level": "Ultra"})
check("reject bad roast", r.status_code == 422)

# validation: dose out of range
r = client.post("/api/recipe", json={**payload, "custom_dose": 999})
check("reject huge dose", r.status_code == 422)

# missing origin
r = client.post("/api/recipe", json={**payload, "origin": ""})
check("reject empty origin", r.status_code == 422)

print()
print(f"=== {len(failures)} failures ===")
for f in failures:
    print(" -", f)
sys.exit(1 if failures else 0)

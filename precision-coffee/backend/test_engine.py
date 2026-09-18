"""Smoke test: exercise every endpoint path + engine logic. Run: python test_engine.py"""
import json
import sys

sys.path.insert(0, ".")

from coffee_engine import (
    BeanProfile,
    BrewRecipe,
    PourStage,
    generate_recipe,
    apply_feedback,
    BARISTA_PRESETS,
    match_presets_by_taste,
    get_grinder_setting,
    STAGE_BUILDERS,
    DOSES,
    RATIOS,
    TEMP_BASE,
)

failures = []


def check(name, cond, extra=""):
    print(f"{'PASS' if cond else 'FAIL'}  {name} {extra}")
    if not cond:
        failures.append(name)


# 1. Every equipment has dose/ratio/temp/stage builder
from coffee_engine import GRIND_OFFSETS, ROAST_GRIND_BASE

EQS = ["V60", "Aeropress", "Chemex", "French Press", "Espresso", "Moka Pot",
       "Tubruk", "Cold Brew", "Kalita Wave", "Turkish", "Clever Dripper", "Siphon"]
for eq in EQS:
    check(f"tables[{eq}]", eq in DOSES and eq in RATIOS and eq in TEMP_BASE and eq in STAGE_BUILDERS and eq in GRIND_OFFSETS)

# 2. Generate recipe for every equipment x roast x process
grinders_seen = set()
for eq in EQS:
    for roast in ["Light", "Medium", "Dark"]:
        for proc in ["Washed", "Natural", "Anaerobic"]:
            p = BeanProfile(origin="Test", process=proc, roast_level=roast, equipment=eq)
            r = generate_recipe(p)
            ok = (
                5 <= r.dose_g <= 200
                and 0 <= r.grind_size <= 100
                and r.total_water_g > 0
                and r.total_time_s > 0
                and len(r.stages) > 0
                and r.grinder_info.get("grinder") == "Generic (Tanpa Referensi)"
                and abs(r.total_water_g - r.dose_g * r.ratio) <= max(2, r.dose_g * 0.01)
            )
            check(f"recipe {eq}/{roast}/{proc}", ok,
                  f"dose={r.dose_g} water={r.total_water_g} ratio={r.ratio} grind={r.grind_size} t={r.total_time_s}")
            grinders_seen.add(r.grinder_info.get("grinder"))

# 3. Stage timeline integrity: start+duration chains, no negative, water monotonic
for eq in EQS:
    p = BeanProfile(origin="T", process="Washed", roast_level="Medium", equipment=eq)
    r = generate_recipe(p)
    stages = r.stages
    timeline_ok = all(s.start_second >= 0 and s.duration_seconds > 0 for s in stages)
    chain_ok = all(stages[i + 1].start_second >= stages[i].start_second for i in range(len(stages) - 1))
    end_ok = stages[-1].start_second + stages[-1].duration_seconds <= r.total_time_s
    check(f"timeline {eq}", timeline_ok and chain_ok and end_ok,
          f"last_end={stages[-1].start_second + stages[-1].duration_seconds} total={r.total_time_s}")

# 4. Grinder reference: every grinder produces sane setting for whole range
GRINDERS = list(get_grinder_setting.__defaults__ or [])
from coffee_engine import GRINDER_REFERENCE

for g in GRINDER_REFERENCE:
    for gs in [0, 15, 30, 45, 60, 75, 90, 100]:
        info = get_grinder_setting(g, gs)
        check(f"grinder {g} @{gs}", "setting" in info and "texture" in info, str(info.get("setting")))

# 5. FEEDBACK: grinder reference must survive adjustment  <-- suspected bug
for g in ["Timemore C2/C3", "Comandante C40", "1Zpresso J-Ultra"]:
    p = BeanProfile(origin="T", process="Washed", roast_level="Light", equipment="V60", grinder=g)
    r = generate_recipe(p)
    before = r.grinder_info["grinder"]
    adj = apply_feedback(r, "SOUR")
    after = adj.grinder_info.get("grinder")
    check(f"feedback grinder survives {g}", after == before, f"before={before} after={after}")

# 6. Feedback direction: SOUR finer, BITTER coarser
p = BeanProfile(origin="T", process="Washed", roast_level="Medium", equipment="V60")
r = generate_recipe(p)
sour = apply_feedback(r, "SOUR")
bit = apply_feedback(r, "BITTER")
check("SOUR finer", sour.grind_size <= r.grind_size, f"{r.grind_size}->{sour.grind_size}")
check("BITTER coarser", bit.grind_size >= r.grind_size, f"{r.grind_size}->{bit.grind_size}")
check("SOUR temp up (unlocked)", sour.water_temp_c >= r.water_temp_c)
check("BITTER temp down (unlocked)", bit.water_temp_c <= r.water_temp_c)

# 7. Temp lock respected
for eq in ["Cold Brew", "Moka Pot", "Turkish"]:
    p = BeanProfile(origin="T", process="Washed", roast_level="Medium", equipment=eq)
    r = generate_recipe(p)
    s = apply_feedback(r, "SOUR")
    b = apply_feedback(r, "BITTER")
    check(f"temp locked {eq}", s.water_temp_c == r.water_temp_c == b.water_temp_c,
          f"{r.water_temp_c}")

# 8. Temperature boundaries (SKILL.md: 80-100 for hot methods)
for eq in EQS:
    if eq == "Cold Brew":
        continue
    for roast in ["Light", "Medium", "Dark"]:
        p = BeanProfile(origin="T", process="Washed", roast_level=roast, equipment=eq)
        r = generate_recipe(p)
        # Moka Pot/Turkish intentionally hit 100; allow 100 ceiling
        check(f"temp range {eq}/{roast}", 80 <= r.water_temp_c <= 100, f"{r.water_temp_c}C")

# 9. Presets: ids unique, equipment valid, taste match works
ids = [p["id"] for p in BARISTA_PRESETS]
check("preset ids unique", len(ids) == len(set(ids)), f"{len(ids)} presets")
for p in BARISTA_PRESETS:
    check(f"preset {p['id']} valid eq", p["equipment"] in EQS and p["dose"] > 0 and p["ratio"] > 0)
res = match_presets_by_taste("fruity bright")
check("taste match returns", len(res) > 0 and all("match_score" in x for x in res), f"{len(res)} hits")
check("taste match empty q", match_presets_by_taste("") == [])

# 10. Custom dose/ratio/water combinations
cases = [
    ("dose+water", dict(custom_dose=20, custom_water=320)),
    ("dose+ratio", dict(custom_dose=20, custom_ratio=16.0)),
    ("dose only", dict(custom_dose=22)),
    ("water only", dict(custom_water=500)),
    ("ratio only", dict(custom_ratio=17.0)),
]
for name, kw in cases:
    p = BeanProfile(origin="T", process="Washed", roast_level="Medium", equipment="V60", **kw)
    r = generate_recipe(p)
    check(f"custom {name}", r.is_custom is True and r.total_water_g > 0,
          f"dose={r.dose_g} water={r.total_water_g} ratio={r.ratio}")

print()
print(f"=== {len(failures)} failures ===")
for f in failures:
    print(" -", f)
sys.exit(1 if failures else 0)

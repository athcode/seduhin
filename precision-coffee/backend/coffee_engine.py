from dataclasses import dataclass, field
from typing import Literal

Origin = str
Process = Literal["Washed", "Natural", "Anaerobic"]
RoastLevel = Literal["Light", "Medium", "Dark"]
Equipment = Literal[
    "V60", "Aeropress", "Chemex",
    "French Press", "Espresso", "Moka Pot",
    "Tubruk", "Cold Brew", "Kalita Wave",
    "Turkish", "Clever Dripper", "Siphon",
]
FeedbackType = Literal["SOUR", "BITTER"]

DOSES: dict[Equipment, int] = {
    "V60": 18, "Aeropress": 16, "Chemex": 25,
    "French Press": 30, "Espresso": 18, "Moka Pot": 18,
    "Tubruk": 18, "Cold Brew": 80, "Kalita Wave": 18,
    "Turkish": 7, "Clever Dripper": 18, "Siphon": 25,
}

RATIOS: dict[Equipment, float] = {
    "V60": 16.0, "Aeropress": 15.0, "Chemex": 16.0,
    "French Press": 15.0, "Espresso": 2.0, "Moka Pot": 7.0,
    "Tubruk": 12.0, "Cold Brew": 5.0, "Kalita Wave": 16.0,
    "Turkish": 10.0, "Clever Dripper": 16.0, "Siphon": 15.0,
}

TEMP_BASE: dict[Equipment, dict[RoastLevel, int]] = {
    "V60":        {"Light": 95, "Medium": 90, "Dark": 85},
    "Aeropress":  {"Light": 95, "Medium": 90, "Dark": 85},
    "Chemex":     {"Light": 95, "Medium": 90, "Dark": 85},
    "French Press":{"Light": 95, "Medium": 90, "Dark": 85},
    "Espresso":   {"Light": 95, "Medium": 93, "Dark": 90},
    "Moka Pot":   {"Light": 100, "Medium": 98, "Dark": 95},
    "Tubruk":     {"Light": 95, "Medium": 90, "Dark": 85},
    "Cold Brew":  {"Light": 22, "Medium": 22, "Dark": 22},
    "Kalita Wave":{"Light": 95, "Medium": 90, "Dark": 85},
    "Turkish":    {"Light": 100, "Medium": 100, "Dark": 100},
    "Clever Dripper":{"Light": 95, "Medium": 90, "Dark": 85},
    "Siphon":     {"Light": 95, "Medium": 90, "Dark": 85},
}

GRIND_OFFSETS: dict[Equipment, int] = {
    "V60": 0, "Aeropress": 0, "Chemex": 0,
    "French Press": 30, "Espresso": -25, "Moka Pot": -12,
    "Tubruk": 25, "Cold Brew": 35, "Kalita Wave": 5,
    "Turkish": -45, "Clever Dripper": 5, "Siphon": 5,
}

ROAST_GRIND_BASE: dict[str, dict[RoastLevel, int]] = {
    "standard": {"Light": 30, "Medium": 45, "Dark": 60},
    "espresso": {"Light": 30, "Medium": 27, "Dark": 25},
    "turkish":  {"Light": 47, "Medium": 45, "Dark": 42},
}

METHOD_GRIND_CATEGORY: dict[Equipment, str] = {
    "Espresso": "espresso",
    "Turkish": "turkish",
}

FEEDBACK_LOCK_TEMP: set[Equipment] = {"Cold Brew", "Moka Pot", "Turkish"}

Grinder = Literal[
    "Timemore C2/C3", "Timemore C3 ESP", "Timemore Chestnut X",
    "Timemore C5 ESP", "Comandante C40",
    "1Zpresso JX/J-Max", "1Zpresso J-Ultra", "1Zpresso K-Series",
    "Baratza Encore", "Fellow Ode Gen 2", "Kingrinder K6",
    "DF64 Gen 2", "Niche Zero", "Eureka Mignon",
    "Option-O Lagom Mini", "Hario Skerton",
    "Generic (Tanpa Referensi)",
]

TEXTURE_SCALE: list[tuple[int, int, str, str]] = [
    (0, 10, "Extra Fine", "seperti tepung/bedak, Turkish"),
    (10, 25, "Fine", "seperti garam meja halus, Espresso"),
    (25, 40, "Medium-Fine", "seperti pasir halus, Moka Pot, Aeropress"),
    (40, 55, "Medium", "seperti garam laut, V60, Kalita, Clever"),
    (55, 70, "Medium-Coarse", "seperti pasir kasar, Chemex, Siphon"),
    (70, 85, "Coarse", "seperti garam kosher, French Press, Tubruk"),
    (85, 100, "Extra Coarse", "seperti butiran merica, Cold Brew"),
]


def get_texture(grind_size: int) -> str:
    for lo, hi, label, desc in TEXTURE_SCALE:
        if grind_size <= hi:
            return f"{label}: {desc}"
    return "Unknown"


GRINDER_REFERENCE: dict[Grinder, dict[str, object]] = {
    "Timemore C2/C3": {
        "type": "Manual, Burr Conical 38mm",
        "unit": "clicks dari posisi terkunci (burr lock)",
        "anchors": {0: 7, 15: 12, 30: 16, 45: 20, 55: 24, 65: 28, 80: 32, 100: 36},
    },
    "Timemore C3 ESP": {
        "type": "Manual, Burr Conical 38mm (ESP = 0.025mm/click, finer adjustment)",
        "unit": "clicks dari posisi terkunci",
        "anchors": {0: 4, 15: 8, 30: 12, 45: 16, 55: 20, 65: 24, 80: 28, 100: 32},
    },
    "Timemore Chestnut X": {
        "type": "Manual, Burr Conical 42mm",
        "unit": "clicks dari posisi terkunci",
        "anchors": {0: 4, 15: 8, 30: 12, 45: 16, 55: 20, 65: 24, 80: 28, 100: 32},
    },
    "Timemore C5 ESP": {
        "type": "Manual, Burr Conical (ESP geometry, optimized for espresso range)",
        "unit": "clicks dari posisi terkunci",
        "anchors": {0: 3, 15: 6, 30: 10, 45: 14, 55: 18, 65: 22, 80: 26, 100: 30},
    },
    "Comandante C40": {
        "type": "Manual, Burr Conical 39mm (High Uniformity)",
        "unit": "clicks dari posisi terkunci",
        "anchors": {0: 8, 15: 18, 30: 25, 45: 30, 55: 34, 65: 38, 80: 44, 100: 50},
    },
    "1Zpresso JX/J-Max": {
        "type": "Manual, Burr Conical 48mm",
        "unit": "angka pada adjustment ring (1 putaran = 10 angka)",
        "anchors": {0: 12, 15: 18, 30: 24, 45: 30, 55: 36, 65: 42, 80: 50, 100: 60},
    },
    "1Zpresso J-Ultra": {
        "type": "Manual, Burr Conical 48mm (8 micron/click, espresso-focused)",
        "unit": "clicks dari posisi terkunci (1 putaran = 100 clicks)",
        "anchors": {0: 40, 15: 55, 30: 70, 45: 90, 55: 110, 65: 130, 80: 160, 100: 200},
    },
    "1Zpresso K-Series": {
        "type": "Manual, Burr Conical 48mm (K-Ultra/K-Plus)",
        "unit": "angka pada adjustment ring (1 putaran = 10 angka)",
        "anchors": {0: 25, 15: 35, 30: 45, 45: 55, 55: 65, 65: 75, 80: 85, 100: 100},
    },
    "Baratza Encore": {
        "type": "Electric, Burr Conical 40mm",
        "unit": "setting 1-40 pada hopper",
        "anchors": {0: 3, 15: 8, 30: 14, 45: 18, 55: 22, 65: 26, 80: 32, 100: 40},
    },
    "Fellow Ode Gen 2": {
        "type": "Electric, Burr Flat 64mm",
        "unit": "setting 1-11 pada dial",
        "anchors": {0: 1, 15: 2, 30: 4, 45: 5, 55: 7, 65: 8, 80: 10, 100: 11},
    },
    "Kingrinder K6": {
        "type": "Manual, Burr Conical 48mm",
        "unit": "clicks dari posisi terkunci",
        "anchors": {0: 25, 15: 35, 30: 48, 45: 65, 55: 80, 65: 90, 80: 100, 100: 120},
    },
    "DF64 Gen 2": {
        "type": "Electric, Burr Flat 64mm (stepless)",
        "unit": "pada indikator 0-90",
        "anchors": {0: 3, 15: 7, 30: 15, 45: 25, 55: 35, 65: 45, 80: 60, 100: 85},
    },
    "Niche Zero": {
        "type": "Electric, Burr Conical 63mm (stepless, espresso-focused)",
        "unit": "pada indikator dot (0-50)",
        "anchors": {0: 3, 15: 8, 30: 15, 45: 22, 55: 28, 65: 32, 80: 40, 100: 50},
    },
    "Eureka Mignon": {
        "type": "Electric, Burr Flat 50mm/55mm (Specialita/Silenzio, stepless)",
        "unit": "pada knob 0-9 (stepless, 1 putaran penuh = 5 angka)",
        "anchors": {0: 0.3, 15: 1.0, 30: 2.0, 45: 3.0, 55: 4.0, 65: 5.0, 80: 7.0, 100: 9.0},
    },
    "Option-O Lagom Mini": {
        "type": "Electric, Burr Conical 38mm (stepless)",
        "unit": "pada indikator dot (0-10)",
        "anchors": {0: 0.3, 15: 1.0, 30: 2.5, 45: 4.0, 55: 5.5, 65: 7.0, 80: 8.5, 100: 10.0},
    },
    "Hario Skerton": {
        "type": "Manual, Burr Ceramic",
        "unit": "notch dari posisi terkunci",
        "anchors": {0: 3, 15: 5, 30: 7, 45: 9, 55: 11, 65: 13, 80: 15, 100: 18},
    },
    "Generic (Tanpa Referensi)": {
        "type": "Universal",
        "unit": "skala 0-100",
        "anchors": {},
    },
}


def get_grinder_setting(grinder: Grinder, grind_size: int) -> dict:
    ref = GRINDER_REFERENCE[grinder]
    anchors = ref["anchors"]
    if not anchors:
        setting = grind_size
    else:
        keys = sorted(anchors.keys())
        if grind_size <= keys[0]:
            setting = anchors[keys[0]]
        elif grind_size >= keys[-1]:
            setting = anchors[keys[-1]]
        else:
            for i in range(len(keys) - 1):
                if keys[i] <= grind_size <= keys[i + 1]:
                    t = (grind_size - keys[i]) / (keys[i + 1] - keys[i])
                    setting = anchors[keys[i]] + t * (anchors[keys[i + 1]] - anchors[keys[i]])
                    setting = round(setting)
                    break
            else:
                setting = grind_size

    return {
        "grinder": grinder,
        "type": ref["type"],
        "unit": ref["unit"],
        "setting": setting,
        "texture": get_texture(grind_size),
    }


BARISTA_PRESETS: list[dict] = [
    # ── V60 ──
    {
        "id": "hoffmann-v60",
        "name": "Hoffmann Ultimate V60",
        "barista": "James Hoffmann",
        "equipment": "V60",
        "dose": 30, "ratio": 16.7,
        "description": "Single pour setelah bloom. Spin setelah tuang untuk flat bed. Medium-fine grind, 95-98°C.",
        "tags": ["champion", "single-pour", "clean"],
        "taste_notes": "Clean, balanced, high clarity. Sweetness menonjol dengan acidity yang terintegrasi. Tidak ada bitterness.",
        "taste_keywords": ["clean", "balanced", "sweet", "bright", "smooth", "clarity"],
    },
    {
        "id": "kasuya-46",
        "name": "Kasuya 4:6 Method",
        "barista": "Tetsu Kasuya",
        "equipment": "V60",
        "dose": 20, "ratio": 15.0,
        "description": "5 kali tuang: 40% pertama kontrol rasa (asam/manis), 60% sisanya kontrol kekuatan. Coarse grind, 90-93°C.",
        "tags": ["champion", "4:6", "coarse"],
        "taste_notes": "Bright acidity, sweetness forward. Body ringan seperti teh. Kamu bisa tuning acidity/sweetness dengan mengatur 40% pertama.",
        "taste_keywords": ["bright", "sweet", "tea-like", "light-body", "acidic", "fruity"],
    },
    {
        "id": "rao-v60",
        "name": "Rao Single Pour V60",
        "barista": "Scott Rao",
        "equipment": "V60",
        "dose": 22, "ratio": 16.4,
        "description": "Bloom 3x berat kopi, lalu single pour kontinyu. Spin setelah tuang untuk meratakan ekstraksi. 93-96°C.",
        "tags": ["single-pour", "spin", "even-extraction"],
        "taste_notes": "High extraction yield, full sweetness, balanced body. Even extraction, tidak ada channeling atau dry spots.",
        "taste_keywords": ["sweet", "full-body", "balanced", "rich", "smooth"],
    },
    {
        "id": "onyx-v60",
        "name": "Onyx Standard V60",
        "barista": "Onyx Coffee Lab",
        "equipment": "V60",
        "dose": 25, "ratio": 16.0,
        "description": "3-pour method. Bloom + 2 pulse pours. Medium-fine grind, 93°C. Flat bed after drawdown.",
        "tags": ["specialty", "3-pour", "balanced"],
        "taste_notes": "Balanced & approachable. Sweetness + acidity harmonis. Cocok untuk daily driver dengan berbagai jenis beans.",
        "taste_keywords": ["balanced", "approachable", "sweet", "smooth", "daily"],
    },
    {
        "id": "april-v60",
        "name": "April Coffee V60",
        "barista": "Patrik Rolf",
        "equipment": "V60",
        "dose": 20, "ratio": 15.0,
        "description": "Low-temp pour-over. 2 pours total. 91-92°C, medium-coarse. Fokus clarity dan sweetness.",
        "tags": ["low-temp", "clarity", "2-pour"],
        "taste_notes": "Exceptional clarity & sweetness. Acidity terdefinisi jelas: floral, fruity. Body ringan, finish bersih.",
        "taste_keywords": ["floral", "fruity", "clarity", "sweet", "light-body", "clean"],
    },
    # ── AEROPRESS ──
    {
        "id": "hoffmann-aeropress",
        "name": "Hoffmann Aeropress",
        "barista": "James Hoffmann",
        "equipment": "Aeropress",
        "dose": 11, "ratio": 18.0,
        "description": "Inverted method opsional. 11g kopi, 200g air. Aduk, diamkan 2 menit, swirl, press 30 detik. 95°C.",
        "tags": ["champion", "light-body", "clean"],
        "taste_notes": "Clean & tea-like. High extraction dengan dosis kecil. Acidity cerah, body ringan. Sangat berbeda dari Aeropress biasanya.",
        "taste_keywords": ["clean", "tea-like", "bright", "light-body", "smooth"],
    },
    {
        "id": "wendelboe-aeropress",
        "name": "Wendelboe Aeropress",
        "barista": "Tim Wendelboe",
        "equipment": "Aeropress",
        "dose": 14, "ratio": 14.3,
        "description": "14g kopi, 200g air. 1 menit steep, slow press. Medium-fine grind, 92-95°C. Nordic style: clean & bright.",
        "tags": ["nordic", "bright", "quick"],
        "taste_notes": "Nordic brightness: acidity tinggi, floral notes, lemon zest. Body ringan, finish cepat & bersih. Perfect untuk light roast.",
        "taste_keywords": ["acidic", "floral", "bright", "citrus", "light-body", "clean"],
    },
    # ── CHEMEX ──
    {
        "id": "howell-chemex",
        "name": "Howell Chemex",
        "barista": "George Howell",
        "equipment": "Chemex",
        "dose": 50, "ratio": 16.0,
        "description": "Batch besar: 50g kopi, 800g air. 3-4 pours, medium-coarse grind. 93-96°C. Crisp & clean.",
        "tags": ["large-batch", "crisp", "classic"],
        "taste_notes": "Crisp, clean, tea-like. Thick filter menghilangkan oils. Hasilnya sangat jernih. Acidity terdefinisi, zero bitterness.",
        "taste_keywords": ["crisp", "clean", "tea-like", "bright", "smooth", "zero-bitter"],
    },
    {
        "id": "bluebottle-chemex",
        "name": "Blue Bottle Chemex",
        "barista": "Blue Bottle Coffee",
        "equipment": "Chemex",
        "dose": 44, "ratio": 15.9,
        "description": "44g kopi, 700g air. 3 pours (bloom + 2 main). Medium-coarse. 93°C.",
        "tags": ["specialty", "clean", "balanced"],
        "taste_notes": "Clean & elegant. Balanced sweetness dengan light acidity. Cocok untuk morning brew: smooth & easy drinking.",
        "taste_keywords": ["clean", "balanced", "smooth", "elegant", "sweet", "easy"],
    },
    # ── ESPRESSO ──
    {
        "id": "hoffmann-espresso",
        "name": "Hoffmann Espresso",
        "barista": "James Hoffmann",
        "equipment": "Espresso",
        "dose": 18, "ratio": 2.0,
        "description": "Classic 1:2 ratio. 18g in, 36g out dalam 25-30 detik. Fine grind, 93-94°C. Fokus even extraction.",
        "tags": ["champion", "classic", "balanced"],
        "taste_notes": "Rich, syrupy body. Sweetness karamel + chocolate notes. Balanced acidity, tidak terlalu sour atau bitter.",
        "taste_keywords": ["rich", "syrupy", "caramel", "chocolate", "bold", "full-body"],
    },
    {
        "id": "rao-espresso",
        "name": "Rao Blooming Espresso",
        "barista": "Scott Rao",
        "equipment": "Espresso",
        "dose": 20, "ratio": 2.5,
        "description": "Long ratio 1:2.5: 20g in, 50g out. Pre-infuse 5-8 detik, lalu full pressure. Grind lebih halus dari klasik.",
        "tags": ["long-ratio", "blooming", "sweet"],
        "taste_notes": "Extra sweetness & clarity. Long ratio mengeluarkan lebih banyak flavor notes: fruity, floral, complex. Less body, more flavor.",
        "taste_keywords": ["sweet", "fruity", "floral", "complex", "clarity", "bright"],
    },
    # ── FRENCH PRESS ──
    {
        "id": "hoffmann-fp",
        "name": "Hoffmann French Press",
        "barista": "James Hoffmann",
        "equipment": "French Press",
        "dose": 30, "ratio": 16.7,
        "description": "No-press method. 4 menit seduh, break crust, buang busa, diamkan 5-8 menit. Tuang tanpa tekan plunger. Coarse grind.",
        "tags": ["champion", "no-press", "clean-body"],
        "taste_notes": "Surprisingly clean untuk French Press. Full body tanpa silt/grit. Rich, smooth, zero bitterness. Best of immersion.",
        "taste_keywords": ["rich", "full-body", "smooth", "clean", "bold", "zero-bitter"],
    },
    # ── MOKA POT ──
    {
        "id": "hoffmann-moka",
        "name": "Hoffmann Moka Pot",
        "barista": "James Hoffmann",
        "equipment": "Moka Pot",
        "dose": 18, "ratio": 7.0,
        "description": "Air panas di boiler (bukan dingin), api sedang. Angkat saat sputtering. Fine grind tapi tidak seperti espresso.",
        "tags": ["champion", "hot-water-start", "smooth"],
        "taste_notes": "Smooth, rich, no bitterness. Menghindari metallic taste khas Moka Pot. Bold seperti espresso tapi lebih gentle.",
        "taste_keywords": ["rich", "smooth", "bold", "chocolate", "full-body"],
    },
    # ── COLD BREW ──
    {
        "id": "rao-coldbrew",
        "name": "Rao Cold Brew Concentrate",
        "barista": "Scott Rao",
        "equipment": "Cold Brew",
        "dose": 80, "ratio": 5.0,
        "description": "1:5 concentrate. 12-16 jam di suhu ruang. Extra coarse grind. Encerkan 1:1 sebelum diminum. Bold & smooth.",
        "tags": ["concentrate", "bold", "smooth"],
        "taste_notes": "Ultra-smooth, zero acidity, bold chocolate + nutty notes. Zero bitterness meskipun pekat. Perfect untuk summer.",
        "taste_keywords": ["smooth", "chocolate", "nutty", "zero-acid", "bold", "refreshing"],
    },
    # ── TUBRUK ──
    {
        "id": "klasik-tubruk",
        "name": "Tubruk Kopi Nusantara",
        "barista": "Tradisi Indonesia",
        "equipment": "Tubruk",
        "dose": 18, "ratio": 12.0,
        "description": "Kopi bubuk + gula (opsional) di gelas. Tuang air mendidih, aduk 3x. Diamkan 3-4 menit hingga bubuk mengendap.",
        "tags": ["traditional", "indonesian", "no-filter"],
        "taste_notes": "Earthy, bold, rustic. Full body dengan sedikit sediment di dasar. Manis alami dari slow extraction. Comfort drink.",
        "taste_keywords": ["earthy", "bold", "rustic", "full-body", "traditional", "comfort"],
    },
    # ── TURKISH ──
    {
        "id": "klasik-turkish",
        "name": "Turkish Coffee Klasik",
        "barista": "Tradisi Turki",
        "equipment": "Turkish",
        "dose": 7, "ratio": 10.0,
        "description": "7g kopi ultra-fine + 70ml air di cezve. Panaskan api kecil, 3x naik busa. Jangan diaduk setelah kopi basah. Tuang perlahan.",
        "tags": ["traditional", "foam", "unfiltered"],
        "taste_notes": "Intense, thick, syrupy. Crema foam di atas, bold flavor dengan spice notes (cardamom opsional). Unfiltered richness.",
        "taste_keywords": ["intense", "thick", "spicy", "bold", "syrupy", "traditional"],
    },
    # ── KALITA WAVE ──
    {
        "id": "april-kalita",
        "name": "April Kalita Wave",
        "barista": "Patrik Rolf",
        "equipment": "Kalita Wave",
        "dose": 20, "ratio": 15.0,
        "description": "Low-temp pour-over. 2-3 pours, 91-92°C. Flat bottom filter lebih forgiving. Cocok untuk pemula.",
        "tags": ["low-temp", "forgiving", "sweet"],
        "taste_notes": "Sweet, clean, forgiving. Flat bottom = ekstraksi lebih merata. Floral + fruity notes dengan sweetness dominan.",
        "taste_keywords": ["sweet", "floral", "fruity", "clean", "forgiving", "easy"],
    },
    # ── SIPHON ──
    {
        "id": "bluebottle-siphon",
        "name": "Blue Bottle Siphon",
        "barista": "Blue Bottle Coffee",
        "equipment": "Siphon",
        "dose": 25, "ratio": 15.0,
        "description": "Siphon/vacuum pot: theatrical & clean. Panaskan hingga air naik, masukkan kopi, aduk, matikan api. Drawdown ~30 detik.",
        "tags": ["theatrical", "clean", "specialty"],
        "taste_notes": "Theatrical & clean. Clarity tinggi dengan body medium. Flavor notes sangat distinct, hampir seperti tea. Aromatic experience.",
        "taste_keywords": ["clean", "aromatic", "tea-like", "clarity", "bright", "elegant"],
    },
]


def match_presets_by_taste(query: str) -> list[dict]:
    """Score presets by keyword overlap with user's taste query."""
    q = query.lower().strip()
    if not q:
        return []
    q_words = set(q.replace(",", " ").split())
    scored = []
    for p in BARISTA_PRESETS:
        kw = p.get("taste_keywords", [])
        tags = p.get("tags", [])
        desc = p.get("description", "").lower()
        taste = p.get("taste_notes", "").lower()
        all_words = set(kw) | set(tags) | set(desc.split()) | set(taste.split())
        score = sum(1 for w in q_words if any(w in aw for aw in all_words))
        if score > 0:
            scored.append({**p, "match_score": score})
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:6]


@dataclass
class BeanProfile:
    origin: Origin
    process: Process
    roast_level: RoastLevel
    equipment: Equipment
    grinder: Grinder = "Generic (Tanpa Referensi)"
    custom_dose: int | None = None
    custom_water: int | None = None
    custom_ratio: float | None = None

    def base_temp(self) -> int:
        return TEMP_BASE[self.equipment][self.roast_level]

    def base_grind(self) -> int:
        category = METHOD_GRIND_CATEGORY.get(self.equipment, "standard")
        grinds = ROAST_GRIND_BASE[category]
        val = grinds[self.roast_level] + GRIND_OFFSETS[self.equipment]
        if self.process == "Natural":
            val += 8
        elif self.process == "Anaerobic":
            val += 3
        return max(0, min(100, val))

    def base_dose(self) -> int:
        return DOSES[self.equipment]

    def ratio(self) -> float:
        return RATIOS[self.equipment]


@dataclass
class PourStage:
    label: str
    start_second: int
    duration_seconds: int
    target_water_g: int
    instruction: str


@dataclass
class BrewRecipe:
    dose_g: int
    water_temp_c: int
    grind_size: int
    total_water_g: int
    total_time_s: int
    ratio: float
    equipment: Equipment
    roast_level: RoastLevel
    stages: list[PourStage] = field(default_factory=list)
    adjustments: dict = field(default_factory=dict)
    grinder_info: dict = field(default_factory=dict)
    is_custom: bool = False


def _v60_stages(dose: int, total_water: int) -> list[PourStage]:
    bloom = PourStage("Bloom", 0, 30, int(dose * 2.5),
        "Tuang air 2.5x berat kopi, gerakan spiral perlahan. Diamkan 30 detik.")
    remaining = total_water - bloom.target_water_g
    p2w = int(remaining * 0.55)
    return [
        bloom,
        PourStage("Second Pour", 30, 30, bloom.target_water_g + p2w,
            "Tuang perlahan dari tengah ke luar, jaga ketinggian air konstan."),
        PourStage("Final Pour", 60, 30, total_water,
            "Tuang sisa air. Biarkan drawdown hingga tetesan berhenti."),
    ]


def _aeropress_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Bloom & Stir", 0, 15, total_water,
            "Tuang seluruh air, aduk 3 kali. Pasang plunger, tarik sedikit untuk vakum."),
        PourStage("Steep", 15, 45, total_water,
            "Diamkan. Jangan disentuh."),
        PourStage("Press", 60, 30, total_water,
            "Tekan plunger perlahan, konstan ~30 detik. Hentikan saat mendesis."),
    ]


def _chemex_stages(dose: int, total_water: int) -> list[PourStage]:
    bloom = PourStage("Bloom", 0, 45, int(dose * 3.0),
        "Tuang 3x berat kopi, basahi merata. Diamkan 45 detik.")
    remaining = total_water - bloom.target_water_g
    p2 = int(remaining * 0.40)
    return [
        bloom,
        PourStage("Second Pour", 45, 40, bloom.target_water_g + p2,
            "Tuang perlahan spiral. Jaga aliran tetap di tengah filter."),
        PourStage("Final Pour", 85, 45, total_water,
            "Tuang sisa air. Tunggu drawdown total. Total waktu ~4 menit."),
    ]


def _french_press_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Bloom", 0, 30, int(dose * 2.5),
            "Tuang air 2.5x berat kopi. Diamkan 30 detik untuk blooming."),
        PourStage("Fill & Steep", 30, 210, total_water,
            "Tuang sisa air. Pasang tutup, jangan tekan plunger. Diamkan 3.5 menit."),
        PourStage("Break Crust", 240, 10, total_water,
            "Buka tutup, aduk perlahan kerak di permukaan. Buang busa."),
        PourStage("Plunge", 250, 20, total_water,
            "Pasang tutup, tekan plunger perlahan dan konstan. Tuang segera."),
    ]


def _espresso_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Pre-infusion", 0, 5, int(total_water * 0.15),
            "Aktifkan pompa tekanan rendah (~3 bar). Basahi puck merata."),
        PourStage("Extraction", 5, 25, total_water,
            "Tekanan penuh (~9 bar). Perhatikan aliran, target 36g dalam 25-30 detik. Hentikan saat blonding."),
    ]


def _moka_pot_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Heat", 0, 180, 0,
            "Isi boiler dengan air panas. Masukkan basket kopi (jangan dipadatkan). Pasang bagian atas. Panaskan dengan api sedang."),
        PourStage("Extraction Start", 180, 30, int(total_water * 0.3),
            "Kopi mulai naik ke chamber atas. Suara mendidih pelan."),
        PourStage("Main Extraction", 210, 45, int(total_water * 0.8),
            "Aliran kopi stabil. Tutup sedikit jika terlalu cepat."),
        PourStage("Sputter Stop", 255, 15, total_water,
            "Saat suara sputter (gelembung udara), segera angkat dari api. Tuang."),
    ]


def _tubruk_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Pour & Stir", 0, 10, total_water,
            "Tuang air panas ke gelas berisi kopi bubuk. Aduk perlahan 3-5 kali."),
        PourStage("Settle", 10, 230, total_water,
            "Diamkan 3-4 menit. Bubuk kopi akan mengendap di dasar gelas. Jangan diaduk lagi."),
    ]


def _cold_brew_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Immersion", 0, 1, total_water,
            "Campur kopi bubuk kasar dengan air suhu ruang. Aduk rata."),
        PourStage("Steep", 1, 43199, total_water,
            "Diamkan 12-24 jam di suhu ruang atau dalam kulkas. Tutup wadah."),
        PourStage("Filter", 43200, 300, total_water,
            "Saring dengan kain atau kertas filter. Hasil konsentrat. Encerkan 1:1 dengan air/es sebelum diminum."),
    ]


def _kalita_wave_stages(dose: int, total_water: int) -> list[PourStage]:
    bloom = PourStage("Bloom", 0, 30, int(dose * 2.5),
        "Tuang 2.5x berat kopi. Diamkan 30 detik. Flat-bottom filter lebih forgiving.")
    remaining = total_water - bloom.target_water_g
    p2 = int(remaining * 0.35)
    p3 = int(remaining * 0.35)
    p4 = remaining - p2 - p3
    return [
        bloom,
        PourStage("2nd Pour", 30, 20, bloom.target_water_g + p2,
            "Tuang perlahan, gerakan spiral kecil. Jaga level air konstan."),
        PourStage("3rd Pour", 50, 20, bloom.target_water_g + p2 + p3,
            "Lanjutkan spiral pour. Flat bottom mendukung ekstraksi merata."),
        PourStage("Final Pour", 70, 50, total_water,
            "Tuang sisa air. Biarkan drawdown total ~3.5 menit."),
    ]


def _turkish_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("First Rise", 0, 60, total_water,
            "Campur kopi + air (opsional: gula) di cezve/ibrik. Panaskan api kecil. JANGAN diaduk setelah kopi basah."),
        PourStage("Second Rise", 60, 60, total_water,
            "Saat busa naik ke atas, angkat dari api. Diamkan 5 detik, panaskan kembali."),
        PourStage("Third Rise & Serve", 120, 60, total_water,
            "Busa naik lagi. Angkat, tuang perlahan ke cangkir. Diamkan 1 menit sebelum diminum."),
    ]


def _clever_dripper_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Water + Coffee", 0, 10, total_water,
            "Tuang air dulu, lalu masukkan kopi (atau kopi dulu). Aduk ringan. Tutup rapat."),
        PourStage("Steep", 10, 120, total_water,
            "Diamkan 2 menit. Sesekali aduk perlahan."),
        PourStage("Drawdown", 130, 80, total_water,
            "Letakkan Clever di atas cangkir, katup otomatis terbuka. Drawdown ~1 menit."),
    ]


def _siphon_stages(dose: int, total_water: int) -> list[PourStage]:
    return [
        PourStage("Heat", 0, 90, 0,
            "Isi bottom globe dengan air. Panaskan dengan burner hingga air naik ke globe atas."),
        PourStage("Brew", 90, 60, total_water,
            "Air sudah di globe atas. Masukkan kopi, aduk ringan. Jaga suhu stabil."),
        PourStage("Drawdown", 150, 30, total_water,
            "Matikan api. Kopi akan tersedot turun melalui filter cloth ke bottom globe."),
    ]


STAGE_BUILDERS = {
    "V60": _v60_stages,
    "Aeropress": _aeropress_stages,
    "Chemex": _chemex_stages,
    "French Press": _french_press_stages,
    "Espresso": _espresso_stages,
    "Moka Pot": _moka_pot_stages,
    "Tubruk": _tubruk_stages,
    "Cold Brew": _cold_brew_stages,
    "Kalita Wave": _kalita_wave_stages,
    "Turkish": _turkish_stages,
    "Clever Dripper": _clever_dripper_stages,
    "Siphon": _siphon_stages,
}


def generate_recipe(profile: BeanProfile) -> BrewRecipe:
    default_dose = profile.base_dose()
    default_ratio = profile.ratio()
    is_custom = False

    if profile.custom_dose and profile.custom_water:
        dose = profile.custom_dose
        total_water = profile.custom_water
        ratio = round(total_water / dose, 1)
        is_custom = True
    elif profile.custom_dose and profile.custom_ratio:
        dose = profile.custom_dose
        ratio = profile.custom_ratio
        total_water = int(dose * ratio)
        is_custom = True
    elif profile.custom_dose:
        dose = profile.custom_dose
        ratio = default_ratio
        total_water = int(dose * ratio)
        is_custom = True
    elif profile.custom_water:
        total_water = profile.custom_water
        ratio = default_ratio
        dose = max(5, int(total_water / ratio))
        is_custom = True
    elif profile.custom_ratio:
        dose = default_dose
        ratio = profile.custom_ratio
        total_water = int(dose * ratio)
        is_custom = True
    else:
        dose = default_dose
        ratio = default_ratio
        total_water = int(dose * ratio)

    grind = profile.base_grind()
    temp = profile.base_temp()
    stages = STAGE_BUILDERS[profile.equipment](dose, total_water)
    total_time = stages[-1].start_second + stages[-1].duration_seconds + 20

    return BrewRecipe(
        dose_g=dose,
        water_temp_c=temp,
        grind_size=grind,
        total_water_g=total_water,
        total_time_s=total_time,
        ratio=ratio,
        equipment=profile.equipment,
        roast_level=profile.roast_level,
        stages=stages,
        grinder_info=get_grinder_setting(profile.grinder, grind),
        is_custom=is_custom,
    )


def apply_feedback(recipe: BrewRecipe, feedback: FeedbackType) -> BrewRecipe:
    adjusted = BrewRecipe(
        dose_g=recipe.dose_g,
        water_temp_c=recipe.water_temp_c,
        grind_size=recipe.grind_size,
        total_water_g=recipe.total_water_g,
        total_time_s=recipe.total_time_s,
        ratio=recipe.ratio,
        equipment=recipe.equipment,
        roast_level=recipe.roast_level,
        stages=recipe.stages,
        grinder_info=recipe.grinder_info,
        adjustments={"previous_grind": recipe.grind_size, "previous_temp": recipe.water_temp_c},
    )

    lock_temp = recipe.equipment in FEEDBACK_LOCK_TEMP

    if feedback == "SOUR":
        adjusted.grind_size = max(0, recipe.grind_size - 5)
        if not lock_temp:
            adjusted.water_temp_c = min(100, recipe.water_temp_c + 2)
        reason = "SOUR (under-extracted): finer grind"
        if not lock_temp:
            reason += " + higher temp"
        reason += " for more extraction"
        if adjusted.grind_size == recipe.grind_size and (lock_temp or adjusted.water_temp_c == recipe.water_temp_c):
            reason += " (already at extraction limit. Try adjusting ratio or dose manually)"
    else:
        adjusted.grind_size = min(100, recipe.grind_size + 5)
        if not lock_temp:
            adjusted.water_temp_c = max(22, recipe.water_temp_c - 2)
        reason = "BITTER (over-extracted): coarser grind"
        if not lock_temp:
            reason += " + lower temp"
        reason += " to reduce extraction"
        if adjusted.grind_size == recipe.grind_size and (lock_temp or adjusted.water_temp_c == recipe.water_temp_c):
            reason += " (already at extraction limit. Try adjusting ratio or dose manually)"

    adjusted.adjustments["reason"] = reason
    adjusted.adjustments["grind_delta"] = adjusted.grind_size - recipe.grind_size
    if not lock_temp:
        adjusted.adjustments["temp_delta"] = adjusted.water_temp_c - recipe.water_temp_c

    grinder_name = recipe.grinder_info.get("grinder", "Generic (Tanpa Referensi)")
    adjusted.grinder_info = get_grinder_setting(grinder_name, adjusted.grind_size)

    return adjusted
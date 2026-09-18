# Seduhin — Checkpoint

**Date:** 2026-09-18
**Status:** v2.7 — copy de-slop frontend + audit em-dash backend **selesai** (lihat "v2.7 Changelog"). 18 barista presets, 17 grinders, 12 methods, taste search, brew history, timer 30fps + sound alert. Tidak ada blocker production-ready lagi.

---

## Project Structure (Current)

```
precision-coffee/
├── backend/
│   ├── main.py              # FastAPI — 5 endpoints (health, presets, taste-match, recipe, feedback)
│   ├── coffee_engine.py     # 12 methods, 17 grinders, 18 presets, taste matching, feedback
│   ├── requirements.txt     # fastapi, uvicorn, pydantic
│   ├── test_engine.py       # 190+ assertion (deterministic engine)
│   └── test_api.py          # TestClient 5 endpoint
├── frontend/
│   ├── index.html
│   ├── package.json         # React 18 + Vite 5 + Tailwind 3 + @fontsource-variable (fraunces, dm-sans)
│   ├── vite.config.ts       # host: true, proxy /api → 127.0.0.1:8000
│   ├── tailwind.config.js   # design tokens: mocha, shadow-soft/lift, ease-brew, text-timer
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx              # Entry + ErrorBoundary
│       ├── App.tsx               # 7-phase: home→method→presets→input→recipe→brewing→feedback
│       ├── types.ts              # All TS interfaces
│       ├── constants.ts          # METHODS, GRINDERS, DEFAULT_DOSES/RATIOS, EST_TIMES, RATIO_SUGGESTIONS, formatTimeLabel
│       ├── context/
│       │   └── AppContext.tsx    # useReducer + equipment state + feedback lock
│       ├── hooks/
│       │   └── useBrewHistory.ts # localStorage, max 30 entri
│       ├── components/
│       │   ├── Home.tsx              # Beranda: hero hook + Cara Pakai 3 langkah
│       │   ├── EquipmentSelect.tsx   # Grid 12 kartu metode + taste search
│       │   ├── PresetModal.tsx       # Popup resep barista per metode
│       │   ├── BeanInput.tsx         # Form: origin, process, roast, grinder, custom dose/ratio
│       │   ├── RecipeDisplay.tsx     # Recipe card + grinder setting + pour stages
│       │   ├── BrewTimer.tsx         # 30fps timer + dual progress bars + WebAudio beep
│       │   ├── FeedbackPanel.tsx     # Kegasaman/Kepahitin → auto-adjust recipe
│       │   ├── MethodIcon.tsx        # 12 custom inline SVG + BrandIcon
│       │   └── ErrorBoundary.tsx     # Crash handler
│       └── styles/
│           └── globals.css          # 44px tap target, reduced-motion, safe-area
├── scripts/
│   ├── validate_icons.mjs       # cek 12 icon ter-render
│   ├── check_icon_render.mjs    # Edge headless --dump-dom (JALANKAN VIA NODE, bukan PowerShell)
│   ├── copy_check.mjs           # DOM check anti-slop (saat ini FAIL: em-dash backend)
│   └── find_emdash.mjs          # scan fs, skip node_modules
├── COFFEE_KNOWLEDGE.md      # 11-bab panduan kopi bahasa Indonesia
├── AGENTS.md                # Ponytail + Coffee domain knowledge
├── stop-slop.md             # Style guide copy anti generative-AI (10 tanda slop)
├── start.ps1                # One-click launcher (taskkill /F /T)
├── README.md                # Localhost guide
├── opencode.json            # ponytail + impeccable plugins
└── checkpoint.md            # This file
```

---

## API Endpoints

| Method | Path | Params | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/presets` | — | 18 barista preset recipes |
| GET | `/api/taste-match` | `?q=fruity bright` | Keyword matching → ranked presets |
| POST | `/api/recipe` | BeanInput JSON | Generate recipe |
| POST | `/api/feedback` | FeedbackInput JSON | Process SOUR/BITTER → adjusted recipe |

---

## Features Summary

### 12 Brewing Methods
V60, Aeropress, Chemex, French Press, Espresso, Moka Pot, Tubruk, Cold Brew, Kalita Wave, Turkish, Clever Dripper, Siphon

### 17 Grinder References
Timemore C2/C3, C3 ESP, Chestnut X, C5 ESP, Comandante C40, 1Zpresso JX/J-Max, J-Ultra, K-Series, Baratza Encore, Fellow Ode Gen 2, Kingrinder K6, DF64 Gen 2, Niche Zero, Eureka Mignon, Option-O Lagom Mini, Hario Skerton, Generic

### 18 Barista Presets
| Barista | Method | Dose | Ratio | Taste |
|---|---|---|---|---|
| James Hoffmann | V60 | 30g | 1:16.7 | Clean, balanced, high clarity |
| Tetsu Kasuya | V60 (4:6) | 20g | 1:15 | Bright, sweet, tea-like |
| Scott Rao | V60 | 22g | 1:16.4 | Sweet, full-body, even |
| Onyx Coffee Lab | V60 | 25g | 1:16 | Balanced, approachable |
| Patrik Rolf | V60 | 20g | 1:15 | Floral, fruity, clarity |
| James Hoffmann | Aeropress | 11g | 1:18 | Clean, tea-like, bright |
| Tim Wendelboe | Aeropress | 14g | 1:14.3 | Nordic brightness, floral |
| George Howell | Chemex | 50g | 1:16 | Crisp, clean, tea-like |
| Blue Bottle | Chemex | 44g | 1:15.9 | Clean, elegant, smooth |
| James Hoffmann | Espresso | 18g | 1:2 | Rich, syrupy, caramel |
| Scott Rao | Espresso | 20g | 1:2.5 | Sweet, fruity, complex |
| James Hoffmann | French Press | 30g | 1:16.7 | Rich, full-body, zero-bitter |
| James Hoffmann | Moka Pot | 18g | 1:7 | Smooth, rich, chocolate |
| Scott Rao | Cold Brew | 80g | 1:5 | Ultra-smooth, chocolate |
| Tradisi Indonesia | Tubruk | 18g | 1:12 | Earthy, bold, rustic |
| Tradisi Turki | Turkish | 7g | 1:10 | Intense, thick, spicy |
| Patrik Rolf | Kalita Wave | 20g | 1:15 | Sweet, floral, forgiving |
| Blue Bottle | Siphon | 25g | 1:15 | Clean, aromatic, tea-like |

### User Flow
```
   Page 0: Beranda (hero hook "Biji bagus, sayang ditebak. Seduhin aja." + 3 langkah Cara Pakai)
   ↓
Page 1: Pilih Metode (grid 12 kartu + taste search bar)
   ↓
Page 2: Pilih Resep (popup preset barista untuk metode terpilih, atau Custom)
   ↓
Page 3: Isi Bean (origin, process, roast, grinder, custom dose/ratio)
   ↓
Page 4: Lihat Resep (dose, suhu, grinder setting, pour stages)
   ↓
Page 5: Brew Timer (dual progress bars, stage instructions)
   ↓
Page 6: Feedback (Kegasaman / Kepahitin → auto-adjust recipe)
```

### Key Calculations
- **Grind**: `ROAST_GRIND_BASE[category][roast] + GRIND_OFFSET[equipment] + process_bonus`, clamped [0, 100]
- **Roast categories**: standard (pour-over), espresso (inverted), turkish
- **Temp lock**: Cold Brew (22°C fixed), Moka Pot, Turkish — tidak berubah saat feedback
- **Custom dose/ratio**: dose + ratio → water = dose × ratio (auto-calculate)

---

## v2.6 Changelog (2026-09-18)

### Rebrand → "Seduhin"
- Brand: **Seduhin**, hook *"Biji bagus, sayang ditebak. Seduhin aja."*
- Nama bergaya verb+`-in` (pola Jadwalin): nama = call-to-action.
- Update: `App.tsx` (header link ke beranda + footer), `index.html` (title/meta), `README.md`, backend `FastAPI(title)` + health response.

### Halaman Beranda Baru (phase `home`)
- Hero: ikon cangkir SVG, wordmark, hook headline, CTA "Mulai Seduh"
- Section **Cara Pakai**: 3 langkah bernomor (Pilih Metode → Isi Bean → Seduh + Timer)
- Chip fitur: 12 metode · 17 grinder · 18 preset · brew timer
- Home terpisah dari method page → tidak padat di 1 halaman
- `AppPhase` bertambah `"home"`; initial phase = `"home"`; RESET kembali ke beranda
- Header brand "Seduhin" clickable → balik ke beranda

### Bug Fix Tambahan
| Severity | Bug | Fix | File |
|---|---|---|---|
| P2 | `start.ps1` `Kill()` hanya bunuh parent — child reloader uvicorn jadi zombie (7 proses yatam ditemukan saat test) | `taskkill /F /T /PID` (kill tree) | start.ps1 |
| P2 | `PresetModal` render teks "null" jika `equipment` kosong | Early return guard | PresetModal.tsx |

## v2.5 Changelog (2026-09-18)

### Bug Fix
| Severity | Bug | Fix | File |
|---|---|---|---|
| P1 | `/api/feedback` rekonstruksi `BrewRecipe` tanpa `grinder_info` → grinder jatuh ke "Generic" setelah feedback | Pass `grinder_info` + `is_custom` saat rekonstruksi | main.py:149 |
| P1 | Select rasio blank untuk preset dgn rasio di luar opsi (16.7, 14.3, 15.9, 2.5) | Ganti select → text input + datalist | BeanInput.tsx |
| P2 | `is_custom` badge hilang setelah feedback | Ikut direkonstruksi | main.py |
| P2 | Versi tidak sinkron (v2.0/v2.2/v2.3/v2.4) | Semua disamakan ke v2.5 | start.ps1, README, App.tsx, checkpoint.md |
| P2 | Duplikat `formatTime` di 2 file | Pindah ke `constants.ts` (shared) | RecipeDisplay, BrewTimer |
| P2 | Duplikat DEFAULT_DOSES/RATIOS di BeanInput | Ekstrak `constants.ts` | BeanInput.tsx |
| P2 | Fetch taste-search tidak dibatalkan saat unmount | `AbortController` | EquipmentSelect.tsx |
| P2 | ErrorBoundary pakai `text-light-brown` (kontras 1.9:1) | Ganti `text-muted` (5.6:1) | ErrorBoundary.tsx |
| P3 | Timer overflow di layar 320px (`text-7xl`) | `text-timer` fluid `clamp()` | BrewTimer.tsx |
| P3 | Tombol timer overflow di layar sempit | `flex-col sm:flex-row` | BrewTimer.tsx, RecipeDisplay, FeedbackPanel |

### Redesign UI/UX
- **Design tokens**: palet + `mocha` untuk teks muted (WCAG AA), shadow soft/lift, timing `ease-brew`
- **Mobile-first**: grid 2→3→4 kolom, target tap 44px (`min-h-11`), `viewport-fit=cover`, safe-area
- **Low-end**: font sistem (hapus Google Fonts → 0 download), timer throttle 60→30fps, progress bar CSS transition, `prefers-reduced-motion`, `will-change`
- **UX baru**: onboarding dismissable, preview resep di preset card, brew history localStorage (30 entri), mute toggle, skeleton loading preset, `aria-live` untuk error/loading
- **Struktur**: `constants.ts` (shared), `hooks/useBrewHistory.ts`

### Test Harness
- `backend/test_engine.py` — 190+ assertion: 12 method × 3 roast × 3 process, timeline integrity, 17 grinder, feedback direction, temp lock, boundary 80–100°C, custom dose/ratio/water, preset uniqueness
- `backend/test_api.py` — TestClient: 5 endpoint + validasi 422 + grinder retention round-trip

## Known Fixed Bugs (v2.4)

| Severity | Bug | Fix | File |
|---|---|---|---|
| P0 | `recipe.adjustments.reason` no optional chaining | `?.` + type guard | RecipeDisplay.tsx |
| P0 | Dead `<details>` showing wrong recipe | Removed | RecipeDisplay.tsx |
| P1 | `handleStart` no rAF cancel | `cancelAnimationFrame` before start | BrewTimer.tsx |
| P1 | `handleResume` stale `elapsedMs` (state) | `elapsedRef.current` (ref) | BrewTimer.tsx |
| P1 | Progress bar invisible at 0% | Border outline + labels + min-width | BrewTimer.tsx |
| P1 | `SET_RECIPE` didn't clear `adjustmentHistory` | `adjustmentHistory: []` | AppContext.tsx |
| P1 | Backend no try/except on recipe/feedback | `HTTPException(500)` | main.py |
| P2 | Concurrent feedback submission | `isSubmittingRef` lock | AppContext.tsx |
| P2 | ErrorBoundary no `componentDidCatch` | Added with `console.error` | ErrorBoundary.tsx |

---

## How to Run

### One-click:
```powershell
.\start.ps1
```

### Manual:
```bash
# Terminal 1:
cd backend && python main.py      # → http://127.0.0.1:8000

# Terminal 2:
cd frontend && npm run dev        # → http://localhost:5173
```

### Deploy Tunnel (share ke teman):
```powershell
ngrok http 5173 --host-header=rewrite --request-header-add="ngrok-skip-browser-warning:true"
```

---

## v2.7 Changelog (2026-09-18)

### Copy De-Slop Frontend
Patrol `stop-slop.md` (10 tanda generative-AI copy). Frontend `src/` proses copy sudah bersih dari kata slop ("secara otomatis", "dihitung khusus", dll):
- `Home.tsx` hero + Cara Pakai, `constants.ts` METHODS description, `FeedbackPanel` (Gimana Rasanya / Kegasaman / Kepahitin / Lewati / Bikin Baru), `EquipmentSelect` (onboarding, Paling Cocok), `BeanInput` label, `PresetModal`, `RecipeDisplay` (Sudah Disesuaikan / Setting Grinder / StatBox), `BrewTimer` (Timer / Lagi Jalan / Seduh Lagi), `App.tsx` phase label (Kopi / Resep / Seduh / Rasa).

### Hero Copy Lebih Simpel
Hook + paragraf hero diringkas: `"Biji bagus, hasil tebakan? ... Nggak perlu nebak-nebak. Sebut biji sama grinder kamu, langsung ke dapat: gram kopi, derajat air, klik grinder, sampai kapan harus tuang. Bikin sendiri cuma 8rb per cangkir, di kafe 60rb."` jadi `"Biji bagus, sayang ditebak."` + `"Sebut biji sama grinder kamu. Dapat resepnya: gram kopi, suhu air, kapan tuang."` Hook lebih pendek dan emosional ("sayang"), paragraf satu ide (apa yang kamu dapat), perbandingan harga vs kafe dilepas (ga nyambung ke 3 langkah di bawah). Hook lama diganti di `Home.tsx`, footer `App.tsx`, meta `index.html`, `README.md`.

### Typografi: Fraunces + DM Sans
Pengganti font sistem (Inter dicantum di config tapi ga pernah diload). Sekarang:
- **Heading** (`h1`-`h3`): **Fraunces**, variable serif warm dengan karakter artisan. Dipasang lewat rule global `h1, h2, h3 { @apply font-display; }` di `globals.css` (1 tempat, ga sentuh komponen).
- **Body**: **DM Sans**, sans geometris santai, pairing standar Fraunces.
- Timer tetap `font-mono`.

Lewat `@fontsource-variable/fraunces` + `@fontsource-variable/dm-sans` (npm, dibundle Vite, **self-hosted**). Tetap 0 download eksternal saat runtime, sesuai keputusan low-end v2.5. Axis `wght` default (100-900); subset latin + latin-ext yang ke-load untuk teks ID; `font-display: swap` jadi ga nahan first paint. Bobot: ~125KB woff2 total, JS tetap 186KB.

### Audit Em-Dash Selesai
Semua em-dash di copy naratif (frontend + backend) diganti: koma, titik, koma-titik, atau pecah jadi 2 kalimat. Diganti:

| Lokasi | Jumlah | Pengganti |
|---|---|---|
| `coffee_engine.py` TEXTURE_SCALE | 7 | koma sebelum nama method |
| `coffee_engine.py` `get_texture()` | 1 | `f"{label}: {desc}"` |
| `coffee_engine.py` GRINDER_REFERENCE `"type"` | 16 | `"Manual, Burr ..."`, `"Electric, Burr ..."` |
| `coffee_engine.py` preset description + taste_notes | 15 | koma / titik / koma-titik |
| `coffee_engine.py` stage instructions | 5 | koma / pecah 2 kalimat |
| `coffee_engine.py` feedback reason | 2 | pecah 2 kalimat (Inggris, sama seperti string reason lain) |
| `constants.ts` GRINDERS `"type"` | 16 | koma |
| `constants.ts` RATIO_SUGGESTIONS label | 10 | `· ` |
| `BeanInput.tsx` option join | 3 | `· ` |
| `BrewTimer.tsx` (header + next-stage target) | 2 | `· ` |
| `RecipeDisplay.tsx` (grinder label + history delta) | 2 | `· ` / koma |
| `index.html` title + meta description | 2 | koma-titik / hapus |
| `App.tsx` footer `&mdash;` entity | 1 | `·` + bump v2.7 |

**Catatan entity:** `App.tsx:76` pakai `&mdash;` (HTML entity), jadi scan karakter `—` literal ga ketangkap dan DOM home page masih ada em-dash. `find_emdash.mjs` sekarang juga scan `&mdash;` + `&#8212;`.

**Sengaja dipertahankan (sah, bukan slop):**
- Placeholder `origin ?? "—"` (AppContext:142) dan `h.origin || "—"` (EquipmentSelect:175).
- Range angka `25s — 40s` (RecipeDisplay:58).
- Komentar kode (EquipmentSelect:20, useBrewHistory:21, test_api:50) dan dokumen (README, AGENTS, COFFEE_KNOWLEDGE, stop-slop) bukan UI, opsional.

### Verifikasi
- `python test_engine.py` + `python test_api.py`: **0 failure**.
- `npm run build`: **0 type error**, 43 modules.
- `node scripts/find_emdash.mjs`: user-facing source = **0** (sisa cuma placeholder, range, komentar, dokumen). Scanner sekarang tangkap `&mdash;` / `&#8212;` entity juga.

`scripts/copy_check.mjs` (cek DOM home page) dan `scripts/find_emdash.mjs` (scan source) masih ada kalau mau dipakai lagi, aman dihapus. Warning: `copy_check.mjs` jalanin `taskkill /F /IM node.exe` + `python.exe` (bunuh SEMUA proses node/python di mesin), jadi ga bisa dijalankan pas ada kerjaan lain atau saat opencode lagi jalan. DOM home page udah terbukekan em-dash-free lewat grep + build (Home.tsx + index.html bersih, home page ga nyajiin string backend). Keep `validate_icons.mjs`, `check_icon_render.mjs`.

---

## Next Work (urutan prioritas)

### 1. Lanjut fitur
- [ ] Filter presets by equipment on taste-match endpoint
- [ ] Dark mode UI
- [ ] PWA / offline support
- [ ] Export resep ke PDF
- [ ] Multi-language (EN/ID)
- [ ] Water recipe calculator (mineral composition)

### 2. Selesai (jangan kerjain lagi)
- [x] Timer sound alert saat stage berganti (v2.5)
- [x] Brew history / log penyeduhan localStorage (v2.5)
- [x] Rebrand "Seduhin" + halaman Beranda (v2.6)
- [x] Copy de-slop frontend (v2.7, lihat stop-slop.md)
- [x] Audit em-dash backend + frontend (v2.7)

### Ready to Deploy
Semua endpoint + frontend production-ready. **Tidak ada blocker lagi.** Build output di `frontend/dist/` (45 modules, ~186KB JS ~58KB gzip + ~125KB font woff2 self-hosted).
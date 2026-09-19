# Seduhin v2.11

> **Biji bagus, sayang ditebak. Seduhin aja.**

Generator resep seduh kopi: pilih metode → isi bean & grinder → dapatkan dose, suhu, gilingan, dan tahapan tuang yang dihitung khusus. Lengkap dengan timer, feedback ASAM/PAHIT kalibrasi otomatis, dan riwayat seduh.

**12 metode · 17 grinder · 18 preset barista · taste search · brew timer**

---

## Cara Menjalankan

### Opsi 1: Satu Klik (Windows PowerShell)

Buka PowerShell di folder ini, lalu:

```powershell
.\start.ps1
```

Script akan otomatis:
- Start backend (Python FastAPI) di `http://127.0.0.1:8000`
- Start frontend (Vite + React) di `http://localhost:5173`
- Buka browser ke `http://localhost:5173`
- `Ctrl+C` untuk stop semua server

### Opsi 2: Manual (2 Terminal)

**Terminal 1 — Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Buka browser: `http://localhost:5173`

---

## Syarat

| Kebutuhan | Versi | Cek |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| pip packages | fastapi, uvicorn, pydantic | `pip install -r backend/requirements.txt` |
| npm packages | React, Vite, Tailwind | `cd frontend && npm install` |

---

## Alur Penggunaan

1. **Beranda** — hook + cara pakai, lalu masuk ke pemilihan metode
2. **Metode** — pilih alat seduh, atau cari preset barista lewat taste search
3. **Preset** — pilih resep barista untuk metode itu, atau custom
4. **Bean Profile** — isi origin, process, roast, grinder, custom dose/ratio
5. **Recipe** — resep lengkap: dose, suhu, gilingan (setting grinder kamu!), tahapan tuang
6. **Brew Timer** — timer interaktif + progress bar per stage + notifikasi suara
7. **Feedback** — evaluasi SOUR/PAHIT → resep otomatis dikalibrasi

---

## Fitur

- **12 metode seduh**: V60, Aeropress, Chemex, French Press, Espresso, Moka Pot, Tubruk, Cold Brew, Kalita Wave, Turkish, Clever Dripper, Siphon
- **17 referensi grinder**: Timemore C2/C3, C3 ESP, Chestnut X, C5 ESP, Comandante C40, 1Zpresso JX/J-Max/J-Ultra/K-Series, Baratza Encore, Fellow Ode, Kingrinder K6, DF64 Gen 2, Niche Zero, Eureka Mignon, Lagom Mini, Hario Skerton
- **18 preset barista**: Hoffmann, Kasuya, Rao, Onyx, April, Wendelboe, Howell, Blue Bottle + resep tradisional
- **Taste search**: cari resep berdasarkan rasa ("fruity bright") → ranking keyword
- **Auto-adjustment**: Feedback SOUR/BITTER otomatis kalibrasi gilingan + suhu
- **Grinder lock**: Cold Brew, Moka Pot, Turkish — suhu dikunci saat feedback
- **Brew timer**: rAF 30fps, dual progress bar (CSS transition), notifikasi suara saat stage berganti
- **Brew history**: riwayat seduh tersimpan di localStorage (opsional, tidak butuh server)
- **Browser back/next**: tiap phase punya URL sendiri (`/metode`, `/kopi`, `/seduh`, dst.), tombol back/forward browser + deep-link jalan
- **Mobile-first & low-end**: target tap 44px, kontras teks WCAG, font sistem (tanpa download), reduced-motion

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/presets` | 18 preset resep barista |
| `GET` | `/api/taste-match?q=fruity` | Ranking preset berdasarkan keyword rasa |
| `POST` | `/api/recipe` | Generate resep dari profil biji + grinder |
| `POST` | `/api/feedback` | Proses feedback → resep adjusted |

---

## Troubleshooting

**Backend tidak start?**
- Cek port 8000 tidak dipakai aplikasi lain
- `pip install -r backend/requirements.txt`

**Frontend tidak start?**
- Cek port 5173 tidak dipakai
- `cd frontend && npm install`

**Halaman putih?**
- Pastikan backend JALAN (cek `http://127.0.0.1:8000/api/health` di browser)
- Buka DevTools (F12) → Console → lihat error

**Error CORS?**
- Backend harus jalan di port 8000, frontend di 5173
- Jangan ubah port — proxy Vite di-hardcode ke 8000

---

## Deploy

**Production:** https://seduhinkopi.vercel.app (alias) · https://seduhin-app.vercel.app (canonical)
**Repo:** https://github.com/athcode/seduhin (branch `main`, push = auto-deploy)

Satu project Vercel, dua service (lihat `vercel.json`):

| Service | Root | Isi |
|---|---|---|
| `web` | `frontend/` | Vite build (static), SPA fallback ke `/index.html` |
| `api` | `backend/` | FastAPI serverless, entrypoint `main:app` |

Routing: `/api/*` → service `api`, sisanya → service `web`.

Deploy manual ke production:

```bash
vercel deploy --prod
```

Lihat build log: `vercel inspect <deployment-url> --logs`.

### Alias `seduhinkopi.vercel.app`

Vercel alias nempel ke **deployment ID**, bukan hostname. Tiap `git push` bikin deployment baru, jadi alias ini ketinggalan build (nyajin versi sebelumnya). Setelah setiap deploy, jalankan:

```powershell
.\scripts\alias_prod.ps1
```

Script cari production deployment terbaru (lewat API), lalu pasang ulang aliasnya.

### Domain custom

```bash
vercel domains add seduhin.app
```

Lalu set DNS record sesuai instruksi Vercel. `seduhin.vercel.app` sudah dipakai project pihak ketiga, jadi pakai `seduhin-app` atau varian lain (seduhin-kopi, seduhin-id, seduhin-aja).

### Catatan deploy (jangan diulang)

- Vercel melihat dependency `fastapi` di project = framework preset wajib entrypoint FastAPI; file-based `/api/*.py` functions tidak jadi. Frontend static + Python di project yang sama → **Services**, bukan preset.
- Rewrite di service `web` butuh exclude `assets/`, kalau tidak JS/CSS ikut ke-rewrite ke `index.html`.
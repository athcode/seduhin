# SKILLS & TOOLS REPOSITORY (EXTENDED FOR FULL-STACK DEPLOYMENT)

Dokumen ini mendefinisikan parameter kompetensi teknis yang dibutuhkan oleh agen pengembang dan pengembang manusia untuk membangun, mengintegrasikan, dan memelihara replika sistem BrewMind pada lingkungan localhost.

## 1. BACKEND DEVELOPMENT SKILLS (Data & AI Orchestration)

Backend bertindak sebagai layer orkestrasi antara antarmuka pengguna, basis data, dan model DeepSeek V4.

*   **Asynchronous Programming (Python/FastAPI atau Node.js):** 
    Kemampuan mengelola *non-blocking I/O*. Pemrosesan inferensi LLM membutuhkan waktu (terutama pada perangkat keras lokal). Eksekusi harus menggunakan pendekatan asinkron (`async/await`) untuk mencegah *thread blocking* yang dapat menyebabkan aplikasi *hang* atau *timeout*.
*   **LLM Inference & API Integration:**
    Kemampuan mengonfigurasi *endpoint* DeepSeek V4 (melalui *wrapper* lokal seperti Ollama, vLLM, atau Llama.cpp). Memerlukan keahlian dalam pengaturan parameter generatif:
    *   *Temperature control* (disarankan < 0.3 untuk presisi resep, menghindari halusinasi variabel seduh).
    *   *System prompt isolation* untuk memisahkan instruksi sistem dari input pengguna.
*   **Structured Output Parser:**
    Kemampuan mengonversi output LLM menjadi *machine-readable format*. Membutuhkan implementasi validasi skema ketat (contoh: Pydantic di Python atau Zod di TypeScript) untuk memaksa LLM mengembalikan respon murni JSON tanpa *markdown block* tambahan yang dapat merusak *parser frontend*.
*   **Database Schema & ORM Management:**
    Kemampuan merancang skema relasional. Menggunakan SQLAlchemy atau Prisma untuk mengelola entitas terstruktur: `Users`, `Coffee_Profiles` (origin, roast_level), `Brew_Recipes` (grind_size, temp, ratio), dan `Brew_Logs` (feedback pengguna).

## 2. FRONTEND DEVELOPMENT SKILLS (Client-Side Rendering)

Frontend bertugas merender data ekstraksi menjadi instruksi visual yang *real-time* dan responsif.

*   **Strict Type Checking (TypeScript):**
    Kemampuan mendefinisikan *interface* statis untuk setiap variabel resep (contoh: `Dose`, `WaterVolume`, `PourStages`). Hal ini menghilangkan risiko *runtime errors* yang diakibatkan oleh ketidakcocokan tipe data antara respons backend dan komponen UI.
*   **High-Precision Timer Loop (Web APIs):**
    Penggunaan `requestAnimationFrame` atau *Web Worker* alih-alih `setInterval`. Algoritma `setInterval` pada JavaScript berjalan pada *main thread* dan rentan terhadap deviasi waktu (*drift*) jika browser memproses rendering UI berat. Eksekusi tahap penuangan air (*pour sequence*) membutuhkan presisi milidetik.
*   **Global State Management:**
    Implementasi arsitektur manajemen *state* (misal: Zustand, Redux, atau Context API). Diperlukan untuk menjaga sinkronisasi data lintas komponen, memastikan waktu yang berjalan di antarmuka selaras dengan status tahap penuangan (contoh: transisi dari fase "Bloom" ke fase "First Pour" secara mulus).
*   **Audio-Visual Cue Engineering:**
    Kemampuan memanipulasi *Web Audio API* untuk memberikan notifikasi auditori sebelum transisi tahap seduh, dan DOM manipulasi ringan untuk indikator visual (seperti *progress bar* berat air).

## 3. DEBUGGING & SYSTEMATIC QA SKILLS (Zero-Defect Implementation)

Untuk mencapai reliabilitas 100% pada localhost, diperlukan metodologi penelusuran galat yang terstruktur.

*   **Cross-Origin Resource Sharing (CORS) Resolution:**
    Kemampuan mengonfigurasi *middleware* CORS pada backend untuk mengizinkan *preflight requests* (OPTIONS) dari port frontend (contoh: mengizinkan trafik dari `http://localhost:3000` ke `http://localhost:8000`). Ini adalah titik kegagalan paling umum pada pengembangan lokal.
*   **LLM Hallucination & Parsing Fallback:**
    *   *Skill:* Implementasi blok `try-catch` spesifik pada *parser* respons LLM.
    *   *Prosedur:* Jika DeepSeek V4 gagal memberikan JSON yang valid, sistem harus memiliki *fallback mechanism* (misalnya: meretries prompt, memuat resep statis bawaan, atau memberikan pesan kesalahan terstruktur tanpa menjatuhkan aplikasi).
*   **Network & Performance Profiling:**
    *   Penggunaan *Browser Developer Tools* (Network Tab) untuk mengukur latensi pengiriman prompt ke LLM.
    *   Penggunaan alat pemrofilan memori untuk memastikan komponen pengatur waktu di *frontend* tidak menyebabkan kebocoran memori (*memory leak*) setelah pengguna menyeduh berkali-kali tanpa memuat ulang halaman.
*   **Payload Validation & Sanitization:**
    Kemampuan menginspeksi muatan permintaan (*request payload*). Validasi ketat pada input pengguna sebelum dikirim ke parameter agen AI untuk mencegah *prompt injection* yang dapat merusak struktur keluaran algoritma ekstraksi.
*   **Logging System (Backend Traceability):**
    Implementasi sistem pencatatan kronologis terstruktur (log level: INFO, WARNING, ERROR). Semua kueri LLM, respons mentah, waktu eksekusi, dan anomali parameter dicatat dalam *file log* lokal untuk audit pasca-kegagalan.

## 4. DOMAIN-SPECIFIC LOGIC (Coffee Extraction Engine)

Algoritma validasi yang harus diprogram untuk mencegah agen AI menghasilkan resep yang menyalahi hukum fisika penyeduhan.

*   **Boundary Condition Checking:** 
    Memastikan variabel yang dihitung oleh AI tidak melampaui batasan fisik.
    *   Validasi Suhu: Harus berada di rentang 80°C - 100°C.
    *   Validasi Rasio: Volume air total = Dosis kopi * Rasio target (batas toleransi error < 1%).
    *   Validasi Waktu: Total durasi penuangan harus logis (biasanya antara 120 detik hingga 210 detik untuk *pour-over* standar).
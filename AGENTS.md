# BREWMIND CLONE - AGENTS ARCHITECTURE

## 1. CORE APPLICATION AGENTS (Sistem AI Backend)
Agen-agen ini adalah otak dari aplikasi, ditenagai oleh prompt DeepSeek V4 yang terstruktur.

### A. Bean_Analyzer_Agent
*   **Peran:** Bertugas membedah informasi biji kopi dari input pengguna.
*   **Fungsi Utama:** Menerima input teks (atau hasil OCR dari foto kemasan kopi) dan mengekstrak entitas penting seperti: *Origin* (Asal), *Altitude* (Ketinggian), *Process* (Washed/Natural/Anaerobic), *Roast Level* (Light/Medium/Dark), dan *Tasting Notes*.
*   **Output:** JSON terstruktur berisi profil lengkap biji kopi.

### B. Precision_Barista_Agent
*   **Peran:** Ahli teori ekstraksi kopi dan pembuat resep.
*   **Fungsi Utama:** Mengambil JSON dari `Bean_Analyzer_Agent` dan alat seduh yang dipilih pengguna (V60, Aeropress, Chemex, dll). Agen ini menghitung variabel krusial:
    *   Dose (Gram kopi) & Yield (Total air)
    *   Grind Size (Ukuran gilingan) & Suhu Air (Celcius)
    *   Tahapan Penuangan (Bloom, 2nd pour, 3rd pour) dengan target waktu dan berat.
*   **Aturan Khusus:** Harus mematuhi hukum fisika seduh kopi (misal: *Light roast* butuh air lebih panas untuk ekstraksi maksimal; *Natural process* lebih mudah larut sehingga butuh gilingan sedikit lebih kasar).

### C. Brew_Evolution_Agent (Feedback Engine)
*   **Peran:** Kalibrator resep otomatis.
*   **Fungsi Utama:** Memproses umpan balik pengguna setelah menyeduh. Jika pengguna menekan "SOUR" (Asam/Under-extracted), agen akan menginstruksikan suhu lebih tinggi, gilingan lebih halus, atau rasio air lebih banyak di seduhan berikutnya. Jika "BITTER" (Pahit/Over-extracted), agen melakukan sebaliknya.
*   **Output:** Rekomendasi modifikasi (*delta adjustments*) untuk resep aslinya.

### D. Hardware_Translator_Agent (Opsional)
*   **Peran:** Integrator perangkat keras (seperti fitur integrasi xBloom pada BrewMind).
*   **Fungsi Utama:** Menerjemahkan resep JSON dari `Precision_Barista_Agent` menjadi format *machine-readable* yang bisa diekspor langsung ke *smart brewers*.

---

## 2. DEVELOPMENT AGENTS (Bantuan Coding di Localhost)
Jika menggunakan *AI Coding Assistant* (seperti Cline, ChatDev, atau RooCode) untuk membangun web ini, gunakan persona berikut:

*   **Frontend_Engineer:** Bertanggung jawab membangun UI/UX menggunakan React/Vue/Next.js. Fokus utama: Membuat antarmuka *Brew Timer* yang interaktif (menampilkan waktu, berat air, dan instruksi per detik) serta UI animasi "Tasting Feedback".
*   **Backend_Engineer:** Membangun API menggunakan Python (FastAPI) atau Node.js. Mengatur integrasi API DeepSeek V4, *routing* agen, dan mengelola *database* lokal (SQLite/PostgreSQL) untuk menyimpan riwayat resep pengguna.
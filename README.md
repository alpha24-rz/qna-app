# PIMNAS MBPP — Sistem Pencarian Instan Q&A (< 1 Detik)

Aplikasi Next.js (App Router + React 19 + TypeScript + Tailwind CSS) untuk pencarian instan 200 pasangan tanya-jawab PIMNAS MBPP 2026. Siap dideploy ke **Vercel** dan dapat diakses dari laptop, tablet, maupun smartphone secara online.

---

## ⚡ Fitur Unggulan

- **Respon Instan (< 10 ms)**: Pencarian diproses langsung di memori browser (client-side) tanpa jeda jaringan.
- **Auto-Spotlight**: Jawaban dari pertanyaan paling relevan langsung ditampilkan penuh seketika saat Anda mengetik kata kunci.
- **Penyorotan Kata Kunci**: Kata kunci yang cocok otomatis di-highlight dengan warna kontras.
- **Salin Cepat (Copy)**: Tombol salin pertanyaan dan jawaban lengkap ke clipboard.
- **Dukungan Suara (Text-to-Speech)**: Fitur "Dengar" untuk melafalkan jawaban dalam Bahasa Indonesia (sangat berguna untuk simulasi presentasi).
- **Filter Kategori & Tag Populer**: Kategori Dasar Penelitian, Hasil Penelitian, Metode Penelitian, dan Luaran Penelitian.
- **Responsif di Semua Layar**: Nyaman dibuka dari HP saat sesi tanya jawab.
- **Dark / Light Mode**: Tema visual modern dengan ambient glow.

---

## 🚀 Cara Menjalankan di Komputer Lokal

Masuk ke folder `qna-app`:
```bash
cd qna-app
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

Untuk melakukan build production:
```bash
npm run build
npm run start
```

---

## 🌐 Cara Deploy ke Vercel (Gratis & Cepat)

### Langkah 1: Inisialisasi Git & Upload ke GitHub
Jalankan perintah berikut di terminal (dari folder `qna-app`):

```bash
cd /home/alpha/Documents/pkp/qna-app

# 1. Inisialisasi Git jika belum ada
git init
git add .
git commit -m "feat: PIMNAS MBPP instant QnA retrieval app"

# 2. Buat repository baru di GitHub (misal bernama 'pimnas-mbpp-qna')
# Lalu hubungkan remote repository:
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/pimnas-mbpp-qna.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login (bisa via akun GitHub).
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository GitHub yang baru saja Anda push (`pimnas-mbpp-qna`).
4. Pada bagian *Framework Preset*, Vercel akan otomatis mendeteksi **Next.js**.
5. Klik **"Deploy"**.
6. Dalam waktu ~30 detik, website Anda sudah online dengan URL gratis (contoh: `https://pimnas-mbpp-qna.vercel.app`)!

---

### Alternatif: Deploy Langsung via Vercel CLI (Tanpa Buka GitHub)
Jika Anda sudah memiliki akun Vercel:
```bash
cd /home/alpha/Documents/pkp/qna-app
npx vercel
```
Ikuti instruksi singkat di terminal (tekan Enter untuk opsi default). Aplikasi akan langsung online seketika!

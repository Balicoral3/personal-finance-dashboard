Personal Finance Dashboard – Portofolio Data Analyst

Live Dashboard: https://datastudio.google.com/reporting/895e70a2-fbec-45c7-b402-e904217f958b
Source Data: https://docs.google.com/spreadsheets/d/1vaAD8NFkD62Oub9yGzhO6nQDCmz9gV8LHig066nTTbM/edit?usp=sharing

---

📊 Project Overview

Sistem pencatatan keuangan pribadi end-to-end untuk dua pengguna (Jordy & Nina) dengan fitur:
- Input transaksi via Google Form (validasi kategori, anti-duplikat, upload bukti)
- Tracking investasi Emas & Bitcoin dengan harga real-time dari API eksternal
- Dashboard interaktif Looker Studio
- Perhitungan ROI portofolio otomatis

---

🛠️ Tech Stack

| Layer | Tools |
|-------|-------|
| Data Input | Google Forms, Google Drive (upload bukti) |
| Database | Google Sheets (multiple sheets) |
| Automations | Google Apps Script (fetch API, anti-duplikat, kalkulasi portofolio) |
| Visualization | Looker Studio (dashboard interaktif) |
| APIs | Coinbase (Bitcoin), GoldAPI.io (Emas) |

---

🔄 Data Architecture
[Google Form] → [Google Sheets: Transaksi]
↓
[Apps Script] → anti-duplikat, ID unik, fetch harga aset, hitung portofolio
↓
[Looker Studio] ← Transaksi, Anggaran, Portfolio_Summary


---

📈 Key Features & Insights

- Expense Ratio = Total Pengeluaran / Total Pendapatan
- ROI portofolio berdasarkan harga live emas & bitcoin
- Filter interaktif: tanggal, nama, tipe transaksi, kategori
- Drill-down: klik bar kategori → tabel detail transaksi tersaring

---

📸 Dashboard Preview

| ID | EN |
|-------------|------------|
| screenshots/Indonesia Version.JPEG | screenshots/English Version.JPEG |

---

📁 Data Source Details

- Transaksi: semua transaksi harian dari Google Form
- Harga_Aset: harga Bitcoin & Emas real-time
- Portfolio_Summary: ringkasan unit, modal, dan ROI

---

🚀 How to Replicate

1. Copy Google Sheet template dari link ini (jika ada) atau buat sesuai struktur.
2. Buat Google Form dan hubungkan ke sheet `Transaksi`.
3. Salin kode `scripts/Code.gs` ke Apps Script.
4. Set trigger untuk `onFormSubmit` dan `updateHargaAset`.
5. Hubungkan data ke Looker Studio dan desain dashboard.

---

🙋‍♂️ About Me

- Nama: Jordy Josua Andika Samahati
- LinkedIn: https://www.linkedin.com/in/jordy-josua-andika-samahati-2a94751bb/
- Website: https://www.jordysamahati.com/
- Email: jordyjosuaas@gmail.com

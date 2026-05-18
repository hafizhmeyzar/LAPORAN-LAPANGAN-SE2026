# 📋 Panduan Lengkap Deployment – Form Lapangan SE2026

## 📁 Struktur Project

```
SE2026/
├── index.html        ← Form utama (HTML + CSS + JS)
├── Code.gs           ← Google Apps Script backend
└── README.md         ← Panduan ini
```

---

## 🚀 LANGKAH DEPLOYMENT

### TAHAP 1 – Persiapkan Google Apps Script

1. Buka browser, kunjungi: https://script.google.com
2. Klik **"+ New Project"**
3. Beri nama project: `SE2026-Backend`
4. Hapus isi file `Code.gs` yang ada
5. **Copy-paste seluruh isi file `Code.gs`** ke editor
6. Klik **Save** (ikon disket atau Ctrl+S)

---

### TAHAP 2 – Konfigurasi ID Spreadsheet & Drive

Di file `Code.gs`, pastikan baris berikut sudah benar:

```javascript
const SPREADSHEET_ID  = '1o28CTI1SDOgWZCDwcOK-3gxV3FbL0KYg0DMNgxAaYrY';
const DRIVE_FOLDER_ID = '1K2e7MNNMqGsBy_K7e5HxFhPIyVDnnVc2';
const SHEET_NAME      = 'Data Lapangan SE2026';
```

> **Cara cek ID:**
> - **Spreadsheet ID**: Ada di URL spreadsheet antara `/d/` dan `/edit`
>   - Contoh: `https://docs.google.com/spreadsheets/d/1o28CTI.../edit`
> - **Drive Folder ID**: Ada di URL folder Drive
>   - Contoh: `https://drive.google.com/drive/folders/1K2e7MNN...`

---

### TAHAP 3 – Deploy sebagai Web App

1. Di editor Apps Script, klik menu **"Deploy"** → **"New deployment"**
2. Klik ikon ⚙️ (gear) di sebelah "Select type" → pilih **"Web app"**
3. Isi konfigurasi:
   - **Description**: `SE2026 Form API v1`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone` ← **PENTING! Pilih ini**
4. Klik **"Deploy"**
5. Klik **"Authorize access"** jika diminta
6. Pilih akun Google Anda
7. Klik **"Allow"** untuk semua izin yang diminta
8. **Copy Web App URL** yang ditampilkan

Contoh URL:
```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxx/exec
```

---

### TAHAP 4 – Hubungkan HTML dengan Apps Script

1. Buka file `index.html`
2. Cari baris ini (ada di bagian `<script>`):

```javascript
const GAS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

3. Ganti dengan URL Web App yang dicopy tadi:

```javascript
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxx/exec';
```

4. **Simpan** file `index.html`

---

### TAHAP 5 – Test Form

1. Buka `index.html` di browser HP Android
2. Izinkan akses lokasi saat diminta
3. Isi semua field form
4. Ambil foto
5. Klik **"Kirim Laporan"**
6. Cek Spreadsheet – data harus muncul di baris baru
7. Cek Google Drive folder – foto harus terupload

---

### TAHAP 6 – Upload ke Hosting (Opsional)

Agar bisa diakses oleh semua petugas, upload `index.html` ke:

**Opsi A – GitHub Pages (Gratis)**
1. Buat repository GitHub baru
2. Upload `index.html`
3. Enable GitHub Pages di Settings
4. Bagikan URL ke petugas

**Opsi B – Google Sites**
1. Buka sites.google.com
2. Buat halaman baru
3. Embed HTML via "Embed" widget

**Opsi C – Netlify Drop (Paling Mudah)**
1. Buka https://app.netlify.com/drop
2. Drag & drop file `index.html`
3. Dapatkan URL otomatis

---

## ⚙️ KONFIGURASI TAMBAHAN

### Menambah Nama Petugas

Di `index.html`, cari array `NAMA_PETUGAS`:

```javascript
const NAMA_PETUGAS = [
  'Ahmad Fauzi',
  'Siti Nurhaliza',
  // Tambahkan nama di sini
  'Nama Baru 1',
  'Nama Baru 2',
];
```

### Menambah Kecamatan

Di `index.html`, cari array `KECAMATAN`:

```javascript
const KECAMATAN = [
  'Majalengka',
  'Cigasong',
  // Tambahkan kecamatan di sini
  'Kecamatan Baru',
];
```

---

## 🔄 UPDATE DEPLOYMENT

Jika ada perubahan di `Code.gs`:

1. Di Apps Script editor, klik **"Deploy"** → **"Manage deployments"**
2. Klik ✏️ (edit) pada deployment yang ada
3. Di **"Version"**, pilih **"New version"**
4. Klik **"Deploy"**

> ⚠️ URL Web App **tidak berubah** saat update – tidak perlu update `index.html`

---

## 🛠️ TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Error "Script function not found" | Pastikan nama fungsi `doPost` sudah benar di Code.gs |
| Data tidak masuk spreadsheet | Cek ID spreadsheet, pastikan tidak ada typo |
| Foto tidak terupload | Cek ID folder Drive, pastikan folder bisa diakses |
| GPS tidak muncul | Buka via HTTPS, bukan file:// |
| CORS error | Pastikan deploy sebagai "Anyone" |
| "Authorization required" | Re-deploy dan authorize ulang |

---

## 📊 Struktur Kolom Spreadsheet

| No | Kolom | Keterangan |
|----|-------|------------|
| 1 | Timestamp Submit | Waktu server saat data masuk |
| 2 | Nama PML/PPL | Nama petugas |
| 3 | ID Sobat | Nomor identitas |
| 4 | Kecamatan | Wilayah kerja |
| 5 | Latitude | Koordinat GPS |
| 6 | Longitude | Koordinat GPS |
| 7 | GeoAddress | Alamat dari reverse geocoding |
| 8 | Geostamp | Waktu pengambilan GPS |
| 9 | Jumlah Submit Hari Ini | Bangunan/KK hari ini |
| 10 | Jumlah Semua Submit | Total akumulasi |
| 11 | Link Foto Google Drive | URL foto di Drive |

---

## 📸 Format Nama File Foto

```
TanggalSubmit_Kecamatan_IDSOBAT_NamaPMLPPL.jpg
```

Contoh:
```
2026-05-18_Majalengka_3212345678901_BudiSantoso.jpg
```

---

## 📱 Kompatibilitas

- ✅ Android Chrome (direkomendasikan)
- ✅ Android Firefox
- ✅ iOS Safari
- ✅ Desktop Chrome / Edge / Firefox
- ⚠️ GPS membutuhkan HTTPS atau localhost

---

*Dibuat untuk Sensus Ekonomi 2026 – BPS RI*

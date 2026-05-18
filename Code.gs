// ================================================================
// CODE.GS – Google Apps Script untuk Form Lapangan SE2026
// BPS – Sensus Ekonomi 2026
// ================================================================
// KONFIGURASI – Ganti dengan ID yang sesuai
// ================================================================

const SPREADSHEET_ID  = '1o28CTI1SDOgWZCDwcOK-3gxV3FbL0KYg0DMNgxAaYrY';
const DRIVE_FOLDER_ID = '1K2e7MNNMqGsBy_K7e5HxFhPIyVDnnVc2';
const SHEET_NAME      = 'Data Lapangan SE2026'; // nama tab/sheet

// ================================================================
// doPost – Endpoint utama menerima POST dari form HTML
// ================================================================
function doPost(e) {
  try {
    // ── PERBAIKAN 1: Guard jika e atau e.postData undefined ──────
    // Terjadi saat fungsi di-run manual dari editor Apps Script,
    // atau saat request masuk tanpa body. Return pesan informatif.
    if (!e || !e.postData) {
      return buildResponse({
        status : 'error',
        message: 'Tidak ada data yang dikirim. Jalankan melalui form HTML, bukan manual dari editor.'
      });
    }

    // ── PERBAIKAN 2: Support dua cara pengiriman ─────────────────
    // A) FormData  → e.parameter.data  (dikirim dari fetch FormData)
    // B) Raw JSON  → e.postData.contents (dikirim dari fetch JSON body)
    let raw;
    if (e.parameter && e.parameter.data) {
      raw = e.parameter.data;                 // FormData field "data"
    } else if (e.postData && e.postData.contents) {
      raw = e.postData.contents;              // Raw JSON body
    } else {
      return buildResponse({ status:'error', message:'Body request kosong.' });
    }

    const data = JSON.parse(raw);

    // Validasi field wajib
    const required = ['nama','idSobat','kecamatan','latitude','longitude','fotoBase64','fotoNama'];
    for (const field of required) {
      if (!data[field] && data[field] !== 0) {
        return buildResponse({ status:'error', message:`Field '${field}' tidak boleh kosong.` });
      }
    }

    // 1. Upload foto ke Google Drive
    const fotoUrl = uploadFotoToDrive(data.fotoBase64, data.fotoNama);

    // 2. Simpan data ke Spreadsheet
    simpanKeSpreadsheet(data, fotoUrl);

    // 3. Return sukses
    return buildResponse({ status:'success', message:'Data berhasil disimpan.', fotoUrl });

  } catch (err) {
    console.error('doPost ERROR:', err.toString());
    return buildResponse({ status:'error', message:'Terjadi kesalahan server: ' + err.toString() });
  }
}

// ================================================================
// doGet – Health check & tangani akses langsung via browser
// ================================================================
function doGet(e) {
  return buildResponse({ status:'ok', message:'SE2026 API is running.' });
}

// ================================================================
// uploadFotoToDrive
// Konversi Base64 → Blob → Upload ke Google Drive
// ================================================================
function uploadFotoToDrive(base64String, fileName) {
  try {
    // Hapus data URI prefix jika ada (misalnya "data:image/jpeg;base64,")
    const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');

    // Decode Base64 ke Blob
    const decoded  = Utilities.base64Decode(cleanBase64);
    const blob     = Utilities.newBlob(decoded, 'image/jpeg', fileName);

    // Ambil folder Drive
    const folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID);

    // Cek apakah file dengan nama sama sudah ada – jika ada, hapus dulu
    const existing = folder.getFilesByName(fileName);
    while (existing.hasNext()) {
      existing.next().setTrashed(true);
    }

    // Upload file baru
    const file = folder.createFile(blob);

    // Set permission: siapa pun dengan link bisa melihat
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Return URL langsung ke file
    return file.getUrl();

  } catch (err) {
    console.error('uploadFotoToDrive ERROR:', err.toString());
    throw new Error('Gagal upload foto: ' + err.toString());
  }
}

// ================================================================
// simpanKeSpreadsheet
// Menulis satu baris data ke Spreadsheet
// ================================================================
function simpanKeSpreadsheet(data, fotoUrl) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Buat header baris pertama
      buatHeader(sheet);
    }

    // Cek apakah sudah ada header, jika belum buat
    if (sheet.getLastRow() === 0) {
      buatHeader(sheet);
    }

    // Timestamp submit (waktu server)
    const timestampSubmit = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );

    // Susun baris data
    const row = [
      timestampSubmit,               // 1.  Timestamp Submit
      data.nama       || '',         // 2.  Nama PML/PPL
      data.idSobat    || '',         // 3.  ID Sobat
      data.kecamatan  || '',         // 4.  Kecamatan
      data.latitude   || '',         // 5.  Latitude
      data.longitude  || '',         // 6.  Longitude
      data.geoAddress || '',         // 7.  GeoAddress
      data.geostamp   || '',         // 8.  Geostamp
      data.submitHariIni || 0,       // 9.  Jumlah Submit Hari Ini
      data.submitTotal   || 0,       // 10. Jumlah Semua Submit
      fotoUrl                        // 11. Link Foto Google Drive
    ];

    // Append ke baris terakhir
    sheet.appendRow(row);

    // Auto-resize kolom
    sheet.autoResizeColumns(1, 11);

  } catch (err) {
    console.error('simpanKeSpreadsheet ERROR:', err.toString());
    throw new Error('Gagal menyimpan ke spreadsheet: ' + err.toString());
  }
}

// ================================================================
// buatHeader – Menulis baris header ke sheet
// ================================================================
function buatHeader(sheet) {
  const headers = [
    'Timestamp Submit',
    'Nama PML/PPL',
    'ID Sobat',
    'Kecamatan',
    'Latitude',
    'Longitude',
    'GeoAddress',
    'Geostamp',
    'Jumlah Submit Hari Ini',
    'Jumlah Semua Submit',
    'Link Foto Google Drive'
  ];
  sheet.appendRow(headers);

  // Style header: bold, background orange, teks putih
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#E8500A');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
}

// ================================================================
// buildResponse – Helper membuat ContentService response JSON
// ── PERBAIKAN 2: Tidak perlu kirim custom headers lewat
//    ContentService (GAS Web App tidak support itu).
//    CORS ditangani di sisi fetch HTML dengan mode 'no-cors'
//    atau via redirect ke endpoint GAS yang mengembalikan JSON.
// ================================================================
function buildResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// TEST FUNCTION – Jalankan dari editor untuk uji coba
// Simulasikan e.parameter.data seperti yang dikirim FormData
// ================================================================
function testDoPost() {
  const mockData = {
    nama          : 'Budi Santoso',
    idSobat       : '3212345678901',
    kecamatan     : 'Majalengka',
    latitude      : -6.8358,
    longitude     : 108.2277,
    geoAddress    : 'Jl. Raya Majalengka, Majalengka, Jawa Barat',
    geostamp      : '2026-05-18 09:30:00',
    submitHariIni : 10,
    submitTotal   : 45,
    fotoBase64    : 'AAAA',  // dummy base64 – hanya test spreadsheet
    fotoNama      : '2026-05-18_Majalengka_3212345678901_BudiSantoso.jpg',
  };

  // Simulasi objek e seperti yang dikirim dari FormData
  const fakeE = {
    parameter : { data: JSON.stringify(mockData) },
    postData  : null,
  };

  const result = doPost(fakeE);
  Logger.log('Hasil test: ' + result.getContent());
}

// ================================================================
// TEST TANPA FOTO – hanya test simpan spreadsheet
// ================================================================
function testSpreadsheetOnly() {
  const mockData = {
    nama          : 'Budi Santoso',
    idSobat       : '3212345678901',
    kecamatan     : 'Majalengka',
    latitude      : -6.8358,
    longitude     : 108.2277,
    geoAddress    : 'Jl. Raya Majalengka, Majalengka, Jawa Barat',
    geostamp      : '2026-05-18 09:30:00',
    submitHariIni : 10,
    submitTotal   : 45,
  };

  simpanKeSpreadsheet(mockData, 'https://drive.google.com/test-url');
  Logger.log('✅ Test spreadsheet berhasil! Cek sheet: ' + SHEET_NAME);
}

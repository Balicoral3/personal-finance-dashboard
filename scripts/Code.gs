function normalizeNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    var cleaned = value.replace(/[^0-9.]/g, '');
    if (cleaned === '') return NaN;
    return parseFloat(cleaned);
  }
  return NaN;
}

function formatDate(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  if (typeof value === 'string') {
    value = value.trim();
    
    // Cek format dd/mm/yyyy
    var parts = value.split('/');
    if (parts.length === 3) {
      var day = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10) - 1;
      var year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        var d = new Date(year, month, day);
        return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
    }
    
    // Cek format yyyy-mm-dd
    var parts2 = value.split('-');
    if (parts2.length === 3) {
      var year2 = parseInt(parts2[0], 10);
      var month2 = parseInt(parts2[1], 10) - 1;
      var day2 = parseInt(parts2[2], 10);
      if (!isNaN(day2) && !isNaN(month2) && !isNaN(year2)) {
        var d2 = new Date(year2, month2, day2);
        return Utilities.formatDate(d2, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
    }
    
    // Fallback
    var d3 = new Date(value);
    if (!isNaN(d3.getTime())) {
      return Utilities.formatDate(d3, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }
  return String(value).trim();
}

function onFormSubmit(e) {
  if (!e) {
    console.log("Fungsi ini tidak bisa dijalankan manual. Harus via trigger Form Submit.");
    return;
  }

  var sheet = e.range.getSheet();
  var row = e.range.getRow();

  // Baca header untuk memetakan nama kolom ke nomor kolom (1-based)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colMap = {}; // nama header -> nomor kolom (1-based)
  for (var i = 0; i < headers.length; i++) {
    colMap[headers[i].toString().trim()] = i + 1;
  }

  // Ambil nilai dari namedValues
  var named = e.namedValues;
  function getNamed(nama) {
    return named[nama] ? named[nama][0] : "";
  }

  var tglTransaksi = getNamed("Tanggal Transaksi");
  var nama = getNamed("Nama");
  var deskripsi = getNamed("Deskripsi");
  var jumlahRaw = getNamed("Jumlah");
  var jumlah = normalizeNumber(jumlahRaw);

  // Buat ID unik dan set flag awal
  var idTrans = Utilities.getUuid().substring(0, 8);
  var idCol = colMap["ID_Transaksi"];
  var dupCol = colMap["Duplicate_Flag"];
  if (idCol) sheet.getRange(row, idCol).setValue(idTrans);
  if (dupCol) sheet.getRange(row, dupCol).setValue("OK");

  // Normalisasi untuk perbandingan
  var tanggalNormal = formatDate(tglTransaksi);
  var deskripsiNormal = deskripsi.trim().toLowerCase();
  var namaNormal = nama.trim().toLowerCase();

  console.log("Tanggal Normal: " + tanggalNormal);
  console.log("Nama Normal: " + namaNormal);
  console.log("Deskripsi Normal: " + deskripsiNormal);
  console.log("Jumlah: " + jumlah);

  // Ambil semua data transaksi yang sudah ada
  var allData = sheet.getDataRange().getValues();
  var isDuplicate = false;

  // Loop dari baris 2 (index 1) sampai sebelum baris saat ini
  for (var i = 1; i < allData.length; i++) {
    if (i + 1 === row) continue; // lewati baris yang baru diinput

    var r = allData[i];

    // Log perbandingan untuk setiap baris yang dicek
    console.log("Baris " + (i + 1) + " -> Tanggal: " + formatDate(r[colMap["Tanggal Transaksi"] - 1]) +
                ", Nama: " + (r[colMap["Nama"] - 1] ? r[colMap["Nama"] - 1].toString().trim().toLowerCase() : "kosong") +
                ", Deskripsi: " + (r[colMap["Deskripsi"] - 1] ? r[colMap["Deskripsi"] - 1].toString().trim().toLowerCase() : "kosong") +
                ", Jumlah: " + normalizeNumber(r[colMap["Jumlah"] - 1]));

    var rTanggal = formatDate(r[colMap["Tanggal Transaksi"] - 1]);
    var rNama = r[colMap["Nama"] - 1] ? r[colMap["Nama"] - 1].toString().trim().toLowerCase() : "";
    var rDeskripsi = r[colMap["Deskripsi"] - 1] ? r[colMap["Deskripsi"] - 1].toString().trim().toLowerCase() : "";
    var rJumlah = normalizeNumber(r[colMap["Jumlah"] - 1]);

    if (rTanggal === tanggalNormal &&
        rNama === namaNormal &&
        rDeskripsi === deskripsiNormal &&
        rJumlah === jumlah) {
      isDuplicate = true;
      break;
    }
  }

  if (dupCol) {
    sheet.getRange(row, dupCol).setValue(isDuplicate ? "DUPLICATE" : "OK");
  }
}

function updateHargaAset() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Harga_Aset");
  if (!sheet) {
    console.log("Sheet 'Harga_Aset' tidak ditemukan. Pastikan nama sheet sudah benar.");
    return;
  }

  var timestamp = new Date();
  var kursIDR = 16000; // Asumsi kurs 1 USD = 16.000 IDR. Bisa diubah manual atau dijadikan dinamis.

      // ========== Ambil Harga Bitcoin dari Coinbase ==========
  try {
    var btcUrl = "https://api.coinbase.com/v2/prices/BTC-USD/spot";
    var btcResponse = UrlFetchApp.fetch(btcUrl);
    var btcData = JSON.parse(btcResponse.getContentText());
    var btcUsd = parseFloat(btcData.data.amount);
    sheet.appendRow([timestamp, "Bitcoin", btcUsd, btcUsd * kursIDR]);
    console.log("Bitcoin USD: " + btcUsd);
  } catch (e) {
    console.log("Bitcoin fetch error: " + e.toString());
  }

  // ========== Ambil Harga Emas dari GoldAPI.io ==========
  var goldApiKey = "goldapi-a0b9f60291e26dd0a7865396b21e8a4e-io"; // ⚠️ GANTI dengan API key asli Anda
  var goldUrl = "https://www.goldapi.io/api/XAU/USD";
  var options = {
    headers: {
      "x-access-token": goldApiKey
    }
  };

  try {
    var goldResponse = UrlFetchApp.fetch(goldUrl, options);
    var goldData = JSON.parse(goldResponse.getContentText());
    var goldUsd = goldData.price;
    sheet.appendRow([timestamp, "Emas", goldUsd, goldUsd * kursIDR]);
    console.log("Emas USD: " + goldUsd);
  } catch (e) {
    console.log("Gold fetch error: " + e.toString());
  }
}

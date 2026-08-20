function calculatePortfolio() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var transSheet = ss.getSheetByName("Transaksi");
  var portSheet = ss.getSheetByName("Portfolio_Summary");
  var hargaSheet = ss.getSheetByName("Harga_Aset");

  if (!transSheet || !portSheet || !hargaSheet) {
    console.log("Pastikan sheet 'Transaksi', 'Portfolio_Summary', dan 'Harga_Aset' ada.");
    return;
  }

  // Ambil data transaksi (dari baris 2 ke bawah)
  var transData = transSheet.getDataRange().getValues();
  var headers = transData[0];
  
  // Pemetaan kolom
  var colMap = {};
  for (var i = 0; i < headers.length; i++) {
    colMap[headers[i].toString().trim()] = i;
  }

  // Inisialisasi posisi aset per orang
  var portofolio = {}; // key: "Nama|Aset", value: {unit, modal}

  // Loop transaksi (mulai dari index 1 karena 0 header)
  for (var i = 1; i < transData.length; i++) {
    var row = transData[i];
    var nama = row[colMap["Nama"]];
    var tipe = row[colMap["Tipe Transaksi"]];
    var kategori = row[colMap["Kategori"]] || "";
    var jumlah = normalizeNumber(row[colMap["Jumlah"]]);
    var unit = normalizeNumber(row[colMap["Jumlah Unit"]]);
    if (isNaN(unit)) unit = 0;

    // Tentukan aset dari kategori
    var aset = "";
    if (kategori.indexOf("Emas") > -1) aset = "Emas";
    else if (kategori.indexOf("Bitcoin") > -1) aset = "Bitcoin";
    if (!aset || isNaN(jumlah) || isNaN(unit)) continue;

    var key = nama + "|" + aset;
    if (!portofolio[key]) {
      portofolio[key] = { unit: 0, modal: 0 };
    }

    if (tipe === "Pengeluaran") {
      // Beli aset
      portofolio[key].unit += unit;
      portofolio[key].modal += jumlah;
    } else if (tipe === "Pemasukan") {
      // Jual aset
      portofolio[key].unit -= unit;
      // Kurangi modal secara proporsional (asumsikan modal rata-rata)
      if (portofolio[key].unit < 0) portofolio[key].unit = 0; // hindari negatif
      // Untuk sederhana, modal tidak dikurangi saat jual (kita hanya hitung modal awal) 
      // Namun agar ROI benar, kita kurangi modal dengan harga jual? 
      // Kita biarkan modal = total beli - total jual (jumlah rupiah)
      portofolio[key].modal -= jumlah; // kurangi modal dari hasil penjualan
    }
  }

  // Ambil harga terkini dari Harga_Aset (baris terakhir per aset)
  var hargaData = hargaSheet.getDataRange().getValues();
  var hargaTerakhir = {}; // aset -> harga IDR
  for (var j = 1; j < hargaData.length; j++) {
    var asetHarga = hargaData[j][1];
    var hargaIDR = hargaData[j][3]; // kolom D: Harga_IDR
    if (asetHarga && !isNaN(hargaIDR)) {
      hargaTerakhir[asetHarga] = hargaIDR;
    }
  }

  // Tulis hasil ke Portfolio_Summary
  portSheet.clearContents();
  portSheet.appendRow(["Nama", "Aset", "Total_Unit", "Modal", "Harga_Sekarang_IDR", "Nilai_Sekarang_IDR", "ROI"]);

  for (var key in portofolio) {
    var parts = key.split("|");
    var namaPemilik = parts[0];
    var asetJenis = parts[1];
    var unitDimiliki = portofolio[key].unit;
    var modalTotal = portofolio[key].modal;
    var hargaSekarang = hargaTerakhir[asetJenis] || 0;
    var nilaiSekarang = unitDimiliki * hargaSekarang;
    var roi = modalTotal !== 0 ? (nilaiSekarang - modalTotal) / modalTotal : 0;

    portSheet.appendRow([
      namaPemilik,
      asetJenis,
      unitDimiliki,
      modalTotal,
      hargaSekarang,
      nilaiSekarang,
      roi
    ]);
  }

  console.log("Portofolio berhasil dihitung.");
}

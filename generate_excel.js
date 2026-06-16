const ExcelJS = require('exceljs');
const path = require('path');

async function createTestChecklist() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('UAT Checklist MBG');

  sheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Modul', key: 'modul', width: 20 },
    { header: 'Fitur / Skenario Testing', key: 'fitur', width: 60 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Catatan (Opsional)', key: 'catatan', width: 40 },
  ];

  // Styling header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' } // Dark blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const testCases = [
    { modul: 'Katalog Publik', fitur: 'Tampilan Grid Katalog responsif (1 kolom di HP, 3-4 di Desktop)' },
    { modul: 'Katalog Publik', fitur: 'Filter Horizontal Cabang & Kategori berfungsi' },
    { modul: 'Katalog Publik', fitur: 'Barang "Terjual/Dipesan" tidak bisa diklik, grayscale, & ada stempel merah overlay' },
    { modul: 'Katalog Publik', fitur: 'Detail Barang: Slider Gambar produk dapat digeser (swipeable di HP)' },
    { modul: 'Katalog Publik', fitur: 'Detail Barang: Catatan Minus/Defect muncul transparan dalam kotak peringatan merah' },
    { modul: 'Katalog Publik', fitur: 'Detail Barang: Tombol WhatsApp Sticky (lengket di bawah), link pre-filled berisi SKU & Harga' },
    
    { modul: 'Admin Core', fitur: 'Halaman Login aman (Password "admin123") dan menolak akses URL /admin secara langsung (Middleware)' },
    { modul: 'Admin Core', fitur: 'Navigasi Sidebar mendeteksi menu aktif & fitur Logout' },
    { modul: 'Admin Core', fitur: 'Dashboard menampilkan metrik (Barang Aktif, Terjual Hari Ini, Pendapatan Hari Ini) secara akurat' },
    { modul: 'Admin Core', fitur: 'Dashboard menampilkan Grafik Distribusi Kategori (Recharts)' },
    
    { modul: 'Manajemen Barang', fitur: 'Halaman tabel manajemen semua barang' },
    { modul: 'Manajemen Barang', fitur: 'Form Tambah Barang: Logika Backend Auto-generate SKU berdasarkan kode cabang (MBG-JKT-001)' },
    { modul: 'Manajemen Barang', fitur: 'Form Tambah Barang: Simulasi kompresi ukuran gambar klien berhasil menghemat ukuran' },
    { modul: 'Manajemen Barang', fitur: 'Detail Barang (Admin): Tombol Print Barcode merender layout stiker kecil khusus printer thermal (80/50mm)' },
    
    { modul: 'POS Kasir', fitur: 'Terdapat dropdown Pilih Nama Kasir (Input scanner terkunci jika nama belum dipilih)' },
    { modul: 'POS Kasir', fitur: 'Auto-focus Barcode Input: Mendeteksi Enter dari scanner fisik & menembak API langsung' },
    { modul: 'POS Kasir', fitur: 'Memainkan suara "Beep" tinggi jika sukses menemukan SKU, atau nada "Error" jika salah' },
    { modul: 'POS Kasir', fitur: 'Checkout berhasil: Status item menjadi "Terjual", input SalesTransaction Audit Log ke database' },
    { modul: 'POS Kasir', fitur: 'Checkout berhasil: Langsung otomatis memunculkan Dialog Cetak Struk Kertas Kasir (Thermal Receipt layout)' },
    { modul: 'POS Kasir', fitur: 'Pencegahan Double-Scan: Menolak SKU yang dipindai lagi jika status barang sudah Terjual sebelumnya' },
    
    { modul: 'Laporan Penjualan', fitur: 'Halaman Laporan menyajikan semua data transaksi di tabel (Tanggal, Nama Kasir, Harga, dll)' },
    { modul: 'Laporan Penjualan', fitur: 'Filter Laporan bekerja baik: Berdasarkan Cabang dan Rentang Tanggal' },
    { modul: 'Laporan Penjualan', fitur: 'Export ke Excel (CSV): Berhasil mendownload tabel laporan sesuai dengan data filter yang muncul' },
  ];

  testCases.forEach((tc, index) => {
    sheet.addRow({
      no: index + 1,
      modul: tc.modul,
      fitur: tc.fitur,
      status: '', 
      catatan: ''
    });
  });

  // Apply dropdown validation (Data Validation) for Status column
  for (let i = 2; i <= testCases.length + 1; i++) {
    sheet.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"selesai,bug,need update"']
    };
  }

  // Wrap text and add borders
  sheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: 'middle', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
    });
  });

  const filePath = path.join(__dirname, 'UAT_Checklist_Testing_MBG.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('File successfully generated at:', filePath);
}

createTestChecklist().catch(console.error);

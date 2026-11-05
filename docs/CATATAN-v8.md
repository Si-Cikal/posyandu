# Catatan Perubahan v8.0

## Rekap laporan bulanan ILP
- Menu baru **Laporan bulanan ILP** tersedia untuk admin dan petugas posyandu.
- Periode dapat dipilih per bulan. Admin dapat memilih seluruh posyandu atau satu posyandu; petugas terkunci ke posyandu akunnya.
- Rekap menghitung sasaran aktif saat ini, kehadiran sasaran unik, kader hadir unik, skrining, layanan ibu, imunisasi/suplementasi, kunjungan rumah, rujukan, kegiatan edukasi, serta peserta edukasi.
- Tabel siklus hidup menampilkan jumlah sasaran aktif, hadir unik, dan skrining menurut kelompok.
- Panel perhatian menampilkan rujukan belum selesai, kunjungan rumah lewat jadwal, stok minimum, dan barang kedaluwarsa.
- Laporan dapat diekspor sebagai CSV dan dicetak / disimpan sebagai PDF melalui dialog cetak browser.
- Tampilan laporan berupa agregat tanpa daftar nama warga.

## Perhitungan dan batasan
- Aktivitas dihitung berdasarkan field `date` pada bulan terpilih.
- Jumlah sasaran aktif menggambarkan kondisi data saat laporan dibuat, bukan rekonstruksi jumlah sasaran pada bulan lampau.
- Proporsi hadir hanya rasio administratif antara sasaran hadir unik dan jumlah sasaran aktif saat ini; bukan indikator cakupan resmi atau perhitungan kohort.
- Rujukan, kunjungan lewat jadwal, stok minimum, dan barang kedaluwarsa merupakan status saat laporan dibuka (snapshot terkini).
- Tidak ada koleksi Firestore baru atau migrasi skema yang diperlukan.

## Pengujian
- Pemeriksaan statis Node.js mencakup versi, service worker, navigasi, props komponen, filter bulan/wilayah, ekspor, dan mode cetak.
- Uji Firebase Emulator dan pengujian manual perangkat tetap wajib dilakukan pada project uji sebelum rilis produksi.

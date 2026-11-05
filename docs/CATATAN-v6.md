# Catatan Perubahan v6.0

## UI/UX
- Tema aplikasi disegarkan ke warna teal klinis dengan kontras mode gelap dan komponen workspace responsif.
- Menu layanan ILP diperluas dan tersedia pada akun admin maupun petugas posyandu.
- Setiap modul memiliki ringkasan, formulir, pencarian, filter status, riwayat, edit/hapus, dan ekspor.

## Modul baru
- Pemantauan ibu hamil, nifas, menyusui, ANC, tekanan darah, LILA, TTD, dan tindak lanjut.
- Riwayat imunisasi dan suplementasi, batch, serta tanggal berikutnya.
- Kunjungan rumah, alasan, temuan, tindakan, status, dan kunjungan ulang.
- Rujukan, urgensi, fasilitas tujuan, status, dan tindak lanjut.
- Logistik / PMT dengan stok, batas minimum, batch, dan kedaluwarsa.
- Edukasi dan penyuluhan dengan kelompok sasaran dan jumlah peserta.
- Dashboard PWS dengan periode 7 hari/bulan/tahun, jangkauan warga, komposisi siklus hidup, layanan, aktivitas, dan daftar perhatian.

## Data & keamanan
- Backup JSON mencakup semua modul baru.
- Koleksi Firestore baru: `anc`, `immunizations`, `home_visits`, `referrals`, `logistics`, `education`.
- Aturan akses modul baru membatasi petugas menurut field `posyandu`; admin dapat mengakses lintas posyandu.
- Service worker cache diperbarui ke `posyandu-ilp-v11`.
- Tes emulator ditambah untuk akses publik dan pembatasan data per posyandu.

## Perhatian
- Belum dilakukan pengujian Firebase Emulator pada sesi pengembangan ini karena Firebase CLI/dependensi tes tidak tersedia dan pemasangan dependensi tidak berhasil selesai. Sintaks JSX, JavaScript, HTML, manifest, dan service worker telah diperiksa. Jalankan `npm install` lalu `npm test` di folder `tests/` pada lingkungan dengan Firebase CLI sebelum menerapkan rules di produksi.
- Modul pencatatan tidak menggantikan Buku KIA, register resmi, penilaian tenaga kesehatan, atau pelaporan e-PPGBM/ASIK/SIMPUS/SATUSEHAT. Konfirmasi SOP, jadwal, dosis, indikator, dan alur rujukan dengan Puskesmas setempat.

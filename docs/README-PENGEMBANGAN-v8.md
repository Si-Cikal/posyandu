# Posyandu ILP Mawar - Pengembangan v8.0

Versi 8 melanjutkan aplikasi satu halaman React + Firebase Auth + Cloud Firestore + PWA dari v7. Tidak ada koleksi Firestore baru dan tidak ada migrasi data yang wajib.

## Pembaruan v8.0

### Rekap laporan bulanan ILP
1. Menu **Laporan bulanan ILP** tersedia untuk admin dan petugas.
2. Pilih bulan pelaporan menggunakan pemilih bulan.
3. Admin dapat memilih semua posyandu atau satu posyandu. Petugas hanya dapat melihat data dari posyandu akunnya.
4. Ringkasan mencakup sasaran aktif, kehadiran sasaran dan kader unik, skrining, ANC/layanan ibu, imunisasi/suplementasi, kunjungan rumah, rujukan, edukasi, dan peserta edukasi.
5. Tabel siklus hidup menampilkan sasaran aktif, hadir unik, dan jumlah skrining.
6. Panel perhatian menampilkan rujukan belum selesai, kunjungan rumah lewat jadwal, stok minimum, dan barang kedaluwarsa.
7. Tombol **Ekspor CSV** membuat file yang dapat dibuka dengan Excel/LibreOffice. Tombol **Cetak / Simpan PDF** membuka dialog cetak browser; pilih printer **Save as PDF / Simpan sebagai PDF**.

## Cara memperbarui dari v7
1. Ekspor backup JSON dari menu Pengaturan pada v7 dan simpan terpisah.
2. Simpan salinan folder hosting lama.
3. Unggah isi folder paket v8 ke lokasi hosting yang sama. Pastikan `index.html`, `sw.js`, `manifest.webmanifest`, dan folder `icons/` ikut terunggah.
4. Rules Firestore v7 tetap digunakan; v8 tidak menambah koleksi atau mengubah struktur akses. Jangan mengganti rules produksi tanpa audit.
5. Buka aplikasi, lakukan hard refresh, masuk sebagai akun admin dan akun kader uji.
6. Periksa filter bulan dan posyandu, lalu cocokkan hasil rekap dengan catatan sumber.

## Arti angka laporan
- **Sasaran aktif saat ini**: jumlah warga yang berstatus aktif ketika laporan dibuka. Tidak menggambarkan jumlah sasaran pada bulan historis.
- **Hadir unik**: jumlah ID sasaran berbeda yang tercatat hadir di bulan terpilih; kunjungan berulang tidak dihitung sebagai orang baru.
- **Proporsi hadir**: rasio hadir unik dibagi sasaran aktif saat ini. Ini indikator internal, bukan cakupan resmi dan bukan kohort historis.
- **Perhatian saat ini**: rujukan, jadwal kunjungan, dan logistik menampilkan status terbaru ketika halaman dibuka, bukan snapshot akhir bulan.
- Laporan cetak tidak memuat daftar nama warga.

## Pengujian
Jalankan dari folder `tests/`:

```bash
npm run test:static
```

Pemeriksaan ini tidak menggantikan tes manual, Firebase Emulator, pemeriksaan hak akses lintas akun, atau uji cetak di browser. Gunakan project Firebase percobaan dan akun contoh. Jangan uji dengan data kesehatan warga asli.

## Keamanan dan penggunaan
- Gunakan akun individual dan batasi akses sesuai tugas.
- Jangan bagikan ekspor CSV/backup kepada pihak yang tidak berwenang.
- Antrean offline v7 tetap disimpan di browser dan belum dienkripsi aplikasi. Tunggu sampai antrean kosong dan buat backup sebelum membersihkan data situs.
- Rekap ini bukan pengganti register resmi, Buku KIA, e-PPGBM, ASIK, SATUSEHAT, atau format laporan Puskesmas. Cocokkan dengan SOP dan arahan Puskesmas.

## Berkas penting
- `index.html` - aplikasi utama.
- `sw.js` - cache PWA v13.
- `firestore.rules` - aturan akses dari v7 (tidak berubah untuk v8).
- `PANDUAN-PENGGUNA-v8.pdf` - panduan admin dan petugas.
- `PANDUAN-UJI.md` - pemeriksaan manual dan otomatis.
- `PANDUAN-KEAMANAN.md` - setup dan privasi.

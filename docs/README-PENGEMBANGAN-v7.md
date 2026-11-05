# Posyandu ILP Mawar — Pengembangan v7.0

v7.0 melanjutkan aplikasi satu halaman React + Firebase Auth + Cloud Firestore + PWA dari v6. Tidak ada koleksi Firestore baru yang diwajibkan; modul agenda mengambil data dari koleksi layanan yang telah ada.

## Pembaruan v7.0

### 1. Agenda & tindak lanjut terpadu
- Menu baru menggabungkan jadwal tindak lanjut dari ANC, imunisasi/suplementasi, kunjungan rumah, dan rujukan.
- Agenda dikelompokkan menjadi terlambat, hari ini, 7 hari ke depan, dan belum dijadwalkan.
- Pencarian nama/jenis layanan/catatan, filter per posyandu, dan ekspor daftar yang sedang difilter tersedia.
- Tombol pada setiap agenda membuka modul asal untuk menyelesaikan atau memperbarui catatan.
- Daftar ini bersifat administratif dan tidak menetapkan prioritas klinis.

### 2. Antrean sinkronisasi offline
- Operasi tambah/ubah/hapus yang gagal karena koneksi terputus disimpan sebagai antrean lokal.
- Antrean dikirim ulang saat koneksi kembali, aplikasi dibuka ke depan, atau petugas menekan tombol "Coba sinkronkan".
- Item antrean terikat pada akun/role yang membuatnya. Item milik akun lain tidak pernah dikirim menggunakan sesi akun yang sedang aktif.
- Antrean yang belum tersinkron tetap dipertahankan saat petugas keluar. Aplikasi meminta konfirmasi sebelum logout bila masih ada antrean milik akun aktif.
- Backup JSON sekarang menyertakan antrean sinkronisasi yang masih tertunda.

### 3. Paket pengujian
- Tes statis bawaan Node.js tanpa dependensi tambahan: `npm run test:static`.
- Tes aturan Firestore memakai Firebase Emulator tetap tersedia: `npm test` (memerlukan dependensi npm dan Firebase CLI).

## Cara menerapkan

1. Buat backup JSON dan ekspor Firestore dari versi sebelumnya.
2. Unggah isi folder ini ke hosting (termasuk `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, dan panduan).
3. Rules Firestore tidak menambah koleksi baru pada v7. Tetap gunakan rules v6 dari `firestore.rules` bila belum diterapkan.
4. Uji antrean offline di project Firebase uji, bukan project yang memuat data warga asli.
5. Lakukan uji manual sesuai `PANDUAN-UJI.md` sebelum rilis produksi.

## Catatan batasan

- Antrean sinkronisasi disimpan pada browser/perangkat yang digunakan dan tidak dienkripsi oleh aplikasi. Jangan gunakan komputer bersama; jangan hapus data situs, cache browser, atau penyimpanan aplikasi sebelum antrean berstatus kosong dan backup sudah dibuat.
- Antrean hanya disinkronkan oleh role yang sama. Jika petugas pindah perangkat atau akun tidak lagi tersedia, ekspor backup dan lakukan rekonsiliasi secara manual dengan admin.
- Jika koneksi terputus ketika menghapus/mengubah data, periksa status antrean sebelum mengulang operasi agar tidak membuat duplikasi.
- Fitur ini bukan antrean transaksi multi-perangkat dan tidak menggantikan prosedur rekonsiliasi data.
- Aplikasi tetap bukan rekam medis lengkap, bukan penentu diagnosis, dan bukan pengganti Buku KIA atau pelaporan resmi. Ikuti SOP Puskesmas dan pedoman Kementerian Kesehatan.
- Data kesehatan dan data anak merupakan data pribadi yang perlu perlindungan ketat. Terapkan akun individual, kata sandi kuat, pembatasan akses, perangkat yang terkunci, backup terkontrol, dan prosedur retensi/penghapusan data sesuai kebijakan pengelola.

## Berkas

- `index.html` — antarmuka, modul dan logika aplikasi.
- `firestore.rules` — aturan akses Firebase.
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA.
- `tests/` — pemeriksaan statis dan tes emulator rules.
- `PANDUAN-UJI.md`, `PANDUAN-KEAMANAN.md` — panduan penerapan dan pengujian.

## Rujukan operasional

- Kementerian Kesehatan RI, [Petunjuk Teknis Integrasi Pelayanan Kesehatan Primer (HK.01.07/MENKES/2015/2023)](https://kesprimkom.kemkes.go.id/konten/158/176/0/nomor-hk-01-07-menkes-2015-2023).
- Kementerian Kesehatan RI, [arah layanan primer berdasarkan siklus hidup dan penguatan kunjungan rumah (27 Juli 2026)](https://kemkes.go.id/id/layanan-primer-berdasarkan-siklus-hidup-ujung-tmbak-layanan).
- Republik Indonesia, [UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Home/Download/224884/UU%20Nomor%2027%20Tahun%202022.pdf).

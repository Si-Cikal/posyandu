# Panduan Pengujian (v8.0)

**Aturan emas: uji di project Firebase terpisah (mis. `posyandu-uji`), jangan di project yang berisi data warga asli.**

## A. Uji otomatis aturan keamanan (emulator, ±5 menit)
Tidak menyentuh data asli dan gratis.
```
npm i -g firebase-tools
cd tests && npm install && npm run test:rules
```
Berisi skenario keamanan data lama dan modul ILP tambahan: publik tidak bisa baca data warga, sesi anonim lama ditolak, absen mandiri (kartu valid/ganda/salah posyandu/non-aktif/jadwal tutup), petugas dibatasi per posyandu, pengaduan via kode. Semua harus **lulus**; kalau ada yang gagal, jangan publish rules.

## B. Uji manual di project uji (±30 menit)
1. Buat project Firebase baru, ikuti `PANDUAN-KEAMANAN.md` (6 akun, matikan sign-up, publish rules).
2. Salin konfigurasi project uji ke `USER_FIREBASE_CONFIG` di `index.html`, lalu jalankan lokal (`npx serve .` atau Firebase Hosting preview channel).
3. Centang daftar ini di HP (Android murah, Chrome) dan komputer:

**Login**
- [ ] Sandi salah menampilkan pesan, sandi benar masuk. Setelah refresh tetap masuk.
- [ ] Mawar 1 hanya melihat data Mawar 1; admin melihat semuanya.
- [ ] Keluar lalu buka lagi: data warga tidak tampak di halaman depan.
- [ ] Ganti sandi berhasil; sandi lama tidak bisa dipakai.

**Publik (buka di jendela privat, tanpa login)**
- [ ] Tidak ada "Cek data saya". Tombol Jadwal menampilkan jam layanan.
- [ ] Absen dengan ID kartu valid berhasil; kedua kalinya ditolak.
- [ ] Absen saat jadwal ditutup / posyandu salah / ID ngawur ditolak.
- [ ] Kirim pengaduan: muncul kode `ADU-...`; menu Balasan dengan kode itu menampilkan balasan setelah petugas membalas. Pencarian dengan nama tidak ada lagi.

**Data warga**
- [ ] Isi tanggal lahir balita: klaster otomatis "Bayi & Balita", umur tampil.
- [ ] Impor `Template_Impor_Warga_ILP.csv` (dan satu berkas .xlsx): jumlah siap/dilewati sesuai; NIK ganda dan tanggal salah dilaporkan per baris.
- [ ] Tandai warga "Pindah": hilang dari daftar, tidak bisa absen (kartu maupun nama).
- [ ] Banner "perlu pindah klaster" muncul untuk data lama yang umurnya berubah.

**Skrining**
- [ ] Tensi `120 80`, `120/80`, `150-95` terbaca; berat 500 kg ditolak.
- [ ] Balita tanpa temuan menampilkan "Pengukuran tercatat", bukan "Normal".
- [ ] Skrining sebelum pukul 07.00 WIB tercatat di tanggal hari itu (ubah jam HP untuk menguji).

## C. Peluncuran bertahap
1. Backup JSON dari aplikasi lama (menu Pengaturan) dan ekspor Firestore.
2. Terapkan ke project asli di luar jam layanan, uji login 6 akun.
3. Pilot 1 posyandu selama 1 kegiatan, baru semua posyandu.


## D. Uji modul ILP v6
- [ ] Login sebagai kader Mawar 1: hanya catatan modul Mawar 1 terlihat.
- [ ] Tambah dan edit pemantauan ibu hamil/nifas; cek tanggal dan posyandu tersimpan.
- [ ] Tambah riwayat imunisasi/suplementasi dan tanggal kunjungan berikutnya; cocokkan dengan Buku KIA serta jadwal Puskesmas.
- [ ] Buat rencana kunjungan rumah, ubah status menjadi selesai, lalu uji tindak lanjut yang lewat tanggal.
- [ ] Catat rujukan dan status pemantauannya. Tanda bahaya tetap harus segera ditangani tenaga kesehatan.
- [ ] Tambah / ubah logistik, periksa penanda stok minimum serta kedaluwarsa.
- [ ] Catat edukasi dan jumlah peserta.
- [ ] Login admin: PWS dapat difilter per posyandu atau seluruh posyandu dan hasil ekspor dapat dibuka.
- [ ] Coba akses koleksi `anc`, `immunizations`, `home_visits`, `referrals`, `logistics`, `education` tanpa login: harus ditolak.


## E. Uji tambahan v7 (antrean offline & pemisahan cache)

**Jalankan pemeriksaan statis terlebih dahulu** (Node.js 18+; tidak perlu instalasi dependency):
```
cd tests && npm run test:static
```
Semua pemeriksaan statis harus lulus. Untuk pengujian emulator rules, jalankan `npm install` lalu `npm run test:rules` pada komputer yang sudah memasang Firebase CLI.

Uji manual tambahan pada project Firebase percobaan:
- [ ] Login sebagai kader Mawar 1, pastikan cache/data hanya milik role Mawar 1.
- [ ] Logout, login sebagai kader Mawar 2 pada browser/perangkat yang sama; data Mawar 1 tidak boleh tampil sesaat maupun setelah halaman dimuat ulang.
- [ ] Login kembali sebagai Mawar 1, putuskan koneksi internet, buat dan ubah satu catatan di modul ILP. Banner jumlah perubahan tertunda harus muncul.
- [ ] Dengan koneksi masih terputus, logout: aplikasi harus meminta konfirmasi dan menjelaskan antrean tetap disimpan untuk role yang sama.
- [ ] Login dengan akun Mawar 2: antrean milik Mawar 1 tidak boleh dikirim menggunakan akun Mawar 2.
- [ ] Login kembali dengan Mawar 1, pulihkan internet, tekan **Coba sinkronkan** atau aktifkan kembali tab. Antrean harus berkurang sampai kosong dan data muncul di Firestore.
- [ ] Tutup dan buka ulang browser sebelum sinkronisasi: antrean tertunda harus masih ada pada perangkat yang sama. Jangan hapus data situs/cache sebelum antrean kosong.
- [ ] Buat jadwal tindak lanjut ANC, imunisasi, kunjungan rumah, dan rujukan; pastikan semuanya muncul pada menu **Agenda & tindak lanjut**. Coba filter terlambat, hari ini, 7 hari, jadwal lainnya, belum dijadwalkan, pencarian, dan filter posyandu admin.
- [ ] Klik **Buka catatan** pada agenda; aplikasi harus berpindah ke modul sumber untuk memperbarui status/catatan.

Catatan: sinkronisasi antrean lokal hanya berlangsung pada perangkat asal dan role pembuat. Ini bukan sinkronisasi multi-perangkat/offline kolaboratif. Ekspor backup dan rekonsiliasi data jika perangkat hilang atau akun petugas berubah.


## F. Uji tambahan v8 (rekap laporan bulanan)
- [ ] Login kader Mawar 1 dan buka **Laporan bulanan ILP**; pastikan filter wilayah tidak dapat diubah dan seluruh angka hanya berasal dari Mawar 1.
- [ ] Pilih bulan yang memiliki catatan kegiatan; cocokkan kehadiran, skrining, ANC, imunisasi, kunjungan rumah, rujukan, serta edukasi dengan modul sumber.
- [ ] Pastikan kehadiran sasaran dihitung unik berdasarkan ID, bukan jumlah scan/kunjungan berulang.
- [ ] Login admin, pilih semua posyandu lalu pilih satu posyandu; pastikan angka berubah sesuai filter.
- [ ] Ekspor CSV dan buka di Excel/LibreOffice; cocokkan label, angka, dan keterangan.
- [ ] Gunakan **Cetak / Simpan PDF** pada browser desktop dan HP; periksa judul bulan, tabel, tanda tangan, serta catatan kaki tidak terpotong.
- [ ] Pastikan laporan cetak hanya agregat dan tidak menampilkan daftar nama, NIK, alamat, atau catatan kesehatan per orang.
- [ ] Cocokkan rekap dengan register dan format Puskesmas; jangan mengirimnya sebagai laporan resmi tanpa validasi.

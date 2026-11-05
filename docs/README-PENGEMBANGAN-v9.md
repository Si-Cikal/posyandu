# Posyandu ILP Desa Cikulak Kidul — v9.0 Beta 3

v9.0 Beta 3 melanjutkan aplikasi satu halaman React + Firebase Authentication + Cloud Firestore + PWA dari v8. Modul v8 dipertahankan. Beta 3 memperkuat isolasi antrean offline dan backup, serta menyempurnakan grafik pertumbuhan balita. Paket ini tetap berstatus beta.

## Pembaruan Beta 3

### 1. Isolasi antrean dan backup
- Antrean offline dari namespace akun diverifikasi lagi menggunakan `ownerRole` dan `ownerUid`; item milik UID atau role lain tidak boleh masuk ke antrean aktif.
- Antrean legacy yang sudah memiliki UID berbeda dipertahankan di legacy store dan tidak diadopsi oleh akun baru. Antrean Beta 1 yang belum memiliki UID hanya dimigrasikan berdasarkan role yang ditandai.
- Backup admin hanya menyertakan `pendingSync` milik akun admin yang sedang masuk. Ini mencegah antrean privat dari akun lain yang pernah menggunakan browser yang sama ikut terbawa.
- Koleksi `cadreTasks` tetap dicantumkan secara eksplisit. Data tugas yang belum disinkronkan dari perangkat kader lain tidak dapat diambil oleh backup admin; sinkronkan antrean setiap perangkat sebelum backup.
- Metadata backup dinaikkan ke `skemaBackup: 3` dan mencatat cakupan antrean.

### 2. Grafik pertumbuhan balita
- Grafik pertumbuhan untuk balita menggunakan umur saat pemeriksaan (bulan penuh), bukan sekadar urutan baris pemeriksaan.
- Indikator yang dapat divisualisasikan: berat badan, panjang/tinggi badan, lingkar kepala, dan lingkar lengan atas (LiLA), masing-masing jika tersedia minimal dua nilai valid.
- Tanggal pemeriksaan dan tanggal lahir divalidasi sebelum umur dihitung; pengukuran di luar rentang 0–59 bulan tidak dimasukkan ke grafik balita.
- Grafik hanya memperlihatkan tren pengukuran historis. Grafik ini tidak menghitung z-score, tidak memberi klasifikasi status gizi, dan bukan alat diagnosis. Penilaian harus menggunakan standar resmi yang berlaku serta tenaga kesehatan.
- Grafik tren pemeriksaan untuk kelompok usia lain tetap tersedia; tinggi badan sekarang juga ditampilkan ketika data mencukupi.

### 3. Modul v9 sebelumnya tetap dipertahankan
- Manajemen tugas kader dan pengingat WhatsApp manual.
- Laporan bulanan internal, agenda tindak lanjut, PWS, modul ILP, skrining, dan data siklus hidup dari v8.
- Firestore Rules untuk pembatasan data dan validasi assignee tugas tetap sama dengan Beta 2; tetap wajib diuji melalui Emulator sebelum digunakan.

## Upgrade dari Beta 2
1. Ekspor backup dari aplikasi yang sedang aktif dan simpan di lokasi aman. Pastikan semua perangkat kader sudah tersinkron; backup admin tidak dapat mengambil antrean offline yang hanya ada di perangkat lain.
2. Simpan salinan folder hosting sebelumnya.
3. Unggah seluruh isi folder `posyandu-ilp` Beta 3 ke lingkungan uji, bukan langsung ke produksi.
4. Cache data lokal menggunakan namespace role + UID Firebase. Untuk antrean legacy, item dengan UID berbeda tidak dimigrasikan ke akun yang sedang masuk.
5. Jalankan `cd tests && npm run test:static`. Untuk rules, jalankan `npm install` dan `npm run test:rules` pada lingkungan yang memiliki Firebase CLI dan Firestore Emulator.
6. Uji perpindahan akun, dua tab, mode offline, pemulihan antrean, backup dan pembacaan file JSON pada project Firebase uji. Backup saat ini adalah ekspor; impor/pemulihan otomatis dari JSON belum tersedia pada UI aplikasi.
7. Uji grafik dengan data dummy: tanggal lahir, tanggal pemeriksaan, umur 0 bulan, 59 bulan, tanggal tidak valid, dan beberapa pengukuran dengan jarak bulan yang berbeda.
8. Uji semua role Mawar 1–5 dan admin sebelum meminta persetujuan uji lapangan.

## Batasan dan status
- **Status: Beta 3 / belum siap produksi.** Paket belum dinyatakan lolos Firestore Emulator, browser nyata, uji perangkat, dan uji penerimaan di Mawar 1–5.
- Cache lokal menggunakan `localStorage` dan tidak dienkripsi pada perangkat. Isolasi role + UID mencegah pencampuran state akun oleh aplikasi, tetapi tidak melindungi data dari orang yang memiliki akses ke profil browser/perangkat.
- Antrean offline tetap berada pada perangkat/browser tempat perubahan dibuat. Backup admin hanya memuat antrean admin yang sedang aktif, bukan antrean yang belum disinkronkan milik kader lain.
- Pengingat WhatsApp masih manual melalui aplikasi WhatsApp; tidak ada pengiriman otomatis atau bukti pesan terkirim. Jangan masukkan NIK, diagnosis, atau hasil pemeriksaan sensitif ke dalam pesan.
- Laporan merupakan rekap administratif internal, bukan pengganti ASIK, e-PPGBM, SATUSEHAT, register resmi, atau format Puskesmas.
- Tidak ada algoritme diagnosis, kurva standar WHO, atau z-score antropometri baru di Beta 3.

## Pengujian yang dijalankan di lingkungan pengembangan
- `npm run test:static`: 22/22 tes lulus.
- Parse sintaks JavaScript/JSX dengan TypeScript compiler API: lulus tanpa diagnostic parser.
- Firestore Rules Emulator: belum dijalankan; Firebase CLI dan dependensi test belum tersedia pada lingkungan ini.
- Browser nyata, multi-tab, perangkat Android/iOS, sinkronisasi lintas perangkat, backup/pemulihan, serta penerimaan lapangan: belum dijalankan.

Pemeriksaan statis bukan pengganti pengujian browser, emulator, aturan keamanan, dan uji penerimaan pengguna. Jangan gunakan data kesehatan warga asli pada project uji.

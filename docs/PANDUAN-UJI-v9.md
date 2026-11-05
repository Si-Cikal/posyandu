# Panduan Uji Penerimaan v9.0 Beta 3

Lakukan pada project Firebase percobaan dan akun dummy. Jangan gunakan data warga asli.

## A. Pemeriksaan otomatis
```bash
cd tests
npm run test:static
npm install
npm run test:rules
```
Semua tes harus lulus. `test:rules` memerlukan Firebase CLI dan Firestore Emulator.

## B. Isolasi akun, antrean offline, dan backup
1. Masuk sebagai admin, buat beberapa tugas untuk Mawar 1 dan Mawar 5.
2. Masuk sebagai kader Mawar 1; pastikan hanya data Mawar 1 terlihat dan tugas tidak dapat ditugaskan ke kader Posyandu lain.
3. Buat perubahan dummy saat offline; pastikan antrean tersimpan untuk akun tersebut dan hanya dapat disinkronkan kembali oleh UID yang sama.
4. Uji akun dengan role sama tetapi UID berbeda pada browser uji; antrean yang ber-UID lama tidak boleh diadopsi akun baru.
5. Uji pergantian role pada browser yang sama dan dua tab dengan akun berbeda; pastikan state dan antrean tidak tercampur.
6. Sinkronkan antrean pada seluruh perangkat. Kemudian ekspor backup dari admin dan pastikan `cadreTasks`, `pendingSync`, serta `metadata.skemaBackup: 3` tercantum.
7. Pastikan `pendingSync` hanya memuat `ownerRole: admin` dan UID akun admin yang sedang aktif. Jangan mengharapkan backup admin menarik antrean offline yang hanya ada di perangkat kader lain.
8. Pastikan tim memiliki prosedur penyimpanan dan pemulihan eksternal yang teruji. UI aplikasi saat ini menyediakan ekspor JSON, bukan impor/pemulihan otomatis.

## C. Grafik pertumbuhan balita
1. Gunakan profil dummy dengan tanggal lahir valid dan sedikitnya dua tanggal pemeriksaan berbeda.
2. Uji umur saat pemeriksaan tepat 0 bulan, sebelum genap satu bulan, tepat satu bulan, 59 bulan, dan 60 bulan.
3. Uji tanggal lahir atau tanggal pemeriksaan yang tidak valid; umur tidak boleh dihitung.
4. Masukkan dua atau lebih nilai berat, panjang/tinggi, lingkar kepala, dan LiLA secara terpisah. Pastikan tiap grafik hanya muncul ketika indikator memiliki minimal dua nilai valid.
5. Pastikan sumbu mendatar mengikuti umur pada tanggal pemeriksaan, bukan jarak urutan data. Pastikan riwayat diurutkan kronologis.
6. Pastikan label penjelas menyatakan grafik sebagai tren pengukuran, bukan diagnosis/status gizi. Jangan menyimpulkan status gizi dari grafik ini.

## D. Modul tugas kader dan pengingat WhatsApp
1. Uji buat, filter, selesaikan, dan buka kembali tugas pada Mawar 1–5.
2. Uji penolakan tugas lintas Posyandu, assignee tidak ada, dan tugas tanpa assignee di Firestore Emulator.
3. Gunakan nomor WhatsApp dummy yang telah disetujui untuk uji. Periksa nomor dan pesan sebelum membuka WhatsApp.
4. Pastikan aplikasi tidak menyatakan pesan sudah terkirim; pengiriman dilakukan manual oleh pengguna.
5. Jangan mencantumkan NIK, hasil pemeriksaan, atau informasi kesehatan sensitif pada pesan.

## E. Regresi fitur v8
- Uji login, logout, ganti sandi, peserta, kader, absensi, skrining, modul siklus hidup, PWS, agenda, laporan, ekspor, cetak, dan backup.
- Uji admin dan semua role Mawar 1–5.
- Pastikan data lama tetap ada dan laporan tidak membocorkan daftar nama warga.
- Uji mode offline, pulih koneksi, refresh, dan sinkronisasi tanpa duplikasi.

## F. Keputusan rilis
Jangan pasang ke hosting produksi sebelum Firestore Rules Emulator, browser/perangkat nyata, backup serta pemulihan, dan uji penerimaan admin desa, kader, bidan, serta Puskesmas selesai. Simpan backup v8 terpisah dan pastikan pemulihannya dapat dilakukan melalui prosedur yang disetujui.

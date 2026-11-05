# Catatan Perubahan v7.0

## Agenda & tindak lanjut
- Menambahkan halaman agenda gabungan dari ANC, imunisasi/suplementasi, kunjungan rumah, dan rujukan.
- Memilah agenda berdasarkan tanggal: terlambat, hari ini, 7 hari ke depan, lebih dari 7 hari, dan tanpa tanggal.
- Menyediakan pencarian, filter posyandu untuk admin, ekspor agenda yang difilter, dan tautan kembali ke modul sumber.

## Sinkronisasi offline
- Menambahkan antrean lokal perubahan tambah/ubah/hapus ketika perangkat offline atau Firestore gagal karena gangguan jaringan.
- Menambahkan retry ketika koneksi kembali, tab aktif, dan melalui tombol manual.
- Menjaga antrean berdasarkan role pembuat; data tidak dikirim dengan akun berbeda.
- Menampilkan banner jumlah perubahan tertunda dan konfirmasi sebelum logout.
- Menyertakan antrean tertunda di backup JSON.

## PWA
- Cache service worker diperbarui ke `posyandu-ilp-v12`.

## Pengujian
- Menambahkan test statis bawaan Node.js.
- Tes emulator Firestore tetap tersedia tetapi belum dapat dijalankan di lingkungan pengembangan ini karena instalasi dependensi npm tidak selesai (akses registry tidak tersedia).
- Pengujian manual perangkat, Firebase Emulator, dan simulasi jaringan tetap wajib sebelum penggunaan produksi.

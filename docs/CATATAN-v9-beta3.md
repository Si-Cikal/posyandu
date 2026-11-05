# Catatan perubahan — Posyandu ILP v9.0 Beta 3

## Isolasi antrean dan backup
- Validasi antrean diperketat: hanya item dengan `ownerRole` yang sama dan `ownerUid` kosong (khusus antrean legacy Beta 1) atau sama dengan UID akun aktif yang boleh dimigrasikan.
- Item legacy dengan UID berbeda tidak diadopsi dan tetap disimpan untuk pemilik sebelumnya.
- Backup admin hanya memasukkan antrean milik akun admin aktif, bukan semua antrean pada browser.
- `cadreTasks` tetap dimasukkan ke backup. Antrean offline kader dari perangkat lain harus disinkronkan pada perangkat asal sebelum backup admin.
- Skema backup ditingkatkan menjadi 3.

## Grafik pertumbuhan balita
- Umur pada tanggal pemeriksaan dihitung dalam bulan penuh secara bebas zona waktu browser.
- Grafik terpisah untuk berat badan, panjang/tinggi badan, lingkar kepala, dan LiLA.
- Rentang grafik balita dibatasi 0–59 bulan; minimal dua pengukuran valid per indikator.
- Grafik adalah riwayat/tren pengukuran, bukan penilaian status gizi atau diagnosis. Tidak ada kurva WHO, z-score, atau rekomendasi klinis baru.

## Versi dan cache PWA
- Versi aplikasi: `9.0-beta3`.
- Cache shell service worker dinaikkan menjadi `posyandu-ilp-v16`.

## Pengujian
- Tes statis/regresi: 22/22 lulus.
- Parse JavaScript/JSX: lulus tanpa diagnostic parser.
- Firestore Rules Emulator belum dijalankan karena Firebase CLI/dependensi tidak tersedia.
- Pengujian browser, multi-tab, perangkat nyata, backup/pemulihan, dan uji penerimaan Mawar 1–5 belum dilakukan.

**Status rilis: Beta 3, bukan final.**

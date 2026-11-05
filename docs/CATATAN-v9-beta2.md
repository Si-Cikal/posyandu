# Catatan perubahan — Posyandu ILP v9.0 Beta 2

## Fokus perubahan
Beta 2 adalah hardening lanjutan dari paket v9.0 Beta 1, bukan rilis final.

### Pemisahan cache akun
- Cache data aplikasi memakai namespace berdasarkan role dan UID Firebase.
- State data tidak lagi diinisialisasi dari satu kumpulan cache bersama sebelum autentikasi diketahui.
- Penulisan cache ditahan sampai data untuk akun aktif selesai dihidrasi.
- Cache legacy Beta 1 dimigrasikan satu kali hanya jika penanda role lama cocok, lalu kunci bersama lama dibersihkan.

### Antrean offline
- Antrean disimpan per role + UID Firebase.
- Item antrean menyimpan `ownerRole` dan `ownerUid`; proses sinkronisasi hanya memproses antrean akun yang sedang aktif.
- Antrean Beta 1 dimigrasikan saat akun dengan role yang sama masuk.
- Backup admin mengumpulkan antrean yang tersimpan pada browser/perangkat tersebut. Antrean yang hanya ada pada perangkat lain dan belum tersinkron tidak dapat dimasukkan dari jarak jauh.

### Backup
- Backup JSON menyertakan `cadreTasks` secara eksplisit dan menambahkan `metadata.skemaBackup: 2`.
- `pendingSync` memuat antrean offline yang ditemukan pada browser/perangkat saat backup dilakukan.

### Firestore Rules
- Penugasan tugas kader divalidasi di server: `assigneeId` harus menunjuk ke dokumen kader yang ada dan `posyandu` kader harus sama dengan `posyandu` tugas.
- Pengujian rules diperluas untuk menolak assignee lintas Posyandu dan tugas tanpa assignee.

### Cache PWA
- Nama cache service worker dinaikkan agar shell Beta 2 diambil ulang.

## Validasi yang dijalankan
- `npm run test:static`: 17/17 tes lulus (termasuk uji helper cache menggunakan simulasi localStorage).
- Pemeriksaan parse JSX/JavaScript dengan TypeScript `--noCheck`: lulus tanpa error parser.
- Firebase Rules Emulator belum dapat dijalankan pada lingkungan ini karena Firebase CLI tidak tersedia dan instalasi dependensi npm tidak selesai.

## Belum selesai / wajib diuji sebelum produksi
- Jalankan `npm install` dan `npm run test:rules` pada lingkungan yang memiliki Firebase CLI dan Firestore Emulator.
- Uji browser sungguhan untuk pergantian akun, beberapa tab, mode offline, pemulihan antrean, dan unduh/pulihkan backup.
- Uji semua role Mawar 1–5 dan admin menggunakan project Firebase uji.
- Uji penerimaan admin desa, kader, bidan, dan Puskesmas.

Beta 2 tidak boleh diberi label final atau dipasang menggantikan produksi sebelum pengujian tersebut selesai.

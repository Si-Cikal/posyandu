# Posyandu ILP — Desa Cikulak Kidul

Aplikasi web satu halaman (React + Firebase Authentication + Cloud Firestore + PWA) untuk pencatatan Posyandu ILP.

**Versi: 9.0 Beta 3 — belum disetujui untuk produksi.**

## Struktur repo

| Berkas | Fungsi |
|---|---|
| `index.html` | Aplikasi utama |
| `sw.js` | Service worker (cache PWA) |
| `manifest.webmanifest` | Pengaturan install aplikasi di HP |
| `icons/` | Ikon aplikasi (192, 512, maskable) |
| `firestore.rules` | Aturan akses Firestore (harus diterapkan di Firebase, bukan otomatis dari GitHub) |
| `PANDUAN-KEAMANAN.md` | Konfigurasi Authentication dan perlindungan data |
| `tests/` | Pengujian otomatis |
| `docs/` | Catatan versi, panduan uji, panduan pengguna v8 |

## Deploy

1. Hubungkan repo ini ke GitHub Pages atau Cloudflare Pages (folder root, tanpa build command).
2. Di Firebase Console → Authentication → Settings → **Authorized domains**, tambahkan domain situs Anda.
3. Ikuti `PANDUAN-KEAMANAN.md`: aktifkan Email/Password, matikan Anonymous, nonaktifkan sign-up, buat akun petugas.
4. Terapkan `firestore.rules`:
   ```
   firebase deploy --only firestore:rules
   ```
5. Uji sebelum dipakai (lihat di bawah).

## Pengujian

```
cd tests
npm install
npm run test:static   # tes statis, tanpa Firebase CLI
npm test              # termasuk Firestore Rules (butuh Firebase CLI + Java)
```

Catatan: Firebase `apiKey` di `index.html` memang bersifat publik pada aplikasi web; keamanan data ditentukan oleh `firestore.rules` dan pengaturan Authentication.

## Batasan yang diketahui

- Firestore Rules belum diuji di Emulator.
- Belum ada uji browser, multi-tab, perangkat nyata, serta backup/pemulihan.
- Pertama kali dibuka memerlukan internet (React, Babel, Tailwind dari CDN).
- Panduan pengguna (`docs/PANDUAN-PENGGUNA-v8.pdf`) masih untuk v8.

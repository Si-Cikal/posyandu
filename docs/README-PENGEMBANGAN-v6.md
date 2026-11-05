# Posyandu ILP Mawar — Pengembangan v6.0

Paket ini merupakan pengembangan dari aplikasi v5 yang sudah Anda kirim. Aplikasi tetap memakai satu halaman React (Babel di browser), Firebase Authentication, Cloud Firestore, dan PWA/service worker. Data warga dan fitur lama dipertahankan.

## Pembaruan v6.0

### Perombakan UI/UX
- Palet layanan kesehatan bernuansa teal, kontras mode gelap, komponen kartu, tombol, navigasi, serta ruang kerja yang lebih konsisten.
- Halaman modul menggunakan ringkasan indikator, formulir terstruktur, daftar riwayat, pencarian, filter, edit/hapus, dan ekspor CSV yang dapat dibuka di Excel.
- Navigasi layanan ILP tersedia untuk admin maupun petugas posyandu.

### Modul baru
1. **Ibu, hamil & nifas** — catatan ANC, pemantauan nifas/menyusui, tekanan darah, LILA, TTD, temuan dan tindak lanjut.
2. **Imunisasi & suplementasi** — riwayat imunisasi, tahap/dosis, batch, tanggal berikutnya, vitamin A, obat cacing, dan TTD.
3. **Kunjungan rumah** — sasaran siklus hidup, alasan, temuan, tindakan, status kunjungan, serta jadwal ulang.
4. **Rujukan & tindak lanjut** — urgensi, alasan, fasilitas tujuan, status dan hasil pemantauan.
5. **Logistik & PMT** — jumlah tersedia, batas minimum, satuan, batch, dan tanggal kedaluwarsa.
6. **Edukasi & penyuluhan** — topik, kelompok sasaran, metode, jumlah peserta, fasilitator dan ringkasan materi.
7. **Dashboard PWS** — ringkasan data terfilter 7 hari/bulan/tahun, komposisi siklus hidup, daftar perhatian, aktivitas terbaru, dan ekspor.

### Integrasi dan keamanan
- Enam koleksi baru dimuat melalui listener Firestore dan disimpan sementara ke cache lokal browser seperti modul lama.
- Aturan Firestore baru membatasi data menurut `posyandu`. Admin dapat melihat lintas posyandu; kader hanya posyandunya.
- Service worker dinaikkan ke `posyandu-ilp-v11` agar perangkat mengambil shell aplikasi terbaru.
- Tes keamanan ditambah untuk akses publik, isolasi kader, dan akses admin terhadap modul baru.

## Cara menerapkan

1. **Cadangkan data** dari menu Pengaturan dan ekspor Firestore sebelum mengganti file hosting.
2. Unggah seluruh isi folder `posyandu-ilp` ke hosting, termasuk `index.html`, `sw.js`, `firestore.rules`, `manifest.webmanifest`, `icons/`, `tests/`, serta panduan.
3. Firebase Console → Firestore → Rules: publish isi `firestore.rules` dari paket ini. Aturan lama tidak mengenali koleksi modul baru.
4. Buka aplikasi, login dengan akun petugas yang sudah dibuat, lalu uji di project Firebase uji terlebih dahulu.
5. Jalankan skenario di `PANDUAN-UJI.md`. Uji rules di emulator dengan perintah pada panduan tersebut sebelum produksi.
6. Setelah rilis, lakukan hard refresh bila browser masih menyajikan aset lama. Service worker v11 akan mengganti cache v10.

## Batasan penting sebelum operasional

- Form ini adalah pencatatan operasional kader, bukan rekam medis lengkap. Hasil klinis tidak dihitung atau diputuskan oleh aplikasi.
- Jadwal imunisasi, dosis, suplementasi, ambang klinis, SOP, indikator SPM, dan alur rujukan perlu diverifikasi bersama Puskesmas serta disesuaikan dengan pedoman terbaru dan format kabupaten/kota.
- Dashboard PWS menghitung catatan yang masuk ke aplikasi, bukan pengganti e-PPGBM, ASIK, SIMPUS, SATUSEHAT, atau pelaporan resmi lainnya.
- Data baru akan tersimpan di koleksi Firestore setelah rules v6 dipublikasikan. Jangan uji coba pada project yang berisi data warga asli.
- Kartu QR masih menggunakan layanan QR eksternal seperti versi sebelumnya; sebelum penggunaan skala luas, bundel pustaka QR secara lokal agar ID kartu tidak dikirim ke pihak ketiga.

## Isi paket

- `index.html` — antarmuka dan logika aplikasi.
- `firestore.rules` — aturan akses Firebase.
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA.
- `tests/` — pengujian aturan Firestore.
- `PANDUAN-UJI.md`, `PANDUAN-KEAMANAN.md` — panduan implementasi dan uji.

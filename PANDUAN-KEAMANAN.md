# Panduan Setup Keamanan & Privasi (v8.0)

Aplikasi v7 tetap memakai model autentikasi Firebase dan pembatasan data berbasis posyandu yang diperkenalkan pada versi sebelumnya. **Lakukan langkah di bawah sebelum aplikasi dipakai**, agar akses petugas dan koleksi data terlindungi.

## 1. Firebase Console > Authentication
1. **Sign-in method**: aktifkan *Email/Password*. **Matikan Anonymous.**
2. **Settings > User actions**: **hapus centang "Enable create (sign-up)"**. Ini wajib, supaya orang luar tidak bisa mendaftar memakai email petugas.
3. **Users > Add user**, buat 6 akun (email persis seperti ini, sandi kuat dan berbeda-beda, minimal 8 karakter):

| Akun | Email |
|---|---|
| Admin pusat | `admin@posyandu.invalid` |
| Mawar 1–5 | `mawar1@posyandu.invalid` ... `mawar5@posyandu.invalid` |

Domain `.invalid` memang tidak nyata, sehingga email reset sandi tidak akan terkirim ke siapa pun. Ganti sandi lewat Console atau tombol **Ganti sandi** di menu aplikasi.

## 2. Firestore
1. Buka **Firestore > Rules**, tempel isi `firestore.rules`, lalu **Publish**.
2. Hapus dokumen lama `artifacts/posyandu-ilp-mawar-cikulak/public/data/settings/credentials` (berisi sandi teks biasa `123`). Setelah rules baru aktif dokumen ini sudah tidak bisa dibaca, tapi tetap sebaiknya dihapus.
3. Pastikan setiap dokumen di `participants`, `cadres`, `health`, `attendances`, `complaints` punya field `posyandu` (diisi `mawar1`..`mawar5`). Dokumen tanpa field itu tidak terlihat oleh petugas posyandu (admin tetap bisa melihat).
4. Login admin sekali, lalu buka **Pengaturan > Jadwal** dan simpan. Dokumen `settings/schedule` harus ada agar absen mandiri publik bisa dipakai.

## 3. Yang berubah untuk pengguna
- **Petugas**: login memakai akun Firebase; sesi tetap tersimpan, sandi tidak lagi ada di database. Petugas posyandu hanya menerima data posyandunya sendiri. Tombol *Ganti sandi* tersedia di menu.
- **Absen mandiri (publik)**: hanya lewat scan QR / ketik ID kartu (mis. `ILP-AB12C`) dan memilih posyandu. Aplikasi tidak lagi memuat daftar nama warga di halaman publik. Warga yang lupa kartu dibantu kader lewat menu *Scan kehadiran* (ada kolom cari nama).
- **Cek data saya**: dihapus dari halaman depan (data kesehatan tidak boleh dibuka tanpa verifikasi). Diganti tombol *Jadwal*.
- **Pengaduan**: setiap laporan mendapat kode acak `ADU-XXXXXXXXXX`; balasan hanya bisa dilihat dengan kode itu, bukan dengan nama.
- **Asisten AI** hanya tampil setelah login.
- Tombol *Muat ulang* di layar error tidak lagi menghapus data lokal.

## 4. Sangat disarankan
- Aktifkan **Firebase App Check** (reCAPTCHA v3) untuk Firestore agar absen/pengaduan publik tidak bisa di-spam dari luar aplikasi.
- Batasi API key di Google Cloud Console ke domain aplikasi Anda.
- Kartu QR di fitur cetak masih dibuat lewat `api.qrserver.com` (ID kartu terkirim ke layanan pihak ketiga). Untuk produksi, ganti dengan pustaka QR yang dibundel lokal.

## 5. Perbaikan logika (poin 2)
- Tanggal memakai waktu lokal (WIB), bukan UTC, sehingga data sebelum pukul 07.00 tidak lagi masuk ke hari sebelumnya.
- Tekanan darah terbaca dari `120/80`, `120 80`, `120-80`; hipertensi bila sistolik ≥140 **atau** diastolik ≥90; hipotensi bila <90 atau <60. Nilai disimpan seragam `sistolik/diastolik`.
- Balita tidak lagi diberi label "Pertumbuhan Normal" tanpa pembanding; hasilnya "Pengukuran tercatat (status gizi belum dinilai)" sampai z-score WHO ditambahkan.
- Lingkar perut hanya dinilai untuk dewasa/lansia: laki-laki >90 cm, perempuan >80 cm. Field **Jenis Kelamin** ditambahkan di data warga.
- Validasi rentang nilai (mis. berat 500 kg ditolak dengan pesan jelas).
- Versi konsisten: v4.8 (footer, cache service worker v8).

## 6. Tambahan v4.9 (data warga)
- Data warga kini punya tanggal lahir, jenis kelamin, alamat, RT/RW, nama orang tua/wali, dan status (aktif/pindah/meninggal).
- Klaster siklus hidup otomatis dari umur: bayi & balita 0–59 bulan, anak & remaja 5–17 th, dewasa 18–59 th, lansia ≥60 th. Ibu hamil dipilih manual. Sesuaikan batas umur dengan juknis Puskesmas Anda.
- Warga yang sudah berganti kelompok umur ditandai banner; satu klik memindahkan semuanya.
- Impor massal dari .csv/.xlsx (template tersedia). Berkas .xlsx memuat pustaka SheetJS dari cdnjs saat dibutuhkan.
- Warga non-aktif tidak bisa absen (diperiksa di aplikasi dan di firestore.rules).
- Publish ulang `firestore.rules` (ada tambahan cek status aktif). Lihat `PANDUAN-UJI.md` untuk pengujian.


## 7. Modul ILP tambahan v6.0
Versi 6 menambahkan koleksi Firestore `anc`, `immunizations`, `home_visits`, `referrals`, `logistics`, dan `education`. Setelah mengunggah versi baru, **publish ulang `firestore.rules` dari paket ini**. Semua dokumen baru harus memiliki field `posyandu` (`mawar1` sampai `mawar5`). Kader hanya dapat mengakses data posyandu sendiri; akun admin dapat mengakses lintas posyandu. Koleksi baru tidak dapat dibaca publik.

Jangan menganggap formulir ini sebagai pengganti Buku KIA, register resmi, pemeriksaan tenaga kesehatan, atau aplikasi pelaporan Kementerian Kesehatan. Jadwal imunisasi, interpretasi klinis, kriteria rujukan, dan SOP harus mengikuti pedoman terbaru serta arahan Puskesmas setempat.


## 8. Tambahan perlindungan data v7
- Cache aplikasi kini mencatat role pemilik. Saat role yang berbeda masuk pada browser yang sama, cache lama dihapus sebelum data akun baru ditampilkan.
- Antrean perubahan offline dibatasi menurut role pembuat dan tidak dikirim menggunakan role berbeda. Antrean tersimpan di localStorage browser dan tidak dienkripsi oleh aplikasi; gunakan perangkat pribadi/tepercaya yang terkunci, jangan gunakan komputer bersama, dan jangan hapus data situs sebelum sinkronisasi selesai.
- Data kesehatan dan data anak harus diperlakukan sebagai data pribadi berisiko tinggi. Hindari komputer bersama, aktifkan penguncian perangkat, gunakan akun terpisah per petugas bila tersedia, dan batasi akses/ekspor backup sesuai kebijakan Puskesmas/pengelola.

Rujukan perlindungan data: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi memasukkan data dan informasi kesehatan serta data anak ke kategori Data Pribadi yang bersifat spesifik. Pengelola aplikasi perlu menetapkan dasar pemrosesan, tujuan, akses, masa simpan, hak subjek data, dan prosedur insiden sesuai ketentuan yang berlaku. Lihat [teks UU No. 27 Tahun 2022](https://peraturan.bpk.go.id/Home/Download/224884/UU%20Nomor%2027%20Tahun%202022.pdf).

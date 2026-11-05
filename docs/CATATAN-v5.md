# Catatan Perubahan v5.0

## Tampilan
- Tema visual baru: token warna, latar gradasi, navigasi dan bilah bawah berefek kaca, tombol bergradien, input dengan fokus bercincin, toast dan modal yang diperbarui.
- Mode gelap dirapikan (kontras tombol Absen diperbaiki).
- Perbaikan layout: topbar dan bilah bawah tidak lagi muncul di layar lebar; baris input + tombol (ID kartu + HADIR) tidak terpotong di ponsel.
- Garis tabel dan input memakai warna tema, tidak bergantung pada versi preflight Tailwind.

## Stabilitas
- Galat JavaScript kecil tidak lagi mengosongkan seluruh layar. Layar galat hanya tampil jika aplikasi gagal dimuat sama sekali.
- Tombol di layar galat diberi label jujur ("Muat ulang aplikasi"); tidak lagi menjanjikan reset data.
- Versi aplikasi 5.0; cache service worker `posyandu-ilp-v10`.

## Belum berubah (perlu tindak lanjut)
- Cetak kartu QR masih memakai api.qrserver.com (ID kartu dikirim ke pihak ketiga).
- Aturan keamanan belum diuji ulang di emulator pada perubahan ini (jalankan `tests/` seperti di PANDUAN-UJI.md).

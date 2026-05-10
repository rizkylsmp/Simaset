# Analisis UI SIMASET

Analisis ini digunakan sebagai dasar penyusunan wireframe HTML/CSS pada folder ini.

## 1. Arsitektur Tampilan

SIMASET memiliki dua kelompok antarmuka. Pertama, aplikasi internal yang memakai `RootLayout`, terdiri atas header sticky, sidebar kiri, dan area konten utama. Kedua, halaman publik seperti login, aset sewa tersedia, dan EKASMAT yang tidak memakai sidebar internal.

Halaman internal dirancang untuk pekerjaan operasional berulang. Karena itu pola yang dominan adalah tabel, filter, kartu statistik, panel aksi, dan peta. Halaman publik lebih editorial dan informatif, terutama pada halaman aset sewa tersedia yang memakai navigasi publik, hero hijau, peta, daftar aset, dan formulir permintaan.

## 2. Design Token

Warna dasar aplikasi adalah putih dan abu muda:

- `surface`: putih untuk header, sidebar, kartu, tabel, dan panel.
- `surface-secondary`: abu sangat muda untuk latar halaman.
- `border`: abu tipis untuk pemisah dan outline komponen.
- `accent`: hitam gelap untuk state aktif, tombol utama, dan identitas sistem.
- Warna semantik: biru untuk data umum, hijau untuk berhasil/tersedia, amber untuk indikasi/peringatan, merah untuk bermasalah, ungu untuk statistik tertentu.

Radius utama berkisar 10-20px. Komponen penting seperti sidebar item, tombol, kartu statistik, panel filter, dan tabel memakai sudut membulat. Shadow digunakan ringan, terutama pada tombol aktif, avatar, kartu, dan overlay.

## 3. Layout Internal

Header internal berisi identitas SIMASET, timer sesi, tombol mode gelap, notifikasi, dan profil pengguna. Sidebar memiliki menu utama dan submenu. Item aktif memakai background gelap gradien, teks putih, dan shadow.

Konten internal mengikuti pola:

1. Page header: ikon modul, judul, deskripsi singkat, dan tombol aksi.
2. Statistik ringkas jika halaman memerlukan monitoring.
3. Filter/search card.
4. Table card atau panel utama.
5. Badge status dan tombol aksi baris.

Pola ini terlihat pada Kelola Aset, Data Substansi, Pusat Data, Penyewaan, Permintaan Sewa, Riwayat, Backup, Notifikasi, dan Pengaturan.

## 4. Dashboard dan Peta

Dashboard SIMASET berbeda dari dashboard biasa karena peta menjadi tampilan default. Statistik tidak langsung memenuhi layar, melainkan muncul sebagai overlay/panel. Ini sesuai revisi yang meminta dashboard menampilkan map terlebih dahulu.

Halaman peta memakai peta sebagai kanvas utama, dengan panel kontrol mengambang. Elemen pentingnya:

- Pencarian aset.
- Filter status/lokasi.
- Toggle marker dan polygon.
- Layer kecamatan/kelurahan.
- Layer status atau sewa.
- Legenda.
- Panel detail aset.

Wireframe HTML/CSS meniru pola ini dengan map canvas, pin, road layer, panel layer, dan detail card.

## 5. Data dan Tabel

Tabel menjadi komponen pusat pada modul administratif. Tabel asli banyak memakai:

- Header uppercase kecil.
- Row hover.
- Badge kode atau status.
- Kolom aksi di kanan.
- Overflow horizontal untuk tabel besar.
- Empty/loading state pada implementasi aktual.

Wireframe menyederhanakan data tetapi mempertahankan anatomi visual: table header, badge jumlah data, status pill, row action, dan kolom data utama.

## 6. Halaman Publik

Halaman publik aset sewa tersedia memiliki visual yang lebih komunikatif dibanding dashboard internal. Struktur utamanya:

- Navigasi publik sticky.
- Hero hijau untuk konteks sewa aset.
- Peta lokasi aset.
- Daftar aset tersedia.
- Form permintaan sewa.

Login menggunakan latar peta gelap dan sistem selector. Ini menegaskan bahwa pengguna memilih konteks BPKA/BPN/EKASMAT sebelum masuk atau membuka layanan publik.

## 7. Pengaturan dan EKASMAT

Pengaturan memakai layout dua kolom: rail tab di kiri dan form di kanan. Ini cocok untuk admin karena banyak konfigurasi dikelompokkan dalam beberapa kategori.

EKASMAT dibuat sebagai form publik yang lebih sederhana: identitas responden, daftar pertanyaan, skala nilai 1-5, catatan, dan tombol kirim.

## 8. Keputusan Wireframe

Wireframe terbaru sengaja dibuat dengan warna dan struktur yang mendekati aplikasi asli, bukan hitam-putih abstrak, karena permintaan terbaru adalah menyamakan UI dengan aplikasi. Namun artefak tetap disebut wireframe karena tujuannya menjelaskan struktur dan komponen, bukan menggantikan screenshot final aplikasi.


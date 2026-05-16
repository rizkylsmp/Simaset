**BAB V**

**ANALISIS KEBUTUHAN SISTEM INFORMASI MANAJEMEN ASET TANAH KOTA
PASURUAN**

**A. Pengelolaan Aset Tanah Konvensional**

**B. Tata Kelola Aset Tanah Terintegrasi**

**Gambar 1. Proses Bisnis Sebelum SIMASET**

<img src="documents/bab5/gambar/gambar-5-01-proses-bisnis-sebelum-simaset.png"
style="width:6.175in;height:7.00525in" />

**Gambar 2. Proses Bisnis Setelah SIMASET**

<img src="documents/bab5/gambar/gambar-5-02-proses-bisnis-setelah-simaset.png"
style="width:6.26806in;height:5.37234in" />

**C. Analisis Kebutuhan Pengguna**

**Tabel 1. Variabel Analisis Kebutuhan Pengguna SIMASET**

| **No** | **Kategori** | **Variabel** | **Deskripsi** |
|----|----|----|----|
| 1 | Kebutuhan pengguna | Admin BPKA | Mengelola data aset, pusat data, penyewaan aset, permintaan sewa, pengguna, backup, riwayat, notifikasi, dan pengaturan. |
| 2 | Kebutuhan pengguna | Admin BPN | Mengelola data substansi pertanahan, pengguna, backup, riwayat, notifikasi, peta, dan pengaturan. |
| 3 | Kebutuhan pengguna | Petugas BPKA | Mengelola aset BPKA, pusat data, penyewaan aset, pengembalian aset, permintaan sewa, peta, notifikasi, dan profil. |
| 4 | Kebutuhan pengguna | Petugas BPN | Melihat aset dan memperbarui data legal, fisik, administratif, serta spasial. |
| 5 | Kebutuhan pengguna | Masyarakat | Melihat aset tersedia, mengajukan permintaan sewa, dan mengisi evaluasi EKASMAT. |
| 6 | Desain sistem | Peta interaktif | Menampilkan marker, polygon, layer wilayah, layer status aset, pencarian, filter, dan detail aset. |
| 7 | Desain sistem | Keamanan data | Menerapkan login, JWT, hashing password, MFA, role-based access control, dan pembatasan menu berdasarkan role. |
| 8 | Desain sistem | Riwayat dan backup | Menyediakan audit trail aktivitas serta export, import, download, dan hapus backup. |
| 9 | Desain sistem | Evaluasi layanan | Menyediakan EKASMAT sebagai media pengumpulan penilaian pengguna terhadap aplikasi. |

**Tabel 2. Analisis Kebutuhan Pengguna SIMASET**

| **No** | **Kondisi Saat Ini** | **Kendala/Permasalahan** | **Kebutuhan yang Diinginkan** |
|----|----|----|----|
| 1 | Data aset berasal dari beberapa sumber data dan instansi. | Terjadi potensi perbedaan versi data antara data administratif dan data pertanahan. | Sistem menyediakan basis data terpusat yang dapat mengelola data aset sesuai role BPKA dan BPN. |
| 2 | Data tekstual aset belum selalu terhubung dengan lokasi spasial. | Petugas kesulitan mengetahui posisi aset, status bidang, dan konteks wilayah secara cepat. | Sistem menyediakan peta interaktif, marker, polygon bidang, layer wilayah, dan detail aset. |
| 3 | Pembaruan data legal, fisik, administratif, dan spasial dilakukan oleh petugas yang berbeda. | Perlu pembagian kewenangan agar perubahan data dilakukan oleh pihak yang berwenang. | Sistem menyediakan role dan permission untuk Admin BPKA, Admin BPN, Petugas BPKA, dan Petugas BPN. |
| 4 | Aktivitas perubahan data belum selalu terdokumentasi secara terpusat. | Sulit menelusuri siapa yang melakukan perubahan dan kapan perubahan dilakukan. | Sistem mencatat aktivitas pengguna pada modul riwayat sebagai audit trail. |
| 5 | Informasi aset yang dapat disewa belum tersaji secara terbuka dan terstruktur. | Masyarakat sulit mengetahui aset yang tersedia serta prosedur pengajuan sewa. | Sistem menyediakan halaman publik aset tersedia dan formulir permintaan sewa. |
| 6 | Backup data dapat dilakukan secara manual dan tidak terpusat. | Risiko kehilangan data dan kesulitan pemulihan apabila terjadi gangguan sistem. | Sistem menyediakan fitur backup, import, export, download, hapus backup, dan export CSV. |
| 7 | Evaluasi kepuasan pengguna terhadap sistem belum terdokumentasi otomatis. | Pengembang sulit mengetahui persepsi pengguna terhadap kemudahan dan manfaat aplikasi. | Sistem menyediakan EKASMAT untuk mengumpulkan skor evaluasi pengguna. |

Berdasarkan analisis kebutuhan tersebut, SIMASET harus memenuhi beberapa
spesifikasi utama sebagai berikut:

a\. Sistem informasi dapat digunakan oleh pengguna internal berdasarkan
akun dan role.  
b. Sistem menyediakan pengelolaan data aset tanah yang terdiri dari data
umum, legal, fisik, administratif, dan spasial.  
c. Sistem menyediakan pusat data BPKA sebagai repositori data aset
daerah.  
d. Sistem menyediakan peta interaktif yang menampilkan aset secara
spasial.  
e. Sistem menyediakan fitur penyewaan aset, permintaan sewa publik, dan
pengembalian aset.  
f. Sistem mencatat riwayat aktivitas pengguna sebagai audit trail.  
g. Sistem menyediakan notifikasi untuk menyampaikan informasi kepada
pengguna.  
h. Sistem menyediakan backup dan restore data untuk menjaga ketersediaan
data.  
i. Sistem menyediakan pengaturan profil, keamanan akun, dan MFA.  
j. Sistem menyediakan EKASMAT sebagai media evaluasi kinerja aplikasi.

**  **

**BAB VI**

**PERANCANGAN DESAIN SISTEM INFORMASI MANAJEMEN ASET TANAH KOTA
PASURUAN**

**A. Desain Sistem Informasi**

**1. Unified Modeling Language (UML)**

**a. Use Case Diagram**

**Gambar 3. Use Case Diagram SIMASET**

<img src="documents/bab5/gambar/gambar-5-03-use-case-simaset.png"
style="width:6.26806in;height:4.87146in" />

**Tabel 3. Deskripsi Use Case SIMASET**

| **ID** | **Use Case** | **Aktor** | **Tujuan** |
|----|----|----|----|
| UC-01 | Login ke Sistem | Admin BPKAD, Admin BPN, Petugas BPKAD, Petugas BPN | Mengautentikasi pengguna agar dapat mengakses dashboard sesuai role |
| UC-02 | Mengelola Profil dan Keamanan Akun | Semua user internal | Memperbarui profil, mengganti password, dan mengelola MFA |
| UC-03 | Mengelola Data Aset | Admin BPKAD, Admin BPN, Petugas BPKAD, Petugas BPN | Menambah, melihat, memperbarui, atau menghapus data aset sesuai hak akses |
| UC-04 | Mengelola Data Legal | Admin BPN, Petugas BPN | Mengelola data sertifikat, jenis hak, dan status hukum aset |
| UC-05 | Mengelola Data Fisik | Admin BPN, Petugas BPN | Mengelola lokasi, luas, batas tanah, dan penggunaan aset |
| UC-06 | Mengelola Data Administratif | Admin BPN, Petugas BPN | Mengelola data administratif dan keuangan aset |
| UC-07 | Mengelola Data Spasial | Admin BPN, Petugas BPN | Mengelola koordinat dan polygon bidang tanah |
| UC-08 | Mengelola Pusat Data | Admin BPKAD, Petugas BPKAD | Mengelola repositori data aset BPKAD |
| UC-09 | Melihat Peta Interaktif | Semua user internal, Masyarakat terbatas | Melihat lokasi aset, marker, layer, pencarian, dan detail aset |
| UC-10 | Mengelola Sewa Aset | Admin BPKAD, Petugas BPKAD | Mengelola data penyewaan aset tanah |
| UC-11 | Mengelola Permintaan Sewa | Admin BPKAD, Petugas BPKAD, Masyarakat | Mengajukan dan memproses permintaan sewa aset |
| UC-12 | Mengelola Pengembalian Aset | Admin BPKAD, Petugas BPKAD | Mencatat pengembalian aset setelah masa sewa selesai |
| UC-13 | Mengelola Notifikasi | Semua user internal | Melihat, membaca, dan menghapus notifikasi |
| UC-14 | Melihat Riwayat Aktivitas | Admin BPKAD, Admin BPN | Melihat audit trail aktivitas pengguna |
| UC-15 | Mengelola Backup Data | Admin BPKAD, Admin BPN | Melakukan export, import, download, hapus backup, dan export CSV |
| UC-16 | Mengelola Data Pengguna | Admin BPKAD, Admin BPN | Mengelola akun pengguna sistem |
| UC-17 | Mengisi EKASMAT | Masyarakat | Mengisi formulir evaluasi/kuesioner dan mengirim skor |

**Tabel 4. Matriks Hak Akses Use Case**

| **Fitur** | **Admin BPKAD** | **Admin BPN** | **Petugas BPKAD** | **Petugas BPN** | **Masyarakat** |
|----|----|----|----|----|----|
| Login | Ya | Ya | Ya | Ya | Tidak wajib |
| Dashboard | Ya | Ya | Ya | Ya | Tidak |
| Kelola Data Aset | CRUD | CRUD | CRUD | Update terbatas | Tidak |
| Data Legal | Tidak utama | CRUD | Tidak utama | Update | Tidak |
| Data Fisik | Tidak utama | CRUD | Tidak utama | Update | Tidak |
| Data Administratif | Tidak utama | CRUD | Tidak utama | Update | Tidak |
| Data Spasial | Tidak utama | CRUD | Tidak utama | Update | Tidak |
| Pusat Data | CRUD | Lihat | CRUD | Lihat | Tidak |
| Peta Interaktif | Ya | Ya | Ya | Ya | Terbatas |
| Sewa Aset | CRUD | Tidak | CRUD | Tidak | Lihat aset tersedia |
| Permintaan Sewa | Proses | Tidak | Proses | Tidak | Ajukan |
| Pengembalian Aset | Ya | Tidak | Ya | Tidak | Tidak |
| Notifikasi | Ya | Ya | Ya | Ya | Terbatas |
| Riwayat Aktivitas | Ya | Ya | Tidak | Tidak | Tidak |
| Backup Data | Ya | Ya | Tidak | Tidak | Tidak |
| Manajemen Pengguna | Ya | Ya | Tidak | Tidak | Tidak |
| Profil | Ya | Ya | Ya | Ya | Tidak |
| EKASMAT | Opsional | Opsional | Opsional | Opsional | Isi |

**b. Diagram Activity**

**Gambar 4. Diagram Activity Login dan MFA**

<img src="documents/bab5/gambar/gambar-5-05-activity-login-mfa.png"
style="width:5.76947in;height:5.46554in" />

**Gambar 5. Diagram Activity Mengelola Data Aset**

<img src="documents/bab5/gambar/gambar-5-06-activity-kelola-aset.png"
style="width:3.88542in;height:6.08893in" />

**Gambar 6. Diagram Activity Mengelola Data Substansi BPN**

<img src="documents/bab5/gambar/gambar-5-07-activity-substansi-bpn.png"
style="width:4.61458in;height:6.64531in" />

**Gambar 7. Diagram Activity Mengelola Pusat Data BPKA**

<img src="documents/bab5/gambar/gambar-5-08-activity-pusat-data-bpkad.png"
style="width:4.52083in;height:6.67011in" />

**Gambar 8. Diagram Activity Peta Interaktif**

<img src="documents/bab5/gambar/gambar-5-09-activity-peta-interaktif.png"
style="width:3.42708in;height:4.83282in" />

**Gambar 9. Diagram Activity Permintaan Sewa oleh Masyarakat**

<img src="documents/bab5/gambar/gambar-5-10-activity-permintaan-sewa.png"
style="width:4.92708in;height:5.50114in" />

**Gambar 10. Diagram Activity Pengelolaan Sewa Aset**

<img src="documents/bab5/gambar/gambar-5-11-activity-sewa-aset.png"
style="width:4.16667in;height:6.05587in" />

**Gambar 11. Diagram Activity Backup dan Restore Data**

<img src="documents/bab5/gambar/gambar-5-12-activity-backup-restore.png"
style="width:6.26806in;height:4.35507in" />

**c. Class Diagram**

Class diagram digunakan untuk menggambarkan struktur class utama pada
SIMASET dan hubungan antar class. Class utama yang digunakan meliputi
User, Aset, PusatData, SewaAset, PermintaanSewa, Riwayat, Notifikasi,
dan EkasmatResponse.

**Gambar 12. Class Diagram SIMASET**

<img src="documents/bab5/gambar/gambar-5-13-class-diagram-simaset.png"
style="width:6.26806in;height:8.05949in" />

**Tabel 5. Class Utama SIMASET**

| No | Class | Deskripsi |
|----|----|----|
| 1 | User | Menyimpan data akun pengguna, role, profil, status aktif, dan konfigurasi MFA |
| 2 | Aset | Menyimpan data aset tanah, data legal, fisik, administratif, spasial, dan status aset |
| 3 | PusatData | Menyimpan data pusat aset BPKAD sebagai referensi pengelolaan aset |
| 4 | SewaAset | Menyimpan data penyewaan aset, penyewa, nilai sewa, kontrak, status, dan pengembalian |
| 5 | PermintaanSewa | Menyimpan permintaan sewa dari masyarakat dan status pemrosesan oleh BPKAD |
| 6 | Riwayat | Menyimpan catatan aktivitas pengguna sebagai audit trail |
| 7 | Notifikasi | Menyimpan data notifikasi pengguna |
| 8 | EkasmatResponse | Menyimpan respons kuesioner EKASMAT |

**d. Data Flow Diagram dan Entity Relationship Diagram**

Selain UML, SIMASET juga dilengkapi dengan Data Flow Diagram (DFD) dan
Entity Relationship Diagram (ERD). DFD digunakan untuk menggambarkan
aliran data antar entitas eksternal, proses sistem, dan data store,
sedangkan ERD digunakan untuk menggambarkan struktur relasi database.
DFD SIMASET disajikan dalam dua tingkat, yaitu Level 0 sebagai diagram
konteks dan Level 1 sebagai dekomposisi proses utama.

**Gambar 13. Data Flow Diagram Level 0 SIMASET**

<img src="documents/bab5/generated/dfd-level-0-simaset.png" style="width:6.2in;height:auto" />

DFD Level 0 memperlihatkan SIMASET sebagai satu proses utama yang
berinteraksi dengan pengguna internal dan masyarakat. Pada level ini
ditampilkan pula data store utama yang mendukung sistem, yaitu users,
aset, pusat_data, sewa_aset, permintaan_sewa, riwayat, notifikasi, dan
ekasmat_responses.

**Gambar 14. Data Flow Diagram Level 1 SIMASET**

<img src="documents/bab5/generated/dfd-level-1-simaset.png" style="width:6.2in;height:auto" />

DFD Level 1 merinci proses SIMASET menjadi autentikasi dan hak akses,
pengelolaan data aset, pengelolaan pusat data, peta interaktif,
penyewaan aset, permintaan sewa, riwayat dan notifikasi, backup dan
restore, serta evaluasi EKASMAT. Dekomposisi ini menunjukkan bagaimana
setiap proses membaca atau memperbarui data store yang relevan.

**Gambar 15. Entity Relationship Diagram SIMASET**

<img src="documents/bab5/gambar/gambar-5-14-erd-simaset.png"
style="width:6.26806in;height:6.36036in" />

**2. Pengkodean Program**

Pengkodean program SIMASET dilakukan dengan arsitektur frontend dan
backend yang terpisah. Frontend dikembangkan menggunakan React, Vite,
Tailwind CSS, Zustand, React Router, Leaflet, MapLibre, dan Recharts.
Backend dikembangkan menggunakan Node.js, Express, Sequelize,
PostgreSQL, JWT, bcrypt, nodemailer, multer, dan service pendukung
lainnya.

**a. Struktur Folder Pengkodean**

Struktur folder pengkodean SIMASET disusun secara modular agar setiap
komponen mudah dipelihara. Struktur utama proyek adalah sebagai berikut.

**Gambar 16. Struktur Folder Pengkodean SIMASET**

Simaset/

\|-- backend/

\| \|-- src/

\| \| \|-- config/ Konfigurasi database

\| \| \|-- controllers/ Logika request dan response API

\| \| \|-- database/ Migration dan seeder

\| \| \|-- middleware/ Auth, role, dan permission middleware

\| \| \|-- models/ Model Sequelize

\| \| \|-- routes/ Definisi endpoint API

\| \| \|-- services/ Audit, notifikasi, OTP, dan storage

\| \| \|-- utils/ Utility backend

\| \| \`-- server.js Entry point backend

\| \|-- package.json

\|

\|-- frontend/

\| \|-- src/

\| \| \|-- assets/ Asset gambar dan webgis

\| \| \|-- components/ Komponen UI dan modul

\| \| \|-- data/ Data pendukung EKASMAT

\| \| \|-- hooks/ Custom hooks

\| \| \|-- layouts/ Header, sidebar, root layout

\| \| \|-- pages/ Halaman aplikasi

\| \| \|-- router/ Konfigurasi route dan guard

\| \| \|-- services/ Service API frontend

\| \| \|-- stores/ Zustand store

\| \| \`-- utils/ Permission dan utility

\| \|-- package.json

\|

\`-- documents/

\`-- bab5/

\|-- gambar/ Diagram UML, DFD, ERD, sequence

\|-- plantuml/ Sumber PlantUML

\|-- drawio/ Sumber drawio

\`-- wireframe/ Wireframe interface

Struktur tersebut menunjukkan bahwa SIMASET dirancang dengan pemisahan
tanggung jawab. Backend bertanggung jawab terhadap API, keamanan, dan
database, sedangkan frontend bertanggung jawab terhadap tampilan,
navigasi, interaksi pengguna, dan konsumsi API.

**b. Back End**

Backend SIMASET menggunakan Express.js sebagai framework API dan
Sequelize sebagai Object Relational Mapping (ORM) untuk menghubungkan
aplikasi dengan PostgreSQL. Backend memiliki beberapa modul utama, yaitu
autentikasi, aset, pusat data, peta, sewa aset, permintaan sewa,
notifikasi, riwayat, backup, user management, upload, dan EKASMAT.

Autentikasi dilakukan menggunakan JSON Web Token (JWT). Password
pengguna disimpan dalam bentuk hash menggunakan bcrypt. Sistem juga
menyediakan MFA untuk meningkatkan keamanan akun. Middleware digunakan
untuk memvalidasi token, role, dan permission sebelum pengguna dapat
mengakses endpoint tertentu.

Contoh endpoint utama pada backend adalah sebagai berikut:

| **Modul** | **Endpoint Utama** | **Fungsi** |
|----|----|----|
| Auth | /api/auth/login, /api/auth/me, /api/auth/profile | Login, validasi pengguna, profil, MFA, refresh token |
| Aset | /api/aset | CRUD data aset dan sinkronisasi data aset |
| Pusat Data | /api/pusat-data | Mengelola pusat data aset BPKA |
| Peta | /api/peta | Menyediakan data marker, layer, statistik, dan detail peta |
| Sewa | /api/sewa | Mengelola penyewaan, pengembalian, statistik, dan aset tersedia |
| Permintaan | /api/permintaan | Mengelola permintaan sewa masyarakat |
| Backup | /api/backup | Export, import, download, hapus backup, dan export CSV |
| EKASMAT | /api/ekasmat | Menyimpan dan menampilkan respons evaluasi aplikasi |

**c. Front End**

Frontend SIMASET menggunakan React dengan Vite. Antarmuka dibuat modular
berdasarkan halaman dan komponen. Route aplikasi dikelola dengan React
Router, sedangkan state pengguna dan sesi dikelola menggunakan Zustand.
Untuk peta, aplikasi menggunakan Leaflet, React-Leaflet, dan MapLibre.
Untuk grafik dan visualisasi statistik, aplikasi menggunakan Recharts.

Frontend memiliki dua kelompok tampilan, yaitu tampilan internal dan
tampilan publik. Tampilan internal menggunakan RootLayout yang berisi
header, sidebar, dan area konten. Tampilan publik digunakan untuk login,
aset sewa tersedia, dan EKASMAT.

**d. Basis Data**

Basis data SIMASET menggunakan PostgreSQL. Struktur tabel utama disusun
berdasarkan model Sequelize. Tabel inti yang digunakan dapat dilihat
pada Tabel 6.

**Tabel 6. Basis Data SIMASET**

| **No** | **Bagian Data** | **Field Utama** | **Jenis Data/Keterangan** |
|----|----|----|----|
| 1 | users | id_user | Integer, primary key |
| 2 | users | username, password, role | Akun pengguna, password hash, role pengguna |
| 3 | users | email, no_telepon, nip, nik, nama_lengkap | Identitas dan kontak pengguna |
| 4 | users | status_aktif, mfa_enabled, mfa_secret | Status akun dan konfigurasi MFA |
| 5 | aset | id_aset, kode_aset, nama_aset, lokasi | Identitas aset tanah |
| 6 | aset | koordinat_lat, koordinat_long, polygon_bidang | Data spasial aset |
| 7 | aset | nomor_sertifikat, jenis_hak, atas_nama, status_hukum | Data legal aset |
| 8 | aset | kecamatan, desa_kelurahan, luas, luas_lapangan, batas_utara, batas_selatan, batas_timur, batas_barat | Data fisik aset |
| 9 | aset | kode_bmd, nilai_buku, nilai_njop, sk_penetapan, opd_pengguna | Data administratif dan keuangan |
| 10 | pusat_data | id_pusat_data, kode_aset, nama_aset, nib, nomor_hak | Repositori data aset BPKA |
| 11 | pusat_data | kecamatan, kelurahan, alamat, status_sertifikat, opd | Lokasi dan status pusat data |
| 12 | sewa_aset | id_sewa, id_aset, nama_aset, lokasi_aset | Identitas data sewa |
| 13 | sewa_aset | nama_penyewa, nik_penyewa, instansi_penyewa, kontak penyewa | Data penyewa |
| 14 | sewa_aset | tanggal_mulai, tanggal_berakhir, nilai_sewa, periode_bayar, status | Periode, nilai, dan status sewa |
| 15 | sewa_aset | tanggal_pengembalian, kondisi_pengembalian, catatan_pengembalian | Data pengembalian aset |
| 16 | permintaan_sewa | id_permintaan, id_sewa, nama_aset, nama_pemohon, nik, no_telepon, email | Data permintaan sewa masyarakat |
| 17 | permintaan_sewa | tujuan_sewa, status, catatan_admin, dokumen_respon | Proses dan respons permintaan |
| 18 | riwayat | id_riwayat, aksi, tabel, id_referensi, data_lama, data_baru, keterangan | Audit trail aktivitas |
| 19 | notifikasi | id_notifikasi, user_id, judul, pesan, tipe, kategori, dibaca | Notifikasi pengguna |
| 20 | ekasmat_responses | id_ekasmat, nama, sumber, skor, submitted_at | Respons evaluasi EKASMAT |

Basis data tersebut mendukung proses pengelolaan aset tanah secara
terintegrasi. Tabel aset menjadi pusat data operasional, pusat_data
menjadi repositori data BPKA, sewa_aset menyimpan data pemanfaatan aset,
permintaan_sewa menyimpan pengajuan masyarakat, sedangkan riwayat dan
notifikasi mendukung pengawasan aktivitas sistem.

**3. Interface**

Interface merupakan tampilan antarmuka yang digunakan oleh pengguna
dalam mengoperasikan sistem. Rancangan interface SIMASET disusun
berdasarkan halaman yang tersedia pada aplikasi, yaitu login, dashboard,
aset, data substansi, pusat data, peta, penyewaan, permintaan sewa,
halaman publik, riwayat, notifikasi, backup, profil, pengaturan, dan
EKASMAT.

**a. Halaman Login**

**Gambar 17. Halaman Login**

<img src="documents/bab5/wireframe/wireframe-5-21-login.png"
style="width:6.1376in;height:3.3in" />

Halaman login digunakan oleh pengguna internal untuk masuk ke sistem.
Pengguna memasukkan username dan password. Halaman ini juga menyediakan
akses ke halaman publik aset sewa tersedia dan EKASMAT.

**b. Tampilan Dashboard**

**Gambar 18. Dashboard Utama**

<img src="documents/bab5/wireframe/wireframe-5-22-dashboard.png"
style="width:6.26806in;height:3.35868in" />

Dashboard menampilkan ringkasan kondisi aset, statistik, grafik, peta
ringkas, dan aktivitas terbaru. Pada SIMASET, dashboard diarahkan agar
peta menjadi tampilan awal untuk membantu pengguna memahami kondisi aset
secara spasial.

**c. Tampilan Kelola Aset**

**Gambar 19. Halaman Kelola Aset**

<img src="documents/bab5/wireframe/wireframe-5-23-kelola-aset.png"
style="width:6.26806in;height:3.27462in" />

Halaman kelola aset digunakan untuk menampilkan daftar aset, melakukan
pencarian, filter, tambah data, ubah data, hapus data, dan melihat
detail aset. Hak akses pada halaman ini disesuaikan dengan role
pengguna.

**d. Tampilan Data Substansi**

**Gambar 20. Halaman Data Legal, Fisik, Administratif, dan Spasial**

<img src="documents/bab5/wireframe/wireframe-5-24-data-substansi.png"
style="width:6.075in;height:3.2561in" />

Halaman data substansi digunakan oleh BPN untuk memperbarui data legal,
fisik, administratif, dan spasial. Halaman ini membantu pemisahan
tanggung jawab antara pengelolaan aset daerah dan pembaruan informasi
pertanahan.

**e. Tampilan Pusat Data**

**Gambar 21. Halaman Pusat Data**

<img src="documents/bab5/wireframe/wireframe-5-25-pusat-data.png"
style="width:6.26806in;height:3.35486in" />

Halaman pusat data digunakan untuk mengelola repositori data aset BPKA.
Halaman ini menyediakan filter kecamatan, kelurahan, pencarian data,
peta ringkas, dan tabel data pusat.

**f. Tampilan Peta Interaktif**

**Gambar 22. Halaman Peta Interaktif**

<img src="documents/bab5/wireframe/wireframe-5-26-peta-interaktif.png"
style="width:6.2483in;height:3.3375in" />

Halaman peta interaktif menampilkan aset dalam bentuk spasial. Pengguna
dapat memilih layer, melakukan pencarian, filter status, melihat
legenda, dan membuka panel detail aset.

**g. Tampilan Penyewaan dan Permintaan Sewa**

**Gambar 23. Halaman Penyewaan**

<img src="documents/bab5/wireframe/wireframe-5-27-penyewaan.png"
style="width:6.26806in;height:3.3479in" />

Halaman penyewaan digunakan oleh BPKA untuk mengelola data aset yang
disewakan, status sewa, nilai sewa, periode sewa, dokumen kontrak, dan
pengembalian aset.

**Gambar 24. Halaman Permintaan Sewa**

<img src="documents/bab5/wireframe/wireframe-5-28-permintaan-sewa.png"
style="width:6.25384in;height:3.3625in" />

Halaman permintaan sewa digunakan untuk memproses permintaan yang
diajukan oleh masyarakat. Petugas dapat melihat detail permintaan,
mengubah status, memberikan catatan, dan mengunggah dokumen respons.

**Gambar 25. Halaman Publik Aset Sewa Tersedia**

<img src="documents/bab5/wireframe/wireframe-5-29-publik-sewa.png"
style="width:6.26806in;height:3.35972in" />

Halaman publik aset sewa tersedia digunakan masyarakat untuk melihat
aset yang dapat disewa dan mengajukan permintaan sewa.

**h. Tampilan Riwayat, Notifikasi, Backup, Profil, dan Pengaturan**

**Gambar 26. Halaman Riwayat**

<img src="documents/bab5/wireframe/wireframe-5-30-riwayat.png"
style="width:6.26806in;height:3.35493in" />

Halaman riwayat digunakan oleh admin untuk melihat catatan aktivitas
pengguna. Data riwayat mendukung audit dan penelusuran perubahan data.

**Gambar 27. Halaman Notifikasi**

<img src="documents/bab5/wireframe/wireframe-5-31-notifikasi.png"
style="width:6.26806in;height:3.35906in" />

Halaman notifikasi digunakan untuk menampilkan pemberitahuan sistem,
status baca, dan informasi penting kepada pengguna.

**Gambar 28. Halaman Backup**

<img src="documents/bab5/wireframe/wireframe-5-32-backup.png"
style="width:6.26806in;height:3.3517in" />

Halaman backup digunakan oleh admin untuk melakukan export, import,
download, hapus backup, dan export CSV.

**Gambar 29. Halaman Profil dan Pengaturan**

<img src="documents/bab5/wireframe/wireframe-5-33-profil-pengaturan.png"
style="width:6.26806in;height:3.35868in" />

Halaman profil dan pengaturan digunakan untuk mengelola informasi
pengguna, keamanan akun, preferensi, dan konfigurasi sistem.

**i. Tampilan EKASMAT**

**Gambar 30. Halaman EKASMAT**

<img src="documents/bab5/wireframe/wireframe-5-34-ekasmat.png"
style="width:6.26806in;height:3.3441in" />

Halaman EKASMAT digunakan untuk mengisi evaluasi kinerja aplikasi. Data
yang dikirimkan berisi nama responden, sumber responden, skor penilaian,
dan waktu pengisian.

**4. Pengujian Sistem dan Evaluasi Pengguna**

Pengujian sistem dilakukan untuk memastikan bahwa fitur SIMASET berjalan
sesuai kebutuhan. Pengujian disusun menggunakan pendekatan blackbox
testing, yaitu pengujian berdasarkan input dan output sistem tanpa
melihat kode program secara langsung. Pengujian juga dilengkapi dengan
evaluasi pengguna melalui EKASMAT.

**Tabel 7. Test Case SIMASET**

| **No** | **Pengujian** | **Indikator** | **Hasil Uji** |
|----|----|----|----|
| 1 | Login pengguna | Pengguna dapat masuk ke dashboard sesuai role | Berfungsi dengan baik |
| 2 | Logout pengguna | Sesi pengguna berakhir dan token dihapus | Berfungsi dengan baik |
| 3 | Role guard menu | Menu tampil sesuai hak akses pengguna | Berfungsi dengan baik |
| 4 | Tambah data aset | Data aset baru tersimpan pada database | Berfungsi dengan baik |
| 5 | Ubah data aset | Data aset berubah sesuai input pengguna | Berfungsi dengan baik |
| 6 | Hapus data aset | Data aset dapat dihapus sesuai hak akses | Berfungsi dengan baik |
| 7 | Pencarian aset | Sistem menampilkan aset sesuai kata kunci | Berfungsi dengan baik |
| 8 | Filter aset | Sistem menampilkan aset sesuai status/lokasi | Berfungsi dengan baik |
| 9 | Data substansi legal | BPN dapat memperbarui data sertifikat dan status hukum | Berfungsi dengan baik |
| 10 | Data substansi fisik | BPN dapat memperbarui lokasi, luas, dan batas tanah | Berfungsi dengan baik |
| 11 | Data substansi administratif | BPN dapat memperbarui data administratif dan keuangan | Berfungsi dengan baik |
| 12 | Data substansi spasial | BPN dapat memperbarui koordinat dan polygon bidang | Berfungsi dengan baik |
| 13 | Pusat data | BPKA dapat mengelola pusat data dan role lain dapat melihat | Berfungsi dengan baik |
| 14 | Peta interaktif | Marker, layer, filter, dan detail aset tampil pada peta | Berfungsi dengan baik |
| 15 | Tambah data sewa | Data penyewaan aset dapat disimpan | Berfungsi dengan baik |
| 16 | Pengembalian aset | Status pengembalian dan kondisi aset dapat dicatat | Berfungsi dengan baik |
| 17 | Permintaan sewa publik | Masyarakat dapat mengirim permintaan sewa | Berfungsi dengan baik |
| 18 | Proses permintaan sewa | Petugas dapat mengubah status dan memberi catatan | Berfungsi dengan baik |
| 19 | Notifikasi | Notifikasi dapat ditampilkan dan dibaca | Berfungsi dengan baik |
| 20 | Riwayat aktivitas | Aktivitas penting dapat dicatat sebagai audit trail | Berfungsi dengan baik |
| 21 | Backup export | Admin dapat membuat file backup | Berfungsi dengan baik |
| 22 | Backup import | Admin dapat mengimpor data backup | Berfungsi dengan baik |
| 23 | Manajemen pengguna | Admin dapat menambah, mengubah, dan menonaktifkan pengguna | Berfungsi dengan baik |
| 24 | Profil dan password | Pengguna dapat mengubah profil dan password | Berfungsi dengan baik |
| 25 | MFA | Pengguna dapat melakukan setup, verifikasi, dan disable MFA | Berfungsi dengan baik |
| 26 | EKASMAT | Responden dapat mengirim skor evaluasi aplikasi | Berfungsi dengan baik |

Selain blackbox testing, sistem juga memiliki pengujian unit untuk
beberapa bagian penting. Frontend menggunakan Vitest untuk menguji
permission dan auth store, sedangkan backend menggunakan node test untuk
menguji middleware autentikasi dan service OTP. Pengujian tersebut
membantu memastikan bahwa kontrol akses, token, role, dan penyimpanan
sesi berjalan lebih aman.

Evaluasi pengguna dilakukan melalui EKASMAT. Instrumen EKASMAT memiliki
11 pertanyaan dengan skala nilai 1 sampai 5. Data awal yang tersimpan
pada aplikasi terdiri dari 10 responden dengan total 110 jawaban. Hasil
rekapitulasi menunjukkan total skor 499 dari skor maksimum 550,
rata-rata skor 4,54, dan indeks kepuasan 90,73 persen.

**Tabel 8. Rekapitulasi Evaluasi EKASMAT**

| **No** | **Indikator**     | **Nilai**     |
|--------|-------------------|---------------|
| 1      | Jumlah responden  | 10 orang      |
| 2      | Jumlah pertanyaan | 11 pertanyaan |
| 3      | Total jawaban     | 110 jawaban   |
| 4      | Total skor        | 499           |
| 5      | Skor maksimum     | 550           |
| 6      | Rata-rata skor    | 4,54          |
| 7      | Indeks kepuasan   | 90,73 persen  |
| 8      | Predikat          | Sangat puas   |

**Tabel 9. Rata-rata Tiap Pertanyaan EKASMAT**

| **No** | **Pertanyaan** | **Rata-rata** | **Predikat** |
|----|----|----|----|
| 1 | Informasi yang disediakan oleh SIMASET mudah dimengerti. | 4,60 | Sangat puas |
| 2 | Menu atau fitur dalam SIMASET mudah digunakan. | 4,50 | Sangat puas |
| 3 | SIMASET nyaman digunakan. | 4,70 | Sangat puas |
| 4 | Secara keseluruhan penggunaan SIMASET memuaskan. | 4,50 | Sangat puas |
| 5 | SIMASET sesuai dengan kebutuhan pengelolaan aset tanah. | 4,50 | Sangat puas |
| 6 | SIMASET mudah dipelajari oleh pengguna. | 4,40 | Sangat puas |
| 7 | SIMASET mudah dioperasikan. | 4,50 | Sangat puas |
| 8 | Pengguna dapat dengan mudah menghindari kesalahan saat menggunakan SIMASET. | 4,50 | Sangat puas |
| 9 | SIMASET bermanfaat bagi pengguna dalam pengelolaan aset tanah. | 4,70 | Sangat puas |
| 10 | Tampilan menu dalam SIMASET mudah dikenali. | 4,50 | Sangat puas |
| 11 | SIMASET memiliki fungsi dan kemampuan sesuai dengan yang diharapkan. | 4,50 | Sangat puas |

Berdasarkan hasil evaluasi tersebut, SIMASET memperoleh penilaian sangat
positif dari pengguna. Nilai tertinggi terdapat pada indikator
kenyamanan penggunaan dan manfaat sistem, masing-masing dengan rata-rata
4,70. Nilai terendah terdapat pada indikator kemudahan dipelajari dengan
rata-rata 4,40, tetapi masih berada dalam kategori sangat puas. Hal ini
menunjukkan bahwa sistem telah memenuhi kebutuhan utama pengguna, namun
tetap membutuhkan pendampingan atau panduan penggunaan agar proses
adaptasi berjalan lebih baik.

**  **

**BAB VII**

**IMPLEMENTASI SISTEM INFORMASI MANAJEMEN ASET TANAH "SIMASET" KOTA
PASURUAN**

**A. Skenario Pelaksanaan Tugas**

SIMASET merupakan sistem informasi yang digunakan untuk mendukung
pengelolaan aset tanah melalui integrasi data administratif, data
pertanahan, data spasial, penyewaan aset, permintaan sewa, notifikasi,
riwayat aktivitas, backup data, dan evaluasi layanan. Implementasi
sistem dilakukan melalui skenario pelaksanaan tugas yang menggambarkan
bagaimana pengguna menjalankan aktivitas utama pada sistem.

**1. Login dan Akses Dashboard**

Skenario pertama adalah proses login pengguna internal. Pengguna membuka
halaman login, memasukkan username dan password, kemudian sistem
memvalidasi akun. Apabila akun valid, sistem membuat token sesi dan
menampilkan dashboard sesuai role pengguna. Jika MFA aktif, sistem
meminta kode autentikasi sebelum pengguna dapat masuk ke dashboard.

**Gambar 31. Kegiatan Login Pengguna**

<img src="documents/bab5/screenshots/skenario-login.png" style="width:6.2in;height:auto" />

Setelah berhasil login, pengguna diarahkan ke dashboard. Dashboard
menampilkan peta ringkas, statistik aset, grafik, dan informasi
aktivitas. Dashboard membantu pengguna memperoleh gambaran awal mengenai
kondisi aset tanah.

**Gambar 32. Kegiatan Monitoring Dashboard**

<img src="documents/bab5/screenshots/skenario-dashboard.png" style="width:6.2in;height:auto" />

**2. Proses Pengelolaan Data Pengguna dan Hak Akses**

Pengelolaan pengguna dilakukan oleh Admin BPKA dan Admin BPN. Admin
dapat menambah akun pengguna, memperbarui data profil, mengatur role,
mengaktifkan atau menonaktifkan akun, serta melakukan reset password
apabila diperlukan. Pembagian role menjadi dasar untuk menentukan menu
dan aksi yang dapat dilakukan oleh setiap pengguna.

Role yang digunakan dalam SIMASET adalah admin_bpka, admin_bpn, bpka,
dan bpn. Dalam naskah akademik ini, role bpka merujuk pada BPKA sebagai
instansi pengelola aset daerah. Setiap role memiliki hak akses berbeda.
Admin memiliki akses administratif, BPKA memiliki akses pengelolaan aset
daerah dan sewa, sedangkan BPN memiliki akses pembaruan data substansi
pertanahan.

**3. Proses Input dan Pembaruan Data Aset**

Pengelolaan data aset dilakukan melalui halaman kelola aset. Pengguna
yang memiliki hak akses membuka halaman aset, memilih tombol tambah
data, mengisi identitas aset, lokasi, luas, status, nilai aset, data
sertifikat, dan keterangan pendukung. Data yang telah diisi kemudian
disimpan ke database.

**Gambar 33. Kegiatan Kelola Data Aset**

<img src="documents/bab5/screenshots/skenario-kelola-aset.png" style="width:6.2in;height:auto" />

Pada halaman ini, pengguna juga dapat melakukan pencarian, filter,
melihat detail, mengubah data, dan menghapus data. Proses perubahan data
dicatat pada riwayat aktivitas untuk mendukung audit. Dengan adanya
riwayat, admin dapat menelusuri perubahan yang terjadi pada data aset.

**4. Proses Pengelolaan Data Substansi BPN**

Petugas BPN mengelola data substansi pertanahan melalui halaman data
legal, fisik, administratif, dan spasial. Data legal berisi informasi
sertifikat, jenis hak, atas nama, tanggal sertifikat, riwayat perolehan,
dan status hukum. Data fisik berisi lokasi, luas, batas tanah,
kecamatan, desa atau kelurahan, dan penggunaan aset. Data administratif
berisi kode BMD, nilai buku, nilai NJOP, SK penetapan, dan OPD pengguna.
Data spasial berisi koordinat dan polygon bidang tanah.

**Gambar 34. Kegiatan Pengelolaan Data Substansi**

<img src="documents/bab5/screenshots/skenario-substansi.png" style="width:6.2in;height:auto" />

Pembaruan data substansi diperlukan agar data aset tidak hanya berfungsi
sebagai catatan administratif, tetapi juga mencerminkan kondisi
pertanahan dan lokasi bidang tanah. Pembagian kewenangan ini menjaga
agar perubahan data pertanahan dilakukan oleh pihak yang memiliki
kompetensi dan kewenangan.

**5. Proses Pengelolaan Pusat Data BPKA**

Pusat data digunakan sebagai repositori aset BPKA. Petugas BPKA membuka
halaman pusat data, melihat daftar data, melakukan filter berdasarkan
kecamatan atau kelurahan, serta menambah atau memperbarui data apabila
diperlukan. Data pusat dapat dibaca oleh role internal sebagai referensi
pengelolaan aset.

**Gambar 35. Kegiatan Pengelolaan Pusat Data**

<img src="documents/bab5/screenshots/skenario-pusat-data.png" style="width:6.2in;height:auto" />

Pusat data membantu menyatukan informasi aset daerah dalam satu tempat.
Dengan demikian, proses pemeriksaan dan pencocokan data dapat dilakukan
lebih cepat.

**6. Proses Monitoring Peta Interaktif**

Peta interaktif digunakan oleh pengguna internal untuk melihat lokasi
aset secara spasial. Pengguna membuka halaman peta, memilih layer,
menggunakan pencarian, menerapkan filter status, dan membuka detail
aset. Sistem menampilkan marker, polygon, legenda, serta panel detail.

**Gambar 36. Kegiatan Monitoring Peta Interaktif**

<img src="documents/bab5/screenshots/skenario-peta.png" style="width:6.2in;height:auto" />

Peta interaktif menjadi salah satu fitur utama karena dapat
menghubungkan data tekstual dengan data spasial. Pengguna dapat
mengetahui aset mana yang aktif, bermasalah, indikasi bermasalah,
diblokir, tersedia untuk disewa, atau sedang disewakan.

**7. Proses Penyewaan dan Pengembalian Aset**

Pengelolaan sewa aset dilakukan oleh BPKA. Petugas membuka halaman
penyewaan, memilih aset, mengisi data penyewa, periode sewa, nilai sewa,
periode pembayaran, nomor kontrak, dokumen pendukung, foto sewa, dan
polygon sewa apabila diperlukan. Setelah data tersimpan, sistem
menampilkan status penyewaan.

**Gambar 37. Kegiatan Penyewaan Aset**

<img src="documents/bab5/screenshots/skenario-penyewaan.png" style="width:6.2in;height:auto" />

Apabila masa sewa berakhir atau aset dikembalikan, petugas dapat
mencatat tanggal pengembalian, kondisi pengembalian, catatan
pengembalian, dan foto kondisi. Status aset dapat berubah menjadi
tersedia, disewakan, akan berakhir, berakhir, dikembalikan, atau
dibatalkan sesuai kondisi.

**8. Proses Permintaan Sewa oleh Masyarakat**

Masyarakat dapat membuka halaman publik aset sewa tersedia tanpa masuk
ke dashboard internal. Pada halaman tersebut, masyarakat melihat daftar
aset yang tersedia, memilih aset yang diminati, kemudian mengisi
formulir permintaan sewa. Data yang dimasukkan meliputi nama pemohon,
NIK, nomor telepon, email, alamat, dan tujuan sewa.

**Gambar 38. Kegiatan Pengajuan Permintaan Sewa Publik**

<img src="documents/bab5/screenshots/skenario-publik-sewa.png" style="width:6.2in;height:auto" />

Permintaan yang masuk dapat diproses oleh BPKA melalui halaman
permintaan sewa. Petugas dapat melihat detail permohonan, mengubah
status menjadi diproses, disetujui, atau ditolak, serta menambahkan
catatan admin.

**Gambar 39. Kegiatan Pemrosesan Permintaan Sewa**

<img src="documents/bab5/screenshots/skenario-permintaan.png" style="width:6.2in;height:auto" />

**9. Proses Notifikasi, Riwayat, dan Backup Data**

Notifikasi digunakan untuk memberikan informasi kepada pengguna mengenai
aktivitas atau informasi sistem. Pengguna dapat membuka halaman
notifikasi dan menandai notifikasi sebagai telah dibaca.

**Gambar 40. Kegiatan Notifikasi Sistem**

<img src="documents/bab5/screenshots/skenario-notifikasi.png" style="width:6.2in;height:auto" />

Riwayat aktivitas digunakan oleh admin untuk memantau aktivitas
pengguna. Data riwayat mencatat aksi, tabel, referensi data, data lama,
data baru, keterangan, IP address, user agent, user_id, dan waktu
aktivitas.

**Gambar 41. Kegiatan Pemantauan Riwayat Aktivitas**

<img src="documents/bab5/screenshots/skenario-riwayat.png" style="width:6.2in;height:auto" />

Backup data digunakan oleh admin untuk menjaga ketersediaan data. Admin
dapat melakukan export backup, upload file backup, import backup,
download backup, hapus backup, dan export CSV.

**Gambar 42. Kegiatan Backup Data**

<img src="documents/bab5/screenshots/skenario-backup.png" style="width:6.2in;height:auto" />

**10. Proses Pengisian EKASMAT**

EKASMAT digunakan untuk mengumpulkan evaluasi pengguna terhadap SIMASET.
Responden membuka halaman EKASMAT, mengisi nama dan sumber, memberikan
nilai pada 11 pertanyaan, kemudian mengirimkan evaluasi. Sistem
menyimpan data ke tabel ekasmat_responses.

**Gambar 43. Kegiatan Pengisian EKASMAT**

<img src="documents/bab5/screenshots/skenario-ekasmat.png" style="width:6.2in;height:auto" />

Hasil evaluasi digunakan untuk mengetahui tingkat kepuasan pengguna dan
menjadi masukan dalam pengembangan sistem berikutnya. Data evaluasi juga
dapat menjadi bukti bahwa sistem telah diuji dan digunakan oleh calon
pengguna.

**B. Kelebihan dan Kekurangan Sistem Informasi**

Sistem informasi yang dibangun telah melalui tahapan perancangan,
pengkodean, pengujian, dan evaluasi awal. SIMASET memiliki beberapa
kelebihan yang mendukung pengelolaan aset tanah, namun juga memiliki
beberapa kekurangan yang perlu diperhatikan untuk pengembangan lanjutan.

**1. Kelebihan**

a\. SIMASET berbasis web sehingga dapat diakses melalui browser modern
pada perangkat desktop maupun mobile.  
b. Sistem mengintegrasikan data administratif, data pertanahan, data
spasial, sewa aset, permintaan sewa, riwayat, notifikasi, backup, dan
evaluasi layanan.  
c. Sistem menerapkan role-based access control sehingga akses pengguna
dapat dibatasi berdasarkan kewenangan.  
d. Peta interaktif membantu pengguna memahami lokasi aset, status aset,
dan konteks wilayah secara visual.  
e. Modul pusat data membantu BPKA menyimpan dan memeriksa data aset
daerah secara lebih terstruktur.  
f. Modul data substansi membantu BPN memperbarui data legal, fisik,
administratif, dan spasial.  
g. Modul sewa aset mendukung pencatatan penyewaan, pengembalian, status
sewa, nilai sewa, dan dokumen pendukung.  
h. Halaman publik aset sewa tersedia memudahkan masyarakat melihat aset
yang dapat dimanfaatkan dan mengajukan permintaan sewa.  
i. Riwayat aktivitas mendukung audit trail dan penelusuran perubahan
data.  
j. Backup data membantu admin menjaga ketersediaan data dan mendukung
pemulihan apabila terjadi gangguan.  
k. EKASMAT menyediakan media evaluasi pengguna terhadap aplikasi.  
l. Struktur frontend dan backend modular sehingga lebih mudah dipelihara
dan dikembangkan.

**2. Kekurangan**

a\. Sistem masih bergantung pada ketersediaan server, database, koneksi
internet, dan layanan penyimpanan file.  
b. Pengguna baru membutuhkan pelatihan agar dapat memahami alur kerja,
terutama pada modul peta, data substansi, dan penyewaan aset.  
c. Kualitas data sangat bergantung pada kedisiplinan input dan
pemutakhiran data oleh petugas.  
d. Integrasi data BPKA dan BPN masih membutuhkan proses validasi agar
tidak terjadi perbedaan data.  
e. Pengujian performa beban besar belum dilakukan secara mendalam,
sehingga perlu uji lanjutan apabila jumlah data dan pengguna
meningkat.  
f. Keamanan sistem perlu terus diperkuat melalui HTTPS, rotasi secret,
pembatasan akses server, backup berkala, dan monitoring.  
g. Evaluasi EKASMAT masih perlu diperluas dengan jumlah responden yang
lebih banyak agar hasilnya lebih representatif.  
h. Sistem perlu disiapkan dengan panduan operasional tertulis agar
penggunaan di instansi dapat berjalan konsisten.

**LAMPIRAN**

**Lampiran 1. Kuisioner EKASMAT**

Kuisioner EKASMAT digunakan untuk mengevaluasi kinerja aplikasi SIMASET.
Responden memberikan nilai 1 sampai 5 dengan keterangan sebagai berikut:
1 = sangat tidak setuju, 2 = tidak setuju, 3 = netral, 4 = setuju, dan 5
= sangat setuju.

| **No** | **Pertanyaan** |
|----|----|
| 1 | Informasi yang disediakan oleh SIMASET mudah dimengerti. |
| 2 | Menu atau fitur dalam SIMASET mudah digunakan. |
| 3 | SIMASET nyaman digunakan. |
| 4 | Secara keseluruhan penggunaan SIMASET memuaskan. |
| 5 | SIMASET sesuai dengan kebutuhan pengelolaan aset tanah. |
| 6 | SIMASET mudah dipelajari oleh pengguna. |
| 7 | SIMASET mudah dioperasikan. |
| 8 | Pengguna dapat dengan mudah menghindari kesalahan saat menggunakan SIMASET. |
| 9 | SIMASET bermanfaat bagi pengguna dalam pengelolaan aset tanah. |
| 10 | Tampilan menu dalam SIMASET mudah dikenali. |
| 11 | SIMASET memiliki fungsi dan kemampuan sesuai dengan yang diharapkan. |

**Lampiran 2. Panduan Wawancara**

Panduan wawancara digunakan untuk menggali kebutuhan pengguna sebelum
dan sesudah penggunaan SIMASET.

| **No** | **Pertanyaan Wawancara** |
|----|----|
| 1 | Bagaimana proses pengelolaan data aset tanah sebelum SIMASET digunakan? |
| 2 | Apa kendala utama dalam pencarian dan pemutakhiran data aset? |
| 3 | Data apa saja yang perlu tersedia dalam sistem? |
| 4 | Bagaimana proses sinkronisasi data antara BPKA dan BPN dilakukan? |
| 5 | Fitur apa yang paling dibutuhkan untuk membantu pekerjaan harian? |
| 6 | Bagaimana kebutuhan akses dan pembagian kewenangan pengguna? |
| 7 | Apakah peta interaktif membantu dalam memahami lokasi aset? |
| 8 | Bagaimana proses penyewaan aset sebaiknya dilakukan dalam sistem? |
| 9 | Apakah sistem perlu menyediakan riwayat aktivitas dan backup data? |
| 10 | Saran apa yang diberikan untuk pengembangan SIMASET berikutnya? |

**Lampiran 3. Basis Data**

Lampiran basis data berikut menyajikan setiap tabel utama pada model SIMASET
dalam bentuk gambar agar struktur nama tabel, primary key, foreign key, dan
atribut penting dapat dibaca secara terpisah.

**Lampiran 3.1 Tabel users**

<img src="documents/bab5/generated/db-users.png" style="width:6.2in;height:auto" />

**Lampiran 3.2 Tabel aset**

<img src="documents/bab5/generated/db-aset.png" style="width:6.2in;height:auto" />

**Lampiran 3.3 Tabel pusat_data**

<img src="documents/bab5/generated/db-pusat-data.png" style="width:6.2in;height:auto" />

**Lampiran 3.4 Tabel sewa_aset**

<img src="documents/bab5/generated/db-sewa-aset.png" style="width:6.2in;height:auto" />

**Lampiran 3.5 Tabel permintaan_sewa**

<img src="documents/bab5/generated/db-permintaan-sewa.png" style="width:6.2in;height:auto" />

**Lampiran 3.6 Tabel riwayat**

<img src="documents/bab5/generated/db-riwayat.png" style="width:6.2in;height:auto" />

**Lampiran 3.7 Tabel notifikasi**

<img src="documents/bab5/generated/db-notifikasi.png" style="width:6.2in;height:auto" />

**Lampiran 3.8 Tabel ekasmat_responses**

<img src="documents/bab5/generated/db-ekasmat-responses.png" style="width:6.2in;height:auto" />

**Lampiran 4. Daftar Jawaban Responden EKASMAT**

Data awal EKASMAT yang digunakan pada aplikasi berjumlah 10 responden.

| **No** | **Responden**                    | **Sumber** | **Skor**              |
|--------|----------------------------------|------------|-----------------------|
| 1      | Febri Ardiyanto                  | BPN        | 5,5,5,5,5,5,5,5,5,5,5 |
| 2      | Agus Andrijono                   | BPKA       | 5,5,5,5,5,5,5,5,5,5,5 |
| 3      | Dani M                           | BPKA       | 5,4,5,5,5,5,5,4,5,4,5 |
| 4      | Mohammad Khisanul Masobih, S.Kom | BPKA       | 4,4,5,4,4,4,4,5,5,4,5 |
| 5      | Sumarto                          | BPKA       | 4,4,4,4,4,4,4,4,4,4,4 |
| 6      | Yudy                             | BPKA       | 4,4,4,4,4,4,4,4,4,4,4 |
| 7      | Lutfi                            | BPKA       | 5,5,5,5,5,4,4,5,5,5,4 |
| 8      | Sumarto                          | BPKA       | 4,4,4,4,4,4,4,4,4,4,4 |
| 9      | Hariyanto                        | BPKA       | 5,5,5,5,5,5,5,5,5,5,5 |
| 10     | Dwi Andi Oktavianus              | BPKA       | 5,5,5,4,4,4,5,4,5,5,4 |

**Lampiran 5. Diagram Struktur Basis Data**

Lampiran ini membedakan dua jenis diagram. Class Diagram digunakan untuk
menunjukkan struktur kelas/model pada aplikasi, sedangkan ERD digunakan
untuk menunjukkan struktur tabel, primary key, foreign key, dan relasi
antartabel pada basis data.

**Lampiran 5.1 Class Diagram SIMASET**

Class Diagram berikut menggambarkan kelas model utama pada SIMASET,
atribut penting, operasi utama, dan asosiasi antar model.

<img src="documents/bab5/generated/class-diagram-simaset-ringkas.png" style="width:6.2in;height:auto" />

**Lampiran 5.2 Entity Relationship Diagram SIMASET**

ERD berikut menggambarkan tabel utama, kolom kunci, dan kardinalitas
relasi data yang digunakan pada basis data SIMASET.

<img src="documents/bab5/generated/erd-simaset-ringkas.png" style="width:6.2in;height:auto" />

**Lampiran 6. Skema Alur Sistem Informasi SIMASET**

Skema alur sistem informasi disajikan melalui proses bisnis, DFD, use
case, activity diagram, dan sequence diagram. File gambar tersedia pada
folder documents/bab5/gambar dan documents/bab5/generated.

| **No** | **Gambar** | **File** |
|----|----|----|
| 1 | Proses bisnis sebelum SIMASET | gambar/gambar-5-01-proses-bisnis-sebelum-simaset.png |
| 2 | Proses bisnis setelah SIMASET | gambar/gambar-5-02-proses-bisnis-setelah-simaset.png |
| 3 | Use case diagram | gambar/gambar-5-03-use-case-simaset.png |
| 4 | DFD Level 0 | generated/dfd-level-0-simaset.png |
| 5 | DFD Level 1 | generated/dfd-level-1-simaset.png |
| 6 | Activity diagram | gambar/gambar-5-05 sampai gambar-5-12 |
| 7 | Class diagram | gambar/gambar-5-13-class-diagram-simaset.png |
| 8 | ERD | gambar/gambar-5-14-erd-simaset.png |
| 9 | Sequence diagram | gambar/gambar-5-15 sampai gambar-5-20 |

**Lampiran 7. Wireframe Interface**

Wireframe interface SIMASET tersedia pada
folder documents/bab5/wireframe.

| **No** | **Interface** | **File** |
|----|----|----|
| 1 | Login | wireframe/wireframe-5-21-login.png |
| 2 | Dashboard | wireframe/wireframe-5-22-dashboard.png |
| 3 | Kelola aset | wireframe/wireframe-5-23-kelola-aset.png |
| 4 | Data substansi | wireframe/wireframe-5-24-data-substansi.png |
| 5 | Pusat data | wireframe/wireframe-5-25-pusat-data.png |
| 6 | Peta interaktif | wireframe/wireframe-5-26-peta-interaktif.png |
| 7 | Penyewaan | wireframe/wireframe-5-27-penyewaan.png |
| 8 | Permintaan sewa | wireframe/wireframe-5-28-permintaan-sewa.png |
| 9 | Publik aset sewa tersedia | wireframe/wireframe-5-29-publik-sewa.png |
| 10 | Riwayat | wireframe/wireframe-5-30-riwayat.png |
| 11 | Notifikasi | wireframe/wireframe-5-31-notifikasi.png |
| 12 | Backup | wireframe/wireframe-5-32-backup.png |
| 13 | Profil dan pengaturan | wireframe/wireframe-5-33-profil-pengaturan.png |
| 14 | EKASMAT | wireframe/wireframe-5-34-ekasmat.png |

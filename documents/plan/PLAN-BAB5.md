# Planning Pembaruan BAB 5 SIMASET

## Status Dokumen

Dokumen ini adalah satu-satunya plan kerja untuk pembaruan BAB 5 pada folder `documents/plan`. Isi dokumen ini belum dieksekusi menjadi draft BAB 5; tahap berikutnya menunggu pembacaan dan persetujuan terlebih dahulu.

## 1. Tujuan Pembaruan

Dokumen ini menjadi rencana kerja untuk memperbarui materi `BAB 5 UML.docx` agar sesuai dengan kondisi aplikasi SIMASET saat ini. Pembaruan diarahkan untuk menghasilkan BAB 5 skripsi yang bersifat akademik, konsisten dengan implementasi sistem, dan tetap mengikuti pola penulisan dokumen proposal lama.

Fokus utama pembaruan adalah mengubah naskah dari rancangan/proposal menjadi dokumentasi sistem yang telah diimplementasikan. Oleh karena itu, setiap narasi, aktor, use case, diagram, struktur tabel, dan rancangan antarmuka harus mengacu pada fitur yang benar-benar tersedia di aplikasi.

## 2. Temuan Dari Dokumen Lama

File `documents/bab5/BAB 5 UML.docx` memuat kerangka besar sebagai berikut:

1. Model proses bisnis sebelum dan sesudah sistem.
2. Analisis masalah, peluang, dan perbaikan proses bisnis.
3. Pendefinisian kebutuhan fungsional dan non-fungsional.
4. Functional model melalui use case diagram dan skenario use case.
5. Activity diagram untuk beberapa proses utama.
6. Class diagram dan struktur tabel database.
7. Sequence diagram untuk proses utama.
8. Perancangan interface atau wireframe halaman sistem.
9. Daftar pustaka terkait rekayasa perangkat lunak dan UML.

Beberapa bagian masih menggunakan konteks proposal dan istilah yang perlu disesuaikan, terutama penyebutan `SINKRONA`, keberadaan aktor Dinas Tata Ruang, serta beberapa fitur yang belum tampak sebagai modul aktif pada aplikasi SIMASET saat ini.

## 3. Kondisi Aplikasi Saat Ini

Berdasarkan pembacaan struktur kode, SIMASET saat ini merupakan aplikasi web full-stack dengan frontend React dan backend Express. Sistem menggunakan PostgreSQL melalui Sequelize, autentikasi JWT, MFA berbasis TOTP, serta kontrol akses berbasis role.

Role pengguna yang aktif pada kode adalah:

| No | Role Sistem | Nama Akademik Yang Disarankan | Fokus Akses |
| -- | ----------- | ----------------------------- | ----------- |
| 1 | `admin_bpka` | Admin BPKA/BPKAD | Akses administratif BPKA, user management, backup, riwayat, pusat data, aset, sewa, peta |
| 2 | `admin_bpn` | Admin BPN | Akses administratif BPN, user management, backup, riwayat, data substansi aset, peta |
| 3 | `bpka` | Petugas BPKA/BPKAD | Kelola aset/pusat data BPKA, sewa aset, permintaan sewa, peta, notifikasi, profil |
| 4 | `bpn` | Petugas BPN | Melihat aset dan memperbarui data legal, fisik, administratif, spasial, peta, notifikasi, profil |
| 5 | Publik | Masyarakat/Pengunjung | Melihat daftar aset sewa tersedia, mengajukan permintaan sewa, mengisi EKASMAT |

Modul yang tersedia pada aplikasi:

| No | Modul | Kondisi Implementasi |
| -- | ----- | -------------------- |
| 1 | Autentikasi | Login, register, logout, profil, ganti password, refresh token, setup/disable MFA |
| 2 | Dashboard | Dashboard berbasis role dengan statistik dan visualisasi data |
| 3 | Kelola Aset | Data aset umum serta data substansi legal, fisik, administratif, dan spasial |
| 4 | Pusat Data | Repositori data aset BPKA/BPKAD, dapat dibaca semua role internal dan dikelola BPKA |
| 5 | Peta | Peta interaktif, marker, layer umum, tata ruang, potensi bermasalah, sebaran perkara, detail aset |
| 6 | Sewa Aset | Pengelolaan penyewaan, status sewa, pengembalian, polygon area sewa |
| 7 | Permintaan Sewa | Pengajuan publik dan pemrosesan permintaan oleh BPKA |
| 8 | Riwayat | Audit trail aktivitas sistem, terutama untuk admin |
| 9 | Notifikasi | Notifikasi in-app dan status baca |
| 10 | Backup | Export, import, download, hapus backup, dan export CSV untuk admin |
| 11 | User Management | CRUD pengguna oleh admin |
| 12 | Pengaturan dan Profil | Pengaturan sistem, preferensi, profil, keamanan akun |
| 13 | EKASMAT | Form evaluasi/kuesioner publik dengan penyimpanan skor |

Model database utama:

| No | Model | Fungsi |
| -- | ----- | ------ |
| 1 | `User` | Menyimpan akun, role, profil, status aktif, dan konfigurasi MFA |
| 2 | `Aset` | Menyimpan data aset tanah, data legal, fisik, administratif, spasial, KIB, dan status masalah |
| 3 | `PusatData` | Menyimpan data pusat aset BPKA/BPKAD |
| 4 | `SewaAset` | Menyimpan data sewa, penyewa, periode, nilai sewa, kontrak, status, pengembalian, dan polygon sewa |
| 5 | `PermintaanSewa` | Menyimpan permintaan sewa dari masyarakat |
| 6 | `Riwayat` | Menyimpan catatan aktivitas pengguna |
| 7 | `Notifikasi` | Menyimpan pemberitahuan sistem |
| 8 | `EkasmatResponse` | Menyimpan respons kuesioner EKASMAT |

## 4. Keputusan Penyesuaian Isi BAB 5

1. Gunakan nama sistem `SIMASET` secara konsisten. Istilah `SINKRONA` dari proposal lama diganti atau dijelaskan sebagai konteks lama bila masih diperlukan.
2. Aktor Dinas Tata Ruang tidak dijadikan aktor utama jika tidak ada role dan modul aktif pada aplikasi saat ini.
3. Aktor masyarakat sebaiknya ditulis sebagai aktor publik/pengunjung, bukan user internal, karena akses publik tersedia melalui rute sewa tersedia, permintaan sewa, dan EKASMAT.
4. Hak akses ditulis berdasarkan role yang aktif di frontend dan utility permission aplikasi.
5. Fitur yang belum terimplementasi jangan ditulis sebagai hasil sistem. Jika ingin disebut, tempatkan sebagai saran pengembangan.
6. Bagian peta perlu menekankan integrasi data tekstual dan spasial, bukan sekadar visualisasi marker.
7. Bagian sewa harus dibatasi sebagai kewenangan BPKA/BPKAD.
8. BAB 5 perlu menyertakan catatan bahwa pusat data menjadi area integrasi/rujukan data aset BPKA/BPKAD dan dapat dibaca oleh role internal.
9. EKASMAT dapat dimasukkan sebagai use case tambahan jika skripsi ingin membahas evaluasi/pengukuran layanan; jika tidak, cukup disebut sebagai fitur pendukung.

## 5. Rancangan Struktur BAB 5 Yang Disarankan

### 5.1 Pendahuluan

Isi:

1. Menjelaskan bahwa BAB 5 membahas pemodelan dan rancangan sistem SIMASET setelah aplikasi dikembangkan.
2. Menyebut ruang lingkup: proses bisnis, kebutuhan sistem, use case, activity, class, sequence, struktur tabel, dan interface.
3. Menegaskan bahwa pemodelan disusun berdasarkan aplikasi SIMASET saat ini.

Output:

- Narasi pembuka 3-5 paragraf dengan gaya akademik.

### 5.2 Model Proses Bisnis

Isi:

1. Kondisi sebelum sistem: pengelolaan data aset masih tersebar, pencocokan BPN dan BPKA/BPKAD belum terpusat, verifikasi spasial memerlukan proses manual, dan riwayat aktivitas sulit ditelusuri.
2. Kondisi setelah sistem: data aset, pusat data, peta, sewa, notifikasi, riwayat, dan backup tersedia dalam platform terpadu.
3. Analisis perbaikan proses bisnis dalam bentuk tabel.

Diagram yang disiapkan:

- Gambar 5.1 Proses bisnis sebelum SIMASET.
- Gambar 5.2 Proses bisnis setelah SIMASET.
- Gambar 5.3 BPMN proses pengelolaan aset.
- Gambar 5.4 BPMN proses penyewaan aset.

### 5.3 Pendefinisian Kebutuhan Sistem

Isi:

1. Stakeholder analysis.
2. Functional requirement.
3. Non-functional requirement.

Functional requirement yang perlu ditulis:

| No | Kebutuhan Fungsional | Modul Terkait |
| -- | -------------------- | ------------- |
| 1 | Sistem menyediakan login, logout, MFA, profil, dan pengelolaan sesi | Autentikasi |
| 2 | Sistem mengelola data aset tanah | Kelola Aset |
| 3 | Sistem mengelola data legal, fisik, administratif, dan spasial | Substansi Aset |
| 4 | Sistem mengelola pusat data aset BPKA/BPKAD | Pusat Data |
| 5 | Sistem menampilkan peta interaktif dan layer spasial | Peta |
| 6 | Sistem mengelola penyewaan dan pengembalian aset | Sewa Aset |
| 7 | Sistem menerima dan memproses permintaan sewa | Permintaan Sewa |
| 8 | Sistem mencatat riwayat aktivitas | Riwayat |
| 9 | Sistem menyediakan notifikasi | Notifikasi |
| 10 | Sistem menyediakan backup dan restore data | Backup |
| 11 | Sistem mengelola akun pengguna | User Management |
| 12 | Sistem menyimpan respons EKASMAT | EKASMAT |

Non-functional requirement yang perlu ditulis:

- Keamanan: JWT, bcrypt, MFA, RBAC, HTTPS/TLS.
- Kinerja: respons API dan peta interaktif dalam batas waktu wajar.
- Keandalan: backup, error handling, audit trail.
- Usability: antarmuka berbasis role, filter, pencarian, responsif.
- Maintainability: arsitektur frontend-backend modular.
- Compatibility: browser modern dan perangkat desktop/mobile.

### 5.4 Functional Model / Use Case Modeling

Isi:

1. Definisi singkat use case dan simbol UML.
2. Diagram use case SIMASET.
3. Penjelasan aktor.
4. Deskripsi use case utama.
5. Matriks hak akses per aktor.

Aktor yang digunakan:

- Admin BPKA/BPKAD.
- Admin BPN.
- Petugas BPKA/BPKAD.
- Petugas BPN.
- Masyarakat/Pengunjung.

Use case utama yang disarankan:

| ID | Use Case | Aktor Utama |
| -- | -------- | ----------- |
| UC-01 | Login ke Sistem | Admin BPKA, Admin BPN, BPKA, BPN |
| UC-02 | Mengelola Profil dan Keamanan Akun | Semua user internal |
| UC-03 | Mengelola Data Aset | Admin BPKA, Admin BPN, BPKA, BPN sesuai hak akses |
| UC-04 | Mengelola Data Legal | Admin BPN, BPN |
| UC-05 | Mengelola Data Fisik | Admin BPN, BPN |
| UC-06 | Mengelola Data Administratif | Admin BPN, BPN |
| UC-07 | Mengelola Data Spasial | Admin BPN, BPN |
| UC-08 | Mengelola Pusat Data | Admin BPKA, BPKA |
| UC-09 | Melihat Peta Interaktif | Semua user internal dan publik terbatas |
| UC-10 | Mengelola Sewa Aset | Admin BPKA, BPKA |
| UC-11 | Mengelola Permintaan Sewa | Admin BPKA, BPKA, Masyarakat |
| UC-12 | Mengelola Pengembalian Aset | Admin BPKA, BPKA |
| UC-13 | Melihat dan Mengelola Notifikasi | Semua user internal |
| UC-14 | Melihat Riwayat Aktivitas | Admin BPKA, Admin BPN |
| UC-15 | Mengelola Backup Data | Admin BPKA, Admin BPN |
| UC-16 | Mengelola Data Pengguna | Admin BPKA, Admin BPN |
| UC-17 | Mengisi EKASMAT | Masyarakat/Pengunjung |

Catatan:

- Jika BAB 5 ingin lebih ringkas, UC-04 sampai UC-07 dapat digabung menjadi `Mengelola Data Substansi Aset`.
- EKASMAT dapat dijadikan use case opsional sesuai fokus skripsi.

### 5.5 Activity Diagram

Activity diagram yang perlu dibuat:

| No | Activity Diagram | Alasan |
| -- | ---------------- | ------ |
| 1 | Login dan MFA | Menjelaskan proses masuk sistem dan keamanan |
| 2 | Kelola Data Aset | Menjelaskan CRUD aset dan validasi |
| 3 | Kelola Data Substansi BPN | Menjelaskan pembaruan legal/fisik/administratif/spasial |
| 4 | Kelola Pusat Data BPKA/BPKAD | Menjelaskan pengelolaan data pusat |
| 5 | Lihat Peta Interaktif | Menjelaskan filter, layer, marker, dan detail aset |
| 6 | Pengajuan Permintaan Sewa oleh Masyarakat | Menjelaskan alur publik ke sistem |
| 7 | Pemrosesan Sewa oleh BPKA/BPKAD | Menjelaskan penyewaan, status, dan pengembalian |
| 8 | Backup dan Restore Data | Menjelaskan proses admin menjaga ketersediaan data |

### 5.6 Class Diagram

Class diagram disusun dari model utama berikut:

- User.
- Aset.
- PusatData.
- SewaAset.
- PermintaanSewa.
- Riwayat.
- Notifikasi.
- EkasmatResponse.

Relasi utama:

- User membuat banyak Aset.
- User memiliki banyak Riwayat.
- User menerima banyak Notifikasi.
- User membuat banyak PusatData.
- Aset memiliki banyak SewaAset.
- SewaAset memiliki banyak PermintaanSewa.

### 5.7 Struktur Tabel Database

Tabel yang perlu dijelaskan:

1. `users`.
2. `aset`.
3. `pusat_data`.
4. `sewa_aset`.
5. `permintaan_sewa`.
6. `riwayat`.
7. `notifikasi`.
8. `ekasmat_responses`.

Strategi penulisan:

- Tidak semua field harus dijelaskan terlalu panjang jika tabel sangat besar.
- Untuk tabel `aset`, kelompokkan field berdasarkan data umum, legal, fisik, administratif, spasial, dan audit.
- Gunakan format: field, tipe data, constraint, keterangan.

### 5.8 Sequence Diagram

Sequence diagram yang disarankan:

| No | Sequence Diagram | Komponen Yang Terlibat |
| -- | ---------------- | ---------------------- |
| 1 | Login | User, Login Page, Auth API, User Model, JWT/MFA |
| 2 | Kelola Data Aset | User, Asset Page, Aset API, Aset Model, Riwayat |
| 3 | Peta Interaktif | User, Map Page, Peta API, Aset Model |
| 4 | Permintaan Sewa Publik | Masyarakat, Landing Page, Permintaan API, PermintaanSewa Model, Notifikasi |
| 5 | Pengelolaan Sewa | BPKA, Penyewaan Page, Sewa API, SewaAset Model |
| 6 | Backup Data | Admin, Backup Page, Backup API, Database/Storage |

### 5.9 Perancangan Interface

Halaman yang perlu didokumentasikan:

1. Login.
2. Dashboard.
3. Kelola Aset.
4. Data Legal.
5. Data Fisik.
6. Data Administratif.
7. Data Spasial.
8. Pusat Data.
9. Peta Interaktif.
10. Penyewaan.
11. Permintaan Sewa.
12. Landing Page Sewa Tersedia.
13. Notifikasi.
14. Riwayat.
15. Backup.
16. Profil.
17. Pengaturan/User Management.
18. EKASMAT jika dimasukkan dalam ruang lingkup.

Strategi penulisan:

- Gunakan screenshot aplikasi aktual, bukan wireframe lama, karena aplikasi sudah jadi.
- Setiap gambar diberi nomor, judul, dan penjelasan singkat 1 paragraf.
- Penjelasan interface diarahkan pada fungsi halaman, bukan deskripsi warna/tampilan semata.

## 6. Matriks Akses Yang Disarankan Untuk BAB 5

| Fitur | Admin BPKA | Admin BPN | BPKA | BPN | Masyarakat |
| ----- | ---------- | --------- | ---- | --- | ---------- |
| Login | Ya | Ya | Ya | Ya | Tidak wajib |
| Dashboard | Ya | Ya | Ya | Ya | Tidak |
| Kelola Aset | Ya | Ya | Ya | Update terbatas | Tidak |
| Data Legal/Fisik/Administratif/Spasial | Tidak utama | Ya | Tidak utama | Ya | Tidak |
| Pusat Data | CRUD | Lihat | CRUD | Lihat | Tidak |
| Peta | Ya | Ya | Ya | Ya | Terbatas |
| Sewa Aset | Ya | Tidak | Ya | Tidak | Lihat aset tersedia |
| Permintaan Sewa | Proses | Tidak | Proses | Tidak | Ajukan |
| Riwayat | Ya | Ya | Tidak | Tidak | Tidak |
| Notifikasi | Ya | Ya | Ya | Ya | Terbatas jika diperlukan |
| Backup | Ya | Ya | Tidak | Tidak | Tidak |
| User Management | Ya | Ya | Tidak | Tidak | Tidak |
| Pengaturan | Ya | Ya | Tidak | Tidak | Tidak |
| Profil | Ya | Ya | Ya | Ya | Tidak |
| EKASMAT | Lihat data jika diperlukan | Lihat data jika diperlukan | Opsional | Opsional | Isi kuesioner |

## 7. Catatan Konsistensi Sebelum Penulisan

Ada beberapa hal yang perlu diputuskan sebelum draft final:

1. Istilah instansi: pilih salah satu bentuk utama, `BPKA` atau `BPKAD`, lalu konsisten. Jika institusi resmi skripsi memakai BPKAD, tulis `BPKAD` pada naskah dan beri catatan bahwa kode menggunakan role `bpka`.
2. Role publik: masyarakat pada implementasi tidak memiliki role login internal. Tulis sebagai aktor eksternal/publik.
3. Dinas Tata Ruang: jangan dijadikan aktor utama kecuali memang akan ditambahkan ke aplikasi.
4. Sewa aset: naskah akademik sebaiknya mengikuti hak akses frontend, yaitu hanya BPKA/BPKAD. Terdapat route backend yang masih menggunakan permission aset untuk beberapa endpoint sewa, sehingga perlu diselaraskan bila nanti aplikasi difinalisasi.
5. Riwayat: frontend hanya menampilkan menu riwayat untuk admin. Naskah sebaiknya mengikuti perilaku frontend agar sesuai dengan pengalaman pengguna.
6. Penilaian aset: jangan dimasukkan sebagai modul aktif jika menu tersebut sudah dihapus dari alur aplikasi.
7. Google Maps: proposal revisi menyebut rencana mengganti framework peta ke Google Maps, tetapi implementasi saat ini menggunakan Leaflet/React-Leaflet dan MapLibre. Tuliskan teknologi yang digunakan saat ini.

## 8. Urutan Kerja Penyusunan Draft

1. Membuat daftar final aktor, use case, dan hak akses.
2. Menyusun ulang narasi proses bisnis sebelum/sesudah SIMASET.
3. Menulis kebutuhan fungsional dan non-fungsional berdasarkan modul aktual.
4. Membuat use case diagram baru.
5. Menulis tabel deskripsi use case dan skenario utama.
6. Membuat activity diagram untuk proses prioritas.
7. Membuat class diagram berdasarkan model Sequelize.
8. Menyusun struktur tabel database dari model aktual.
9. Membuat sequence diagram untuk alur utama.
10. Mengambil screenshot aplikasi aktual untuk bagian interface.
11. Merapikan bahasa akademik, nomor tabel/gambar, sitasi, dan daftar pustaka.
12. Melakukan validasi akhir dengan mencocokkan naskah terhadap route, model, menu, dan permission aplikasi.

## 9. Output Akhir Yang Diharapkan

Output BAB 5 final sebaiknya terdiri dari:

1. Naskah BAB 5 lengkap dalam format akademik.
2. Diagram proses bisnis/BPMN.
3. Use case diagram SIMASET terbaru.
4. Activity diagram proses utama.
5. Class diagram berdasarkan model aktual.
6. Sequence diagram proses utama.
7. Struktur tabel database.
8. Screenshot interface aktual.
9. Matriks hak akses aktor.
10. Daftar pustaka teori UML dan rekayasa perangkat lunak.

## 10. Checklist Finalisasi Nanti

Checklist ini digunakan setelah plan disetujui dan draft BAB 5 mulai ditulis:

- [ ] Pendahuluan menjelaskan tujuan BAB 5 dan hubungan dengan implementasi SIMASET.
- [ ] Semua aktor sistem sudah sesuai dengan role aplikasi saat ini.
- [ ] Semua use case utama sesuai dengan fitur yang benar-benar tersedia.
- [ ] Hak akses BPN dan BPKA/BPKAD dibedakan secara jelas.
- [ ] Narasi tidak menyebut fitur yang belum tersedia sebagai fitur aktif.
- [ ] Use case diagram, activity diagram, class diagram, dan sequence diagram tersedia.
- [ ] Struktur tabel database mengacu pada model aktual aplikasi.
- [ ] Screenshot interface menggunakan tampilan aplikasi aktual, bukan wireframe lama.
- [ ] Nomor subbab, tabel, dan gambar konsisten.
- [ ] Istilah SIMASET, BPN, BPKA/BPKAD, aset, sewa, peta, pusat data, dan EKASMAT konsisten.
- [ ] Bahasa menggunakan gaya akademik dan siap digabungkan ke dokumen skripsi utama.

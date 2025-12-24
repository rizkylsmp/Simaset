# SINKRONA - Sistem Informasi Manajemen Aset Tanah Terintegrasi

![Status](https://img.shields.io/badge/Status-Development-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Stack Teknologi](#stack-teknologi)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Panduan Development](#panduan-development)
- [Struktur Project](#struktur-project)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Gambaran Umum

**SINKRONA** adalah Sistem Informasi Manajemen Aset Tanah yang dirancang untuk mengintegrasikan pengelolaan aset tanah di berbagai instansi pemerintah (Dinas Aset Pemkot, BPN, Dinas Tata Ruang) menjadi satu platform terpadu.

### **Tujuan Sistem:**

- ✅ Menghilangkan proses manual yang lambat dan tidak efisien
- ✅ Mengintegrasikan data aset dari berbagai instansi ke dalam satu database terpusat
- ✅ Menyediakan visualisasi geografis (GIS) yang interaktif dan real-time
- ✅ Meningkatkan transparansi dan akuntabilitas dalam pengelolaan aset
- ✅ Memberikan akses informasi aset kepada masyarakat umum secara publik
- ✅ Mengurangi biaya operasional (paperless)
- ✅ Meningkatkan keamanan data dengan enkripsi dan backup otomatis

---

## ✨ Fitur Utama

### **1. Autentikasi & Otorisasi**

- Login dengan username & password
- Multi-Factor Authentication (MFA)
- Role-based access control (RBAC) dengan 5 role:
  - **Admin**: Penuh akses, backup/restore, manage user
  - **Dinas Aset Pemkot**: Input dan kelola data aset
  - **BPN**: Verifikasi data pertanahan
  - **Dinas Tata Ruang**: Verifikasi kesesuaian tata ruang
  - **Masyarakat**: Akses publik ke layer umum peta

### **2. Manajemen Data Aset**

- CRUD (Create, Read, Update, Delete) data aset
- Upload dokumen pendukung digital
- Upload foto aset
- Pencarian & filtering data aset
- Export data (PDF, Excel)
- Validasi otomatis input

### **3. Peta Interaktif GIS**

- Visualisasi aset dengan marker geografis
- Multiple layer:
  - Layer Rencana Tata Ruang Aset
  - Layer Potensi Aset Berperkara
  - Layer Sebaran Perkara
  - Layer Umum (publik)
- Zoom, pan, fullscreen controls
- Pencarian aset berdasarkan lokasi
- Overlay otomatis antar layer
- Detail aset saat klik marker

### **4. Riwayat Aktivitas & Audit Trail**

- Pencatatan otomatis setiap aktivitas user
- Filter berdasarkan tanggal, user, jenis aktivitas
- Export riwayat ke PDF/Excel
- Tampilkan IP address & user agent
- Minimal 1 tahun data tersimpan

### **5. Notifikasi Sistem**

- Notifikasi login
- Notifikasi perubahan data aset
- Notifikasi perubahan status
- Push notification & in-app notification
- Tandai sebagai dibaca
- Filter notifikasi (semua, belum dibaca, sudah dibaca)

### **6. Backup & Restore**

- Backup database otomatis harian
- Jadwal backup yang dapat dikustomisasi
- Restore dari file backup
- Enkripsi file backup
- Riwayat backup dengan ukuran file
- Download backup manual

### **7. Dashboard & Reporting**

- Statistik real-time (total aset, aset aktif, aset berperkara, user aktif)
- Grafik visualisasi (line chart, pie chart)
- Tabel aktivitas terbaru
- Quick actions untuk akses cepat

---

## 🛠 Stack Teknologi

### **Frontend**

- Framework: React 18 dengan Vite
- Styling: Tailwind CSS v4. 1
- State Management: Zustand
- HTTP Client: Axios
- Routing: React Router v6
- Maps: Leaflet. js + React Leaflet
- Charts: Recharts
- UI Notifications: React Hot Toast
- Icons: React Icons

### **Backend**

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Sequelize
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcryptjs
- File Upload: Multer
- Image Processing: Sharp
- Environment: dotenv
- CORS: cors middleware

### **Database**

- PostgreSQL 12+
- Connection Pool: Sequelize built-in

### **Infrastructure**

- Development: Nodemon, Vite
- Version Control: Git
- Package Manager: npm

---

## 🏗 Arsitektur Sistem

### **Architecture Diagram**

┌─────────────────────────────────────────────────────────────┐ │ CLIENT (React Vite) │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Pages (Login, Dashboard, Aset, Peta, Riwayat, dll) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Components (Header, Sidebar, Table, Map, Form) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Services (API calls), Stores (Zustand), Hooks │ │ │ └──────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────┘ ↕ (Axios HTTP) ↕ ┌─────────────────────────────────────────────────────────────┐ │ SERVER (Express.js) │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ API Routes (Auth, Aset, Peta, Notifikasi, Backup) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Controllers (Business Logic) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Middleware (Auth, Validation, Error Handling) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Services (Business Logic, File Upload, Email) │ │ │ └──────────────────────────────────────────────────────┘ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Models (Sequelize ORM) │ │ │ └──────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────┘ ↕ (SQL Queries) ↕ ┌─────────────────────────────────────────────────────────────┐ │ DATABASE (PostgreSQL) │ │ ┌──────────────────────────────────────────────────────┐ │ │ │ Tables: users, aset, notifikasi, riwayat_aktivitas │ │ │ │ peta_interaktif, backup │ │ │ └──────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────┘

### **Data Flow**

User Input (Frontend) ↓ Axios API Call + JWT Token ↓ Express Routes (Routing) ↓ Auth Middleware (Verify Token & Role) ↓ Controller (Handle Request) ↓ Service Layer (Business Logic) ↓ Sequelize Model (ORM) ↓ PostgreSQL Query ↓ Database Operation ↓ Response JSON (Backend) ↓ Zustand Store / Component State (Frontend) ↓ UI Re-render ↓ User sees updated data

---

## 🚀 Instalasi & Setup

### **Prasyarat**

- Node.js v16+ dan npm v8+
- PostgreSQL 12+
- Git
- VS Code (recommended)
- GitHub Copilot (recommended)

### **1. Clone Repository**

```bash
git clone <repository-url>
cd sinkrona-aset-tanah
git init
```

### **2. Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env dengan kredensial database Anda
# DATABASE_URL=postgresql://postgres:password@localhost:5432/sinkrona_aset_tanah

# Run migrations (jika menggunakan Sequelize CLI)
npm run db:migrate

# Run seeders (optional, untuk data dummy)
npm run db:seed

# Start development server
npm run dev
# Server akan berjalan di http://localhost:5000
```

### **3. Setup Frontend**

```bash

cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
# App akan berjalan di http://localhost:5173

```

### **4. Setup Database (PostgreSQL)**

# Buka PostgreSQL client

psql -U postgres

# Jalankan script database

\i path/to/database-schema.sql

# Atau manual create database

CREATE DATABASE sinkrona_aset_tanah;
\c sinkrona_aset_tanah

# Copy paste isi dari backend/src/database/schema.sql

## 🗄 Database Schema

# Tabel users

- id_user (PK, auto-increment)
- username (unique, required)
- password (hashed)
- role (enum: Admin, DinasAsetPemkot, BPN, DinasTataRuang, Masyarakat)
- email (unique, required)
- no_telepon (optional)
- nip (unique, optional - untuk pegawai)
- nik (optional - untuk masyarakat)
- nama_lengkap (required)
- jabatan (optional)
- instansi (optional)
- alamat (optional)
- status_aktif (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)

# Tabel aset

- id_aset (PK, auto-increment)
- kode_aset (unique, required)
- nama_aset (required)
- lokasi (required)
- koordinat_lat (decimal 10,8)
- koordinat_long (decimal 11,8)
- luas (decimal 15,2)
- status (enum: Aktif, Berperkara, Dijual, Tidak Aktif)
- jenis_aset (varchar)
- nilai_aset (decimal 20,2)
- tahun_perolehan (integer)
- nomor_sertifikat (varchar)
- status_sertifikat (varchar)
- foto_aset (varchar - path to file)
- dokumen_pendukung (JSONB array)
- keterangan (text)
- created_by (FK to users)
- created_at, updated_at (timestamp)

# Tabel notifikasi

- id_notifikasi (PK, auto-increment)
- id_user (FK to users)
- judul (varchar 150)
- pesan (text)
- jenis (enum: Login, Update Data, Perubahan Status, System)
- status_baca (boolean, default: false)
- waktu (timestamp)

# Tabel riwayat_aktivitas

- id_aktivitas (PK, auto-increment)
- id_user (FK to users)
- jenis_aktivitas (enum: Login, Logout, Create, Update, Delete, View, Export)
- deskripsi (text)
- target_data (varchar)
- ip_address (varchar 45)
- user_agent (varchar 255)
- waktu (timestamp)

# Tabel peta_interaktif

- id_peta (PK, auto-increment)
- nama_layer (varchar 100)
- tipe_layer (enum: Rencana Tata Ruang, Potensi Berperkara, Sebaran Perkara, Umum)
- akses_role (JSONB array)
- file_geojson (text)
- warna_layer (varchar 20)
- status_aktif (boolean, default: true)
- created_at, updated_at (timestamp)

# Tabel backup

- id_backup (PK, auto-increment)
- nama_file (varchar 255)
- ukuran_file (bigint)
- path_file (varchar 255)
- status (enum: Success, Failed, In Progress)
- dilakukan_oleh (FK to users)
- waktu_backup (timestamp)
- keterangan (text)

### 📡 API Documentation

# Base URL

http://localhost:5000/api

## Authentication Endpoints

# POST /auth/login

Request:
{
"username": "admin",
"password": "password123"
}

Response:
{
"message": "Login successful",
"token": "eyJhbGciOiJIUzI1NiIs.. .",
"user": {
"id_user": 1,
"username": "admin",
"nama_lengkap": "Administrator",
"role": "Admin",
"email": "admin@sinkrona.com"
}
}

# POST /auth/register

Request:
{
"username": "newuser",
"password": "password123",
"email": "user@email.com",
"nama_lengkap": "New User",
"role": "Masyarakat"
}

Response:
{
"message": "User created successfully",
"user": { ... }
}

## Asset Endpoints

# GET /aset (Get all assets)

Query Parameters:

- page: number (default: 1)
- limit: number (default: 10)
- status: string (filter by status)
- search: string (search by name/code)

Headers:

- Authorization: Bearer <token>

Response:
{
"data": [... ],
"total": 100,
"page": 1,
"limit": 10
}

# POST /aset (Create asset)

Headers:

- Authorization: Bearer <token>
- Content-Type: application/json

Body:
{
"kode_aset": "AST-001",
"nama_aset": "Tanah Jl. Malioboro",
"lokasi": "Jl. Malioboro No. 12, Yogyakarta",
"koordinat_lat": -7.797068,
"koordinat_long": 110.370529,
"luas": 500.00,
"status": "Aktif",
"jenis_aset": "Tanah Kosong",
"nilai_aset": 5000000000,
"tahun_perolehan": 2020,
"nomor_sertifikat": "SHM-001/2020",
"status_sertifikat": "SHM"
}

# GET /aset/: id (Get single asset)

GET /aset/1

Headers:

- Authorization: Bearer <token>

Response:
{
"id_aset": 1,
"kode_aset": "AST-001",
"nama_aset": "Tanah Jl. Malioboro",
...
"riwayat": [... ],
"dokumen": [...]
}

# PUT /aset/:id (Update asset)

PUT /aset/1

Headers:

- Authorization: Bearer <token>

Body:
{
"nama_aset": "Tanah Jl. Malioboro (Updated)",
"status": "Berperkara",
...
}

# DELETE /aset/:id (Delete asset)

DELETE /aset/1

Headers:

- Authorization: Bearer <token>

Response:
{
"message": "Asset deleted successfully"
}

## Map Endpoints

# GET /peta/layers (Get all map layers)

Response:
{
"layers": [
{
"id_peta": 1,
"nama_layer": "Rencana Tata Ruang Aset",
"tipe_layer": "Rencana Tata Ruang",
"akses_role": ["Admin", "DinasAsetPemkot", "DinasTataRuang"],
"status_aktif": true
},
...
]
}

# GET /peta/markers (Get asset markers for map)

Query Parameters:

- layer: string (filter by layer type)
- bbox: string (bounding box for map view)

Response:
{
"markers": [
{
"id_aset": 1,
"kode_aset": "AST-001",
"nama_aset": "Tanah Jl. Malioboro",
"lat": -7.797068,
"lng": 110.370529,
"status": "Aktif",
"icon_color": "#4CAF50"
},
...
]
}

# History Endpoints

# GET /riwayat (Get activity history)

Query Parameters:

- page: number
- limit: number
- startDate: date (filter by date range)
- endDate: date
- userId: number (admin only)
- jenis_aktivitas: string

Response:
{
"data": [
{
"id_aktivitas": 1,
"user": "dinas_aset01",
"jenis_aktivitas": "Create",
"deskripsi": "Menambahkan data aset AST-001",
"waktu": "2025-01-15T10:30:00Z",
"ip_address": "192.168.1.100"
},
...
],
"total": 1234,
"page": 1
}

## Notification Endpoints

# GET /notifikasi (Get notifications)

Response:
{
"notifikasi": [
{
"id_notifikasi": 1,
"judul": "Login Berhasil",
"pesan": "Anda login pada 15 Jan 2025, 10:30 WIB",
"jenis": "Login",
"status_baca": false,
"waktu": "2025-01-15T10:30:00Z"
},
...
]
}

# PUT /notifikasi/:id/read (Mark as read)

PUT /notifikasi/1/read

Response:
{
"message": "Notification marked as read"
}

# Backup Endpoints

# POST /backup (Create backup)

Headers:

- Authorization: Bearer <token> (Admin only)

Response:
{
"message": "Backup started",
"backup_id": "backup_20250115_103000"
}

# GET /backup/history (Get backup history)

Response:
{
"backups": [
{
"id_backup": 1,
"nama_file": "backup_20250115_103000.sql",
"ukuran_file": 156800000,
"status": "Success",
"waktu_backup": "2025-01-15T10:30:00Z",
"dilakukan_oleh": "admin01"
},
...
]
}

# POST /backup/restore (Restore from backup)

Headers:

- Authorization: Bearer <token> (Admin only)

Body:
{
"id_backup": 1
}

Response:
{
"message": "Restore process started"
}

## 🎨 Frontend Architecture

# Folder Structure

frontend/
├── public/
│ └── vite.svg
├── src/
│ ├── assets/
│ │ ├── images/
│ │ ├── icons/
│ │ └── fonts/
│ ├── components/
│ │ ├── Layout/
│ │ │ ├── Navbar.jsx
│ │ │ ├── Sidebar.jsx
│ │ │ └── Footer.jsx
│ │ ├── Common/
│ │ │ ├── Button.jsx
│ │ │ ├── Input.jsx
│ │ │ ├── Modal.jsx
│ │ │ ├── Card.jsx
│ │ │ └── Table.jsx
│ │ ├── Forms/
│ │ │ ├── AsetForm.jsx
│ │ │ └── FilterForm.jsx
│ │ ├── Maps/
│ │ │ ├── MapViewer.jsx
│ │ │ ├── LayerControl.jsx
│ │ │ └── MarkerPopup.jsx
│ │ ├── Charts/
│ │ │ ├── LineChart.jsx
│ │ │ ├── PieChart.jsx
│ │ │ └── BarChart.jsx
│ │ └── ProtectedRoute.jsx
│ ├── pages/
│ │ ├── LoginPage.jsx
│ │ ├── DashboardPage.jsx
│ │ ├── AsetPage.jsx
│ │ ├── DetailAsetPage.jsx
│ │ ├── PetaPage.jsx
│ │ ├── RiwayatPage.jsx
│ │ ├── NotifikasiPage.jsx
│ │ └── ProfilPage.jsx
│ ├── services/
│ │ ├── api.js
│ │ ├── authService.js
│ │ ├── asetService.js
│ │ ├── petaService.js
│ │ ├── notifikasiService.js
│ │ ├── riwayatService.js
│ │ └── backupService.js
│ ├── stores/
│ │ ├── authStore.js
│ │ ├── asetStore.js
│ │ └── uiStore.js
│ ├── hooks/
│ │ ├── useAuth.js
│ │ ├── useAset.js
│ │ ├── usePeta.js
│ │ └── useAsync.js
│ ├── utils/
│ │ ├── constants.js
│ │ ├── formatters.js
│ │ ├── validators.js
│ │ └── helpers.js
│ ├── layouts/
│ │ ├── AuthLayout.jsx
│ │ ├── DashboardLayout.jsx
│ │ └── PublicLayout.jsx
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── . env
├── .env.example
├── . gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js

# State Management dengan Zustand

// authStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
user: JSON.parse(localStorage.getItem('user')) || null,
token: localStorage.getItem('token') || null,

setUser: (user) => { ... },
setToken: (token) => { ... },
logout: () => { ... },
isAuthenticated: () => { ... },
}))

// Usage di component:
const { user, token, logout } = useAuthStore()

## 💻 Panduan Development

# Development Workflow

1. Buat branch baru

git checkout -b feature/nama-fitur

2. Develop fitur

- Backend: buat route, controller, service, model
- Frontend: buat page, components, services
- Selalu follow struktur folder yang ada

3. Testing

# Test API dengan Postman atau curl

# Test Frontend dengan browser dev tools

4. Commit & Push

git add .
git commit -m "feat: deskripsi fitur"
git push origin feature/nama-fitur

5. Create Pull Request

- Jelaskan perubahan
- Link ke issue jika ada
- Wait for review

## Naming Conventions

# Backend:

- Routes: /api/resource (lowercase, plural)
- Controllers: ResourceController. js
- Models: Resource.js (uppercase)
- Services: resourceService.js
- Methods: getAll(), getById(), create(), update(), delete()

# Frontend:

- Components: ComponentName.jsx (PascalCase)
- Pages: PageNamePage.jsx
- Stores: storeNameStore.js
- Services: serviceName.js
- Hooks: useHookName.js

## Code Style

# Backend (JavaScript):

// Use const/let, not var
const express = require('express')

// Use async/await
const getAset = async (req, res) => {
try {
const aset = await Aset.findAll()
res.json(aset)
} catch (error) {
res.status(500).json({ error: error.message })
}
}

# Frontend (React):

// Use functional components & hooks
import { useState, useEffect } from 'react'

export default function ComponentName() {
const [state, setState] = useState(null)

useEffect(() => {
// Side effects
}, [])

return (
<div className="... ">
{/_ JSX _/}
</div>
)
}

### 📁 Struktur Project

sinkrona-aset-tanah/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ │ └── database.js
│ │ ├── controllers/
│ │ │ ├── authController.js
│ │ │ ├── asetController.js
│ │ │ ├── petaController. js
│ │ │ ├── notifikasiController.js
│ │ │ ├── riwayatController.js
│ │ │ └── backupController. js
│ │ ├── models/
│ │ │ ├── User.js
│ │ │ ├── Aset.js
│ │ │ ├── Notifikasi.js
│ │ │ ├── RiwayatAktivitas.js
│ │ │ ├── PetaInteraktif.js
│ │ │ └── Backup.js
│ │ ├── routes/
│ │ │ ├── auth.routes.js
│ │ │ ├── aset.routes.js
│ │ │ ├── peta.routes.js
│ │ │ ├── notifikasi.routes.js
│ │ │ ├── riwayat.routes.js
│ │ │ └── backup.routes.js
│ │ ├── middleware/
│ │ │ ├── auth.middleware.js
│ │ │ ├── validation.middleware.js
│ │ │ └── errorHandler.middleware.js
│ │ ├── services/
│ │ │ ├── authService.js
│ │ │ ├── asetService. js
│ │ │ ├── petaService.js
│ │ │ ├── notifikasiService. js
│ │ │ ├── uploadService.js
│ │ │ └── backupService. js
│ │ ├── utils/
│ │ │ ├── constants.js
│ │ │ ├── validators.js
│ │ │ └── helpers.js
│ │ ├── database/
│ │ │ ├── migrations/
│ │ │ ├── seeders/
│ │ │ └── schema.sql
│ │ └── server.js
│ ├── uploads/ (gitignored)
│ ├── .env
│ ├── . env.example
│ ├── .gitignore
│ ├── package.json
│ └── README.md
├── frontend/
│ ├── src/ (struktur ada di atas)
│ ├── public/
│ ├── . env
│ ├── . env.example
│ ├── . gitignore
│ ├── package.json
│ ├── vite.config.js
│ ├── tailwind.config.js
│ └── README.md
├── docs/
│ ├── API_DOCUMENTATION.md
│ ├── DATABASE_SCHEMA.md
│ ├── DEPLOYMENT. md
│ └── USER_MANUAL.md
├── . gitignore
├── README.md (this file)
└── LICENSE

### 🔧 Troubleshooting

Backend Issues
Error: Database connection refused

Code
Solusi:

1. Pastikan PostgreSQL running: pg_isready
2. Check . env DATABASE_URL
3. Create database: createdb sinkrona_aset_tanah
4. Run migrations: npm run db:migrate
   Error: Port 5000 already in use

Code
Solusi:

# Linux/Mac

lsof -i :5000
kill -9 <PID>

# Windows

netstat -ano | findstr :5000
taskkill /PID <PID> /F
Error: JWT verification failed

Code
Solusi:

1. Check JWT_SECRET di .env
2. Pastikan token format: Bearer <token>
3. Clear localStorage dan re-login
   Frontend Issues
   Error: Cannot find module '@components'

Code
Solusi:

1. Check vite.config.js alias configuration
2. Restart dev server: npm run dev
   Error: Tailwind CSS not working

Code
Solusi:

1. Check tailwind.config.js
2. Verify postcss. config.js
3. Restart dev server
   Error: Map not rendering

Code
Solusi:

1. Check Leaflet CSS import di component
2. Verify API_URL di .env
3. Check browser console untuk CORS errors

### 📚 Useful Commands

Backend

# Development

npm run dev # Start with nodemon
npm start # Production start

# Database

npm run db:migrate # Run migrations
npm run db:seed # Seed database
npm run db:rollback # Rollback migrations

# Testing

npm test # Run tests
npm run test:watch # Watch mode

Frontend

# Development

npm run dev # Start Vite dev server
npm run build # Build for production
npm run preview # Preview production build

# Linting

npm run lint # Run ESLint
npm run format # Format code with Prettier

Git

# Common workflow

git status
git add .
git commit -m "message"
git push origin branch-name

# Branching

git checkout -b feature/name
git merge feature/name
git branch -d feature/name

### 🔐 Security Best Practices

1. Environment Variables: Jangan commit .env file
2. JWT Secret: Ganti dengan string yang strong dan unique di production
3. Password: Selalu hash dengan bcryptjs
4. CORS: Spesifikkan frontend URL, jangan \*
5. Input Validation: Validasi semua input di backend
6. SQL Injection: Gunakan ORM (Sequelize) dengan parameterized queries
7. File Upload: Validate file type & size, scan untuk malware
8. HTTPS: Use HTTPS di production
9. Rate Limiting: Implement untuk prevent brute force attacks
10. Backup: Regular backup database

### 📝 License

MIT License - lihat file LICENSE untuk details

### 👥 Contributors

Tim Development
Product Owner
QA Team

### 📧 Support & Contact

Email: support@sinkrona.com
Issues: GitHub Issues
Documentation: /docs folder

### 🚀 Deployment

Backend Deployment

# Set NODE_ENV=production

# Deploy ke hosting (Heroku, DigitalOcean, AWS, etc)

# Update DATABASE_URL untuk production database

# Set JWT_SECRET yang strong

Frontend Deployment

# Build untuk production

npm run build

# Deploy build folder ke:

# - Vercel

# - Netlify

# - AWS S3 + CloudFront

# - Heroku

Lihat /docs/DEPLOYMENT.md untuk detail lengkap.

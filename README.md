# SIMASET - Sistem Informasi Manajemen Aset Tanah

## 📋 Gambaran Umum

**SIMASET** adalah Sistem Informasi Manajemen Aset Tanah yang mengintegrasikan pengelolaan aset tanah dari berbagai instansi pemerintah (Dinas Aset Pemkot, BPN, Dinas Tata Ruang) menjadi satu platform terpadu.

---

## 🛠️ Tech Stack

| Layer            | Teknologi                         |
| ---------------- | --------------------------------- |
| Frontend         | React 18 + Vite + Tailwind CSS v4 |
| Backend          | Express.js + Node.js              |
| Database         | PostgreSQL                        |
| State Management | Zustand                           |
| Routing          | React Router (HashRouter)         |
| Maps             | Leaflet + React-Leaflet           |
| Authentication   | JWT                               |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/rizkylsmp/Simaset.git
cd Simaset

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Setup Database (PostgreSQL)

```sql
CREATE DATABASE simaset_aset_tanah;
```

### 3. Environment Variables

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/simaset_aset_tanah
JWT_SECRET=your-secret-key
```

### 4. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 👥 Demo Users

| Username | Password | Role  | Hak Akses                                              |
| -------- | -------- | ----- | ------------------------------------------------------ |
| admin    | admin123 | Admin | Full access (CRUD, Backup, User Management)            |
| bpkad    | bpkad123 | BPKAD | Input Aset (CRUD), Sewa Aset, Penilaian Aset          |
| bpn_user | bpn123   | BPN   | Edit Data Legal, Fisik, Administratif, Spasial         |

### 🌐 Akses Publik (Tanpa Login)

Halaman login menampilkan **Peta Interaktif** sebagai background. Pengunjung dapat melihat lokasi aset secara visual sebelum login. Panel login bisa di-minimize untuk menjelajahi peta. Detail aset hanya tersedia setelah login.

---

## 📁 Project Structure

```
Simaset/
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   └── index.js      # Entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── layouts/      # DashboardLayout
│   │   ├── pages/        # Page components
│   │   ├── router/       # HashRouter config
│   │   ├── services/     # API services
│   │   └── stores/       # Zustand stores
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/login`    | User login       |
| POST   | `/api/auth/register` | Register user    |
| GET    | `/api/auth/me`       | Get current user |

### Assets

| Method | Endpoint        | Description     |
| ------ | --------------- | --------------- |
| GET    | `/api/aset`     | Get all assets  |
| GET    | `/api/aset/:id` | Get asset by ID |
| POST   | `/api/aset`     | Create asset    |
| PUT    | `/api/aset/:id` | Update asset    |
| DELETE | `/api/aset/:id` | Delete asset    |

---

## 🌐 Deployment (Vercel)

### Backend

1. Sudah ada `vercel.json` di folder backend
2. Set Environment Variables di Vercel Dashboard
3. Deploy: `cd backend && vercel`

### Frontend

1. Deploy langsung: `cd frontend && vercel`

**Environment variables di Vercel Dashboard** (jangan commit ke repo):

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `NODE_ENV=production`, `DB_SSL=true`

---

## ✨ Features

- ✅ Multi-role Authentication (Admin, Dinas Aset, BPN, Tata Ruang, Masyarakat)
- ✅ CRUD Data Aset dengan validasi
- ✅ Peta Interaktif (Leaflet) dengan multiple layers
- ✅ Dashboard dengan statistik real-time
- ✅ Riwayat Aktivitas & Audit Trail
- ✅ Notifikasi sistem
- ✅ Backup & Restore database
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Modern Monochrome UI

---

## 📄 License

MIT License - Free to use and modify.

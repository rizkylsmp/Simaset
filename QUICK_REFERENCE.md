# 🚀 SINKRONA - Quick Reference Card

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check

```bash
# Node.js version
node --version              # Should be v16+

# PostgreSQL running
psql --version             # Should be installed

# Database exists
psql -l | grep sinkrona_aset_tanah
```

### Step 1: Backend

```bash
cd backend
npm install                # Only first time
node seed.js              # Seed demo users (only first time)
npm run dev               # Start server
```

### Step 2: Frontend (New Terminal)

```bash
cd frontend
npm install                # Only first time
npm run dev               # Start dev server
```

### Step 3: Access

```
Login: http://localhost:5174
Admin: admin / admin123
```

---

## 🔐 Login Credentials Cheat Sheet

```
┌─────────────────┬─────────────┬──────────────────────┐
│ Username        │ Password    │ Role                 │
├─────────────────┼─────────────┼──────────────────────┤
│ admin           │ admin123    │ Admin                │
│ dinas_aset      │ dinas123    │ Dinas Aset Pemkot    │
│ bpn_user        │ bpn123      │ BPN                  │
│ tata_ruang      │ tataruang123│ Dinas Tata Ruang     │
│ masyarakat_user │ public123   │ Masyarakat (Public)  │
└─────────────────┴─────────────┴──────────────────────┘
```

---

## 🛠 Common Commands

### Database

```bash
# Seed demo users
npm run seed

# View database
psql -U postgres -d sinkrona_aset_tanah
SELECT * FROM users;
\q

# Reset database (caution!)
dropdb sinkrona_aset_tanah
createdb sinkrona_aset_tanah
npm run seed
```

### Backend

```bash
# Start dev server
npm run dev

# Start production
npm start

# Run migrations
npm run db:migrate

# Seed data
npm run seed

# Kill if port in use
lsof -i :5000 | grep node | awk '{print $2}' | xargs kill -9
```

### Frontend

```bash
# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

---

## 📍 URLs Quick Access

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:5174            |
| Backend API  | http://localhost:5000/api        |
| Health Check | http://localhost:5000/api/health |
| Login Form   | http://localhost:5174/login      |
| Dashboard    | http://localhost:5174/dashboard  |

---

## 🔑 API Endpoints

### Authentication

```
POST   /api/auth/login      - Login with credentials
GET    /api/auth/me         - Get current user (protected)
POST   /api/auth/logout     - Logout (protected)
POST   /api/auth/register   - Register new user
GET    /api/health          - Health check
```

### Example Login Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🧪 Quick Tests

### Test 1: API Working

```bash
curl http://localhost:5000/api/health
# Should return: {"status":"Server running",...}
```

### Test 2: Login Works

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Should return JWT token
```

### Test 3: Frontend Loads

```
Open: http://localhost:5174
Should see: Login form with demo credentials
```

---

## ⚙️ Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:sadana123@localhost:5432/sinkrona_aset_tanah
FRONTEND_URL=http://localhost:5173 (or :5174)
JWT_SECRET=your_secret_here
JWT_EXPIRE=24h
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SINKRONA Aset Tanah
```

---

## 🐛 Troubleshooting Quick Fix

| Problem                | Solution                            |
| ---------------------- | ----------------------------------- |
| Can't login            | Check DB has users: `node seed.js`  |
| Port 5000 busy         | `kill $(lsof -t -i :5000)`          |
| Port 5173/5174 busy    | `kill $(lsof -t -i :5173)`          |
| DB won't connect       | Check DATABASE_URL in .env          |
| API error 404          | Verify backend is running on :5000  |
| CORS error             | Restart backend, check FRONTEND_URL |
| Token invalid          | Login again (24h expiration)        |
| Can't access dashboard | Must login first, token required    |

---

## 📁 Important Files

| File                                | Purpose           |
| ----------------------------------- | ----------------- |
| `backend/seed.js`                   | Create demo users |
| `backend/.env`                      | Backend config    |
| `frontend/.env`                     | Frontend config   |
| `backend/src/routes/auth.routes.js` | Login endpoints   |
| `frontend/src/pages/LoginPage.jsx`  | Login form        |
| `frontend/src/stores/authStore.js`  | Auth state        |

---

## ✅ Before Starting

Checklist:

- [ ] Node.js installed
- [ ] PostgreSQL running
- [ ] Database created: `sinkrona_aset_tanah`
- [ ] .env files configured
- [ ] `npm install` run in both folders
- [ ] Demo users seeded: `npm run seed`

---

## 🚦 Login Flow

```
User enters credentials in LoginPage.jsx
          ↓
API call to POST /api/auth/login
          ↓
Backend validates username & password
          ↓
If valid: Generate JWT token & return user data
          ↓
Frontend saves token & user in localStorage
          ↓
Zustand store updates
          ↓
Redirect to /dashboard
          ↓
DashboardPage loads with user info
          ↓
All subsequent API calls include JWT token
```

---

## 🔒 Security Notes

- ✅ Passwords hashed with bcrypt
- ✅ JWT token 24-hour expiration
- ✅ CORS protected
- ✅ Token sent via Authorization header
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Never commit .env files

---

## 📞 Files Reference

Need to understand something?

```
Login logic       → frontend/src/pages/LoginPage.jsx
Auth endpoints    → backend/src/routes/auth.routes.js
User model        → backend/src/models/User.js
State management  → frontend/src/stores/authStore.js
API client        → frontend/src/services/api.js
Routes/Navigation → frontend/src/App.jsx
```

---

## 🎯 Success Indicators

When working correctly, you should see:

✅ Backend console:

```
✅ Server running on http://localhost:5000
✅ Database connected
```

✅ Frontend console:

```
VITE ready in XXX ms
➜ Local: http://localhost:5174/
```

✅ Browser:

```
Login page displays with demo credentials
Can login and see dashboard
```

---

**Last Updated:** December 21, 2025
**Version:** 1.0.0
**Status:** ✅ READY

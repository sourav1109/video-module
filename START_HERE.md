# 🚀 Quick Start Guide - Video Call Module

## ⚠️ Important: Database Setup Required

Your project has been migrated to PostgreSQL for better stability with 10,000+ users.

---

## 🎯 Option 1: Quick Start with Docker (Recommended)

### Step 1: Start Docker Desktop
```powershell
# Make sure Docker Desktop is running
# You can start it from Windows Start menu
```

### Step 2: Start PostgreSQL Database
```powershell
# Run PostgreSQL in Docker
docker run --name sgt-lms-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=sgt_lms `
  -p 5432:5432 `
  -d postgres:15-alpine

# Wait 5 seconds for database to start
Start-Sleep -Seconds 5

# Import database schema
docker cp backend/database/schema.sql sgt-lms-postgres:/schema.sql
docker exec sgt-lms-postgres psql -U postgres -d sgt_lms -f /schema.sql
```

### Step 3: Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 4: Run the Application
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 5: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 🎯 Option 2: Install PostgreSQL Locally

### Windows Installation
```powershell
# Download PostgreSQL installer from:
# https://www.postgresql.org/download/windows/

# Or using Chocolatey package manager:
choco install postgresql

# Or using Scoop:
scoop install postgresql
```

### Create Database
```powershell
# After installation, run:
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE sgt_lms;
\q

# Import schema
psql -U postgres -d sgt_lms -f backend/database/schema.sql
```

### Run Application
```powershell
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm start
```

---

## 🎯 Option 3: Temporary MongoDB Fallback

If you want to test quickly without PostgreSQL setup, you can temporarily use MongoDB:

### Step 1: Install MongoDB
```powershell
# Using Docker
docker run --name mongodb -p 27017:27017 -d mongo:6
```

### Step 2: Update Code (Temporary)
Edit `backend/package.json` - change `pg` to `mongoose`:
```json
"dependencies": {
  "mongoose": "^8.0.3"  // Instead of "pg"
}
```

### Step 3: Run
```powershell
cd backend
npm install
npm start
```

**Note:** MongoDB is NOT recommended for 10k+ users. Use PostgreSQL for production.

---

## 📋 Current Status

✅ **Completed:**
- PostgreSQL database schema created
- Connection pool configured (100 connections)
- User authentication repository (PostgreSQL-ready)
- Live class repository (PostgreSQL-ready)
- Auth routes updated for PostgreSQL
- Multi-device proxy configuration ready
- Dependencies installed (`pg` driver)

⏳ **Pending:**
- Database server setup (choose Option 1 or 2 above)
- Schema import to database
- Frontend dependency installation

---

## 🔍 Verify Setup

### Check Database Connection
```powershell
# Backend should show:
# 🐘 Connecting to PostgreSQL database...
# ✅ PostgreSQL database connected
# 📊 Pool size: 0 (max: 100)
```

### Test API
```powershell
# Register a test user
curl -X POST http://localhost:5000/api/video-call/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Teacher",
    "email": "teacher@test.com",
    "password": "password123",
    "role": "teacher"
  }'
```

---

## 🌐 Multi-Device Access

Once running, access from any device on your network:

1. Find your IP: `ipconfig` (look for IPv4 Address)
2. Access from other devices: `http://YOUR_IP:3000`

Example: `http://192.168.1.100:3000`

---

## 🚨 Troubleshooting

### "Cannot connect to database"
**Solution:** Make sure PostgreSQL is running
```powershell
# Check Docker container
docker ps | Select-String postgres

# Or check Windows service
Get-Service postgresql*
```

### "Docker error"
**Solution:** Start Docker Desktop from Windows Start menu

### "Port 5432 already in use"
**Solution:** Another PostgreSQL is running. Stop it or change port in `.env`

### "Module not found"
**Solution:** Install dependencies
```powershell
cd backend
npm install

cd ../frontend
npm install
```

---

## 📚 Documentation

- `POSTGRESQL_MIGRATION_GUIDE.md` - Complete migration details
- `SCALABILITY_GUIDE.md` - Production deployment (10k+ users)
- `PROJECT_COMPLETE.md` - Feature overview
- `QUICK_START.md` - Alternative setup guide

---

## ✨ Features Ready to Test

1. **Teacher Dashboard** - Create and manage live classes
2. **Student Dashboard** - Join classes and view schedule
3. **Authentication** - Login/Register with JWT
4. **Video Calling** - Mediasoup SFU (10k+ users support)
5. **Real-time Chat** - Socket.IO messaging
6. **Whiteboard** - Collaborative drawing
7. **Polls** - Interactive polling
8. **Attendance** - Automatic tracking
9. **Screen Sharing** - Share your screen
10. **Recording** - Record classes

---

## 🎓 Default Login Credentials (After Registration)

You'll need to register users first. Use the Login page:
- **Teacher:** Create account with role "teacher"
- **Student:** Create account with role "student"

Or use the demo buttons in the Login component.

---

**Ready to start! Choose Option 1 (Docker) or Option 2 (Local PostgreSQL) above.** 🚀

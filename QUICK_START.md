# 🚀 Quick Start Guide - SGT-LMS Live Class System

## ⚡ Get Started in 5 Minutes!

### Prerequisites
- Node.js v16+ installed
- MongoDB running (or use MongoDB Atlas)
- Git installed

---

## 📦 Installation

### 1. Clone or Navigate to Project
```powershell
cd c:\Users\hp\Desktop\vcfinal\video-call-module-
```

### 2. Install Backend Dependencies
```powershell
cd backend
npm install
```

**Required packages:**
- express
- socket.io
- mediasoup
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### 3. Install Frontend Dependencies
```powershell
cd ../frontend
npm install
```

**Required packages:**
- react
- react-router-dom
- @mui/material
- socket.io-client
- mediasoup-client
- fabric
- date-fns

---

## ⚙️ Configuration

### Backend Configuration (`.env` file)
The `.env` file is already created in `backend/.env`. Key settings:

```env
# Basic Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (use your MongoDB connection)
MONGODB_URI=mongodb://localhost:27017/videocall

# Redis (optional for development)
USE_REDIS=false

# Mediasoup (already configured)
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=11000
```

**For production (10k+ users):**
- Set `USE_REDIS=true`
- Use MongoDB cluster URI
- Enable HTTPS

---

## 🎬 Running the Application

### Method 1: Manual Start (Development)

#### Terminal 1 - Start Backend:
```powershell
cd backend
npm start
```

✅ Backend should start on `http://localhost:5000`

#### Terminal 2 - Start Frontend:
```powershell
cd frontend
npm start
```

✅ Frontend should open at `http://localhost:3000`

### Method 2: Docker Compose (Recommended)

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This starts:
- Backend (port 5000)
- Frontend (port 3000)
- MongoDB (port 27017)
- Redis (port 6379)

---

## 🧪 Testing the Application

### Step 1: Open Browser
Navigate to: `http://localhost:3000`

You should see the **Login Page**

### Step 2: Demo Login (Quick Test)

#### **Option A: Demo Teacher**
1. Click "Demo Teacher" button
2. Instantly logged in as teacher
3. Redirects to Teacher Dashboard

#### **Option B: Demo Student**
1. Click "Demo Student" button
2. Instantly logged in as student
3. Redirects to Student Dashboard

### Step 3: Test Features

#### **As Teacher:**
1. Click "Schedule New Class" button
2. Fill in class details:
   - Class Name: "Test Live Class"
   - Subject: "Mathematics"
   - Start Time: (select future time)
   - Duration: 60 minutes
   - Max Students: 100
3. Click "Create Class"
4. Click "Start Class" to begin
5. Test features:
   - ✅ Turn on camera/mic
   - ✅ Share screen
   - ✅ Create a poll
   - ✅ Use whiteboard
   - ✅ Chat with students
   - ✅ View attendance

#### **As Student:**
1. View available classes
2. Click "Join" on live class
3. Test features:
   - ✅ Turn on camera/mic
   - ✅ Raise hand
   - ✅ Chat
   - ✅ Vote in polls
   - ✅ View whiteboard

---

## 🔐 Create Real Accounts

### Register as Teacher:
1. Go to `http://localhost:3000/login`
2. Click "Register" tab
3. Fill in:
   - Name: Your Name
   - Email: teacher@example.com
   - Password: password123
   - Select: "Teacher"
4. Click "Create Account"
5. Login with credentials

### Register as Student:
1. Same process, select "Student" role
2. Use different email

---

## 📊 Dashboard Features

### Teacher Dashboard Includes:
- ✅ **Schedule Classes** - Create new live classes
- ✅ **View Upcoming** - See scheduled classes
- ✅ **Live Classes** - Currently running classes
- ✅ **Past Classes** - Completed class history
- ✅ **Start/Stop** - Control class sessions
- ✅ **Analytics** - View class statistics
- ✅ **Recordings** - Access recorded sessions
- ✅ **Attendance** - Download student attendance

### Student Dashboard Includes:
- ✅ **Available Classes** - All upcoming classes
- ✅ **Join Live** - Enter active classes
- ✅ **Class Schedule** - View timetable
- ✅ **History** - Past attended classes
- ✅ **Recordings** - Watch recorded classes
- ✅ **Attendance** - Track your attendance

---

## 🎥 Live Class Features

### Video & Audio:
- HD video (up to 1080p)
- Multiple quality levels (360p, 720p, 1080p)
- Noise cancellation
- Echo cancellation
- Screen sharing

### Collaboration Tools:
- **Chat** - Real-time messaging
- **Polls** - Create and vote (teacher creates, students vote)
- **Whiteboard** - Advanced drawing tools
- **Hand Raise** - Students can raise hand
- **Attendance** - Automatic tracking

### Controls:
- Mute/Unmute microphone
- Turn camera on/off
- Share screen
- Record session (teacher only)
- End call

---

## 🛠️ Troubleshooting

### Backend Won't Start?

**Issue**: Port 5000 already in use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Issue**: MongoDB connection error
```
# Check if MongoDB is running
mongod --version

# Start MongoDB
net start MongoDB
# OR use MongoDB Atlas (cloud)
```

### Frontend Won't Start?

**Issue**: Port 3000 already in use
- Frontend will ask to use another port (type 'Y')
- Or change in `package.json` → "start": "PORT=3001 react-scripts start"

**Issue**: Module not found
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Camera/Mic Not Working?

1. **Allow permissions** in browser
2. **Use HTTPS** (Chrome requires HTTPS for WebRTC)
3. **Try different browser** (Chrome/Firefox recommended)

### Students Can't See Video?

1. Check RTC ports 10000-11000 are open
2. Check firewall settings
3. Ensure `MEDIASOUP_ANNOUNCED_IP` is correct in `.env`

---

## 📱 Browser Compatibility

✅ **Best Experience:**
- Google Chrome (90+)
- Microsoft Edge (90+)
- Mozilla Firefox (88+)

⚠️ **Limited Support:**
- Safari (WebRTC limitations)
- Mobile browsers (smaller screens)

---

## 🔧 Advanced Configuration

### Enable Redis (for 1000+ users):
```env
# In backend/.env
USE_REDIS=true
REDIS_URL=redis://localhost:6379
```

Then start Redis:
```powershell
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis on Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

### Configure MongoDB:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/videocall

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videocall
```

### Enable HTTPS (Production):
```env
USE_HTTPS=true
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/fullchain.pem
```

---

## 📈 Performance Tips

### Development (1-10 users):
- Keep defaults
- No Redis needed
- Single server

### Testing (10-100 users):
- Enable Redis: `USE_REDIS=true`
- Increase workers: `MEDIASOUP_WORKERS=4`

### Production (100-1000 users):
- Enable Redis clustering
- Use MongoDB replica set
- Enable HTTPS
- See `SCALABILITY_GUIDE.md`

### Enterprise (1000-10000 users):
- Deploy multiple app servers (4-8)
- Load balancer (nginx)
- Redis cluster (3-6 nodes)
- MongoDB cluster (3-5 nodes)
- See `SCALABILITY_GUIDE.md` for full setup

---

## 📚 Next Steps

1. ✅ **Test locally** with demo logins
2. ✅ **Create real accounts** (teacher & student)
3. ✅ **Schedule a test class**
4. ✅ **Test all features**
5. ✅ **Customize branding** (logo, colors)
6. ✅ **Deploy to staging**
7. ✅ **Load test** with multiple users
8. ✅ **Deploy to production**

---

## 📖 Documentation

- **Quick Start**: This file
- **Complete Guide**: `PROJECT_COMPLETE.md`
- **Scalability**: `SCALABILITY_GUIDE.md`
- **Code Index**: `CODE_INDEX.json`
- **API Docs**: Backend routes in `backend/src/routes/`

---

## 🆘 Need Help?

### Common Issues:

**Q: Login not working?**
A: Check backend is running on port 5000. Use demo login for testing.

**Q: Can't schedule class?**
A: Login as teacher (not student). Check MongoDB connection.

**Q: Video not showing?**
A: Allow camera/mic permissions. Use Chrome/Firefox.

**Q: Performance issues?**
A: Enable Redis, increase workers, check CPU/memory usage.

---

## ✨ Features Summary

✅ **Complete Authentication** - Login, register, JWT tokens
✅ **Teacher Dashboard** - Schedule, manage, monitor classes
✅ **Student Dashboard** - Browse, join, attend classes
✅ **HD Video Calls** - Up to 500 students per class
✅ **Screen Sharing** - Present slides, code, documents
✅ **Real-time Chat** - Messaging during class
✅ **Interactive Polls** - Engage students
✅ **Advanced Whiteboard** - Draw, annotate, collaborate
✅ **Attendance Tracking** - Automatic join/leave logging
✅ **Class Recording** - Record and playback
✅ **Scalable Architecture** - Support 10,000+ concurrent users

---

## 🎯 Quick Commands Cheat Sheet

```powershell
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Docker (all services)
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all
docker-compose down

# Restart services
docker-compose restart

# Build for production
cd frontend && npm run build
```

---

**🚀 You're all set! Start the servers and test at http://localhost:3000**

**For production deployment, see `SCALABILITY_GUIDE.md`**

---

*SGT-LMS Live Class System | Built for 10,000+ concurrent users | © 2025*

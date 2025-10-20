# 🚀 Render Environment Variables - Upload Instructions

## ⚠️ IMPORTANT: Render Does NOT Read .env Files!

**You CANNOT upload `.env` files to Render.** You must add environment variables manually through the Render Dashboard.

---

## 📋 Step-by-Step Instructions

### STEP 1: Open Render Dashboard

1. Go to: **https://dashboard.render.com**
2. Login with your account
3. You should see both services:
   - `video-call-backend` (or `video-call-backend-nb87`)
   - `video-call-frontend` (or `video-call-frontend-jwku`)

---

### STEP 2: Configure Backend (CRITICAL - Fixes Authentication Error!)

#### 2.1 Navigate to Backend:
1. Click on **`video-call-backend`**
2. Click **"Environment"** tab on the left sidebar

#### 2.2 Add These Variables ONE BY ONE:

Click **"Add Environment Variable"** button for each:

| Variable Name (Key) | Value to Enter |
|---------------------|----------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `video-call-super-secret-jwt-key-change-in-production-12345` |
| `JWT_EXPIRE` | `7d` |
| `USE_REDIS` | `false` |
| `CORS_ORIGIN` | `https://video-call-frontend-jwku.onrender.com` |
| `MEDIASOUP_WORKER_COUNT` | `8` |
| `TRUST_PROXY` | `1` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` |

#### 2.3 Save:
- Scroll to bottom
- Click **"Save Changes"** button
- ⏰ Wait **30-60 seconds** for backend to restart automatically

---

### STEP 3: Configure Frontend

#### 3.1 Navigate to Frontend:
1. Go back to dashboard (click "Dashboard" at top)
2. Click on **`video-call-frontend`**
3. Click **"Environment"** tab on the left sidebar

#### 3.2 Add These Variables ONE BY ONE:

Click **"Add Environment Variable"** button for each:

| Variable Name (Key) | Value to Enter |
|---------------------|----------------|
| `REACT_APP_API_URL` | `https://video-call-backend-nb87.onrender.com` |
| `REACT_APP_SOCKET_URL` | `https://video-call-backend-nb87.onrender.com` |
| `REACT_APP_SOCKET_PATH` | `/socket.io` |
| `REACT_APP_SOCKET_RECONNECTION` | `true` |
| `REACT_APP_SOCKET_RECONNECTION_DELAY` | `1000` |
| `REACT_APP_SOCKET_RECONNECTION_ATTEMPTS` | `10` |
| `REACT_APP_WEBRTC_AUDIO_ENABLED` | `true` |
| `REACT_APP_WEBRTC_VIDEO_ENABLED` | `true` |
| `REACT_APP_ENABLE_CHAT` | `true` |
| `REACT_APP_ENABLE_WHITEBOARD` | `true` |
| `REACT_APP_ENABLE_SCREEN_SHARE` | `true` |
| `REACT_APP_ENABLE_POLLS` | `true` |
| `REACT_APP_ENABLE_ATTENDANCE` | `true` |

#### 3.3 Save:
- Scroll to bottom
- Click **"Save Changes"** button
- ⏰ Wait **2-3 minutes** for frontend to REBUILD (React bakes env vars into build)

---

## ✅ Verification

### Check Backend Logs:

1. Go to **video-call-backend** service
2. Click **"Logs"** tab
3. Look for these SUCCESS messages:
   ```
   ✅ PostgreSQL connected successfully
   ✅ Mediasoup SFU Service initialized with 8 workers
   ✅ Socket Service initialized
   🚀 Video Call Server running on port 5000
   ```
4. **NO MORE "JWT_SECRET" errors!** ✅

### Check Frontend Build:

1. Go to **video-call-frontend** service
2. Click **"Logs"** tab
3. Wait for build to complete (shows "Live" status)
4. Should see: `Build successful`

### Test Socket.IO Connection:

1. Open frontend URL: `https://video-call-frontend-jwku.onrender.com`
2. Login with your account
3. Create and start a room
4. Open browser console (F12)
5. Should see:
   ```
   ✅ WebSocket connection established
   ✅ Connected to Socket.IO server
   ✅ WebRTC manager initialized successfully
   ```
6. UI should show **"Connected"** status (NOT "Disconnected")

---

## 🎯 Quick Reference Files

I've created these files for you:

1. **`backend/.env.render`** - Copy-paste values for backend
2. **`frontend/.env.render`** - Copy-paste values for frontend

**Open these files and copy values from them when adding to Render Dashboard!**

---

## 🚨 Most Critical Variables

If you're short on time, **add these 3 backend variables first**:

### Backend (Minimum):
1. `JWT_SECRET` = `video-call-super-secret-jwt-key-change-in-production-12345` ⚠️ **CRITICAL**
2. `USE_REDIS` = `false` ⚠️ **CRITICAL**
3. `DATABASE_URL` = `postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Frontend (Minimum):
1. `REACT_APP_API_URL` = `https://video-call-backend-nb87.onrender.com` ⚠️ **CRITICAL**
2. `REACT_APP_SOCKET_URL` = `https://video-call-backend-nb87.onrender.com` ⚠️ **CRITICAL**

---

## 📸 Visual Guide

### Where to Add Variables:

```
Render Dashboard
  └─ Services
      ├─ video-call-backend
      │   └─ Environment ← ADD BACKEND VARIABLES HERE
      │       ├─ Add Environment Variable (button)
      │       │   ├─ Key: JWT_SECRET
      │       │   └─ Value: video-call-super-secret-jwt-key-change-in-production-12345
      │       └─ Save Changes (button at bottom)
      │
      └─ video-call-frontend
          └─ Environment ← ADD FRONTEND VARIABLES HERE
              ├─ Add Environment Variable (button)
              │   ├─ Key: REACT_APP_API_URL
              │   └─ Value: https://video-call-backend-nb87.onrender.com
              └─ Save Changes (button at bottom)
```

---

## ❓ Common Questions

### Q: Can I upload the .env files directly?
**A: NO!** Render does NOT read `.env` files. You must add variables through the Dashboard.

### Q: Why do I need to add these manually?
**A:** Render only reads environment variables from:
1. Dashboard Environment tab (recommended)
2. render.yaml file (for new services)

Existing services need manual updates in Dashboard.

### Q: How long does it take to apply changes?
**A:**
- Backend: 30-60 seconds (restart)
- Frontend: 2-3 minutes (full rebuild required)

### Q: What if I make a typo?
**A:** You can edit or delete variables:
1. Go to Environment tab
2. Click the variable
3. Edit the value
4. Click "Save Changes"

### Q: Do I need to add ALL variables?
**A:** Minimum required:
- Backend: `JWT_SECRET`, `USE_REDIS`, `DATABASE_URL`
- Frontend: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`

Other variables have defaults but are recommended for best performance.

---

## 🎉 Success Indicators

### After Backend Variables Added:
- ✅ Backend logs show "Socket Service initialized"
- ✅ No "JWT_SECRET" errors
- ✅ No "Authentication failed" errors

### After Frontend Variables Added:
- ✅ Frontend builds successfully
- ✅ Frontend shows "Live" status
- ✅ Can login and create rooms

### After Testing:
- ✅ Login works
- ✅ Room creation works
- ✅ Video preview shows your camera
- ✅ Status shows "Connected" (not "Disconnected")
- ✅ Friend from another state can join your room!

---

## 📞 Need Help?

If you're still seeing errors after adding all variables:

1. Check backend logs for specific error messages
2. Verify all variable names are spelled correctly (case-sensitive!)
3. Verify backend URL in frontend variables matches exactly
4. Clear browser cache and refresh
5. Wait full 2-3 minutes after frontend changes

---

## 🚀 You're Almost There!

Once you add these environment variables:
1. Socket.IO authentication will work ✅
2. WebRTC will initialize ✅
3. Video calls will work ✅
4. Your friend can join from another state! ✅

**Start adding the backend variables now - it only takes 5 minutes!** 🎯

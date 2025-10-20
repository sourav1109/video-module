# 🚀 Render Environment Variables Setup Guide

## Critical Issue: Socket.IO Authentication Failing

**Problem**: Your backend shows this error:
```
❌ Socket authentication error: secret or public key must be provided
```

**Cause**: `JWT_SECRET` environment variable is missing in Render Dashboard.

**Solution**: Follow steps below to add environment variables manually.

---

## 📋 Step-by-Step Instructions

### 1. Go to Render Dashboard
- Open browser: https://dashboard.render.com
- Login with your account

### 2. Configure Backend Service

#### Navigate to Backend:
1. Click on **"video-call-backend"** service (or video-call-backend-nb87)
2. Click **"Environment"** tab on the left sidebar

#### Add These Variables:

Click **"Add Environment Variable"** for each:

| Key | Value | Required |
|-----|-------|----------|
| `NODE_ENV` | `production` | ✅ Critical |
| `PORT` | `5000` | ✅ Critical |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Md8Lk6fromCY0Xte95sxKw7hTlDfD@ep-weathered-dust-a5i7dkcf.us-east-2.aws.neon.tech/neondb?sslmode=require` | ✅ Critical |
| `JWT_SECRET` | `video-call-super-secret-jwt-key-change-in-production-12345` | ✅ **CRITICAL - MISSING!** |
| `USE_REDIS` | `false` | ✅ Critical |
| `JWT_EXPIRE` | `7d` | ⚠️ Recommended |
| `CORS_ORIGIN` | `https://video-call-frontend-jwku.onrender.com` | ⚠️ Recommended |
| `MEDIASOUP_WORKER_COUNT` | `8` | ⚠️ Recommended |
| `TRUST_PROXY` | `1` | ⚠️ Recommended |

#### Click "Save Changes" Button
- Backend will automatically restart (30-60 seconds)

---

### 3. Configure Frontend Service

#### Navigate to Frontend:
1. Go back to dashboard
2. Click on **"video-call-frontend"** service (or video-call-frontend-jwku)
3. Click **"Environment"** tab on the left sidebar

#### Add These Variables:

Click **"Add Environment Variable"** for each:

| Key | Value | Required |
|-----|-------|----------|
| `REACT_APP_API_URL` | `https://video-call-backend-nb87.onrender.com` | ✅ Critical |
| `REACT_APP_SOCKET_URL` | `https://video-call-backend-nb87.onrender.com` | ✅ Critical |
| `REACT_APP_SOCKET_PATH` | `/socket.io` | ⚠️ Recommended |
| `REACT_APP_SOCKET_RECONNECTION` | `true` | ⚠️ Recommended |
| `REACT_APP_ENABLE_CHAT` | `true` | Optional |
| `REACT_APP_ENABLE_WHITEBOARD` | `true` | Optional |
| `REACT_APP_ENABLE_SCREEN_SHARE` | `true` | Optional |
| `REACT_APP_ENABLE_POLLS` | `true` | Optional |
| `REACT_APP_ENABLE_ATTENDANCE` | `true` | Optional |

#### Click "Save Changes" Button
- Frontend will rebuild (2-3 minutes)
- **Note**: React apps bake env vars into build, so rebuild is required

---

## ✅ Verification Steps

### 4. Wait for Services to Restart

**Backend** (30-60 seconds):
- Check backend logs for:
  ```
  ✅ PostgreSQL connected successfully
  ✅ Mediasoup SFU Service initialized with 8 workers
  ✅ Socket Service initialized
  🚀 Video Call Server running on port 5000
  ```
- **No more JWT errors!** ✅

**Frontend** (2-3 minutes):
- Wait for build to complete
- Status should show 🟢 "Live"

### 5. Test Socket.IO Connection

1. Open frontend: https://video-call-frontend-jwku.onrender.com
2. Login with your account
3. Create a room
4. Start the room
5. Open browser console (F12)
6. Look for:
   ```
   ✅ WebSocket connection established
   ✅ Connected to Socket.IO server
   ✅ WebRTC manager initialized successfully
   ```
7. Check UI - should show **"Connected"** status (not "Disconnected")

### 6. Test Video Call

1. Share room URL with your friend
2. Friend registers/logs in
3. Friend joins room
4. Both should see each other's video!

---

## 🔍 Copy-Paste Values

### Backend Environment Variables (Complete List)

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_Md8Lk6fromCY0Xte95sxKw7hTlDfD@ep-weathered-dust-a5i7dkcf.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=video-call-super-secret-jwt-key-change-in-production-12345
USE_REDIS=false
JWT_EXPIRE=7d
CORS_ORIGIN=https://video-call-frontend-jwku.onrender.com
MEDIASOUP_WORKER_COUNT=8
TRUST_PROXY=1
```

### Frontend Environment Variables (Complete List)

```
REACT_APP_API_URL=https://video-call-backend-nb87.onrender.com
REACT_APP_SOCKET_URL=https://video-call-backend-nb87.onrender.com
REACT_APP_SOCKET_PATH=/socket.io
REACT_APP_SOCKET_RECONNECTION=true
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_WHITEBOARD=true
REACT_APP_ENABLE_SCREEN_SHARE=true
REACT_APP_ENABLE_POLLS=true
REACT_APP_ENABLE_ATTENDANCE=true
```

---

## 🚨 Most Important Variables

**If you only add 3 variables, add these:**

### Backend:
1. `JWT_SECRET` = `video-call-super-secret-jwt-key-change-in-production-12345`
2. `USE_REDIS` = `false`
3. `DATABASE_URL` = `postgresql://neondb_owner:npg_Md8Lk6fromCY0Xte95sxKw7hTlDfD@ep-weathered-dust-a5i7dkcf.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Frontend:
1. `REACT_APP_API_URL` = `https://video-call-backend-nb87.onrender.com`
2. `REACT_APP_SOCKET_URL` = `https://video-call-backend-nb87.onrender.com`

---

## 📝 Notes

### Why Manual Addition Required?
- `render.yaml` defines defaults for NEW services
- Your services were created before we added JWT_SECRET to yaml
- Existing services need manual environment variable updates
- After adding, changes take effect immediately (backend) or after rebuild (frontend)

### Environment Variable Files
- ✅ `backend/.env` - Ready for local development
- ✅ `backend/.env.example` - Template with all options
- ✅ `frontend/.env` - Ready for local development  
- ✅ `frontend/.env.example` - Template with all options

### Local Development
- Copy `.env.example` to `.env` in each folder
- Change URLs to `http://localhost:5000` for local testing
- Never commit `.env` files to Git (already in .gitignore)

### Security Note
- Change `JWT_SECRET` to a strong random string for production
- Never share your DATABASE_URL publicly
- Keep `.env` files private

---

## ❓ Troubleshooting

### Backend Still Shows JWT Error?
- Double-check JWT_SECRET is exactly: `video-call-super-secret-jwt-key-change-in-production-12345`
- No extra spaces before/after
- Wait 60 seconds after clicking "Save Changes"
- Check backend logs for confirmation

### Frontend Still Shows "Disconnected"?
- Verify REACT_APP_SOCKET_URL matches backend URL exactly
- Frontend needs rebuild after env var changes (2-3 minutes)
- Clear browser cache and refresh
- Check browser console for errors

### Database Connection Error?
- Verify DATABASE_URL has no line breaks
- Check Neon Cloud database is active
- Test connection from backend logs

---

## ✅ Expected Results After Setup

### Backend Logs:
```
Production mode: Creating HTTP server (Render provides HTTPS)
🐘 Initializing PostgreSQL connection...
✅ PostgreSQL connected successfully
📊 Pool size: 1 (max: 100)
✅ Mediasoup SFU Service initialized with 8 workers
✅ Socket Service initialized
🚀 Video Call Server running on port 5000
```

### Frontend Console:
```
Connection parameters: {url: "https://video-call-backend-nb87.onrender.com", path: "/socket.io"}
CONNECTING to: https://video-call-backend-nb87.onrender.com
✅ WebSocket connection established
✅ Connected to Socket.IO server
Socket connected with ID: abc123...
✅ WebRTC manager initialized successfully
Local video stream acquired
Ready for video call! 🎉
```

### UI Status:
- ✅ Login/Register works
- ✅ Room creation works
- ✅ Status shows "Connected" (green)
- ✅ Video preview shows your camera
- ✅ Friend can join and see your video

---

## 🎉 Success!

Once you see "Connected" status and video preview, your video call app is fully working!

Share the frontend URL with friends: `https://video-call-frontend-jwku.onrender.com`

They can:
1. Register an account
2. Login
3. Join your room
4. Start video calling!

**Your friend from another state can now join! 🚀**

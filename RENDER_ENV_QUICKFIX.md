# ⚡ QUICK FIX - Add Environment Variables to Render

## 🎯 This Will Fix Student "Failed to Join" Error

---

## 📍 Step-by-Step (5 Minutes)

### 1️⃣ Open Render Dashboard
```
🌐 https://dashboard.render.com
```

### 2️⃣ Select Your Backend Service
```
Click: "video-call-backend" (or video-call-backend-nb87)
```

### 3️⃣ Go to Environment Tab
```
Left Sidebar → Click: "Environment"
```

### 4️⃣ Add These Variables ONE BY ONE

**Click "Add Environment Variable" for each:**

#### ⚠️ MOST CRITICAL (Add This First!)
```
Key:   MEDIASOUP_ANNOUNCED_IP
Value: video-call-backend-nb87.onrender.com
```

#### 🔐 Authentication
```
Key:   JWT_SECRET
Value: video-call-super-secret-jwt-key-change-in-production-12345
```

#### 🗄️ Database
```
Key:   DATABASE_URL
Value: postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 🌐 CORS
```
Key:   CORS_ORIGIN
Value: https://video-call-frontend-jwku.onrender.com
```

#### 🔧 Redis (Critical!)
```
Key:   USE_REDIS
Value: false
```

#### 🎥 MediaSoup Ports
```
Key:   MEDIASOUP_MIN_PORT
Value: 10000
```

```
Key:   MEDIASOUP_MAX_PORT
Value: 10100
```

```
Key:   MEDIASOUP_WORKER_COUNT
Value: 2
```

#### 🛡️ Security
```
Key:   TRUST_PROXY
Value: 1
```

```
Key:   NODE_ENV
Value: production
```

#### ⏱️ Rate Limiting
```
Key:   RATE_LIMIT_WINDOW_MS
Value: 900000
```

```
Key:   RATE_LIMIT_MAX_REQUESTS
Value: 1000
```

#### 🔑 JWT Expiry
```
Key:   JWT_EXPIRE
Value: 7d
```

#### 🚪 Port (Usually auto-set by Render)
```
Key:   PORT
Value: 5000
```

---

## 5️⃣ Save Changes

**At the bottom of the page:**
```
Click: "Save Changes" (blue button)
```

⏳ **Wait 30-60 seconds** for backend to restart

---

## 6️⃣ Verify It's Working

### Check Backend Logs
```
Render Dashboard → video-call-backend → Logs
```

**Look for:**
```bash
✅ PostgreSQL database connected
✅ Mediasoup SFU Service initialized with 8 workers
✅ Socket Service initialized
🚀 Video Call Server running on port 5000
```

### Test Student Join
1. Login as student: https://video-call-frontend-jwku.onrender.com
2. See available classes
3. Click "Join Class"
4. Open browser console (F12)

**Should see:**
```javascript
✅ Send transport connected successfully
✅ Video track produced successfully
✅ Audio track produced successfully
```

**Should NOT see:**
```javascript
❌ SEND TRANSPORT FAILED  // This error should be GONE!
```

---

## 🎯 Why This Fixes the Problem

### Before Fix:
```javascript
// Backend uses default value
announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1'
                                                      ↑
                                                   WRONG!
// Student browser tries to connect to 127.0.0.1
// ❌ Fails because 127.0.0.1 is localhost (not accessible from internet)
```

### After Fix:
```javascript
// Backend uses Render domain
announcedIp: 'video-call-backend-nb87.onrender.com'
                            ↑
                        CORRECT!
// Student browser connects to video-call-backend-nb87.onrender.com
// ✅ Works because it's publicly accessible
```

---

## 📊 Environment Variables Checklist

Copy this list and check off as you add each one:

- [ ] `MEDIASOUP_ANNOUNCED_IP` = `video-call-backend-nb87.onrender.com` ⚠️ CRITICAL
- [ ] `JWT_SECRET` = `video-call-super-secret-jwt-key-change-in-production-12345`
- [ ] `DATABASE_URL` = `postgresql://neondb_owner:npg_Md8Lk6from...` (full connection string)
- [ ] `CORS_ORIGIN` = `https://video-call-frontend-jwku.onrender.com`
- [ ] `USE_REDIS` = `false` ⚠️ Important for free tier
- [ ] `MEDIASOUP_MIN_PORT` = `10000`
- [ ] `MEDIASOUP_MAX_PORT` = `10100`
- [ ] `MEDIASOUP_WORKER_COUNT` = `2`
- [ ] `TRUST_PROXY` = `1`
- [ ] `NODE_ENV` = `production`
- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `1000`
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `PORT` = `5000`
- [ ] Clicked "Save Changes"
- [ ] Waited for restart
- [ ] Checked logs for success messages

---

## 🆘 Troubleshooting

### "I added the variable but still getting errors"

**Check:**
1. **Spelling** - Is `MEDIASOUP_ANNOUNCED_IP` spelled exactly right?
2. **Value** - Is it `video-call-backend-nb87.onrender.com` (no `https://`, no `/`)?
3. **Restart** - Did backend fully restart? (Check logs timestamp)
4. **Cache** - Hard refresh frontend (Ctrl+Shift+R)

### "Backend won't start after adding variables"

**Check logs for errors:**
```bash
# Common issues:
- DATABASE_URL format wrong
- Missing closing quote in value
- Extra spaces in Key or Value
```

**Fix:** Go back to Environment tab, click Edit on the variable, fix the value

### "Student still can't join"

**Check:**
1. Is teacher's class **status = 'live'**? (Teacher must click "Start Class")
2. Is teacher **in the class**? (At least one participant must be there)
3. Browser console - Any other errors besides WebRTC?

---

## ✅ Success Indicators

### Backend Logs (After Restart)
```bash
🐘 Connecting to PostgreSQL database...
✅ PostgreSQL connected successfully
🚀 Initializing Mediasoup SFU Service...
👷 Created Mediasoup worker 1
👷 Created Mediasoup worker 2
...
✅ Mediasoup SFU Service initialized with 8 workers
🔌 Initializing Socket Service...
✅ Socket Service initialized
🚀 Video Call Server running on port 5000
🎯 Ready to handle video calls for 10,000+ concurrent users
```

### Student Browser Console (When Joining)
```javascript
🔧 API Configuration: {REACT_APP_API_URL: 'https://video-call-backend-nb87...'}
✅ Logging in user: student@example.com
✅ Login successful
📱 ✅ Mediasoup Device created successfully
✅ Send transport created successfully
✅ Receive transport created successfully
✅ Local media obtained: {video: 1, audio: 1}
📤 Connecting send transport...
✅ Send transport connected  ← THIS IS THE KEY!
✅ Video track produced successfully
✅ Audio track produced successfully
✅ Successfully joined class
```

---

## 🎓 What You Just Fixed

**Problem:** Student joining fails with WebRTC error

**Root Cause:** Backend telling browsers to connect to `127.0.0.1` for media

**Solution:** Set `MEDIASOUP_ANNOUNCED_IP` to public Render domain

**Result:** Students can now join classes and stream video/audio ✅

---

**Time to Complete:** ~5 minutes
**Difficulty:** Easy ⭐
**Impact:** High - Fixes student join functionality! 🎉

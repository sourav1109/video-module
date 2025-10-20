# 🎯 Railway Dashboard - Click-by-Click Guide

## 📍 Step-by-Step Visual Instructions

### **PART 1: Backend Deployment (First Service)**

```
┌─────────────────────────────────────────────────────┐
│ 1. Go to: https://railway.app                       │
│ 2. Click: "Login" (use GitHub account)              │
│ 3. Click: "Start a New Project"                     │
│ 4. Click: "Deploy from GitHub repo"                 │
│ 5. Select: "sourav1109/video-module"                │
│ 6. Project created! ✅                               │
└─────────────────────────────────────────────────────┘
```

### **Configure Backend Service**

```
Railway Dashboard → Click on deployed service

┌─────────────────────────────────────────────────────┐
│ TAB: Settings                                        │
│ ├─ Service Name: video-call-backend                 │
│ ├─ Root Directory: /backend        ⭐ SET THIS!    │
│ ├─ Build Command: (leave auto)                      │
│ └─ Start Command: node src/server.js  ⭐ SET THIS! │
└─────────────────────────────────────────────────────┘

Scroll down:
┌─────────────────────────────────────────────────────┐
│ NETWORKING                                           │
│ ├─ Click: "Generate Domain"                         │
│ └─ Copy URL: https://xxx.up.railway.app  📋        │
└─────────────────────────────────────────────────────┘
```

### **Add Backend Environment Variables**

```
Click: "Variables" tab (top of page)

┌─────────────────────────────────────────────────────┐
│ Click "+ New Variable" button                        │
│                                                      │
│ Add these ONE BY ONE:                               │
│                                                      │
│ Variable Name          │ Value                      │
│────────────────────────┼────────────────────────────│
│ NODE_ENV               │ production                 │
│ PORT                   │ 5000                       │
│ DATABASE_URL           │ postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require │
│ JWT_SECRET             │ video-call-super-secret-jwt-key-change-in-production-12345 │
│ JWT_EXPIRE             │ 7d                         │
│ USE_REDIS              │ false                      │
│ CORS_ORIGIN            │ *                          │
│ MEDIASOUP_WORKER_COUNT │ 4                          │
│ MEDIASOUP_MIN_PORT     │ 10000                      │
│ MEDIASOUP_MAX_PORT     │ 10100                      │
│ MEDIASOUP_ANNOUNCED_IP │ ${{RAILWAY_PUBLIC_DOMAIN}} ⭐│
│ TRUST_PROXY            │ 1                          │
│ RATE_LIMIT_WINDOW_MS   │ 900000                     │
│ RATE_LIMIT_MAX_REQUESTS│ 1000                       │
└─────────────────────────────────────────────────────┘

⚠️ COPY-PASTE TIP: Open backend/.env.railway file
   Copy each line, paste into Railway
```

### **Deploy Backend**

```
Click: "Deployments" tab

┌─────────────────────────────────────────────────────┐
│ Latest Deployment                                    │
│ ├─ Status: Building... → Deploying... → ✅ Success │
│ ├─ Logs: Click to view                             │
│ └─ Expected: "Server running on port 5000" ✅      │
└─────────────────────────────────────────────────────┘

Wait 1-2 minutes for deployment to complete
```

---

### **PART 2: Frontend Deployment (Second Service)**

```
Go back to: Railway Dashboard (top left)

┌─────────────────────────────────────────────────────┐
│ Click: "+ New" button (top right)                   │
│ Click: "Empty Service"                              │
│                                                      │
│ New service appears on dashboard!                   │
│ Click on it to configure                            │
└─────────────────────────────────────────────────────┘
```

### **Connect to GitHub**

```
Inside new service:

┌─────────────────────────────────────────────────────┐
│ Click: "Settings" tab                               │
│ ├─ Source: Click "Connect to GitHub"               │
│ ├─ Select repo: sourav1109/video-module            │
│ ├─ Service Name: video-call-frontend               │
│ └─ Connected! ✅                                    │
└─────────────────────────────────────────────────────┘
```

### **Configure Frontend Service**

```
Still in Settings tab:

┌─────────────────────────────────────────────────────┐
│ Build Settings                                       │
│ ├─ Root Directory: /frontend       ⭐ SET THIS!    │
│ ├─ Build Command:                                   │
│ │   npm install && npm run build   ⭐ SET THIS!    │
│ ├─ Start Command:                                   │
│ │   npx serve -s build -l $PORT    ⭐ SET THIS!    │
│ └─ Watch Paths: (leave default)                     │
└─────────────────────────────────────────────────────┘

Scroll down:
┌─────────────────────────────────────────────────────┐
│ NETWORKING                                           │
│ ├─ Click: "Generate Domain"                         │
│ └─ Copy URL: https://yyy.up.railway.app  📋        │
└─────────────────────────────────────────────────────┘
```

### **Add Frontend Environment Variables**

```
Click: "Variables" tab

┌─────────────────────────────────────────────────────┐
│ Click "+ New Variable"                               │
│                                                      │
│ ⚠️ IMPORTANT: Replace URLs with YOUR backend URL!  │
│                                                      │
│ Variable Name          │ Value                      │
│────────────────────────┼────────────────────────────│
│ NODE_ENV               │ production                 │
│ REACT_APP_API_URL      │ https://xxx.up.railway.app │
│                        │   (your backend URL) ⭐    │
│ REACT_APP_SOCKET_URL   │ https://xxx.up.railway.app │
│                        │   (same as above) ⭐       │
│ GENERATE_SOURCEMAP     │ false                      │
└─────────────────────────────────────────────────────┘

Where to get backend URL:
1. Go to backend service
2. Settings tab → Networking → Copy domain
3. Paste into REACT_APP_API_URL and REACT_APP_SOCKET_URL
```

### **Deploy Frontend**

```
Click: "Deployments" tab

┌─────────────────────────────────────────────────────┐
│ Click: "Deploy" button                              │
│ ├─ Status: Building... (2-3 minutes)               │
│ ├─ Look for: "Compiled successfully!" ✅           │
│ └─ Status changes to: ✅ Success                   │
└─────────────────────────────────────────────────────┘
```

---

### **PART 3: Connect Backend & Frontend**

```
Go to: Backend service

┌─────────────────────────────────────────────────────┐
│ Click: "Variables" tab                               │
│ ├─ Find: CORS_ORIGIN (currently = *)               │
│ ├─ Click: Edit icon (pencil) ✏️                    │
│ ├─ Change to: https://yyy.up.railway.app           │
│ │   (your frontend URL from Part 2)                │
│ └─ Service auto-redeploys ✅                        │
└─────────────────────────────────────────────────────┘

Wait 30 seconds for redeploy to complete
```

---

## ✅ Verification Steps

### **Check Backend Health**

```
1. Copy backend URL from Settings → Networking
2. Open in browser: https://xxx.up.railway.app
3. You should see: 404 or "Cannot GET /"
   ✅ This is GOOD! Server is running!

Alternative test:
https://xxx.up.railway.app/api/video-call/health
Should return: {"status":"ok"}
```

### **Check Frontend**

```
1. Copy frontend URL from Settings → Networking
2. Open in browser: https://yyy.up.railway.app
3. You should see: ✅ Login/Register page
4. Press F12 → Console tab
5. Should be: ✅ No red errors
```

### **Test Complete Flow**

```
┌─────────────────────────────────────────────────────┐
│ TEACHER TEST                                         │
│ 1. Register as teacher                              │
│ 2. Create live class                                │
│ 3. Click "Start"                                    │
│ 4. Allow camera/mic                                 │
│ 5. ✅ See your video!                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ STUDENT TEST (Incognito window)                     │
│ 1. Open incognito: Ctrl+Shift+N                    │
│ 2. Go to frontend URL                               │
│ 3. Register as student                              │
│ 4. Click "Join" on live class                       │
│ 5. Allow camera/mic                                 │
│ 6. ✅ See teacher video!                            │
│ 7. ✅ Teacher sees student video!                   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Visual Dashboard Layout

```
Railway Dashboard:
┌─────────────────────────────────────────────────────┐
│ Project: video-call-module                          │
│                                                      │
│ ┌────────────────────┐  ┌────────────────────┐    │
│ │ video-call-backend │  │video-call-frontend │    │
│ │ ● Live             │  │ ● Live             │    │
│ │ Settings Variables │  │ Settings Variables │    │
│ │ Deployments Metrics│  │ Deployments Metrics│    │
│ └────────────────────┘  └────────────────────┘    │
│                                                      │
│ [+ New]  [Settings]  [Usage]                        │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Success Indicators

### **Backend is working when you see:**
```
✅ Green "Live" indicator
✅ Logs show: "Server running on port 5000"
✅ Logs show: "PostgreSQL connected"
✅ Logs show: "Mediasoup SFU Service initialized"
✅ Domain URL returns 404 (server responding!)
```

### **Frontend is working when you see:**
```
✅ Green "Live" indicator  
✅ Build logs: "Compiled successfully!"
✅ Domain URL loads login page
✅ No console errors (F12)
✅ Can type in input fields
```

### **WebRTC is working when:**
```
✅ Camera permission prompt appears
✅ Local video shows
✅ Other user's video shows
✅ NO "Send transport failed" error
✅ Console shows: "DEVICE LOADED"
✅ Console shows: "TRANSPORTS CREATED"
```

---

## 🆘 Common Issues & Quick Fixes

### **Backend crashes immediately**
```
❌ Error: Cannot find module '/app/index.js'
✅ Fix: Set Root Directory = /backend in Settings
```

### **Frontend white screen**
```
❌ Browser shows blank page
✅ Fix 1: Check console (F12) for errors
✅ Fix 2: Verify REACT_APP_API_URL is correct
✅ Fix 3: Check backend CORS_ORIGIN has frontend URL
```

### **CORS errors in console**
```
❌ "Access-Control-Allow-Origin" error
✅ Fix: Update backend CORS_ORIGIN to frontend URL
      Variables → Edit CORS_ORIGIN → Save
```

### **Video not connecting**
```
❌ "Send transport failed"
✅ Fix: Check MEDIASOUP_ANNOUNCED_IP on backend
      Must be: ${{RAILWAY_PUBLIC_DOMAIN}}
      NOT an IP address!
```

---

## 💡 Pro Tips

### **Tip 1: Use Raw Editor for Variables**
```
Variables tab → Click "Raw Editor" button (top right)
Paste all variables at once:
NODE_ENV=production
PORT=5000
...

Much faster than one-by-one!
```

### **Tip 2: Watch Logs in Real-Time**
```
Deployments → Latest → Logs
Logs update live - watch for errors!
```

### **Tip 3: Quick Restart**
```
Deployments → Latest → ⋮ menu → Restart
Forces service to restart without redeploying
```

### **Tip 4: Check Usage**
```
Project Dashboard → Usage tab
Monitor credit consumption
```

---

## 📋 Final Checklist

### **Before testing:**
- [ ] Backend service shows "Live"
- [ ] Frontend service shows "Live"
- [ ] Backend has all 14 environment variables
- [ ] Frontend has all 4 environment variables
- [ ] MEDIASOUP_ANNOUNCED_IP = ${{RAILWAY_PUBLIC_DOMAIN}}
- [ ] REACT_APP_API_URL points to backend domain
- [ ] CORS_ORIGIN points to frontend domain
- [ ] Both domains are generated and accessible

### **After testing:**
- [ ] Can register new users
- [ ] Can login
- [ ] Teacher can create class
- [ ] Teacher can start class with video
- [ ] Student can join class
- [ ] Student sees teacher video
- [ ] Teacher sees student video
- [ ] Chat works
- [ ] No console errors

---

## 🎉 Success!

**If all checks pass, your app is live! 🚀**

**Your URLs:**
- Backend: `https://________________.up.railway.app`
- Frontend: `https://________________.up.railway.app`

**Next steps:**
1. Share frontend URL with users
2. Monitor Railway usage dashboard
3. Consider custom domain
4. Enjoy your fully working video call app!

---

**Made with ❤️ for hassle-free Railway deployment!**

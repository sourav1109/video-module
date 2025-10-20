# 🚂 Railway Quick Setup Card

## 📦 What Gets Deployed

```
┌─────────────────────────────────────────────────────┐
│                 RAILWAY PROJECT                      │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Backend Service │      │ Frontend Service │   │
│  │                  │      │                  │   │
│  │  Node.js + WS    │◄────►│  React Build     │   │
│  │  MediaSoup SFU   │      │  Static Files    │   │
│  │  Port: 5000      │      │  Port: Auto      │   │
│  └────────┬─────────┘      └──────────────────┘   │
│           │                                         │
│           ▼                                         │
│  ┌──────────────────┐                              │
│  │  Neon PostgreSQL │  (External)                  │
│  │  Cloud Database  │                              │
│  └──────────────────┘                              │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ 5-Minute Deployment Steps

### 1️⃣ **Deploy Backend** (2 min)
```bash
1. Railway → New Project → From GitHub
2. Select: sourav1109/video-module
3. Service Settings:
   - Root: /backend
   - Start: node src/server.js
4. Add variables from: backend/.env.railway
5. Generate domain → Copy URL
```

### 2️⃣ **Deploy Frontend** (2 min)
```bash
1. Same Project → + New Service
2. Connect same repo
3. Service Settings:
   - Root: /frontend
   - Build: npm install && npm run build
   - Start: npx serve -s build -l $PORT
4. Add variables from: frontend/.env.railway
   (Replace URLs with backend URL from step 1!)
5. Generate domain
```

### 3️⃣ **Connect Them** (1 min)
```bash
1. Go to Backend service
2. Variables → Update CORS_ORIGIN
3. Set to: frontend URL from step 2
4. Both services auto-redeploy ✅
```

---

## 🎯 Critical Environment Variables

### **Backend (14 variables)**
```env
✅ NODE_ENV=production
✅ PORT=5000
✅ DATABASE_URL=postgresql://... (from Neon)
✅ JWT_SECRET=your-secret-key
✅ JWT_EXPIRE=7d
✅ USE_REDIS=false
✅ CORS_ORIGIN=* (update after frontend deployed)
✅ MEDIASOUP_WORKER_COUNT=4
✅ MEDIASOUP_MIN_PORT=10000
✅ MEDIASOUP_MAX_PORT=10100
✅ MEDIASOUP_ANNOUNCED_IP=${{RAILWAY_PUBLIC_DOMAIN}}  ⭐ CRITICAL!
✅ TRUST_PROXY=1
✅ RATE_LIMIT_WINDOW_MS=900000
✅ RATE_LIMIT_MAX_REQUESTS=1000
```

### **Frontend (4 variables)**
```env
✅ NODE_ENV=production
✅ REACT_APP_API_URL=https://your-backend.railway.app
✅ REACT_APP_SOCKET_URL=https://your-backend.railway.app
✅ GENERATE_SOURCEMAP=false
```

---

## ✅ Success Indicators

### **Backend Deployed:**
```
✅ Status: Live (green dot)
✅ Logs show: "Server running on port 5000"
✅ Logs show: "PostgreSQL connected successfully"
✅ Logs show: "Mediasoup SFU Service initialized"
✅ Domain: https://xxx.up.railway.app generated
```

### **Frontend Deployed:**
```
✅ Status: Live (green dot)
✅ Build logs: "Compiled successfully!"
✅ Domain: https://yyy.up.railway.app generated
✅ Opening domain shows login page
✅ No console errors (F12)
```

### **WebRTC Working:**
```
✅ Teacher can start class
✅ Camera/mic permissions work
✅ Local video appears
✅ Student can join class
✅ Student sees teacher video
✅ Teacher sees student video
✅ NO "Send transport failed" errors! 🎉
```

---

## 🆘 Troubleshooting Quick Fix

### **Backend crashed?**
```bash
Check: Deploy Logs → Look for error
Fix 1: Ensure root directory is /backend
Fix 2: Ensure start command is: node src/server.js
Fix 3: Check DATABASE_URL is valid
Fix 4: Verify MEDIASOUP_ANNOUNCED_IP = ${{RAILWAY_PUBLIC_DOMAIN}}
```

### **Frontend white screen?**
```bash
Check: Browser console (F12)
Fix 1: Verify REACT_APP_API_URL has correct backend URL
Fix 2: Check backend CORS_ORIGIN has frontend URL
Fix 3: Rebuild frontend: Deployments → Deploy
```

### **Video not working?**
```bash
Railway DOES support WebRTC! ✅
Check MEDIASOUP_ANNOUNCED_IP on backend
Should be: ${{RAILWAY_PUBLIC_DOMAIN}}
NOT an IP address, NOT localhost
Redeploy backend after fixing
```

---

## 💰 Free Tier Limits

```
Monthly Credit: $5 FREE
Enough for: ~500 server hours
Perfect for: Development + Testing
Upgrade when: Going to production
```

**Monitor usage:**
Railway Dashboard → Usage tab

---

## 🔄 Auto-Deploy Enabled

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically:
# → Detects push
# → Builds backend
# → Builds frontend
# → Deploys both
# → Zero downtime! ✨
```

---

## 📚 Documentation Files

```
RAILWAY_COMPLETE_DEPLOYMENT.md  ← Full guide (you are here)
backend/.env.railway            ← Backend variables template
frontend/.env.railway           ← Frontend variables template
backend/railway.toml            ← Backend config
frontend/railway.toml           ← Frontend config
Procfile                        ← Process definition
```

---

## 🎯 Your Deployment URLs

Fill these in after deployment:

```
Backend:  https://___________________.up.railway.app
Frontend: https://___________________.up.railway.app
Database: postgresql://... (already set)
```

---

## ✅ Pre-Launch Checklist

- [ ] Backend shows "Live" status
- [ ] Frontend shows "Live" status
- [ ] Backend logs: "Server running"
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Teacher dashboard loads
- [ ] Can create live class
- [ ] Can start class with video
- [ ] Student can see live class
- [ ] Student can join class
- [ ] **Video streaming works!** ⭐
- [ ] Chat works
- [ ] Audio works
- [ ] Multiple students can join

---

## 🎉 You're Done!

**Railway Advantages:**
✅ WebRTC works out of the box
✅ UDP ports automatically open
✅ Fast deployment (< 10 minutes)
✅ Auto-deploy on git push
✅ $5 free credit monthly
✅ Better than Render for WebRTC!

**Share your app:**
Frontend URL: `https://your-app.up.railway.app`

---

**Need help?** Check `RAILWAY_COMPLETE_DEPLOYMENT.md` for detailed instructions!

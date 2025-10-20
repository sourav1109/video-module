# 🚂 Railway - Settings Configuration (Visual Guide)

## 🎯 **STEP-BY-STEP: Fix the "Module Not Found" Error**

---

## **Step 1️⃣: Go to Settings Tab**

```
Railway Dashboard
  └── video-call-module (your service)
      └── Click "Settings" (left sidebar)
```

---

## **Step 2️⃣: Scroll Down to "Deploy"**

Find this section in Settings:

```
┌─────────────────────────────────────────┐
│ Deploy                                  │
├─────────────────────────────────────────┤
│                                         │
│ Custom Build Command                    │
│ ┌─────────────────────────────────────┐ │
│ │ cd backend && npm install           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Custom Start Command                    │
│ ┌─────────────────────────────────────┐ │
│ │ cd backend && node src/server.js    │ │ ⬅️ ADD THIS!
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save] button                           │
└─────────────────────────────────────────┘
```

**Type EXACTLY:**
```
cd backend && node src/server.js
```

Click **"Save"**

---

## **Step 3️⃣: Add Environment Variables**

Click **"Variables"** tab (left sidebar)

```
┌─────────────────────────────────────────┐
│ Variables                               │
├─────────────────────────────────────────┤
│                                         │
│ [+ New Variable] button                 │
│                                         │
│ Key                    Value            │
│ ──────────────────────────────────────  │
│ NODE_ENV               production       │
│ PORT                   5000             │
│ DATABASE_URL           postgresql://... │
│ JWT_SECRET             video-call-...   │
│ USE_REDIS              false            │
│ ...                    ...              │
│                                         │
│ [Add] button for each variable          │
└─────────────────────────────────────────┘
```

**Add these variables ONE BY ONE:**

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=video-call-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRE=7d
USE_REDIS=false
MEDIASOUP_WORKER_COUNT=2
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
TRUST_PROXY=1
```

**IMPORTANT:** Leave `CORS_ORIGIN` empty for now (we'll add it after getting the frontend URL)

---

## **Step 4️⃣: Redeploy**

Two options:

### **Option A: Manual Deploy**
```
Railway Dashboard
  └── video-call-module
      └── Deployments tab
          └── Click "Deploy" button
```

### **Option B: Git Push (Automatic)**
```powershell
# Already done! Railway auto-deploys from git push
```

---

## **Step 5️⃣: Check Deployment Status**

Go to **"Deployments"** tab:

```
┌─────────────────────────────────────────┐
│ Latest Deployment                       │
├─────────────────────────────────────────┤
│                                         │
│ ✅ Building...                          │
│ ✅ Deploying...                         │
│ ✅ Running                              │
│                                         │
│ Logs:                                   │
│ ✅ PostgreSQL connected successfully    │
│ ✅ Mediasoup SFU Service initialized    │
│ 🚀 Server running on port 5000         │
│                                         │
└─────────────────────────────────────────┘
```

**If you see this = SUCCESS! ✅**

---

## **Step 6️⃣: Get Your Backend URL**

In Railway Dashboard:

```
┌─────────────────────────────────────────┐
│ video-call-module                       │
├─────────────────────────────────────────┤
│                                         │
│ 🌐 Deployments                          │
│                                         │
│ https://video-call-module-production... │ ⬅️ COPY THIS!
│                                         │
│ [Copy URL] button                       │
└─────────────────────────────────────────┘
```

**Save this URL!** You'll need it for frontend configuration.

---

## **Step 7️⃣: Test Backend**

Open browser and visit:
```
https://your-backend-url.railway.app
```

**Expected:** Should see a 404 page (this is OK! It means server is running)

**Not Expected:** 
- ❌ "Application Error"
- ❌ "Cannot GET /"
- ❌ Blank page with error

If you see errors, go back to Deployments → Check logs

---

## **Step 8️⃣: Deploy Frontend (Optional - New Service)**

Click **"+ New"** in Railway Dashboard

```
┌─────────────────────────────────────────┐
│ New Project                             │
├─────────────────────────────────────────┤
│                                         │
│ ○ Empty Service                         │
│ ● GitHub Repo                           │ ⬅️ SELECT THIS
│ ○ Docker Image                          │
│                                         │
│ Repository: sourav1109/video-module     │
│                                         │
│ [Deploy] button                         │
└─────────────────────────────────────────┘
```

**Configure Frontend:**

Go to Settings:
- **Service Name:** `video-call-frontend`
- **Root Directory:** `/frontend` ⬅️ IMPORTANT!
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s build -l $PORT`

Add Frontend Variables:
```bash
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
```

---

## **Step 9️⃣: Update Backend CORS**

Go back to **backend service** → Variables

Add or update:
```bash
CORS_ORIGIN=https://your-frontend-url.railway.app
```

Click **"Save"** (backend will auto-restart)

---

## ✅ **Success Checklist**

- [ ] Start command set: `cd backend && node src/server.js`
- [ ] All environment variables added
- [ ] Deployment status shows "Running" (green)
- [ ] Logs show: "Server running on port 5000"
- [ ] Backend URL accessible (returns 404 is OK)
- [ ] Frontend deployed as separate service
- [ ] CORS_ORIGIN configured on backend
- [ ] Frontend can connect to backend

---

## 🎉 **You're Done!**

**Backend:** `https://video-call-module-production.up.railway.app`
**Frontend:** `https://video-call-frontend-production.up.railway.app`

Visit frontend URL and test:
1. ✅ Register/Login
2. ✅ Create live class (teacher)
3. ✅ Join live class (student)
4. ✅ Video/audio streaming works!

---

## 🆘 **Troubleshooting**

### **Still seeing "Module Not Found"?**
1. Check Start Command is EXACTLY: `cd backend && node src/server.js`
2. Check Build Command is: `cd backend && npm install`
3. Redeploy manually

### **"Application Error" page?**
1. Go to Deployments → Check logs
2. Look for error messages
3. Usually missing environment variables

### **Video call not connecting?**
1. Check browser console (F12)
2. Verify CORS_ORIGIN is correct
3. Check backend logs for WebRTC errors

---

**Need help?** Copy the error from Railway logs and ask for specific troubleshooting!

# 🚂 Railway Deployment - Quick Fix Guide

## ❌ Current Error
```
Error: Cannot find module '/app/index.js'
```

**Cause:** Railway doesn't know where your backend entry point is.

---

## ✅ **SOLUTION: 3 Quick Steps**

### **Step 1: Add Environment Variables**

Go to Railway Dashboard → `video-call-module` → **Variables** tab

Click **"+ New Variable"** and add these **ONE BY ONE**:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=video-call-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRE=7d
USE_REDIS=false
CORS_ORIGIN=https://your-frontend-url.railway.app
MEDIASOUP_WORKER_COUNT=2
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
TRUST_PROXY=1
```

**Note:** Replace `CORS_ORIGIN` with your actual Railway frontend URL after deploying frontend.

---

### **Step 2: Configure Start Command**

In Railway Dashboard → `video-call-module` → **Settings** tab:

Find **"Start Command"** and set it to:
```bash
cd backend && node src/server.js
```

OR set **"Custom Build Command"**:
```bash
cd backend && npm install
```

---

### **Step 3: Redeploy**

In Railway Dashboard → `video-call-module` → **Deployments** tab:

Click **"Deploy"** button or run:
```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

Railway will auto-deploy the new commit.

---

## 🎯 **Expected Result**

After redeployment, you should see:
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized with 8 workers
🚀 Video Call Server running on port 5000
```

**Your backend will be live at:** `https://video-call-module-production.up.railway.app`

---

## 🔧 **If Still Crashing**

### **Check Build Logs:**
Railway Dashboard → Deployments → Click on failed deployment → **"Build Logs"**

### **Common Issues:**

#### **Issue 1: Module not found errors**
```bash
# Solution: Set custom install command
cd backend && npm install --production
```

#### **Issue 2: Port binding error**
```bash
# Railway automatically sets PORT variable
# Make sure backend/src/server.js uses:
const PORT = process.env.PORT || 5000;
```

#### **Issue 3: Database connection timeout**
```bash
# Add to environment variables:
DATABASE_CONNECTION_TIMEOUT=30000
```

---

## 📱 **Deploy Frontend (Separate Service)**

### **Step 1: Create New Service**
1. Railway Dashboard → Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose `video-module` repository
4. Name it: `video-call-frontend`

### **Step 2: Configure Frontend**
In Settings:
- **Root Directory:** `/frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s build -l $PORT`

### **Step 3: Add Frontend Variables**
```bash
REACT_APP_API_URL=https://video-call-module-production.up.railway.app
REACT_APP_SOCKET_URL=https://video-call-module-production.up.railway.app
```

### **Step 4: Update Backend CORS**
Go back to backend service → Variables → Update:
```bash
CORS_ORIGIN=https://video-call-frontend-production.up.railway.app
```

---

## 🎉 **Final Setup**

After both services are deployed:

1. **Backend URL:** `https://video-call-module-production.up.railway.app`
2. **Frontend URL:** `https://video-call-frontend-production.up.railway.app`

Test by visiting the frontend URL and trying to:
- ✅ Register/Login
- ✅ Create a class (teacher)
- ✅ Join a class (student)
- ✅ Start video call

---

## 📊 **Railway vs Render**

| Feature | Railway | Render Free |
|---------|---------|-------------|
| WebRTC Support | ✅ **Works** | ❌ Fails |
| UDP Ports | ✅ Open | ❌ Blocked |
| Free Tier | $5 credit/month | Limited |
| Setup | ⚡ Easy | 🐌 Complex |
| Performance | ⚡⚡⚡ Fast | 🐌 Slow |

**Railway is MUCH better for WebRTC apps!**

---

## 🆘 **Still Having Issues?**

Check these files were committed:
- ✅ `Procfile` (contains: `web: cd backend && node src/server.js`)
- ✅ `nixpacks.toml` (backend configuration)
- ✅ `railway.json` (deployment settings)
- ✅ `package.json` (updated start command)

Run:
```bash
cd c:\Users\hp\Desktop\vcfinal\video-call-module-
git status
# Make sure all files are committed
git add .
git commit -m "Fix Railway deployment"
git push origin main
```

---

## ✅ **Success Checklist**

- [ ] Environment variables added to Railway
- [ ] Start command configured: `cd backend && node src/server.js`
- [ ] Configuration files committed and pushed
- [ ] Backend deployment successful (green status)
- [ ] Backend URL accessible (returns 404 is OK, means server is running)
- [ ] Frontend deployed as separate service
- [ ] Frontend can connect to backend
- [ ] Video call working!

---

**Need help?** Check Railway logs and paste the error message for specific troubleshooting.

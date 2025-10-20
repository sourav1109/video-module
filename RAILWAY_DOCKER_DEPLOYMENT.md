# 🐳 Railway Docker Deployment Guide

## ✅ **Why Docker on Railway?**

| Feature | Regular Deploy | Docker Deploy |
|---------|---------------|---------------|
| Build Speed | ⚡ Fast | 🐌 Slower (first time) |
| Reliability | ❓ Platform dependent | ✅ **Consistent** |
| Control | ❌ Limited | ✅ **Full control** |
| Debugging | 🔍 Harder | ✅ **Easier** |
| Recommended | Development | **Production** ⭐ |

**Decision:** Use Docker for production deployments!

---

## 🚀 **Quick Start - Deploy Both Services**

### **Option A: Automatic Detection (Recommended)**

Railway will **automatically detect** your Dockerfiles and use them!

1. **Push your code:**
   ```powershell
   git add .
   git commit -m "Add optimized Docker setup for Railway"
   git push origin main
   ```

2. **Create Backend Service:**
   - Go to: https://railway.app/dashboard
   - Click: **"+ New Project"**
   - Select: **"Deploy from GitHub repo"**
   - Choose: `video-module` repository
   - Railway detects `backend/Dockerfile` ✅
   - Set **Root Directory**: `backend`
   - Click: **"Deploy"**

3. **Create Frontend Service:**
   - In same project, click: **"+ New"**
   - Select: **"GitHub Repo"**
   - Choose: `video-module` again
   - Railway detects `frontend/Dockerfile` ✅
   - Set **Root Directory**: `frontend`
   - Click: **"Deploy"**

---

## 🔧 **Backend Docker Configuration**

### **Step 1: Set Environment Variables**

Railway Dashboard → Backend Service → **Variables** tab

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=video-call-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRE=7d
USE_REDIS=false
CORS_ORIGIN=*
MEDIASOUP_WORKER_COUNT=4
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
MEDIASOUP_ANNOUNCED_IP=${{RAILWAY_PUBLIC_DOMAIN}}
TRUST_PROXY=1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### **Step 2: Configure Service Settings**

Railway Dashboard → Backend Service → **Settings** tab

- **Service Name**: `video-call-backend`
- **Root Directory**: `backend`
- **Dockerfile Path**: `Dockerfile` (auto-detected)
- **Health Check Path**: `/health` (optional)
- **Port**: `5000` (auto-detected from Dockerfile)

### **Step 3: Generate Public Domain**

Railway Dashboard → Backend Service → **Settings** → **Networking**

- Click: **"Generate Domain"**
- Copy the domain (e.g., `video-call-backend-production.up.railway.app`)
- **Save this URL** - you'll need it for frontend!

---

## 🎨 **Frontend Docker Configuration**

### **Step 1: Build-time Environment Variables**

Railway Dashboard → Frontend Service → **Variables** tab

**IMPORTANT:** React needs API URLs at **BUILD TIME**, not runtime!

```bash
# Build-time variables (required for React build)
REACT_APP_API_URL=https://video-call-backend-production.up.railway.app
REACT_APP_SOCKET_URL=https://video-call-backend-production.up.railway.app

# Runtime variables
PORT=8080
NODE_ENV=production
```

**Replace** `video-call-backend-production.up.railway.app` with YOUR actual backend domain!

### **Step 2: Configure Service Settings**

Railway Dashboard → Frontend Service → **Settings** tab

- **Service Name**: `video-call-frontend`
- **Root Directory**: `frontend`
- **Dockerfile Path**: `Dockerfile` (auto-detected)
- **Health Check Path**: `/health`
- **Port**: `8080` (nginx port)

### **Step 3: Generate Public Domain**

Railway Dashboard → Frontend Service → **Settings** → **Networking**

- Click: **"Generate Domain"**
- Copy domain (e.g., `video-call-frontend-production.up.railway.app`)
- This is your **public app URL**! 🎉

---

## 🔄 **Update Backend CORS**

After frontend is deployed, update backend `CORS_ORIGIN`:

Railway Dashboard → Backend Service → **Variables**

Change:
```bash
CORS_ORIGIN=*
```

To:
```bash
CORS_ORIGIN=https://video-call-frontend-production.up.railway.app
```

**Replace** with your actual frontend domain!

Click **"Redeploy"** on backend service.

---

## 📊 **Verify Deployment**

### **Check Backend:**
```bash
# Visit in browser:
https://video-call-backend-production.up.railway.app/health

# Expected response:
{"status":"ok"}
```

### **Check Frontend:**
```bash
# Visit in browser:
https://video-call-frontend-production.up.railway.app

# Should see your login page!
```

### **Check Logs:**

Railway Dashboard → Service → **Deployments** → Click latest → **View Logs**

**Backend should show:**
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized with 4 workers
🚀 Video Call Server running on port 5000
```

**Frontend should show:**
```
nginx: [notice] start worker processes
```

---

## 🐛 **Troubleshooting**

### **Issue 1: Build Failed - COPY failed**

**Error:**
```
COPY failed: file not found in build context
```

**Solution:**
Make sure **Root Directory** is set correctly:
- Backend: `backend`
- Frontend: `frontend`

---

### **Issue 2: Frontend shows API connection error**

**Error in console:**
```
Failed to load resource: https://video-call-backend-production.up.railway.app/api
```

**Solution:**
1. Check backend is running (visit `/health` endpoint)
2. Verify `REACT_APP_API_URL` matches backend domain
3. **Redeploy frontend** (React bakes env vars into build)

---

### **Issue 3: WebRTC transport fails**

**Error:**
```
SEND TRANSPORT FAILED
```

**Solution:**
1. Check `MEDIASOUP_ANNOUNCED_IP` is set to `${{RAILWAY_PUBLIC_DOMAIN}}`
2. Verify ports 10000-10100 are exposed in Dockerfile
3. Railway **free tier supports UDP** ✅ (unlike Render)

---

### **Issue 4: Database connection timeout**

**Error:**
```
Error: Connection terminated unexpectedly
```

**Solution:**
1. Verify `DATABASE_URL` is correct (check Neon dashboard)
2. Ensure Neon database is active (not paused)
3. Check Railway IP is allowed in Neon (should allow all by default)

---

## 🎯 **Docker vs Regular Deploy Comparison**

| Aspect | Regular | Docker | Winner |
|--------|---------|--------|--------|
| First deploy time | 2-3 min | 5-7 min | Regular |
| Rebuild time | 1-2 min | 2-3 min | Regular |
| Consistency | ⚠️ Variable | ✅ Identical | **Docker** |
| Debugging | 🔍 Harder | ✅ Easier | **Docker** |
| Custom config | ❌ Limited | ✅ Full control | **Docker** |
| Production ready | ⚠️ Maybe | ✅ Yes | **Docker** |

**Verdict:** Docker is better for production! 🏆

---

## 🚀 **Advanced: Multi-Stage Builds**

Your Dockerfiles use **multi-stage builds** for optimization:

### **Backend Dockerfile stages:**
1. `base` - Install system dependencies
2. `dependencies` - Install npm packages
3. `prod-dependencies` - Production-only packages
4. `build` - Create directories
5. `production` - Final optimized image (< 200MB)

### **Frontend Dockerfile stages:**
1. `base` - Node.js base
2. `dependencies` - Install npm packages
3. `build` - Build React app
4. `production` - Nginx serving static files (< 50MB)

**Benefits:**
- ⚡ Smaller image size (faster deploys)
- 🔒 More secure (no dev dependencies)
- 🚀 Better performance (optimized layers)

---

## 📝 **Local Docker Testing**

Before deploying to Railway, test locally:

```powershell
# Build and start all services
docker-compose up --build

# Or in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

**Access locally:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

---

## ✅ **Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Backend Dockerfile optimized
- [ ] Frontend Dockerfile optimized  
- [ ] nginx.conf created for frontend
- [ ] .dockerignore files added
- [ ] Backend service created on Railway
- [ ] Backend environment variables added
- [ ] Backend domain generated
- [ ] Frontend service created on Railway
- [ ] Frontend build-time env vars added (with backend URL)
- [ ] Frontend domain generated
- [ ] Backend CORS updated with frontend URL
- [ ] Both services deployed successfully
- [ ] Health checks passing
- [ ] Test login and video call

---

## 🎉 **Success!**

Your Docker-based deployment on Railway is now:
- ✅ **Production-ready**
- ✅ **Scalable**
- ✅ **Consistent**
- ✅ **Easy to debug**
- ✅ **Fully under your control**

**Next Steps:**
1. Test all features (login, video call, chat, whiteboard)
2. Monitor logs for errors
3. Set up custom domain (optional)
4. Configure CI/CD (optional)

**Your app is live! 🚀**

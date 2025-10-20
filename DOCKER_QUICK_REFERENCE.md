# 🚂 Railway Docker - Quick Reference Card

## 📦 **What We Have**

```
video-call-module/
├── backend/
│   ├── Dockerfile ✅ (Multi-stage, optimized)
│   ├── .dockerignore ✅ (Smaller builds)
│   └── src/server.js (Entry point)
├── frontend/
│   ├── Dockerfile ✅ (React + Nginx)
│   ├── .dockerignore ✅ (Smaller builds)
│   └── nginx.conf ✅ (Production config)
└── docker-compose.yml ✅ (Local testing)
```

---

## ⚡ **3-Step Railway Deployment**

### **1️⃣ Push Code**
```powershell
git add .
git commit -m "Docker deployment setup"
git push origin main
```

### **2️⃣ Deploy Backend**
Railway Dashboard:
- New Project → GitHub Repo → `video-module`
- Root Directory: `backend`
- Add Environment Variables (see below)
- Generate Domain → Copy URL

### **3️⃣ Deploy Frontend**
Same project:
- New Service → GitHub Repo → `video-module`  
- Root Directory: `frontend`
- Add Environment Variables (with backend URL)
- Generate Domain → Done! ✅

---

## 🔐 **Environment Variables**

### **Backend (11 variables)**
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
```

### **Frontend (2 variables - BUILD TIME!)**
```bash
REACT_APP_API_URL=https://YOUR-BACKEND.up.railway.app
REACT_APP_SOCKET_URL=https://YOUR-BACKEND.up.railway.app
```

**Replace** `YOUR-BACKEND` with your actual backend domain!

---

## 🎯 **Service Settings**

### **Backend Service**
- **Name**: `video-call-backend`
- **Root Directory**: `backend`
- **Dockerfile**: Auto-detected ✅
- **Port**: `5000`
- **Health Check**: `/health`

### **Frontend Service**
- **Name**: `video-call-frontend`
- **Root Directory**: `frontend`
- **Dockerfile**: Auto-detected ✅
- **Port**: `8080` (nginx)
- **Health Check**: `/health`

---

## ✅ **Verification**

### **Backend Health Check**
```
https://YOUR-BACKEND.up.railway.app/health
Response: {"status":"ok"}
```

### **Frontend Access**
```
https://YOUR-FRONTEND.up.railway.app
Should show: Login page
```

### **Logs Check**
Railway → Deployments → View Logs

**Backend:**
```
✅ PostgreSQL connected
✅ Mediasoup initialized
🚀 Server running on port 5000
```

**Frontend:**
```
nginx: [notice] start worker processes
```

---

## 🐛 **Common Issues**

| Error | Solution |
|-------|----------|
| "Cannot find module" | Set Root Directory correctly |
| "API connection failed" | Check REACT_APP_API_URL matches backend |
| "Build failed" | Check .dockerignore not excluding needed files |
| "WebRTC transport fails" | Verify MEDIASOUP_ANNOUNCED_IP set |
| "Database timeout" | Check DATABASE_URL and Neon is active |

---

## 🚀 **Why Docker on Railway?**

✅ **Consistent** - Same environment everywhere  
✅ **Reliable** - No platform-specific issues  
✅ **Debuggable** - Easy to reproduce locally  
✅ **Production-ready** - Battle-tested setup  
✅ **Optimized** - Multi-stage builds = smaller images  

---

## 🧪 **Local Testing**

```powershell
# Test before deploying
docker-compose up --build

# Access:
http://localhost:3000  # Frontend
http://localhost:5000  # Backend

# Stop:
docker-compose down
```

---

## 📊 **Deployment Flow**

```
┌─────────────┐
│ 1. Git Push │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│ 2. Railway Auto-Deploy  │
│    - Detects Dockerfile │
│    - Builds image       │
│    - Runs container     │
└──────┬──────────────────┘
       │
┌──────▼──────────┐
│ 3. Service Live │
│    ✅ Backend    │
│    ✅ Frontend   │
└─────────────────┘
```

---

## 🎉 **Success Criteria**

- [ ] Both services deployed
- [ ] Health checks passing
- [ ] Can access frontend
- [ ] Can login
- [ ] Video call works
- [ ] No console errors

**All green? You're live! 🚀**

---

## 📚 **Full Documentation**

See: `RAILWAY_DOCKER_DEPLOYMENT.md` for complete guide

---

## 💡 **Pro Tips**

1. **Always test locally first** with docker-compose
2. **Use Railway CLI** for faster deployments: `railway up`
3. **Enable health checks** for auto-recovery
4. **Monitor logs** in Railway dashboard
5. **Update CORS** after frontend is deployed

---

## 🆘 **Need Help?**

1. Check logs: Railway → Deployments → View Logs
2. Verify environment variables are set
3. Test locally: `docker-compose up`
4. Review: `RAILWAY_DOCKER_DEPLOYMENT.md`

**Railway Discord:** https://discord.gg/railway  
**Railway Docs:** https://docs.railway.app

---

**Docker + Railway = Production Ready! 🎯**

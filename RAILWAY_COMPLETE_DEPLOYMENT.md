# 🚂 Complete Railway Deployment Guide

## 📋 Overview

This guide will help you deploy **BOTH backend and frontend** on Railway in under 10 minutes.

**What you'll deploy:**
- ✅ Backend (Node.js + MediaSoup + PostgreSQL)
- ✅ Frontend (React app)
- ✅ Full WebRTC support (works on Railway!)

---

## 🎯 Prerequisites

- ✅ GitHub account with your code pushed
- ✅ Railway account (sign up at https://railway.app)
- ✅ $5 free credit on Railway (automatically provided)

---

## 🚀 PART 1: Deploy Backend (5 minutes)

### **Step 1: Create New Project**

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose repository: `sourav1109/video-module`
5. Project name: `video-call-backend`

### **Step 2: Configure Service Settings**

Click on the deployed service → **Settings** tab:

**Root Directory:**
```
/backend
```

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node src/server.js
```

**Deployment Trigger:** Keep as `main` branch

### **Step 3: Add Environment Variables**

Click **"Variables"** tab → **"+ New Variable"** → Add these **ONE BY ONE**:

```env
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

**⚠️ IMPORTANT:** 
- Use `${{RAILWAY_PUBLIC_DOMAIN}}` for `MEDIASOUP_ANNOUNCED_IP` - Railway will auto-replace it
- We'll update `CORS_ORIGIN` after frontend deployment

### **Step 4: Generate Public Domain**

1. Go to **Settings** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://video-call-backend-production-xyz.up.railway.app`)

### **Step 5: Trigger Deployment**

1. Click **"Deployments"** tab
2. Click **"Deploy"** button
3. Wait for deployment (1-2 minutes)

**Expected logs:**
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized with 4 workers
🚀 Video Call Server running on port 5000
```

**✅ Backend URL:** Copy and save this URL - you'll need it for frontend!

---

## 🎨 PART 2: Deploy Frontend (5 minutes)

### **Step 1: Create Frontend Service**

1. Railway Dashboard → Click **"+ New"**
2. Select **"Empty Service"**
3. Click the new service → **"Settings"**
4. Connect to same GitHub repo: `sourav1109/video-module`
5. Service name: `video-call-frontend`

### **Step 2: Configure Frontend Settings**

In **Settings** tab:

**Root Directory:**
```
/frontend
```

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npx serve -s build -l $PORT
```

**Install Command:**
```bash
npm install -g serve && npm install
```

### **Step 3: Add Frontend Environment Variables**

Click **"Variables"** tab → Add these (replace with your backend URL):

```env
NODE_ENV=production
REACT_APP_API_URL=https://video-call-backend-production-xyz.up.railway.app
REACT_APP_SOCKET_URL=https://video-call-backend-production-xyz.up.railway.app
GENERATE_SOURCEMAP=false
```

**⚠️ Replace** `video-call-backend-production-xyz.up.railway.app` with your actual backend Railway URL from Part 1!

### **Step 4: Generate Frontend Domain**

1. Settings → **"Networking"** 
2. Click **"Generate Domain"**
3. Copy the frontend URL (e.g., `https://video-call-frontend-production-abc.up.railway.app`)

### **Step 5: Deploy Frontend**

1. Click **"Deployments"** tab
2. Click **"Deploy"**
3. Wait 2-3 minutes for build to complete

**Expected logs:**
```
> video-call-frontend@1.0.0 build
> react-scripts build
Creating an optimized production build...
Compiled successfully!
```

---

## 🔗 PART 3: Connect Backend & Frontend

### **Update Backend CORS**

1. Go to **backend service** on Railway
2. Click **"Variables"** tab
3. Find `CORS_ORIGIN` variable
4. Update value to your frontend URL:
   ```
   https://video-call-frontend-production-abc.up.railway.app
   ```
5. Service will auto-redeploy (30 seconds)

---

## ✅ PART 4: Test Your Deployment

### **1. Test Backend Health**

Visit: `https://your-backend-url.railway.app/api/video-call/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z"
}
```

### **2. Test Frontend**

1. Open: `https://your-frontend-url.railway.app`
2. Should see login/register page
3. No console errors (F12 to check)

### **3. Test Complete Flow**

#### **As Teacher:**
1. Register/Login as teacher
2. Create a live class
3. Click "Start Class"
4. Allow camera/microphone
5. ✅ You should see your video!

#### **As Student (Incognito Window):**
1. Open incognito: `Ctrl+Shift+N`
2. Go to your frontend URL
3. Register/Login as student
4. Click "Join" on the live class
5. Allow camera/microphone
6. ✅ You should see teacher's video AND yours!

---

## 🎉 Success Checklist

- [ ] Backend deployed and shows "Live" status
- [ ] Backend URL accessible (returns JSON or 404 is OK)
- [ ] Frontend deployed and shows "Live" status  
- [ ] Frontend URL loads the login page
- [ ] No console errors on frontend
- [ ] Can register new users
- [ ] Can login successfully
- [ ] Teacher can create and start classes
- [ ] Student can see and join classes
- [ ] **VIDEO STREAMING WORKS** ⭐

---

## 🔧 Troubleshooting

### **Backend Issues**

#### **Issue: Deployment keeps crashing**
**Check Deploy Logs:**
```
Railway Dashboard → Backend Service → Deployments → Latest → Deploy Logs
```

**Common fixes:**
- Ensure `DATABASE_URL` is correct (copy from Neon dashboard)
- Check `MEDIASOUP_ANNOUNCED_IP` is set to `${{RAILWAY_PUBLIC_DOMAIN}}`
- Verify start command: `node src/server.js`
- Root directory: `/backend`

#### **Issue: "Cannot find module" errors**
**Solution:** Update build command to:
```bash
npm ci --production
```

#### **Issue: Database connection timeout**
**Add variable:**
```env
DATABASE_CONNECTION_TIMEOUT=30000
```

### **Frontend Issues**

#### **Issue: White screen on frontend**
**Check Browser Console (F12):**
- If you see CORS errors → Update backend `CORS_ORIGIN`
- If you see API connection errors → Check `REACT_APP_API_URL`

**Fix:** Make sure environment variables are exact:
```env
REACT_APP_API_URL=https://your-exact-backend-url.up.railway.app
REACT_APP_SOCKET_URL=https://your-exact-backend-url.up.railway.app
```

#### **Issue: Build fails with memory error**
**Add variable:**
```env
NODE_OPTIONS=--max-old-space-size=4096
```

### **WebRTC Issues**

#### **Issue: Video not connecting**
**Check these variables on backend:**
```env
MEDIASOUP_ANNOUNCED_IP=${{RAILWAY_PUBLIC_DOMAIN}}
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

**Railway automatically opens these ports!** ✅

#### **Issue: "Send transport failed"**
**Solution:** Railway supports UDP, so this should work. If not:
1. Redeploy backend
2. Check logs for port binding errors
3. Ensure `MEDIASOUP_ANNOUNCED_IP` is the Railway domain (not IP address)

---

## 📊 Railway Configuration Summary

### **Backend Service**
| Setting | Value |
|---------|-------|
| Root Directory | `/backend` |
| Build Command | `npm install` |
| Start Command | `node src/server.js` |
| Node Version | 18+ (auto-detected) |
| Health Check | `/api/video-call/health` |

### **Frontend Service**
| Setting | Value |
|---------|-------|
| Root Directory | `/frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx serve -s build -l $PORT` |
| Node Version | 18+ (auto-detected) |

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 credit per month (FREE)
- Enough for ~500 hours of server runtime
- **Perfect for development and testing!**

**Usage Monitor:**
Railway Dashboard → Project → **"Usage"** tab

---

## 🔄 Continuous Deployment

**Auto-deploy is enabled by default!**

When you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. ✅ Detect the push
2. ✅ Auto-build backend
3. ✅ Auto-build frontend
4. ✅ Deploy both services
5. ✅ Zero downtime!

---

## 🌐 Custom Domain (Optional)

Want to use your own domain?

1. Railway Dashboard → Service → **Settings**
2. Scroll to **"Networking"**
3. Click **"Add Custom Domain"**
4. Enter: `api.yourdomain.com` (backend) or `app.yourdomain.com` (frontend)
5. Add the CNAME record to your DNS provider
6. Wait 5-10 minutes for DNS propagation

---

## 📝 Environment Variables Reference

### **Backend Variables (Required)**
```env
NODE_ENV=production                    # Production mode
PORT=5000                              # Railway sets this automatically
DATABASE_URL=postgresql://...          # Your Neon PostgreSQL URL
JWT_SECRET=your-secret-key             # Change this in production!
JWT_EXPIRE=7d                          # Token expiration
USE_REDIS=false                        # Disable Redis (not needed on Railway)
CORS_ORIGIN=https://frontend-url       # Your frontend Railway URL
MEDIASOUP_WORKER_COUNT=4               # Number of MediaSoup workers
MEDIASOUP_MIN_PORT=10000               # WebRTC port range start
MEDIASOUP_MAX_PORT=10100               # WebRTC port range end
MEDIASOUP_ANNOUNCED_IP=${{RAILWAY_PUBLIC_DOMAIN}}  # Critical for WebRTC!
TRUST_PROXY=1                          # Trust Railway proxy
```

### **Frontend Variables (Required)**
```env
NODE_ENV=production                    # Production mode
REACT_APP_API_URL=https://backend-url  # Your backend Railway URL
REACT_APP_SOCKET_URL=https://backend-url  # Same as API URL
GENERATE_SOURCEMAP=false               # Faster builds
```

---

## ✅ Final Checklist

Before going live:

- [ ] Both services show "Live" status in Railway
- [ ] Backend logs show "Server running on port 5000"
- [ ] Frontend loads without errors
- [ ] CORS configured correctly (frontend URL in backend)
- [ ] Environment variables all set
- [ ] Database connected successfully
- [ ] WebRTC video streaming works
- [ ] Chat functionality works
- [ ] Whiteboard works (if applicable)
- [ ] Tested with multiple users
- [ ] Mobile responsive (test on phone)

---

## 🎯 Quick Commands Reference

### **Check Service Status**
```bash
# In Railway Dashboard
Services → Click service → View logs
```

### **Restart Service**
```bash
# In Railway Dashboard
Deployments → Latest deployment → "⋮" menu → Restart
```

### **View Environment Variables**
```bash
# In Railway Dashboard
Variables tab → View all variables
```

### **Manual Redeploy**
```bash
# In Railway Dashboard
Deployments tab → "Deploy" button
```

---

## 🆘 Getting Help

**Still stuck?**

1. **Check Railway Logs:**
   - Dashboard → Service → Deployments → Latest → Logs
   - Look for red error messages

2. **Common Error Messages:**
   - `EADDRINUSE` → Port already in use (Railway handles this)
   - `MODULE_NOT_FOUND` → Check root directory and start command
   - `Database connection error` → Verify DATABASE_URL
   - `CORS error` → Update CORS_ORIGIN with correct frontend URL

3. **Railway Discord:**
   - https://discord.gg/railway
   - Very responsive community!

---

## 🎉 Congratulations!

Your video call application is now live on Railway! 🚂

**Share your URLs:**
- Backend: `https://your-backend.up.railway.app`
- Frontend: `https://your-frontend.up.railway.app`

**Next steps:**
- Test with real users
- Monitor Railway usage dashboard
- Consider upgrading if you exceed free tier
- Add custom domain for professional look

---

**Made with ❤️ for seamless video call deployment!**

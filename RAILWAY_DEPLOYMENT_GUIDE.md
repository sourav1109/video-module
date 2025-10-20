# 🚂 Railway.app Deployment Guide - Complete WebRTC Solution

## ✅ **Why Railway for This Project?**
- ✅ UDP ports work (WebRTC compatible!)
- ✅ $5 FREE credit = 500 hours/month
- ✅ Auto-deploy from GitHub
- ✅ PostgreSQL database included (or use your Neon DB)
- ✅ Simple environment variables
- ✅ Custom domains
- ✅ **No credit card required for FREE tier!**

**Expected Result:** Your video call app will work **100% perfectly** with video/audio streaming!

---

## 📋 **Prerequisites**
- ✅ GitHub account (already have)
- ✅ GitHub repository: `sourav1109/video-module` (already done)
- ✅ Neon PostgreSQL database (already have)

---

## 🚀 **Step-by-Step Deployment (15 minutes)**

### **Step 1: Sign Up for Railway**

1. Go to: **https://railway.app**
2. Click: **"Login"** (top right)
3. Click: **"Login with GitHub"**
4. Authorize Railway to access your GitHub
5. ✅ You get **$5 FREE credit** = 500 hours/month!

---

### **Step 2: Create New Project**

1. Click: **"New Project"** (purple button)
2. Select: **"Deploy from GitHub repo"**
3. If prompted, click **"Configure GitHub App"**
   - Select: **"Only select repositories"**
   - Choose: **`sourav1109/video-module`**
   - Click: **"Save"**
4. Back on Railway, select: **`video-module`**

---

### **Step 3: Deploy Backend**

1. Railway will detect your repo
2. Click: **"Add a service"**
3. Select: **"GitHub Repo"**
4. Choose: **`sourav1109/video-module`**

#### **Configure Backend Service:**

1. Click on the service card
2. Go to: **"Settings"** tab
3. **Service Name:** Change to `backend`
4. **Root Directory:** Change to `/backend`
5. **Build Command:** Leave as `npm install`
6. **Start Command:** Change to `npm start`
7. **Watch Paths:** Set to `backend/**`

#### **Add Environment Variables:**

1. Still in **"Settings"** → Click **"Variables"** tab
2. Click **"+ New Variable"** for each:

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
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

3. Click **"Add"** after each variable

#### **Generate Public URL:**

1. Go to: **"Settings"** → **"Networking"**
2. Click: **"Generate Domain"**
3. **Copy the URL** (e.g., `backend-production-abc123.up.railway.app`)
4. Go back to **"Variables"** tab
5. Add these 2 MORE variables:

```bash
MEDIASOUP_ANNOUNCED_IP=backend-production-abc123.up.railway.app
CORS_ORIGIN=*
```
**(Replace with YOUR actual backend domain!)**

6. Click **"Deploy"** if not auto-deployed

**Wait 2-3 minutes for deployment...**

✅ **Backend Status:** Should show "Active" with green dot

---

### **Step 4: Deploy Frontend**

1. Go back to **Project** view (click project name at top)
2. Click: **"+ New"**
3. Select: **"GitHub Repo"**
4. Choose: **`sourav1109/video-module`** again

#### **Configure Frontend Service:**

1. Click on the new service card
2. Go to: **"Settings"** tab
3. **Service Name:** Change to `frontend`
4. **Root Directory:** Change to `/frontend`
5. **Build Command:** Change to `npm install && npm run build`
6. **Start Command:** Change to `npx serve -s build -p $PORT`
7. **Watch Paths:** Set to `frontend/**`

#### **Add Environment Variables:**

1. Go to **"Variables"** tab
2. Add these variables (use YOUR backend URL from Step 3):

```bash
REACT_APP_API_URL=https://backend-production-abc123.up.railway.app
REACT_APP_SOCKET_URL=https://backend-production-abc123.up.railway.app
```

**(Replace with YOUR actual backend domain!)**

#### **Generate Public URL:**

1. Go to: **"Settings"** → **"Networking"**
2. Click: **"Generate Domain"**
3. **Copy the URL** (e.g., `frontend-production-xyz789.up.railway.app`)
4. **Open this URL in browser!**

**Wait 3-5 minutes for build...**

✅ **Frontend Status:** Should show "Active" with green dot

---

### **Step 5: Update CORS (Important!)**

1. Go back to **backend service**
2. Go to **"Variables"** tab
3. Find `CORS_ORIGIN` variable
4. **Edit** it to your frontend URL:

```bash
CORS_ORIGIN=https://frontend-production-xyz789.up.railway.app
```

5. Service will auto-redeploy (wait 1 minute)

---

## 🧪 **Step 6: Test Your App!**

### **Test 1: Backend Health Check**
1. Open: `https://YOUR-BACKEND-URL.up.railway.app/`
2. Should see: `Cannot GET /` (this is normal!)
3. Check Railway logs:
   - Backend service → "Deployments" → Click latest
   - Should see: `✅ Mediasoup SFU Service initialized`

### **Test 2: Frontend**
1. Open: `https://YOUR-FRONTEND-URL.up.railway.app`
2. Should see: Login/Register page
3. **Register as Teacher:**
   - Email: `teacher@test.com`
   - Password: `password123`
   - Name: `Test Teacher`
   - Role: **Teacher**

### **Test 3: Video Call (CRITICAL!)**

1. **Teacher creates class:**
   - Click "Schedule Class"
   - Fill details → Submit
   - Click "Start" on created class
   - **Allow camera/microphone**
   - ✅ You should see YOUR VIDEO!

2. **Student joins (Incognito):**
   - Press `Ctrl+Shift+N` (incognito)
   - Go to frontend URL
   - Register as student:
     - Email: `student@test.com`
     - Password: `password123`
     - Role: **Student**
   - Click "Join" on live class
   - **Allow camera/microphone**
   - ✅ You should see TEACHER VIDEO + YOUR VIDEO!

### **Expected Console Logs (F12):**
```
✅ Connected to scalable backend
✅ Send transport created successfully
✅ Receive transport created successfully
✅ Local media obtained
✅ video track produced successfully
✅ audio track produced successfully
📡 [SendTransport] connectionstatechange -> connected  ← THIS IS CRITICAL!
```

**If you see:**
```
❌ SEND TRANSPORT FAILED
```
Then WebRTC is still failing (unlikely on Railway)

---

## 🔧 **Troubleshooting**

### **Issue: Build Failed**

**Backend:**
```bash
# Check Railway logs for errors
# Common fix: Update package.json engine

# Add to backend/package.json:
"engines": {
  "node": ">=18.0.0"
}
```

**Frontend:**
```bash
# Increase build memory
# In Railway Settings → Variables:
NODE_OPTIONS=--max-old-space-size=4096
```

### **Issue: Backend crashes**

1. Check Railway logs: Backend → Deployments → Latest
2. Look for error messages
3. Common issues:
   - Database connection: Check `DATABASE_URL`
   - Port binding: Should be `process.env.PORT`

### **Issue: CORS errors**

1. Backend Variables → Check `CORS_ORIGIN`
2. Should match frontend URL EXACTLY
3. Or use `*` for testing:
   ```
   CORS_ORIGIN=*
   ```

### **Issue: WebRTC still failing**

1. Check backend logs for:
   ```
   ✅ Mediasoup SFU Service initialized with X workers
   ```
2. Check `MEDIASOUP_ANNOUNCED_IP` matches backend domain
3. Test locally first (see LOCAL_TESTING_GUIDE.md)

---

## 💰 **Free Tier Limits**

Railway FREE tier includes:
- ✅ **$5 credit/month**
- ✅ **500 execution hours** (20+ days of uptime)
- ✅ **100 GB egress** (bandwidth)
- ✅ **All ports open** (WebRTC works!)

**Your usage:**
- Backend: ~720 hours/month (always on)
- Frontend: Minimal (static serving)

**Cost estimate:** ~$3-4/month (uses $5 credit = FREE!)

**Tip:** If you exceed free tier, Railway will just pause services until next month.

---

## 🎨 **Custom Domain (Optional)**

Want `videocall.yourdomain.com` instead of Railway URL?

1. Buy domain from Namecheap/GoDaddy (or use existing)
2. Railway → Frontend → Settings → Networking
3. Click "Custom Domain"
4. Add your domain: `videocall.yourdomain.com`
5. Copy CNAME record
6. Add to your domain's DNS:
   ```
   Type: CNAME
   Name: videocall
   Value: [Railway CNAME]
   ```
7. Wait 5-60 minutes for DNS propagation

✅ Now access at: `https://videocall.yourdomain.com`

---

## 🔄 **Auto-Deploy from GitHub**

Railway automatically redeploys when you push to GitHub!

```powershell
# Make code changes
git add .
git commit -m "Update feature"
git push origin main

# Railway will:
# 1. Detect push
# 2. Rebuild services
# 3. Deploy automatically
# ✅ Live in 2-3 minutes!
```

---

## 📊 **Monitoring**

### **View Logs:**
1. Railway → Service → "Deployments"
2. Click latest deployment
3. Real-time logs appear

### **Resource Usage:**
1. Railway → Service → "Metrics"
2. See CPU, RAM, Network usage

### **Set Alerts:**
1. Railway → Project Settings → "Alerts"
2. Get notified on Slack/Email

---

## ✅ **Success Checklist**

After deployment, verify:

- [ ] Backend shows "Active" status
- [ ] Frontend shows "Active" status  
- [ ] Backend URL opens (shows error page - normal)
- [ ] Frontend URL shows login page
- [ ] Can register teacher account
- [ ] Can create live class
- [ ] Can start class and see OWN video
- [ ] Can register student (incognito)
- [ ] Student can join class
- [ ] Student sees teacher video
- [ ] Teacher sees student video
- [ ] Chat works
- [ ] No WebRTC transport errors in console

**All checked?** 🎉 **Deployment successful!**

---

## 🆘 **Need Help?**

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app
- Status: https://railway.statuspage.io

**Your Logs Location:**
- Railway Dashboard → Service → Deployments → Click latest

**Common Issues:**
1. WebRTC fails → Check `MEDIASOUP_ANNOUNCED_IP`
2. CORS error → Check `CORS_ORIGIN` matches frontend
3. 502 error → Backend crashed, check logs
4. Build fails → Check `package.json` engines

---

## 🎯 **Next Steps After Deployment**

1. ✅ Test all features (video, audio, chat, whiteboard)
2. ✅ Share frontend URL with testers
3. ✅ Monitor Railway metrics
4. ✅ Add custom domain (optional)
5. ✅ Set up alerts for downtime
6. ✅ Upgrade to paid tier if needed ($5-10/month)

**Railway FREE tier should be enough for 100-200 concurrent users!**

---

## 🔥 **Why Railway is Better than Render for This Project**

| Feature | Railway | Render Free |
|---------|---------|-------------|
| WebRTC/UDP Support | ✅ **Works!** | ❌ Blocked |
| MediaSoup | ✅ **Works!** | ❌ Fails |
| Free Tier | $5 credit | Limited hours |
| Auto-deploy | ✅ Yes | ✅ Yes |
| Easy setup | ✅ 15 min | ✅ 15 min |
| Video streaming | ✅ **Perfect!** | ❌ **Broken** |

**Bottom line:** Railway solves your WebRTC problem instantly!

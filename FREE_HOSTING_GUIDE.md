# 🌐 FREE HOSTING GUIDE - Live Video Call App

## 🎯 Best Free Hosting Options

Your app has 3 components:
1. **Backend** (Node.js + Socket.IO + Mediasoup)
2. **Frontend** (React)
3. **Database** (Already on Neon - FREE ✅)

---

## ⭐ RECOMMENDED: Railway + Vercel (100% FREE)

### Why This Combo?
- ✅ **Completely FREE**
- ✅ **Easy deployment** (5 minutes each)
- ✅ **HTTPS automatically**
- ✅ **Global CDN**
- ✅ **No credit card required**
- ✅ **Supports WebRTC**

---

## 🚂 OPTION 1: Railway (Backend) + Vercel (Frontend)

### Part A: Deploy Backend to Railway

**Railway Free Tier:**
- ✅ $5 free credits/month
- ✅ Enough for small-medium usage
- ✅ HTTPS included
- ✅ WebSocket support
- ✅ No credit card needed initially

**Steps:**

1. **Create Railway Account:**
   - Go to: https://railway.app
   - Sign up with GitHub (free)

2. **Deploy Backend:**
   ```bash
   # In your backend folder
   cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
   
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

3. **Add Environment Variables:**
   - Go to Railway dashboard → Your project → Variables
   - Add these:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=your-super-secret-key-change-this
   PORT=5000
   NODE_ENV=production
   USE_REDIS=false
   ```

4. **Get Your Backend URL:**
   - Railway will give you: `https://your-app.railway.app`
   - Copy this URL!

### Part B: Deploy Frontend to Vercel

**Vercel Free Tier:**
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy from Git
- ✅ No credit card required

**Steps:**

1. **Update Frontend Config:**
   - Edit `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://your-app.railway.app
   REACT_APP_SOCKET_URL=https://your-app.railway.app
   ```

2. **Push to GitHub:**
   ```bash
   cd C:\Users\hp\Desktop\vcfinal\video-call-module-
   git add .
   git commit -m "Prepare for deployment"
   git push origin master
   ```

3. **Deploy to Vercel:**
   - Go to: https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory: `frontend`
   - Click "Deploy"

4. **Done!** Your app is live at: `https://your-app.vercel.app`

---

## 🎨 OPTION 2: Render (Backend + Frontend)

**Render Free Tier:**
- ✅ Completely free
- ✅ 750 hours/month
- ✅ Auto-deploy from Git
- ✅ HTTPS included
- ⚠️ Sleeps after 15 min inactivity (wakes up in ~30s)

**Steps:**

1. **Create `render.yaml` in root:**

```yaml
services:
  # Backend
  - type: web
    name: video-call-backend
    env: node
    region: singapore
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 5000

  # Frontend
  - type: web
    name: video-call-frontend
    env: static
    region: singapore
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/build
    envVars:
      - key: REACT_APP_API_URL
        fromService:
          name: video-call-backend
          type: web
          property: url
```

2. **Push to GitHub**

3. **Deploy on Render:**
   - Go to: https://render.com
   - Sign up with GitHub
   - Click "New Blueprint Instance"
   - Select your repository
   - Render auto-deploys both services!

---

## 🐋 OPTION 3: Heroku (Easiest, but Limited)

**Heroku Free Tier:**
- ⚠️ **No longer truly free** (requires credit card)
- ✅ $5/month Eco Dynos
- ✅ 1000 free hours/month
- ✅ Very easy to use

**Steps:**

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   heroku login
   heroku create your-video-call-backend
   heroku addons:create heroku-postgresql:mini
   git push heroku master
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   heroku create your-video-call-frontend
   heroku buildpacks:set mars/create-react-app
   git push heroku master
   ```

---

## 🆓 OPTION 4: Free Combination Setup

### Backend: Railway ($5 free credits)
### Frontend: Cloudflare Pages (Unlimited free)
### Database: Neon (512MB free) ✅ Already set up!

**Cloudflare Pages Setup:**

1. Go to: https://pages.cloudflare.com
2. Sign up (free)
3. Connect GitHub
4. Select your repository
5. Build settings:
   - Framework: Create React App
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/build`
6. Deploy!

---

## 📋 DEPLOYMENT CHECKLIST:

### Before Deploying:

- [ ] **Database ready** (Neon) ✅ Already done!
- [ ] **Update CORS** in `backend/src/server.js`:
  ```javascript
  origin: [
    'https://your-frontend-url.vercel.app',
    'https://your-frontend-url.pages.dev',
    'http://localhost:3000' // for testing
  ]
  ```

- [ ] **Update Socket.IO CORS** in `backend/src/services/SocketService.js`:
  ```javascript
  cors: {
    origin: [
      'https://your-frontend-url.vercel.app',
      'https://your-frontend-url.pages.dev'
    ],
    credentials: true
  }
  ```

- [ ] **Set production environment variables**
- [ ] **Test locally first**
- [ ] **Commit and push to GitHub**

### After Deploying:

- [ ] Test login functionality
- [ ] Test class creation
- [ ] Test video call from 2 devices
- [ ] Check camera/mic permissions
- [ ] Test from mobile devices

---

## 🎥 TURN/STUN Servers (For Better Connectivity)

Free STUN servers are included in your code, but for production, consider:

**Free TURN Providers:**
1. **Metered.ca** - 50GB free/month
   - https://www.metered.ca/tools/openrelay/
   
2. **Xirsys** - Free tier available
   - https://xirsys.com

**Add to your Mediasoup config:**
```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'your-username',
    credential: 'your-password'
  }
]
```

---

## 💰 COST COMPARISON:

| Service | Backend | Frontend | Database | Total |
|---------|---------|----------|----------|-------|
| **Railway + Vercel** | $5 credits/mo | FREE | FREE | **$0/mo** |
| **Render** | FREE (sleeps) | FREE | FREE | **$0/mo** |
| **Cloudflare Pages + Railway** | $5 credits/mo | FREE | FREE | **$0/mo** |
| **All Heroku** | $5/mo | $5/mo | FREE | **$10/mo** |

---

## 🚀 MY RECOMMENDATION:

### For Immediate Testing (Next 5 minutes):

**Use ngrok (temporary but instant):**
```bash
# Install ngrok
choco install ngrok

# Run backend on localhost:5000
cd backend
npm start

# In another terminal, tunnel backend
ngrok http 5000

# You get: https://abc123.ngrok.io
# Use this URL in frontend .env
```

**Pros:**
- ✅ Instant (5 minutes)
- ✅ Works immediately
- ✅ Free tier sufficient
- ✅ HTTPS automatically

**Cons:**
- ⚠️ URL changes each time you restart
- ⚠️ Requires ngrok running
- ⚠️ Not for permanent hosting

### For Permanent Free Hosting:

**Best Choice: Railway + Vercel**
- Deploy backend to Railway (10 minutes)
- Deploy frontend to Vercel (5 minutes)
- Both are FREE forever with generous limits
- Professional URLs
- Auto HTTPS
- Great for portfolios

---

## 📝 QUICK DEPLOYMENT SCRIPT:

I can create automated deployment scripts for you. Which option do you prefer?

1. **Railway + Vercel** (Recommended)
2. **Render** (Easiest - single blueprint)
3. **Cloudflare Pages + Railway**
4. **ngrok** (Quickest - for immediate testing)

Let me know and I'll create the exact deployment files and step-by-step commands! 🚀

---

## 🎯 AFTER DEPLOYMENT:

Your app will be accessible from anywhere in the world:
- ✅ Any device with internet
- ✅ Any country
- ✅ Professional HTTPS URL
- ✅ No IP addresses needed
- ✅ Share the link with anyone!

**Example URLs:**
- Frontend: `https://sgt-lms-video.vercel.app`
- Backend: `https://sgt-lms-backend.railway.app`

Anyone can access and start a video call! 🌍🎥

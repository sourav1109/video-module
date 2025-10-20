# 🚀 FIX: Deploy Fresh from Blueprint

Render is trying to build Docker instead of using the blueprint. Here's how to fix it:

## Step 1: Delete Old Services (IMPORTANT!)

1. Go to: https://dashboard.render.com
2. Click on each failed service (`video-call-backend`, `video-call-frontend`)
3. Go to **Settings** tab
4. Scroll to bottom → Click **"Delete Service"**
5. Confirm deletion (do both services)

**This is necessary** because the old services are configured as Docker services, not blueprint services.

---

## Step 2: Create Fresh Deployment from Blueprint

1. Go to: https://dashboard.render.com
2. Click: **"New +"**
3. Click: **"Blueprint"**
4. Click: **"Connect GitHub"**
5. Select your repo: `sourav1109/video-module`
6. Keep branch as: `main`
7. Click: **"Apply"**

Render will now:
- Read the `render.yaml` file
- Create backend service (Node.js runtime)
- Create frontend service (static site)
- Build both automatically

---

## Step 3: Wait for Build (5-10 minutes)

Watch the logs as it builds:
- Backend: npm install + npm start
- Frontend: npm install + npm run build

Both should go 🟢 **Green**

---

## Step 4: Add DATABASE_URL

Once backend is green:

1. Click on: `video-call-backend` service
2. Go to: **Environment** tab
3. Click: **"Add Environment Variable"**
4. Key: `DATABASE_URL`
5. Value: `postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
6. Click: **"Save"**

Backend will auto-restart with the database connection.

---

## Step 5: Test and Share!

Once both services are 🟢 green:

1. Open frontend URL: `https://video-call-frontend-XXXX.onrender.com`
2. Register and create a room
3. Share the URL with your friend from another state
4. They can join and video call! 🎉

---

**Key Points:**
- ✅ Delete old Docker-based services
- ✅ Create fresh blueprint deployment
- ✅ Render reads render.yaml automatically
- ✅ Services deploy as native runtimes (Node.js + Static)
- ✅ No Docker confusion

**Let me know once you delete the services and I'll verify the blueprint deployment!**

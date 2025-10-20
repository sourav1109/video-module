# 🎯 RENDER DASHBOARD - EXACT STEPS TO FIX WEBRTC

## 📍 **Current Location**
You are here: Render Dashboard → Services

---

## 🎬 **Step-by-Step Instructions**

### **STEP 1: Navigate to Backend Service**
```
1. Look for service named: "video-call-backend"
2. Click on it
3. You should see: Overview, Events, Logs, Shell, Settings
```

---

### **STEP 2: Go to Environment Tab**
```
1. Look at LEFT SIDEBAR
2. Click: "Environment"
3. You should see list of existing environment variables
```

---

### **STEP 3: Add First Variable (MOST CRITICAL)**
```
1. Click button: "Add Environment Variable"
2. In "Key" field, type:
   MEDIASOUP_ANNOUNCED_IP

3. In "Value" field, type EXACTLY:
   video-call-backend-nb87.onrender.com

4. Click "Add" or press Enter
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Add Environment Variable                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Key:   [MEDIASOUP_ANNOUNCED_IP              ]  │
│                                                 │
│ Value: [video-call-backend-nb87.onrender.com]  │
│                                                 │
│        [ Cancel ]  [ Add ]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 4: Add Second Variable**
```
1. Click button: "Add Environment Variable" again
2. In "Key" field, type:
   MEDIASOUP_MIN_PORT

3. In "Value" field, type:
   10000

4. Click "Add"
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Add Environment Variable                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Key:   [MEDIASOUP_MIN_PORT                  ]  │
│                                                 │
│ Value: [10000                               ]  │
│                                                 │
│        [ Cancel ]  [ Add ]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 5: Add Third Variable**
```
1. Click button: "Add Environment Variable" again
2. In "Key" field, type:
   MEDIASOUP_MAX_PORT

3. In "Value" field, type:
   10100

4. Click "Add"
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Add Environment Variable                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Key:   [MEDIASOUP_MAX_PORT                  ]  │
│                                                 │
│ Value: [10100                               ]  │
│                                                 │
│        [ Cancel ]  [ Add ]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 6: Update Existing Variable**
```
1. SCROLL through existing variables
2. Find one called: "MEDIASOUP_WORKER_COUNT"
3. Click the "EDIT" icon (pencil) next to it
4. Change value from "8" to "2"
5. Click "Save" or press Enter
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Environment Variables                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ ... (other variables) ...                       │
│                                                 │
│ MEDIASOUP_WORKER_COUNT  [8]  ✏️  🗑️           │
│                             👆 CLICK THIS       │
│                                                 │
│ Then change to:                                 │
│ MEDIASOUP_WORKER_COUNT  [2]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 7: Save All Changes**
```
1. SCROLL to the BOTTOM of the page
2. Look for blue button: "Save Changes"
3. Click it
4. You'll see message: "Deploying..."
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  (All your environment variables listed above)  │
│                                                 │
│                                                 │
│                                                 │
│                    [ Save Changes ]             │
│                          👆                     │
│                    CLICK THIS!                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 8: Wait for Deployment**
```
1. You'll be redirected to "Events" page automatically
2. You'll see: "Deploying..." with spinning icon
3. Wait 30-60 seconds
4. Status will change to: "Live" with green checkmark ✅
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Latest Deploy                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ⏳ Deploying...                                 │
│    Environment variables updated                │
│    Restarting service...                        │
│                                                 │
│         ↓ (wait 60 seconds) ↓                   │
│                                                 │
│ ✅ Live                                         │
│    Deploy successful                            │
│    Oct 20, 2025 at 11:45 AM                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **STEP 9: Verify Changes**
```
1. Go back to "Environment" tab
2. Scroll through variables
3. Confirm you see all 3 new variables:
   ✅ MEDIASOUP_ANNOUNCED_IP = video-call-backend-nb87.onrender.com
   ✅ MEDIASOUP_MIN_PORT = 10000
   ✅ MEDIASOUP_MAX_PORT = 10100
4. Confirm updated variable:
   ✅ MEDIASOUP_WORKER_COUNT = 2 (not 8)
```

---

### **STEP 10: Test Video Call**
```
1. Open new browser tab
2. Go to: https://video-call-frontend-jwku.onrender.com
3. Login as teacher
4. Start a class
5. Turn on video
6. Check browser console (F12):
   - Should see: "✅ Send transport connected"
   - Should see: "✅ Producer created"
7. Your video should appear! 🎥
```

---

## ✅ **Checklist Summary**

```
Before you start:
□ Open: https://dashboard.render.com
□ Locate: video-call-backend service

Steps:
□ Step 1: Click on video-call-backend
□ Step 2: Click "Environment" in left sidebar
□ Step 3: Add MEDIASOUP_ANNOUNCED_IP = video-call-backend-nb87.onrender.com
□ Step 4: Add MEDIASOUP_MIN_PORT = 10000
□ Step 5: Add MEDIASOUP_MAX_PORT = 10100
□ Step 6: Change MEDIASOUP_WORKER_COUNT from 8 to 2
□ Step 7: Click "Save Changes" at bottom
□ Step 8: Wait 60 seconds for "Live" status
□ Step 9: Verify variables in Environment tab
□ Step 10: Test video call in browser

Done! ✅
```

---

## 🎯 **Copy-Paste Values**

**Variable 1:**
```
MEDIASOUP_ANNOUNCED_IP
video-call-backend-nb87.onrender.com
```

**Variable 2:**
```
MEDIASOUP_MIN_PORT
10000
```

**Variable 3:**
```
MEDIASOUP_MAX_PORT
10100
```

**Update Existing:**
```
MEDIASOUP_WORKER_COUNT
2
```

---

## 🔍 **How to Find Render Dashboard**

### **Option A: Direct Link**
```
https://dashboard.render.com
```

### **Option B: Google Search**
```
1. Search: "render dashboard"
2. Click first result: dashboard.render.com
3. Login with your credentials
```

### **Option C: From Email**
```
1. Check email from Render
2. Click "View Dashboard" link
3. Find "video-call-backend" service
```

---

## 🚨 **Common Mistakes to Avoid**

### ❌ **Wrong Service**
```
Don't add to: video-call-FRONTEND
Add to:       video-call-BACKEND ✅
```

### ❌ **Typos in Variable Names**
```
Wrong: MEDIASOUP_ANNOUNCE_IP
Wrong: MEDIASOUP_ANNOUNED_IP
Right: MEDIASOUP_ANNOUNCED_IP ✅
```

### ❌ **Wrong Domain**
```
Wrong: video-call-frontend-jwku.onrender.com
Right: video-call-backend-nb87.onrender.com ✅
```

### ❌ **Forgot to Save**
```
After adding all variables, MUST click "Save Changes" at bottom!
```

---

## 📊 **Final Environment Variables List**

After completing all steps, you should have **14 total variables**:

```
1.  NODE_ENV = production
2.  PORT = 5000
3.  DATABASE_URL = postgresql://neondb_owner...
4.  JWT_SECRET = video-call-super-secret...
5.  JWT_EXPIRE = 7d
6.  USE_REDIS = false
7.  CORS_ORIGIN = https://video-call-frontend-jwku...
8.  MEDIASOUP_ANNOUNCED_IP = video-call-backend-nb87.onrender.com  🆕
9.  MEDIASOUP_MIN_PORT = 10000                                     🆕
10. MEDIASOUP_MAX_PORT = 10100                                     🆕
11. MEDIASOUP_WORKER_COUNT = 2                                     ✏️
12. TRUST_PROXY = 1
13. RATE_LIMIT_WINDOW_MS = 900000
14. RATE_LIMIT_MAX_REQUESTS = 1000
```

**Legend:**
- 🆕 = New variable (just added)
- ✏️ = Updated variable (changed value)

---

## 🎉 **Success Indicators**

### **In Render Dashboard:**
```
✅ All 14 variables listed in Environment tab
✅ Status shows "Live" with green checkmark
✅ Logs show: "Mediasoup SFU Service initialized"
```

### **In Browser (Teacher View):**
```
✅ Local video appears
✅ Console shows: "Send transport connected"
✅ Console shows: "Producer created"
✅ No red errors in console
```

### **In Browser (Student View):**
```
✅ Teacher's video appears
✅ Teacher's audio audible
✅ Console shows: "Receive transport connected"
✅ Console shows: "Consumer created"
```

---

## ⏱️ **Time Breakdown**

- Navigate to Render Dashboard: 30 seconds
- Add 3 variables: 2 minutes
- Update 1 variable: 30 seconds
- Save and wait for restart: 60 seconds
- Verify and test: 1 minute

**Total: ~5 minutes** ⚡

---

## 🆘 **Need Help?**

### **Can't find "video-call-backend"?**
- It might be named slightly different
- Look for service with "backend" in the name
- Check URL contains: "onrender.com"

### **Don't see "Environment" tab?**
- Make sure you clicked ON the service (not just viewing list)
- Look at LEFT sidebar (not top navigation)
- Try refreshing page

### **Changes not applying?**
- Did you click "Save Changes" at bottom?
- Wait full 60 seconds for restart
- Check "Events" tab for deployment status

### **Video still not working?**
- Check browser console for errors (F12)
- Try different browser (Chrome recommended)
- Check `WEBRTC_RENDER_FIX.md` for advanced troubleshooting

---

## 📱 **Mobile Instructions**

### **On Phone/Tablet:**
```
1. Open browser, go to: dashboard.render.com
2. May need to request "Desktop Site" for full interface
3. Tap "video-call-backend" service
4. Tap "Environment" in menu
5. Use "Add Environment Variable" button
6. Type carefully (no autocorrect errors!)
7. Tap "Save Changes" at bottom
8. Wait 60 seconds
```

**Note:** Easier on desktop/laptop, but mobile works too.

---

## ✅ **Ready? Let's Do This!**

**Current Status:**
- ❌ Video not working (Send transport failed)

**After this fix:**
- ✅ Video working (WebRTC connected)

**Time needed:**
- ⏱️ 5 minutes

**Risk level:**
- 🟢 Low (safe configuration change)

**Let's fix it now!** 🚀

👉 **Start here:** https://dashboard.render.com

---

**Last updated:** 2025-10-20
**Issue:** WebRTC Send Transport Failure
**Fix:** Add MEDIASOUP_ANNOUNCED_IP environment variable

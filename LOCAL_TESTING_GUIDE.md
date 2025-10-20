# 🏠 Local Testing Guide - No Render Issues!

## ✅ Test Locally in 5 Minutes (100% FREE)

This will bypass ALL Render limitations and work perfectly on your machine.

---

## 📋 **Prerequisites**
- ✅ Node.js installed (already done)
- ✅ PostgreSQL database (using Neon Cloud - already done)
- ✅ Git repository cloned (already done)

---

## 🚀 **Step 1: Backend Setup**

### Open PowerShell Terminal 1:
```powershell
# Navigate to backend
cd c:\Users\hp\Desktop\vcfinal\video-call-module-\backend

# Install dependencies (if not done)
npm install

# Start backend server
npm start
```

**Expected output:**
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized
🚀 Video Call Server running on port 5000
```

**Leave this terminal running!**

---

## 🎨 **Step 2: Frontend Setup**

### Open PowerShell Terminal 2:
```powershell
# Navigate to frontend  
cd c:\Users\hp\Desktop\vcfinal\video-call-module-\frontend

# Install dependencies (if not done)
npm install

# Start frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

**Browser will auto-open at http://localhost:3000**

---

## 🧪 **Step 3: Test Video Call**

### **Test 1: Teacher Dashboard**
1. Go to: http://localhost:3000
2. Click "Register" (or Login if already registered)
   - Email: `teacher@test.com`
   - Password: `password123`
   - Name: `Test Teacher`
   - Role: **Teacher**
3. Click "Create Live Class"
4. Click "Start" on the created class
5. **Allow camera and microphone** when prompted
6. ✅ You should see your video!

### **Test 2: Student Joining (same machine)**
1. Open **Incognito/Private window**: `Ctrl+Shift+N`
2. Go to: http://localhost:3000
3. Register as student:
   - Email: `student@test.com`
   - Password: `password123`
   - Name: `Test Student`
   - Role: **Student**
4. Click "Join" on the live class
5. **Allow camera and microphone**
6. ✅ You should see teacher's video AND your own!

### **Test 3: Multi-Device (optional)**
1. Find your local IP:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```
2. On phone/another computer, go to:
   ```
   http://YOUR_IP:3000
   # Example: http://192.168.1.100:3000
   ```
3. Login as student and join class

---

## 🔧 **Troubleshooting Local Testing**

### **Issue: Backend won't start**
```powershell
# Error: Port 5000 in use
netstat -ano | findstr :5000
# Find the PID and kill it:
taskkill /PID <PID_NUMBER> /F

# Restart backend
npm start
```

### **Issue: Frontend won't start**
```powershell
# Error: Port 3000 in use
netstat -ano | findstr :3000
# Find the PID and kill it:
taskkill /PID <PID_NUMBER> /F

# Restart frontend
npm start
```

### **Issue: Camera/Mic not working**
1. Check browser permissions:
   - Chrome: `chrome://settings/content/camera`
   - Allow `localhost` to access camera/mic
2. Refresh page and try again

### **Issue: Can't see other participants**
1. Check console logs (F12)
2. Make sure both users are in the SAME class
3. Teacher must click "Start" first
4. Student joins after class is live

---

## 🌐 **Make It Public (Optional - Using ngrok)**

Want to share with friends outside your network?

### **Install ngrok:**
1. Download: https://ngrok.com/download
2. Extract to `C:\ngrok`
3. Sign up (free): https://ngrok.com/signup

### **Expose backend:**
```powershell
# In new terminal
cd C:\ngrok
.\ngrok http 5000
```

**Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)**

### **Update frontend:**
```powershell
# Edit: frontend\.env
REACT_APP_API_URL=https://abc123.ngrok.io
REACT_APP_SOCKET_URL=https://abc123.ngrok.io

# Restart frontend
npm start
```

**Now anyone can access your app via the ngrok URL!**

---

## 📊 **Local vs Render Comparison**

| Feature | Local (FREE) | Render Free | Render Paid |
|---------|--------------|-------------|-------------|
| Setup Time | 5 minutes | 30 minutes | 30 minutes |
| WebRTC | ✅ Works | ❌ Fails | ✅ Works |
| Cost | $0 | $0 | $7/month |
| Performance | ⚡ Best | 🐌 Slow | ⚡ Fast |
| Public Access | ❌ No (use ngrok) | ✅ Yes | ✅ Yes |
| Debugging | ✅ Easy | ❌ Hard | ❌ Hard |

---

## ✅ **Recommended Workflow**

1. **Development:** Use Local (this guide)
2. **Testing:** Use ngrok (share with testers)
3. **Production:** Deploy to Render Paid ($7/month)

**Why?** Local testing is FASTER and has NO WebRTC limitations!

---

## 🎯 **Next Steps**

1. ✅ Run locally using this guide
2. ✅ Test all features (video, audio, chat, whiteboard)
3. ✅ Fix any bugs
4. ✅ When ready for production → Upgrade Render to Paid tier

**Local testing = Full control + Zero costs + No deployment delays!**

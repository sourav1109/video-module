# 🚀 QUICK START - HTTPS MODE

## ✅ SSL Certificates Ready!

Certificates have been generated in both `backend/ssl/` and `frontend/ssl/` directories.

---

## 🎯 START SERVERS:

### Option 1: Double-click Batch Files (Easiest!)

1. **Start Backend:**
   - Double-click: `backend/start-https.bat`
   - Wait for: "Video Call Server running on port 5000"
   - Look for: "Protocol: HTTPS" ✅

2. **Start Frontend:**
   - Double-click: `frontend/start-https.bat`
   - Wait for: "Compiled successfully!"
   - Browser will open automatically

### Option 2: Use Terminal

**Backend:**
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

**Frontend:**
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
npm start
```

---

## 🔐 ACCEPT SSL CERTIFICATE:

When you see "Your connection isn't private":

1. Click **"Advanced"**
2. Click **"Continue to localhost (unsafe)"** or **"Proceed anyway"**
3. ✅ Done!

**You need to accept the certificate for BOTH:**
- Frontend: `https://localhost:3000`
- Backend: `https://localhost:5000`

---

## 📱 TEST WITH SECOND DEVICE:

### On Your Phone/Tablet:

1. **Connect to same Wi-Fi**

2. **Open browser and go to:**
   ```
   https://10.164.114.166:3000
   ```

3. **Accept the certificate:**
   - Tap "Advanced"
   - Tap "Proceed to 10.164.114.166 (unsafe)"

4. **Login as Student**

5. **Join the class created by teacher**

6. **✅ Camera and mic should now work!**

---

## 🎥 TESTING CHECKLIST:

### On Main Computer (Teacher):
- [ ] Open `https://localhost:3000`
- [ ] Accept SSL certificate
- [ ] Login as Demo Teacher
- [ ] Create a new class
- [ ] Start the class
- [ ] Camera should work ✅
- [ ] Microphone should work ✅

### On Second Device (Student):
- [ ] Open `https://10.164.114.166:3000`
- [ ] Accept SSL certificate
- [ ] Login as Demo Student
- [ ] Join the class using class code
- [ ] Camera should work ✅
- [ ] Microphone should work ✅
- [ ] Should see teacher's video ✅

---

## ⚠️ TROUBLESHOOTING:

### Backend shows "Protocol: HTTP" instead of "HTTPS"

**Solution:**
1. Stop backend (Ctrl+C)
2. Check `backend/ssl/` folder has `cert.pem` and `key.pem`
3. If missing, run: `node generate-ssl.js` in backend folder
4. Start backend again

### Frontend won't start with HTTPS

**Check `.env.local` has:**
```
HTTPS=true
SSL_CRT_FILE=ssl/cert.pem
SSL_KEY_FILE=ssl/key.pem
```

### "Failed to connect" error

1. Make sure backend is running
2. Go to `https://localhost:5000` and accept certificate
3. Try frontend again

### Camera still not working

1. Make sure you're using `https://` (not `http://`)
2. Check browser console (F12) for errors
3. Make sure you accepted the SSL certificate
4. Try hard refresh: Ctrl+Shift+R

---

## 🎉 SUCCESS INDICATORS:

**Backend:**
```
🔐 HTTPS server created with SSL certificates
   📄 Cert: C:\...\backend\ssl\cert.pem
   🔑 Key: C:\...\backend\ssl\key.pem
🚀 Video Call Server running on port 5000
   Protocol: HTTPS ✅
   Local: https://localhost:5000
   Network: https://10.164.114.166:5000
```

**Frontend:**
```
Compiled successfully!

You can now view the app in the browser.
  Local:            https://localhost:3000
  On Your Network:  https://10.164.114.166:3000
```

**In Browser:**
- ✅ Green padlock or "Not Secure" warning accepted
- ✅ Camera permission granted
- ✅ Can see video preview
- ✅ Can join/create classes
- ✅ Video call works between devices

---

## 📊 CURRENT CONFIGURATION:

- **SSL Certificates**: ✅ Generated (self-signed, 365 days validity)
- **Backend HTTPS**: ✅ Port 5000
- **Frontend HTTPS**: ✅ Port 3000
- **Network IP**: `10.164.114.166`
- **Database**: ✅ Neon Cloud PostgreSQL
- **Mediasoup**: ✅ 8 workers initialized

---

## 🔑 WHY HTTPS IS NEEDED:

**Browser Security Policy:**
- Camera/Microphone access requires:
  - `https://` on any IP address ✅
  - `http://localhost` (special exception) ✅
  - `http://127.0.0.1` (special exception) ✅
  - ❌ `http://10.164.114.166` → BLOCKED

**With HTTPS enabled:**
- ✅ Both devices can access camera
- ✅ Both devices can access microphone
- ✅ Proper WebRTC peer-to-peer connections
- ✅ Screen sharing works
- ✅ Real-world testing conditions

---

**Your app is ready for multi-device testing!** 🎉

Start both servers and test with camera access from multiple devices!

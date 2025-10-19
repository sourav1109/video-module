# Quick Setup Guide - Network Access

## Your Network Configuration

**Main Computer IP:** `10.164.114.166`
**Backend URL:** `http://10.164.114.166:5000`
**Frontend URL:** `http://10.164.114.166:3000`

---

## ✅ What We Fixed

1. **Backend** - Now listens on `0.0.0.0` (all network interfaces)
2. **CORS** - Allows requests from any origin
3. **Socket.IO** - Allows connections from any device
4. **Login Component** - Uses dynamic API URL from environment variables
5. **Environment Files** - Created `.env` and `.env.local` files

---

## 🚀 How to Start Servers

### 1. Start Backend (Terminal 1)

```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

**Expected output:**
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized with 8 workers
🚀 Video Call Server running on port 5000
   Protocol: HTTP
   Local: http://localhost:5000
   Network: http://10.164.114.166:5000
   📱 Access from other devices using: http://10.164.114.166:5000
```

### 2. Start Frontend (Terminal 2)

**For Main Computer (localhost access):**
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
npm start
```

**For Network Access (from other devices):**
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
$env:HOST="0.0.0.0"; npm start
```

---

## 📱 Access from Different Devices

### Main Computer
- **URL:** `http://localhost:3000`
- Uses `.env.local` file (localhost URLs)

### Other Devices (Phone, Tablet, Another PC)
1. **Connect to same Wi-Fi network**
2. **URL:** `http://10.164.114.166:3000`
3. Uses `.env` file (network IP)

---

## 🔧 Environment Files Explained

### `.env.local` (for main computer only)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```
- Priority: HIGH (overrides .env)
- Not committed to git
- Used when you access via `localhost:3000`

### `.env` (for network devices)
```env
REACT_APP_API_URL=http://10.164.114.166:5000
REACT_APP_SOCKET_URL=http://10.164.114.166:5000
```
- Priority: NORMAL
- Committed to git
- Used when accessing from other devices

### Which file is used?

React checks in this order:
1. `.env.local` (if exists and accessed via localhost)
2. `.env` (if .env.local doesn't exist)

---

## 🧪 Testing

### Test Backend from Other Device

Open browser on phone/tablet:
```
http://10.164.114.166:5000/api/video-call/health
```

Should return: `{"status":"healthy"}`

### Test Frontend from Other Device

Open browser on phone/tablet:
```
http://10.164.114.166:3000
```

Should show login page!

---

## 🎯 Expected Behavior

### On Main Computer
1. Backend: `npm start` → Running on http://10.164.114.166:5000
2. Frontend: `npm start` → Running on http://localhost:3000
3. Access: `http://localhost:3000` → Uses localhost backend
4. Login works ✅
5. Video call works ✅

### On Other Device (e.g., Phone)
1. Connect to same Wi-Fi
2. Open: `http://10.164.114.166:3000`
3. Login page appears ✅
4. Login works ✅
5. Can join same class as main computer ✅
6. Video/audio works between devices ✅

---

## ⚠️ Important Notes

### Restart Frontend After .env Changes
If you modify `.env` or `.env.local`, you MUST restart the frontend:
```powershell
# Press Ctrl+C in frontend terminal
npm start
```

### Windows Firewall
If connection fails, allow ports:
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Video Call Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
New-NetFirewallRule -DisplayName "Video Call Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### Same Wi-Fi Network
**CRITICAL:** All devices MUST be on the same Wi-Fi network!
- Main computer Wi-Fi: Same network
- Phone/Tablet Wi-Fi: Same network
- Another PC Wi-Fi: Same network

---

## 🔄 To Switch Between Localhost and Network

### Use Localhost (on main computer only)
1. Keep `.env.local` file (already created)
2. Access via: `http://localhost:3000`
3. Backend will be `http://localhost:5000`

### Use Network IP (for other devices)
1. Remove or rename `.env.local` → `.env.local.backup`
2. Access via: `http://10.164.114.166:3000`
3. Backend will be `http://10.164.114.166:5000`

---

## 🆘 Troubleshooting

### "Failed to fetch" or "Network error"
- ✅ Backend running? Check terminal
- ✅ Correct IP address? Run `ipconfig`
- ✅ Same Wi-Fi network? Check both devices
- ✅ Firewall allows port 5000? Run firewall commands
- ✅ Frontend restarted after .env change?

### "Route not found" or "404"
- ✅ Backend shows correct routes on startup
- ✅ Check browser console for actual URL being called
- ✅ API URL in .env is correct: `http://10.164.114.166:5000` (no `/api/video-call`)

### Video call doesn't connect
- ✅ Both devices use same backend IP
- ✅ Socket.IO URL is correct in .env
- ✅ Browser allows camera/mic permissions

---

## 📞 Next Steps

1. **Restart Frontend** to load new `.env` files
2. **Test on main computer** - `http://localhost:3000` - Login should work
3. **Test from phone** - `http://10.164.114.166:3000` - Login should work
4. **Create a class** on main computer
5. **Join from phone** - Should see the same class
6. **Start video call** - Both devices should see each other!

---

**Your backend is ready and accessible on the network! 🎉**
**Just restart the frontend and test!**

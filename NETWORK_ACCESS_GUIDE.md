# Network Access Guide - Connect from Multiple Devices

## ✅ What We Fixed

1. **Backend listening on all network interfaces** - Changed from `localhost` to `0.0.0.0`
2. **CORS policy updated** - Allows connections from any origin
3. **Socket.IO CORS updated** - Allows WebSocket connections from any device

## 🌐 How to Access from Other Devices

### Step 1: Find Your Computer's IP Address

**On Windows (your main computer):**
1. Open PowerShell or Command Prompt
2. Run: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100` or `192.168.0.50`

**Quick command:**
```powershell
ipconfig | findstr IPv4
```

### Step 2: Restart Backend Server

The backend needs to restart to apply the network configuration changes.

**Stop current backend** (if running):
```powershell
# Press Ctrl+C in the backend terminal
```

**Start backend:**
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

**Look for this output:**
```
🚀 Video Call Server running on port 5000
   Protocol: HTTP
   Local: http://localhost:5000
   Network: http://192.168.X.X:5000
   📱 Access from other devices using: http://192.168.X.X:5000
```

The IP shown in "Network" is what you'll use from other devices!

### Step 3: Configure Frontend for Network Access

**Option A: Use Environment Variable (Recommended)**

Create `.env` file in `frontend` folder:
```env
REACT_APP_API_URL=http://192.168.X.X:5000
REACT_APP_SOCKET_URL=http://192.168.X.X:5000
```

Replace `192.168.X.X` with your actual IP address!

**Option B: Serve Frontend on Network**

Start frontend to listen on all interfaces:
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
$env:HOST="0.0.0.0"; npm start
```

Then access from other devices: `http://192.168.X.X:3000`

### Step 4: Connect from Other Device

**On your phone/tablet/another computer:**

1. Make sure the device is on the **same Wi-Fi network**
2. Open browser
3. Go to: `http://192.168.X.X:3000` (use your computer's IP)
4. Login with your credentials
5. Join the same class!

## 🔒 Firewall Configuration

If you can't connect, you may need to allow the ports through Windows Firewall:

### Allow Backend Port 5000

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Video Call Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### Allow Frontend Port 3000

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Video Call Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**Or use Windows Firewall GUI:**
1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. TCP → Specific local ports: `5000` → Next
5. Allow the connection → Next
6. Check all profiles → Next
7. Name: "Video Call Backend" → Finish
8. Repeat for port `3000`

## 📱 Mobile Device Access

### Android/iOS Browser

1. Connect phone to same Wi-Fi
2. Open Chrome/Safari
3. Enter: `http://192.168.X.X:3000`
4. Login and join class

### Common Issues on Mobile

**Camera/Mic not working:**
- Make sure you're using `http://` (not `https://`)
- Some browsers require HTTPS for camera access
- Try Chrome browser if default doesn't work

**"Not secure" warning:**
- This is normal for local IP addresses
- Click "Advanced" → "Proceed anyway"

## 🧪 Testing the Connection

### Test Backend API from Other Device

Open browser on other device and visit:
```
http://192.168.X.X:5000/api/video-call/health
```

You should see a success response!

### Test with curl (from other device)

```bash
curl http://192.168.X.X:5000/api/video-call/health
```

## 🔧 Troubleshooting

### Issue: "Failed to fetch" or "Network error"

**Solutions:**
1. ✅ Make sure both devices are on same Wi-Fi network
2. ✅ Check Windows Firewall allows port 5000 and 3000
3. ✅ Backend is running and shows network IP
4. ✅ Use correct IP address (not localhost)
5. ✅ Antivirus isn't blocking connections

### Issue: Can access frontend but can't login

**Solutions:**
1. Frontend might still be using `localhost:5000` for API
2. Create `.env` file with correct backend IP
3. Restart frontend after creating `.env`

### Issue: Can login but video call doesn't connect

**Solutions:**
1. Socket.IO might be trying to connect to localhost
2. Check browser console for Socket.IO errors
3. Make sure `.env` has both `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`

### Issue: One-way video (teacher sees student but not vice versa)

**Solutions:**
1. Mediasoup might need network configuration
2. Both devices need to access backend via same IP
3. Check NAT/Router settings if on different subnets

## 🌍 Production Deployment (Future)

For production use:

1. **Use proper domain name** instead of IP address
2. **Enable HTTPS** with SSL certificate
3. **Restrict CORS** to specific domains
4. **Use environment variables** for all URLs
5. **Deploy to cloud** (AWS, Azure, Google Cloud)

## 📋 Quick Reference

### Your Setup (Example - Replace with actual values)

```
Main Computer IP: 192.168.1.100
Backend URL: http://192.168.1.100:5000
Frontend URL: http://192.168.1.100:3000

From Main Computer:
  - Use: http://localhost:3000

From Other Devices:
  - Use: http://192.168.1.100:3000
```

### Environment Variables (.env in frontend folder)

```env
# Replace with your computer's IP address
REACT_APP_API_URL=http://192.168.1.100:5000
REACT_APP_SOCKET_URL=http://192.168.1.100:5000
```

## ✅ Verification Checklist

Before connecting from other device:

- [ ] Backend running and showing network IP
- [ ] Frontend running (optionally with HOST=0.0.0.0)
- [ ] Windows Firewall allows ports 5000 and 3000
- [ ] .env file created with correct IP (if using)
- [ ] Both devices on same Wi-Fi network
- [ ] Can access `http://YOUR_IP:5000/api/video-call/health` from other device

## 🎯 Expected Behavior

After completing setup:

1. ✅ **Main computer**: Access via `http://localhost:3000`
2. ✅ **Phone/Tablet**: Access via `http://192.168.X.X:3000`
3. ✅ **Another PC**: Access via `http://192.168.X.X:3000`
4. ✅ All devices can login
5. ✅ All devices can join same class
6. ✅ Video/audio works between all participants
7. ✅ Chat, whiteboard, polls work across devices

---

## 🆘 Still Having Issues?

Provide these details:
1. Your computer's IP address (from `ipconfig`)
2. Backend terminal output (especially the "Network:" line)
3. Other device's IP address
4. Error message from browser console (F12)
5. Both devices are on same Wi-Fi? (Yes/No)

# Camera & Video Debugging Guide

## ✅ What We Fixed

1. **PostgreSQL Migration** - All Mongoose models replaced with PostgreSQL repositories
2. **Socket.IO URLs** - Changed from `https://192.168.7.20:5000` to `http://localhost:5000`
3. **API Endpoints** - Fixed from `/api/live-classes/` to `/api/video-call/`
4. **WebRTC Connection** - Updated server URL to localhost

## 🎥 How Camera Should Work

### Automatic Flow (When You Join Class):

1. **VideoCallRoom.js** - `initializeRealTimeClass()` runs
2. **Creates WebRTC Manager** - `new ScalableWebRTCManager()`
3. **Calls connect()** - Establishes Socket.IO connection
4. **Calls joinClass()** - Joins the room, gets RTP capabilities
5. **Creates Transports** - Sets up send/receive transports
6. **Calls startLocalMedia()** - **THIS REQUESTS CAMERA & MIC**
7. **getUserMedia()** - Browser shows permission dialog
8. **onLocalStream callback** - Sets `localStream` state
9. **Video element updates** - Your camera appears in UI

### Manual Camera Toggle:

1. Click camera button in UI
2. `toggleCamera()` function runs
3. Checks `canUseMedia('camera')` - For teachers, always returns `true`
4. Enables/disables video track
5. Calls `produceTrack('video', videoTrack)` to send to server

## 🔍 Debug Steps

### 1. Open Browser Console (F12)

Look for these log messages:

```
✅ GOOD SIGNS:
🔌 Socket connected
✅ Successfully joined class
✅ Transports ready
🎥 Starting local media for role: teacher
✅ Local media obtained: {video: 1, audio: 1}
✅ onLocalStream callback executed successfully
✅ video PRODUCER CREATED
✅ audio PRODUCER CREATED

❌ BAD SIGNS:
❌ Failed to initialize local media
❌ getUserMedia error
⚠️ onLocalStream callback not set
❌ Failed to produce video
```

### 2. Check Browser Permissions

- Click the **lock icon** in address bar (next to http://localhost:3000)
- Check **Camera** and **Microphone** permissions
- Should be set to **"Allow"** or **"Ask"**
- If **"Block"**, change to **"Allow"** and reload page

### 3. Check if Camera is Already in Use

Close these apps if open:
- Zoom
- Microsoft Teams
- Skype
- Other browser tabs using camera

### 4. Test Camera Independently

Visit: https://webcamtests.com/
- Click "Test my cam"
- If it works there, camera is functional
- If it doesn't work, check camera drivers

### 5. Check Console for Specific Errors

#### Error: "Permission denied"
**Solution**: Grant camera permission in browser settings

#### Error: "NotFoundError: Requested device not found"
**Solution**: No camera detected - check if camera exists

#### Error: "NotAllowedError: Permission dismissed"
**Solution**: You clicked "Block" - reset permissions

#### Error: "NotReadableError: Could not start video source"
**Solution**: Camera is in use by another app

#### Error: "Transport not ready"
**Solution**: Socket.IO or Mediasoup connection failed - check backend logs

## 🐛 Manual Camera Test

If automatic doesn't work, try manual camera toggle:

1. Wait for page to fully load
2. Look for connection status indicator
3. Should show **"CONNECTED"** (green)
4. Click the **camera icon** button
5. Browser should show permission dialog
6. Click **"Allow"**
7. Your video should appear

## 📊 Expected State After Joining

```javascript
// In browser console, type:
webrtcManager.current

// You should see:
{
  isConnected: true,
  localStream: MediaStream {...},  // NOT null
  sendTransport: Object {...},     // NOT null
  recvTransport: Object {...},     // NOT null
  producers: Map { 'video' => Producer, 'audio' => Producer },
  cameraEnabled: true,
  micEnabled: true
}
```

## 🔧 Quick Fixes

### Fix 1: Reload Page
Press **F5** to reload - sometimes hot reload doesn't apply all changes

### Fix 2: Clear Browser Cache
Press **Ctrl+Shift+Delete** → Clear browsing data → Cached images and files

### Fix 3: Reset Camera Permissions
1. Browser Settings → Privacy and Security → Site Settings → Camera
2. Find `localhost:3000`
3. Change to **"Allow"**
4. Reload page

### Fix 4: Check Backend is Running
Backend terminal should show:
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized with 8 workers
🚀 Video Call Server running on port 5000
```

If not running:
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

### Fix 5: Check Frontend is Running
Frontend terminal should show:
```
webpack compiled successfully
```

If not running:
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
npm start
```

## 📝 What to Report Back

If camera still doesn't work, please provide:

1. **Browser console screenshot** (especially any red errors)
2. **Connection status** (CONNECTED or DISCONNECTED?)
3. **Which browser** (Chrome, Edge, Firefox?)
4. **After clicking camera button, what happens?**
   - Nothing?
   - Permission dialog appears?
   - Error message?
5. **Backend terminal output** (any errors when you join?)

## 🎯 Most Common Issue

**Camera permission blocked** - 90% of cases

**Solution**:
1. Click lock icon → Camera → Allow
2. Reload page (F5)
3. Camera should start automatically

## 💡 Role-Based Behavior

### Teachers (You):
- ✅ Can use camera immediately (no permission needed from others)
- ✅ Camera should auto-start when joining
- ✅ `canUseMedia('camera')` returns `true`

### Students:
- ❌ Need permission from teacher first
- ❌ Camera blocked until teacher grants permission
- ⚠️ `canUseMedia('camera')` returns `false` initially

## 🔄 Expected User Flow

1. **Login as teacher** ✅
2. **Schedule class** ✅
3. **Start class** ✅
4. **Join class** ✅
5. **Socket.IO connects** ✅ (Status shows "CONNECTED")
6. **Browser asks for camera permission** ⬅️ YOU ARE HERE
7. **Click "Allow"**
8. **Camera starts** ⬅️ GOAL
9. **Your video appears**
10. Students can see you streaming

---

## 🆘 Still Not Working?

Reply with:
1. Screenshot of browser console
2. Screenshot of the live class page
3. Connection status (CONNECTED/DISCONNECTED)
4. What you see when you click camera button

I'll help debug further!

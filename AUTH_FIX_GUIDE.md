# 🔧 Authentication Fix Guide

## Problem: "jwt malformed" Error

This error occurs when there's an invalid token stored in your browser's localStorage.

---

## 🛠️ Quick Fix Options

### Option 1: Auto-Clear on Reload (Recommended)
The app will now automatically detect and clear invalid tokens when you:
1. **Refresh the page** (Ctrl+R or F5)
2. The console will show: `🔧 Found invalid token on startup, cleaning up...`

### Option 2: Manual Browser Clear
1. Open your browser at: http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Paste this command and press Enter:

```javascript
localStorage.clear(); window.location.reload();
```

5. The page will reload with a clean state

### Option 3: Hard Refresh
1. Close all browser tabs with http://localhost:3000
2. Clear browser cache:
   - **Chrome/Edge**: Ctrl+Shift+Delete → Check "Cookies and other site data" → Clear
   - **Firefox**: Ctrl+Shift+Delete → Check "Cookies" → Clear
3. Open http://localhost:3000 again

---

## ✅ After Clearing

1. Go to http://localhost:3000
2. You should see the **Login page** (no errors)
3. Register a new account or use Demo Login
4. The 401 errors will be gone! ✨

---

## 🔐 How Authentication Works Now

### Improvements Made:

1. **Auto Token Validation**
   - App checks token format on startup
   - Invalid tokens are automatically cleared
   - You'll see console messages: `🧹 Clearing authentication data`

2. **Clean Token Storage**
   - Tokens are cleaned of extra quotes/whitespace
   - JWT format validation (must have 3 parts: `header.payload.signature`)
   - Proper error handling

3. **Better Error Messages**
   - Clear console logs for debugging
   - Automatic redirect to login on auth errors

---

## 📝 Test Authentication

### Register New Account:
1. Go to http://localhost:3000/login
2. Click "Register" tab
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Teacher or Student
4. Click "Create Account"
5. You'll be automatically logged in

### Demo Login (Fastest):
1. Go to http://localhost:3000/login
2. Click "Demo Teacher" or "Demo Student" button
3. Automatic account creation and login!

---

## 🐛 Still Getting Errors?

### Check Backend is Running:
```powershell
# Terminal should show:
✅ PostgreSQL connected
✅ Mediasoup SFU Service initialized with 8 workers
🚀 Video Call Server running on port 5000
```

### Check Frontend Console:
```
Expected messages:
🚀 Initializing app...
ℹ️ No valid session found (if not logged in)
```

### If you see "jwt malformed" after login:
1. Logout (clear localStorage)
2. Close all browser tabs
3. Restart frontend:
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\frontend
npm start
```

---

## 🎯 Understanding the Error

### What "jwt malformed" means:
- JWT (JSON Web Token) should have format: `xxxxx.yyyyy.zzzzz`
- Old/invalid tokens might be: `"token"`, `null`, `undefined`, or corrupted
- The app now detects and cleans these automatically

### Why it happened:
- Old token from previous session
- Browser cached invalid data
- Development server restart with different JWT secret

### How it's fixed:
- ✅ Auto-validation on app start
- ✅ Clean storage on 401 errors
- ✅ Better token format checking
- ✅ Context-based auth management

---

## 🚀 Ready to Use!

After clearing localStorage, your authentication will work perfectly:

1. **Register/Login** → Get valid JWT token
2. **Token stored safely** → Validated and cleaned
3. **API calls work** → No more 401 errors
4. **Dashboard loads** → Full access to features

**Try it now:** http://localhost:3000

---

*Last Updated: October 19, 2025*
*Status: ✅ Authentication System Fixed*

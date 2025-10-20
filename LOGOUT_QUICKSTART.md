# 🎯 Logout & Session Management - Quick Start

## What Was Added

✅ **Backend Session Management**
- Database tables for session tracking and token blacklisting
- Enhanced login to create sessions with unique JWT IDs
- Logout API endpoints (single device & all devices)
- Middleware to check blacklisted tokens
- Automatic session cleanup

✅ **Frontend Logout Integration**
- `authApi.js` service for logout operations
- Enhanced `App.js` with auto-logout on token expiration
- Notification system for session warnings
- Axios interceptors for automatic error handling

---

## 🚀 Quick Setup (5 Minutes)

### 1. Run Database Migration

```bash
cd backend
# Run this SQL migration
psql $DATABASE_URL < database/migrations/002_add_session_management.sql
```

This creates:
- `user_sessions` table
- `token_blacklist` table
- Adds `last_logout` column to `users` table

### 2. Test Locally

```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm start
```

### 3. Test Logout

1. Login to the app
2. Click logout button (or wait for token expiration)
3. Check browser console - should see: `✅ Logout successful`
4. Try accessing protected route - should redirect to login

---

## 📋 API Endpoints Added

### 1. Logout (Current Device)
```
POST /api/video-call/auth/logout
Authorization: Bearer <token>
```

### 2. Logout All Devices
```
POST /api/video-call/auth/logout-all
Authorization: Bearer <token>
```

### 3. View Active Sessions
```
GET /api/video-call/auth/sessions
Authorization: Bearer <token>
```

---

## 🔒 Security Features

1. **Token Blacklisting** - Prevents token reuse after logout
2. **Session Tracking** - Tracks device, IP, login/logout times
3. **Auto-Expiration** - Sessions expire with JWT tokens
4. **Multi-Device Support** - Logout from all devices
5. **Activity Monitoring** - Tracks last activity timestamp

---

## 📝 How Users Experience It

### Normal Logout:
1. User clicks "Logout"
2. Session terminated on server
3. Token blacklisted
4. Local storage cleared
5. Redirected to login

### Session Expiration:
1. Token expires (after 7 days)
2. Next API call returns 401
3. Frontend auto-detects error
4. Shows "Session expired" notification
5. Auto-logout and redirect to login

### Warning Before Expiration:
1. Token has < 1 hour left
2. Backend sends expiration header
3. Frontend shows warning notification
4. User can save work and re-login

---

## 🧪 Testing Checklist

- [ ] Database migration ran successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login successfully
- [ ] Logout button works
- [ ] Session cleared after logout
- [ ] Cannot use old token after logout
- [ ] Auto-logout works on token expiration
- [ ] Notifications show for login/logout events

---

## 📦 Files Modified/Created

### Backend:
- ✅ `backend/database/migrations/002_add_session_management.sql` (NEW)
- ✅ `backend/src/routes/auth.js` (MODIFIED - enhanced login/logout)
- ✅ `backend/src/middleware/sessionMiddleware.js` (NEW)

### Frontend:
- ✅ `frontend/src/services/authApi.js` (NEW)
- ✅ `frontend/src/App.js` (MODIFIED - added auto-logout)

### Documentation:
- ✅ `LOGOUT_IMPLEMENTATION.md` (Complete guide)
- ✅ `LOGOUT_QUICKSTART.md` (This file)

---

## 🚀 Deployment to Render

### Database Migration:

Get your database URL from Render Dashboard, then:

```bash
# Option 1: Direct connection
psql "postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" < backend/database/migrations/002_add_session_management.sql

# Option 2: Using Render shell
# Go to Render Dashboard → Backend → Shell tab
# Run:
cd /opt/render/project/src/backend
psql $DATABASE_URL < database/migrations/002_add_session_management.sql
```

### Environment Variables:

Already configured in `.env.render` files:
- `JWT_SECRET` ✅
- `JWT_EXPIRE=7d` ✅

### Push Changes:

```bash
git add .
git commit -m "Add logout functionality with session management"
git push origin main
```

Render will auto-deploy!

---

## ❓ FAQ

**Q: Do I need Redis for this?**  
A: No! This works with PostgreSQL only. No Redis required.

**Q: Will this break existing sessions?**  
A: No. Old tokens without JTI will still work. New logins get JTI tracking.

**Q: How do I test logout locally?**  
A: Login → Click logout → Try accessing protected route → Should redirect to login

**Q: What if database migration fails?**  
A: Tables have `IF NOT EXISTS` checks. Safe to run multiple times.

**Q: How long do sessions last?**  
A: Same as JWT expiration (7 days by default). Configure with `JWT_EXPIRE` env variable.

---

## ✅ Success Indicators

After setup, you should see:

**Backend Logs:**
```
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized
✅ Socket Service initialized
🚀 Video Call Server running on port 5000
```

**Frontend Console (on logout):**
```
✅ Logout successful
```

**Database:**
```sql
SELECT * FROM user_sessions WHERE is_active = TRUE;
-- Should show active sessions

SELECT * FROM token_blacklist;
-- Should show blacklisted tokens after logout
```

---

## 🎉 You're Done!

Your video call app now has:
- ✅ Secure logout with session termination
- ✅ Token blacklisting
- ✅ Auto-logout on expiration
- ✅ Multi-device session management
- ✅ Session expiration warnings

**Ready for production deployment!** 🚀

For detailed documentation, see `LOGOUT_IMPLEMENTATION.md`

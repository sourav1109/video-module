# 🎯 Logout Functionality - Developer Quick Reference

## 🚀 Immediate Actions Needed

### 1. Run Database Migration (REQUIRED)
```bash
# Your Neon Cloud PostgreSQL
psql "postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" < backend/database/migrations/002_add_session_management.sql
```

This creates the session management tables. **Must run this before deployment!**

### 2. Verify Environment Variables (Already Done ✅)
- `JWT_SECRET` ✅
- `USE_REDIS=false` ✅  
- `DATABASE_URL` ✅

### 3. Deploy (Already Pushed ✅)
Changes are committed and pushed to GitHub. Render will auto-deploy.

---

## 📚 API Reference

### Logout Current Device
```javascript
POST /api/video-call/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logout successful. Session terminated."
}
```

### Logout All Devices
```javascript
POST /api/video-call/auth/logout-all
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out from all devices (3 sessions terminated)"
}
```

### View Active Sessions
```javascript
GET /api/video-call/auth/sessions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "device_info": "Mozilla/5.0...",
      "ip_address": "192.168.1.1",
      "login_time": "2025-10-20T10:00:00Z",
      "is_current": true
    }
  ]
}
```

---

## 💻 Frontend Usage

### Import Service
```javascript
import authAPI from './services/authApi';
```

### Logout
```javascript
const handleLogout = async () => {
  try {
    await authAPI.logout(token);
    console.log('✅ Logged out');
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Logout All Devices
```javascript
const handleLogoutAll = async () => {
  try {
    await authAPI.logoutAll(token);
    console.log('✅ Logged out from all devices');
    navigate('/login');
  } catch (error) {
    console.error('Logout all failed:', error);
  }
};
```

### View Sessions
```javascript
const viewSessions = async () => {
  try {
    const { sessions } = await authAPI.getSessions(token);
    console.log('Active sessions:', sessions);
  } catch (error) {
    console.error('Failed to get sessions:', error);
  }
};
```

---

## 🔍 Database Queries

### Check Active Sessions
```sql
SELECT 
  u.name, 
  s.device_info, 
  s.login_time,
  s.is_active
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE;
```

### Check Blacklisted Tokens
```sql
SELECT 
  u.name,
  b.blacklisted_at,
  b.reason
FROM token_blacklist b
JOIN users u ON b.user_id = u.id
ORDER BY b.blacklisted_at DESC
LIMIT 10;
```

### User Logout History
```sql
SELECT 
  name,
  last_login,
  last_logout
FROM users
WHERE last_logout IS NOT NULL
ORDER BY last_logout DESC
LIMIT 10;
```

---

## 🧪 Testing Commands

### Test Login & Session Creation
```bash
curl -X POST http://localhost:5000/api/video-call/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Logout
```bash
curl -X POST http://localhost:5000/api/video-call/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test View Sessions
```bash
curl -X GET http://localhost:5000/api/video-call/auth/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Blacklisted Token (Should Fail)
```bash
# After logout, try using the same token
curl -X GET http://localhost:5000/api/video-call/me \
  -H "Authorization: Bearer OLD_TOKEN"

# Should return: 401 Unauthorized with TOKEN_BLACKLISTED code
```

---

## 🎯 Expected Behavior

### Successful Login:
```
✅ POST /auth/login returns token
✅ Session created in user_sessions table
✅ is_active = TRUE
✅ Token has unique JTI
```

### Successful Logout:
```
✅ POST /auth/logout succeeds
✅ Token added to token_blacklist
✅ Session marked is_active = FALSE
✅ user.last_logout updated
✅ Frontend localStorage cleared
```

### Using Blacklisted Token:
```
❌ API returns 401 Unauthorized
❌ Error code: TOKEN_BLACKLISTED
❌ Frontend auto-logs out
❌ Redirects to login page
```

### Token Expiration:
```
⚠️ Token expires after 7 days
⚠️ API returns 401 Unauthorized
⚠️ Error code: TOKEN_EXPIRED
✅ Frontend auto-logs out
✅ Shows "Session expired" notification
```

---

## 📊 Monitoring Queries

### Count Active Sessions
```sql
SELECT COUNT(*) as active_sessions 
FROM user_sessions 
WHERE is_active = TRUE;
```

### Sessions by User
```sql
SELECT 
  u.name,
  COUNT(*) as session_count
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE
GROUP BY u.name
ORDER BY session_count DESC;
```

### Recent Logouts
```sql
SELECT 
  u.name,
  u.last_logout,
  s.logout_time,
  s.device_info
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.logout_time > NOW() - INTERVAL '24 hours'
ORDER BY s.logout_time DESC;
```

---

## 🔧 Troubleshooting

### Issue: "Token still works after logout"
**Solution**: Check if token is in blacklist
```sql
SELECT * FROM token_blacklist WHERE token_jti = 'YOUR_JTI';
```

### Issue: "Database migration fails"
**Solution**: Tables have IF NOT EXISTS, safe to re-run
```bash
psql $DATABASE_URL < backend/database/migrations/002_add_session_management.sql
```

### Issue: "Frontend doesn't auto-logout"
**Solution**: Check axios interceptor setup in App.js
```javascript
// Should be in useEffect
authAPI.setupInterceptors(() => handleLogout(true));
```

### Issue: "Session not created on login"
**Solution**: Check if uuid package is installed
```bash
cd backend
npm install uuid
```

---

## 📦 Package Requirements

### Backend:
```json
{
  "uuid": "^9.0.1",          // ✅ Already installed
  "jsonwebtoken": "^9.0.0",  // ✅ Already installed
  "pg": "^8.11.0"            // ✅ Already installed
}
```

### Frontend:
```json
{
  "axios": "^1.4.0",         // ✅ Already installed
  "@mui/material": "^5.13.0" // ✅ Already installed
}
```

---

## 🎉 Success Checklist

After running migration and deploying:

- [ ] Database tables created (user_sessions, token_blacklist)
- [ ] Can login successfully
- [ ] Session created in database on login
- [ ] Logout button works
- [ ] Session marked inactive after logout
- [ ] Token added to blacklist after logout
- [ ] Cannot reuse token after logout
- [ ] Frontend auto-redirects to login on 401
- [ ] Notifications show for login/logout events
- [ ] Can view active sessions
- [ ] Can logout from all devices

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `LOGOUT_QUICKSTART.md` | 5-minute setup guide |
| `LOGOUT_IMPLEMENTATION.md` | Complete technical docs |
| `LOGOUT_SUMMARY.md` | Feature overview |
| `LOGOUT_REFERENCE.md` | This quick reference |
| `RENDER_ENV_SETUP.md` | Render deployment guide |

---

## 🚀 Production Ready!

Your logout system is complete and ready for deployment:
✅ Server-side session management  
✅ Token blacklisting  
✅ Multi-device support  
✅ Auto-expiration handling  
✅ Security audit trail  

**Just run the database migration and you're done!** 🎉

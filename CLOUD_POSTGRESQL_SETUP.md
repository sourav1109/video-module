# Cloud PostgreSQL Setup Guide

## 🌐 Use Cloud PostgreSQL Instead of Docker

You can use a cloud PostgreSQL service instead of running Docker locally. This is easier and works from any device!

---

## 🏆 Recommended: Neon (Free Forever)

**Why Neon?**
- ✅ **Best free tier** (512 MB storage)
- ✅ **Serverless** (auto-pause when idle, saves resources)
- ✅ **No credit card** required
- ✅ **Super fast** setup (2 minutes)
- ✅ **Automatic backups**

### Step-by-Step Setup with Neon

#### 1. Create Account
1. Go to: https://neon.tech
2. Click "Sign up" (use GitHub, Google, or Email)
3. Verify your email

#### 2. Create Project
1. Click "New Project"
2. **Project name:** `video-call-app` or `sgt-lms`
3. **Region:** Choose closest to you (e.g., US East, EU West, Asia)
4. **PostgreSQL version:** 15 or 16 (recommended: 16)
5. Click "Create Project"

#### 3. Get Connection String
After project is created, you'll see a **connection string** like:
```
postgresql://alex:AbC123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

#### 4. Configure Backend

**Option A: Use `.env` file (Recommended)**

Create or update `backend/.env`:
```env
# Neon PostgreSQL (paste your connection string here)
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-key-change-this-to-random-string

# Server Settings
PORT=5000
NODE_ENV=development

# Optional: Connection pool size
DB_POOL_SIZE=20
```

**Replace the `DATABASE_URL` with your actual Neon connection string!**

**Option B: Use separate environment variables**
```env
# Neon PostgreSQL (alternative format)
DB_HOST=ep-cool-darkness-123456.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=alex
DB_PASSWORD=AbC123xyz
DB_SSL=true

JWT_SECRET=your-super-secret-key
PORT=5000
```

#### 5. Create Database Tables

**Important:** Neon doesn't automatically create your tables. You need to run the SQL schema.

**Method 1: Using Neon Console (Easiest)**
1. Go to Neon dashboard
2. Click on your project
3. Click "SQL Editor" tab
4. Copy and paste the SQL from `backend/database/schema.sql` (see below)
5. Click "Run"

**Method 2: Using psql (if installed)**
```powershell
# Download schema
# Then run:
psql "postgresql://your-connection-string" -f schema.sql
```

#### 6. Start Backend
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

**Expected output:**
```
🐘 Initializing PostgreSQL connection...
🔧 Database configuration: { type: 'Cloud (CONNECTION_STRING)', ssl: 'enabled' }
✅ PostgreSQL connected successfully
✅ Mediasoup SFU Service initialized
🚀 Video Call Server running on port 5000
```

---

## 🗄️ Database Schema SQL

Copy this SQL and run it in Neon's SQL Editor:

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'hod', 'dean')),
    department VARCHAR(255),
    phone_number VARCHAR(20),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    current_students INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 500,
    allow_chat BOOLEAN DEFAULT TRUE,
    allow_whiteboard BOOLEAN DEFAULT TRUE,
    allow_recording BOOLEAN DEFAULT TRUE,
    recording_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Participants Table
CREATE TABLE IF NOT EXISTS class_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    attendance_duration INTEGER DEFAULT 0,
    is_present BOOLEAN DEFAULT TRUE,
    UNIQUE(class_id, user_id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    poll_type VARCHAR(50) DEFAULT 'multiple_choice' CHECK (poll_type IN ('multiple_choice', 'single_choice', 'yes_no')),
    is_active BOOLEAN DEFAULT TRUE,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll Responses Table
CREATE TABLE IF NOT EXISTS poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    selected_options JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- Whiteboard Data Table
CREATE TABLE IF NOT EXISTS whiteboard_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('draw', 'erase', 'clear', 'undo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Statistics Table
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_classes_attended INTEGER DEFAULT 0,
    total_classes_hosted INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    total_polls_created INTEGER DEFAULT 0,
    total_screen_shares INTEGER DEFAULT 0,
    total_online_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recordings Table
CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    format VARCHAR(50) DEFAULT 'webm',
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher ON live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_class_participants_class ON class_participants(class_id);
CREATE INDEX IF NOT EXISTS idx_class_participants_user ON class_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_class ON chat_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_polls_class ON polls(class_id);

-- Success message
SELECT 'Database schema created successfully!' AS status;
```

---

## 🔄 Alternative: Supabase (Good Alternative)

**Why Supabase?**
- ✅ Free tier (500 MB)
- ✅ Includes auth, storage, real-time features
- ✅ Good documentation

### Quick Setup with Supabase

1. **Create Account:** https://supabase.com
2. **Create Project:**
   - Organization: Create new or use existing
   - Project name: `video-call-app`
   - Database password: Choose strong password (save it!)
   - Region: Choose closest
3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI mode)
   - Replace `[YOUR-PASSWORD]` with your actual password
4. **Run SQL Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Click "New query"
   - Paste the SQL schema above
   - Click "Run"
5. **Update `.env`:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
   ```

---

## 🐘 Alternative: ElephantSQL (Simple Option)

**Why ElephantSQL?**
- ✅ Very simple to use
- ✅ No credit card for free tier
- ⚠️ Only 20 MB free (small)

### Quick Setup with ElephantSQL

1. **Create Account:** https://www.elephantsql.com
2. **Create Instance:**
   - Click "Create New Instance"
   - Name: `video-call-db`
   - Plan: Tiny Turtle (Free)
   - Region: Choose closest
   - Click "Create"
3. **Get Connection String:**
   - Click on your instance
   - Copy the "URL" field
4. **Update `.env`:**
   ```env
   DATABASE_URL=postgres://username:password@host.db.elephantsql.com/database
   ```
5. **Run Schema:**
   - Go to "Browser" tab in ElephantSQL
   - Paste SQL schema
   - Click "Execute"

---

## ✅ Verification Steps

After setting up cloud database:

### 1. Test Connection
```powershell
cd C:\Users\hp\Desktop\vcfinal\video-call-module-\backend
npm start
```

Look for:
```
✅ PostgreSQL connected successfully
```

### 2. Test Registration
1. Start frontend: `npm start` in frontend folder
2. Go to login page
3. Click "Demo Teacher" or register new account
4. Should work without errors!

### 3. Check Neon Dashboard
- Go to Neon dashboard
- Click on your project
- Click "Tables" - you should see all 10 tables created

---

## 📊 Comparison Table

| Feature | Neon | Supabase | ElephantSQL | Docker Local |
|---------|------|----------|-------------|--------------|
| Free Storage | 512 MB | 500 MB | 20 MB | Unlimited |
| Credit Card | No | No | No | N/A |
| Auto-pause | Yes | No | No | No |
| Backups | Yes | Yes | Limited | Manual |
| Setup Time | 2 min | 5 min | 2 min | 10 min |
| **Best For** | **Most users** | Extra features | Small projects | Development |

---

## 🎯 Recommendation

**For your project:** Use **Neon** 

**Why?**
- ✅ Best free tier (512 MB is plenty for testing)
- ✅ No Docker needed - works from any device
- ✅ No credit card required
- ✅ Auto-pauses when idle (saves resources)
- ✅ Easy to upgrade later if needed

---

## 🚀 Next Steps

1. **Sign up for Neon:** https://neon.tech
2. **Create project** (2 minutes)
3. **Copy connection string**
4. **Update `backend/.env`** with `DATABASE_URL`
5. **Run SQL schema** in Neon's SQL Editor
6. **Start backend:** `npm start`
7. **Test login** - should work! ✅

---

## 🆘 Troubleshooting

### "SSL connection error"
Add `?sslmode=require` to your connection string:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### "Password authentication failed"
- Check password in connection string is correct
- Some special characters need URL encoding (e.g., `@` → `%40`)

### "Connection timeout"
- Check your internet connection
- Try different region when creating project
- Increase `connectionTimeoutMillis` in database.js

### Tables not created
- Run the SQL schema in cloud provider's SQL editor
- Check for SQL errors in the output

---

**With cloud PostgreSQL, you don't need Docker anymore!** 🎉

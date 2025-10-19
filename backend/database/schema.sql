-- ============================================================================
-- SGT-LMS Database Schema - PostgreSQL
-- Designed for 10,000+ concurrent users
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'hod', 'dean')),
    phone_number VARCHAR(20),
    department VARCHAR(100),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- LIVE CLASSES TABLE
-- ============================================================================
CREATE TABLE live_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    max_students INTEGER DEFAULT 500,
    current_students INTEGER DEFAULT 0,
    
    -- Class settings
    allow_chat BOOLEAN DEFAULT TRUE,
    allow_screen_share BOOLEAN DEFAULT TRUE,
    allow_recording BOOLEAN DEFAULT TRUE,
    allow_whiteboard BOOLEAN DEFAULT TRUE,
    require_approval BOOLEAN DEFAULT FALSE,
    
    -- Recording info
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    recording_size_mb DECIMAL(10, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_classes_teacher ON live_classes(teacher_id);
CREATE INDEX idx_classes_status ON live_classes(status);
CREATE INDEX idx_classes_scheduled_start ON live_classes(scheduled_start_time);
CREATE INDEX idx_classes_class_id ON live_classes(class_id);

-- ============================================================================
-- PARTICIPANTS TABLE (Student enrollment & attendance)
-- ============================================================================
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    
    -- Attendance tracking
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'joined', 'left', 'removed')),
    
    -- Participation metrics
    messages_sent INTEGER DEFAULT 0,
    polls_answered INTEGER DEFAULT 0,
    hand_raised_count INTEGER DEFAULT 0,
    
    -- Connection info
    socket_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(class_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_class ON participants(class_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_participants_status ON participants(status);

-- ============================================================================
-- CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255),
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    content TEXT NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size_kb INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_messages_class ON chat_messages(class_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);

-- ============================================================================
-- POLLS TABLE
-- ============================================================================
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    votes JSONB DEFAULT '{}', -- Map of option_index -> vote_count
    voters JSONB DEFAULT '[]', -- Array of user_ids who voted
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_polls_class ON polls(class_id);
CREATE INDEX idx_polls_active ON polls(is_active);

-- ============================================================================
-- WHITEBOARD DATA TABLE
-- ============================================================================
CREATE TABLE whiteboard_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    page_number INTEGER DEFAULT 1,
    canvas_data JSONB NOT NULL, -- Fabric.js canvas JSON
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_whiteboard_class ON whiteboard_data(class_id);

-- ============================================================================
-- RECORDINGS TABLE
-- ============================================================================
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size_mb DECIMAL(10, 2),
    duration_minutes INTEGER,
    format VARCHAR(20) DEFAULT 'webm',
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recordings_class ON recordings(class_id);
CREATE INDEX idx_recordings_status ON recordings(status);

-- ============================================================================
-- USER STATISTICS TABLE
-- ============================================================================
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_classes_attended INTEGER DEFAULT 0,
    total_classes_taught INTEGER DEFAULT 0,
    total_hours_in_class DECIMAL(10, 2) DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    total_polls_created INTEGER DEFAULT 0,
    total_polls_answered INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_stats_user ON user_statistics(user_id);

-- ============================================================================
-- SESSION LOGS TABLE (for debugging & analytics)
-- ============================================================================
CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES live_classes(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_logs_class ON session_logs(class_id);
CREATE INDEX idx_logs_event_type ON session_logs(event_type);
CREATE INDEX idx_logs_created_at ON session_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON live_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whiteboard_updated_at BEFORE UPDATE ON whiteboard_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active classes with teacher info
CREATE VIEW active_classes AS
SELECT 
    lc.*,
    u.name as teacher_full_name,
    u.email as teacher_email,
    COUNT(DISTINCT p.id) as total_participants
FROM live_classes lc
LEFT JOIN users u ON lc.teacher_id = u.id
LEFT JOIN participants p ON lc.id = p.class_id AND p.status IN ('joined', 'registered')
WHERE lc.status IN ('scheduled', 'live')
GROUP BY lc.id, u.name, u.email;

-- Student attendance report
CREATE VIEW student_attendance AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    COUNT(p.id) as total_classes_attended,
    SUM(p.duration_minutes) as total_minutes,
    AVG(p.duration_minutes) as avg_duration_per_class
FROM users u
LEFT JOIN participants p ON u.id = p.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample teacher
INSERT INTO users (name, email, password, role, department) VALUES
('Demo Teacher', 'teacher@sgt-lms.com', '$2a$10$demopasswordhash', 'teacher', 'Computer Science');

-- Insert sample student
INSERT INTO users (name, email, password, role, department) VALUES
('Demo Student', 'student@sgt-lms.com', '$2a$10$demopasswordhash', 'student', 'Computer Science');

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE live_classes;
ANALYZE participants;
ANALYZE chat_messages;
ANALYZE polls;

-- Enable auto-vacuum for performance
ALTER TABLE users SET (autovacuum_enabled = true);
ALTER TABLE live_classes SET (autovacuum_enabled = true);
ALTER TABLE participants SET (autovacuum_enabled = true);
ALTER TABLE chat_messages SET (autovacuum_enabled = true);

-- ============================================================================
-- NOTES
-- ============================================================================
-- This schema is optimized for:
-- - 10,000+ concurrent users
-- - Fast queries with proper indexing
-- - Data integrity with foreign keys
-- - Audit trails with timestamps
-- - Scalability with partitioning-ready structure
-- 
-- For production:
-- 1. Use connection pooling (pg-pool)
-- 2. Enable read replicas for scaling reads
-- 3. Consider table partitioning for large tables
-- 4. Set up regular backups (pg_dump)
-- 5. Monitor with pg_stat_statements
-- ============================================================================

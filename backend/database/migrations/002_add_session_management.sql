-- ============================================================================
-- SESSION MANAGEMENT - Add to existing schema
-- Run this migration to add session tracking for logout functionality
-- ============================================================================

-- Sessions table for tracking active sessions and enabling logout
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) UNIQUE NOT NULL, -- JWT ID for token identification
    device_info TEXT, -- Browser, OS, device information
    ip_address VARCHAR(45), -- IPv4 or IPv6
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Blacklisted tokens (for immediate invalidation)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    reason VARCHAR(100) -- 'logout', 'security', 'password_change', etc.
);

-- Indexes for blacklist
CREATE INDEX IF NOT EXISTS idx_blacklist_token_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_expires_at ON token_blacklist(expires_at);

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Mark expired sessions as inactive
    UPDATE user_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    -- Delete old expired sessions (older than 30 days)
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    
    -- Delete old blacklisted tokens (older than their expiry)
    DELETE FROM token_blacklist 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add last_logout column to users table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_logout') THEN
        ALTER TABLE users ADD COLUMN last_logout TIMESTAMP;
    END IF;
END $$;

-- Create index on last_logout
CREATE INDEX IF NOT EXISTS idx_users_last_logout ON users(last_logout);

COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for logout and session management';
COMMENT ON TABLE token_blacklist IS 'Stores invalidated tokens to prevent reuse after logout';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Periodic cleanup of expired sessions and blacklisted tokens';

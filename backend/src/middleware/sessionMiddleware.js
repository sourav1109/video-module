// ============================================================================
// Session & Token Blacklist Middleware
// Checks if token is blacklisted or session is expired
// ============================================================================

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Middleware to check if token is blacklisted
 * Add this AFTER auth middleware to validate session
 */
const checkTokenBlacklist = async (req, res, next) => {
  try {
    // Skip if no user (auth middleware failed)
    if (!req.user) {
      return next();
    }

    // Get token from request
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Decode token to get jti
    const decoded = jwt.decode(token);
    const jti = decoded?.jti;

    if (!jti) {
      // Old token without jti, allow but log warning
      console.warn('⚠️ Token without JTI detected (old format)');
      return next();
    }

    // Check if token is blacklisted
    const blacklistResult = await pool.query(
      'SELECT id FROM token_blacklist WHERE token_jti = $1 AND expires_at > NOW()',
      [jti]
    );

    if (blacklistResult.rows.length > 0) {
      console.log(`🚫 Blacklisted token used: ${jti}`);
      return res.status(401).json({
        success: false,
        message: 'Session has been terminated. Please login again.',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Check if session is still active
    const sessionResult = await pool.query(
      'SELECT is_active FROM user_sessions WHERE token_jti = $1',
      [jti]
    );

    if (sessionResult.rows.length > 0 && !sessionResult.rows[0].is_active) {
      console.log(`🚫 Inactive session used: ${jti}`);
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please login again.',
        code: 'SESSION_INACTIVE'
      });
    }

    // Update last activity
    if (sessionResult.rows.length > 0) {
      await pool.query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE token_jti = $1',
        [jti]
      ).catch(err => console.warn('⚠️ Failed to update last activity:', err.message));
    }

    next();
  } catch (error) {
    console.error('❌ Token blacklist check error:', error);
    // Don't block request on error, but log it
    next();
  }
};

/**
 * Middleware to check token expiration and auto-cleanup
 */
const checkTokenExpiration = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;

    if (exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = exp - now;

      // Token expired
      if (timeLeft <= 0) {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }

      // Token expiring soon (less than 1 hour)
      if (timeLeft < 3600) {
        res.set('X-Token-Expires-Soon', 'true');
        res.set('X-Token-Expires-In', timeLeft.toString());
      }
    }

    next();
  } catch (error) {
    console.error('❌ Token expiration check error:', error);
    next();
  }
};

/**
 * Periodic cleanup job - call this from a cron job or scheduler
 */
const cleanupExpiredSessions = async () => {
  try {
    // Mark expired sessions as inactive
    const inactiveResult = await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE 
       WHERE expires_at < NOW() AND is_active = TRUE
       RETURNING id`
    );

    // Delete old expired sessions (older than 30 days)
    const deleteResult = await pool.query(
      `DELETE FROM user_sessions 
       WHERE expires_at < NOW() - INTERVAL '30 days'
       RETURNING id`
    );

    // Delete old blacklisted tokens
    const blacklistResult = await pool.query(
      `DELETE FROM token_blacklist 
       WHERE expires_at < NOW()
       RETURNING id`
    );

    console.log(`🧹 Cleanup completed:
      - Marked ${inactiveResult.rows.length} sessions as inactive
      - Deleted ${deleteResult.rows.length} old sessions
      - Deleted ${blacklistResult.rows.length} expired blacklist entries
    `);

    return {
      inactiveSessions: inactiveResult.rows.length,
      deletedSessions: deleteResult.rows.length,
      deletedBlacklist: blacklistResult.rows.length
    };
  } catch (error) {
    console.error('❌ Session cleanup error:', error);
    throw error;
  }
};

module.exports = {
  checkTokenBlacklist,
  checkTokenExpiration,
  cleanupExpiredSessions
};

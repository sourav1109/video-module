const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../repositories/UserRepository');
const pool = require('../config/database');

/**
 * @route   POST /api/video-call/auth/register
 * @desc    Register new user (student/teacher)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, department } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Check if user already exists
    let user = await UserRepository.findByEmail(email.toLowerCase());
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    if (!['student', 'teacher', 'admin', 'hod', 'dean'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, teacher, admin, hod, or dean'
      });
    }

    // Create user (password hashing is done in repository)
    user = await UserRepository.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone: phoneNumber,
      department
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/video-call/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await UserRepository.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isMatch = await UserRepository.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role}`
      });
    }

    // Update last login
    await UserRepository.updateLastLogin(user.id);

    // Generate unique JWT ID for session tracking
    const jti = uuidv4();
    const expiresIn = process.env.JWT_EXPIRE || '7d';
    
    // Generate JWT token with jti
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        jti: jti // JWT ID for session tracking
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn }
    );

    // Calculate expiration date
    const expirationMs = expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expirationMs);

    // Store session in database
    try {
      const deviceInfo = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

      await pool.query(
        `INSERT INTO user_sessions (user_id, token_jti, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, jti, deviceInfo, ipAddress, expiresAt]
      );
    } catch (sessionError) {
      console.warn('⚠️ Failed to store session:', sessionError.message);
      // Continue even if session storage fails
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone,
        department: user.department,
        lastLogin: new Date()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/video-call/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user
    const user = await UserRepository.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone,
        department: user.department,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/video-call/auth/logout
 * @desc    Logout user and invalidate session
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Decode token to get jti and user info
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      // Token is invalid or expired, but we still want to clean up
      console.log('⚠️ Logout with invalid/expired token');
      return res.json({
        success: true,
        message: 'Logout successful (token already expired)'
      });
    }

    const { jti, id: userId, exp } = decoded;
    const expiresAt = new Date(exp * 1000);

    // Add token to blacklist
    if (jti) {
      try {
        await pool.query(
          `INSERT INTO token_blacklist (token_jti, user_id, expires_at, reason)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (token_jti) DO NOTHING`,
          [jti, userId, expiresAt, 'logout']
        );
      } catch (blacklistError) {
        console.warn('⚠️ Failed to blacklist token:', blacklistError.message);
      }
    }

    // Mark session as inactive
    if (jti) {
      try {
        await pool.query(
          `UPDATE user_sessions 
           SET is_active = FALSE, logout_time = NOW(), last_activity = NOW()
           WHERE token_jti = $1 AND user_id = $2`,
          [jti, userId]
        );
      } catch (sessionError) {
        console.warn('⚠️ Failed to update session:', sessionError.message);
      }
    }

    // Update user's last logout time
    try {
      await pool.query(
        `UPDATE users SET last_logout = NOW() WHERE id = $1`,
        [userId]
      );
    } catch (userError) {
      console.warn('⚠️ Failed to update last logout:', userError.message);
    }

    console.log(`✅ User ${userId} logged out successfully`);

    res.json({
      success: true,
      message: 'Logout successful. Session terminated.'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/video-call/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    // Get all active sessions for this user
    const sessionsResult = await pool.query(
      `SELECT token_jti, expires_at FROM user_sessions 
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    // Blacklist all tokens
    for (const session of sessionsResult.rows) {
      await pool.query(
        `INSERT INTO token_blacklist (token_jti, user_id, expires_at, reason)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (token_jti) DO NOTHING`,
        [session.token_jti, userId, session.expires_at, 'logout_all']
      );
    }

    // Mark all sessions as inactive
    await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE, logout_time = NOW()
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    console.log(`✅ User ${userId} logged out from all devices (${sessionsResult.rows.length} sessions)`);

    res.json({
      success: true,
      message: `Logged out from all devices (${sessionsResult.rows.length} sessions terminated)`
    });

  } catch (error) {
    console.error('❌ Logout-all error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/video-call/auth/sessions
 * @desc    Get all active sessions for current user
 * @access  Private
 */
router.get('/sessions', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    const currentJti = decoded.jti;

    // Get all active sessions
    const result = await pool.query(
      `SELECT 
        id,
        token_jti,
        device_info,
        ip_address,
        login_time,
        last_activity,
        expires_at,
        CASE WHEN token_jti = $2 THEN TRUE ELSE FALSE END as is_current
       FROM user_sessions
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY login_time DESC`,
      [userId, currentJti]
    );

    res.json({
      success: true,
      sessions: result.rows
    });

  } catch (error) {
    console.error('❌ Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

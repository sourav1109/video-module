const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    const { name, email, password, role, department, phoneNumber } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role, department, phone_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, department, phone_number, profile_picture, created_at
    `;

    const values = [name, email, hashedPassword, role || 'student', department, phoneNumber];
    const result = await db.query(query, values);
    
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, role, department, phone_number, profile_picture, 
             is_active, last_login, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    const query = `
      SELECT id, name, email, role, department, phone_number, profile_picture, 
             is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update user profile
   */
  async update(id, updateData) {
    const allowedFields = ['name', 'department', 'phone_number', 'profile_picture'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, department, phone_number, profile_picture, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Update password
   */
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email
    `;

    const result = await db.query(query, [hashedPassword, id]);
    return result.rows[0];
  }

  /**
   * Compare password for login
   */
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

  /**
   * Get all users by role
   */
  async findByRole(role, limit = 100, offset = 0) {
    const query = `
      SELECT id, name, email, role, department, phone_number, profile_picture, 
             is_active, last_login, created_at
      FROM users
      WHERE role = $1 AND is_active = true
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [role, limit, offset]);
    return result.rows;
  }

  /**
   * Search users by name or email
   */
  async search(searchTerm, limit = 50) {
    const query = `
      SELECT id, name, email, role, department, profile_picture
      FROM users
      WHERE (name ILIKE $1 OR email ILIKE $1) AND is_active = true
      ORDER BY name ASC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_active
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get user statistics
   */
  async getStats(userId) {
    const query = `
      SELECT * FROM user_statistics
      WHERE user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Update user statistics
   */
  async updateStats(userId, stats) {
    const query = `
      INSERT INTO user_statistics (
        user_id, total_classes_attended, total_classes_hosted,
        total_messages_sent, total_polls_created, total_screen_shares,
        total_online_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        total_classes_attended = user_statistics.total_classes_attended + EXCLUDED.total_classes_attended,
        total_classes_hosted = user_statistics.total_classes_hosted + EXCLUDED.total_classes_hosted,
        total_messages_sent = user_statistics.total_messages_sent + EXCLUDED.total_messages_sent,
        total_polls_created = user_statistics.total_polls_created + EXCLUDED.total_polls_created,
        total_screen_shares = user_statistics.total_screen_shares + EXCLUDED.total_screen_shares,
        total_online_hours = user_statistics.total_online_hours + EXCLUDED.total_online_hours,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      userId,
      stats.classesAttended || 0,
      stats.classesHosted || 0,
      stats.messagesSent || 0,
      stats.pollsCreated || 0,
      stats.screenShares || 0,
      stats.onlineHours || 0
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all active teachers
   */
  async getAllTeachers() {
    return await this.findByRole('teacher', 1000, 0);
  }

  /**
   * Get all active students
   */
  async getAllStudents(limit = 1000, offset = 0) {
    return await this.findByRole('student', limit, offset);
  }

  /**
   * Count users by role
   */
  async countByRole(role) {
    const query = `
      SELECT COUNT(*) as count
      FROM users
      WHERE role = $1 AND is_active = true
    `;

    const result = await db.query(query, [role]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get users who joined in the last N days
   */
  async getRecentUsers(days = 7, limit = 50) {
    const query = `
      SELECT id, name, email, role, department, profile_picture, created_at
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    return result.rows;
  }
}

module.exports = new UserRepository();

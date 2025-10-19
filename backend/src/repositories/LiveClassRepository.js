const db = require('../config/database');

class LiveClassRepository {
  /**
   * Create a new live class
   */
  async create(classData) {
    const {
      title,
      description,
      teacherId,
      scheduledStart,
      scheduledEnd,
      classId,
      maxParticipants,
      recordingEnabled,
      whiteboardEnabled,
      chatEnabled,
      pollsEnabled
    } = classData;

    const query = `
      INSERT INTO live_classes (
        title, description, teacher_id, scheduled_start_time, scheduled_end_time,
        class_id, max_students, allow_recording, allow_whiteboard,
        allow_chat, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      title,
      description,
      teacherId,
      scheduledStart,
      scheduledEnd,
      classId,
      maxParticipants || 500,
      recordingEnabled !== false,
      whiteboardEnabled !== false,
      chatEnabled !== false,
      'scheduled'
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Find class by ID
   */
  async findById(id) {
    const query = `
      SELECT lc.*, u.name as teacher_name, u.email as teacher_email
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find class by class ID
   */
  async findByClassId(classId) {
    const query = `
      SELECT lc.*, u.name as teacher_name, u.email as teacher_email
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.class_id = $1
    `;

    const result = await db.query(query, [classId]);
    return result.rows[0] || null;
  }

  /**
   * Update class status
   */
  async updateStatus(id, status, additionalData = {}) {
    const updates = ['status = $1'];
    const values = [status];
    let paramCount = 1;

    // Add actual start/end times if provided
    if (additionalData.actualStart) {
      paramCount++;
      updates.push(`actual_start_time = $${paramCount}`);
      values.push(additionalData.actualStart);
    }

    if (additionalData.actualEnd) {
      paramCount++;
      updates.push(`actual_end_time = $${paramCount}`);
      values.push(additionalData.actualEnd);
    }

    // Add id as the last parameter
    paramCount++;
    values.push(id);

    const query = `
      UPDATE live_classes
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Start a class
   */
  async startClass(id) {
    return await this.updateStatus(id, 'live', {
      actualStart: new Date()
    });
  }

  /**
   * End a class
   */
  async endClass(id) {
    return await this.updateStatus(id, 'completed', {
      actualEnd: new Date()
    });
  }

  /**
   * Cancel a class
   */
  async cancelClass(id) {
    return await this.updateStatus(id, 'cancelled');
  }

  /**
   * Get active classes (currently running)
   */
  async getActiveClasses(limit = 100) {
    const query = `
      SELECT * FROM active_classes
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get classes by teacher ID
   */
  async getByTeacher(teacherId, status = null, limit = 100, offset = 0) {
    let query = `
      SELECT * FROM live_classes
      WHERE teacher_id = $1
    `;
    
    const values = [teacherId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY scheduled_start_time DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get upcoming classes for a student
   */
  async getUpcomingClasses(limit = 20) {
    const query = `
      SELECT lc.*, u.name as teacher_name, u.profile_picture as teacher_avatar
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.status = 'scheduled' 
        AND lc.scheduled_start_time > NOW()
      ORDER BY lc.scheduled_start_time ASC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get scheduled classes for a date range
   */
  async getScheduledClasses(startDate, endDate) {
    const query = `
      SELECT lc.*, u.name as teacher_name, u.email as teacher_email
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.scheduled_start_time >= $1 AND lc.scheduled_start_time <= $2
      ORDER BY lc.scheduled_start_time ASC
    `;

    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Update participant count
   */
  async updateParticipantCount(id, count) {
    const query = `
      UPDATE live_classes
      SET current_students = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [count, id]);
    return result.rows[0];
  }

  /**
   * Increment participant count
   */
  async incrementParticipants(id) {
    const query = `
      UPDATE live_classes
      SET current_students = current_students + 1
      WHERE id = $1
      RETURNING current_students, max_students
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Decrement participant count
   */
  async decrementParticipants(id) {
    const query = `
      UPDATE live_classes
      SET current_students = GREATEST(current_students - 1, 0)
      WHERE id = $1
      RETURNING current_students
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Set recording URL
   */
  async setRecordingUrl(id, url) {
    const query = `
      UPDATE live_classes
      SET recording_url = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [url, id]);
    return result.rows[0];
  }

  /**
   * Get class statistics
   */
  async getStatistics(id) {
    const query = `
      SELECT 
        lc.id,
        lc.title,
        lc.current_students,
        lc.max_students,
        COUNT(DISTINCT p.user_id) as unique_participants,
        COUNT(DISTINCT cm.id) as total_messages,
        COUNT(DISTINCT po.id) as total_polls,
        lc.actual_start_time,
        lc.actual_end_time,
        EXTRACT(EPOCH FROM (lc.actual_end_time - lc.actual_start_time))/60 as duration_minutes
      FROM live_classes lc
      LEFT JOIN participants p ON lc.id = p.class_id
      LEFT JOIN chat_messages cm ON lc.id = cm.class_id
      LEFT JOIN polls po ON lc.id = po.class_id
      WHERE lc.id = $1
      GROUP BY lc.id
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Search classes by title
   */
  async search(searchTerm, limit = 50) {
    const query = `
      SELECT lc.*, u.name as teacher_name
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.title ILIKE $1 OR lc.description ILIKE $1
      ORDER BY lc.scheduled_start_time DESC
      LIMIT $2
    `;

    const result = await db.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  /**
   * Delete a class (only if not started)
   */
  async delete(id) {
    const query = `
      DELETE FROM live_classes
      WHERE id = $1 AND status IN ('scheduled', 'cancelled')
      RETURNING id
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get classes ending soon (for reminders)
   */
  async getEndingSoon(minutes = 5) {
    const query = `
      SELECT lc.*, u.name as teacher_name
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.status = 'active'
        AND lc.scheduled_end_time <= NOW() + INTERVAL '${minutes} minutes'
        AND lc.scheduled_end_time > NOW()
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get classes starting soon (for notifications)
   */
  async getStartingSoon(minutes = 10) {
    const query = `
      SELECT lc.*, u.name as teacher_name
      FROM live_classes lc
      LEFT JOIN users u ON lc.teacher_id = u.id
      WHERE lc.status = 'scheduled'
        AND lc.scheduled_start_time <= NOW() + INTERVAL '${minutes} minutes'
        AND lc.scheduled_start_time > NOW()
    `;

    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = new LiveClassRepository();

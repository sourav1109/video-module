const LiveClassRepository = require('../repositories/LiveClassRepository');
const UserRepository = require('../repositories/UserRepository');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new live class
 */
exports.createClass = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledStart,
      scheduledEnd,
      maxParticipants,
      recordingEnabled,
      whiteboardEnabled,
      chatEnabled,
      pollsEnabled
    } = req.body;

    // Validate required fields
    if (!title || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: 'Title, scheduled start, and scheduled end are required'
      });
    }

    // Get teacher ID from authenticated user
    const teacherId = req.user.id;

    // Generate unique class ID
    const classId = uuidv4();

    // Create class
    const liveClass = await LiveClassRepository.create({
      title,
      description,
      teacherId,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      classId,
      maxParticipants: maxParticipants || 500,
      recordingEnabled: recordingEnabled !== false,
      whiteboardEnabled: whiteboardEnabled !== false,
      chatEnabled: chatEnabled !== false,
      pollsEnabled: pollsEnabled !== false
    });

    res.status(201).json({
      success: true,
      message: 'Live class created successfully',
      class: liveClass
    });

  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating live class',
      error: error.message
    });
  }
};

/**
 * Get class by ID
 */
exports.getClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClassRepository.findById(id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      class: liveClass
    });

  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving live class',
      error: error.message
    });
  }
};

/**
 * Get class by class ID
 */
exports.getClassByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const liveClass = await LiveClassRepository.findByClassId(classId);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      class: liveClass
    });

  } catch (error) {
    console.error('Get class by class ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving live class',
      error: error.message
    });
  }
};

/**
 * Get all active classes
 */
exports.getActiveClasses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const classes = await LiveClassRepository.getActiveClasses(limit);

    res.json({
      success: true,
      count: classes.length,
      classes
    });

  } catch (error) {
    console.error('Get active classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active classes',
      error: error.message
    });
  }
};

/**
 * Get upcoming classes
 */
exports.getUpcomingClasses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const classes = await LiveClassRepository.getUpcomingClasses(limit);

    res.json({
      success: true,
      count: classes.length,
      classes
    });

  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving upcoming classes',
      error: error.message
    });
  }
};

/**
 * Get classes by teacher
 */
exports.getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const classes = await LiveClassRepository.getByTeacher(
      teacherId,
      status,
      limit,
      offset
    );

    res.json({
      success: true,
      count: classes.length,
      classes
    });

  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving teacher classes',
      error: error.message
    });
  }
};

/**
 * Get classes for student (enrolled classes)
 */
exports.getStudentClasses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Get all active and upcoming classes that student can join
    let query = 'SELECT * FROM live_classes WHERE status IN ($1, $2)';
    const params = ['scheduled', 'live'];

    if (status) {
      query = 'SELECT * FROM live_classes WHERE status = $1';
      params[0] = status;
      params.splice(1);
    }

    query += ' ORDER BY scheduled_start_time DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      classes: result.rows
    });

  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving student classes',
      error: error.message
    });
  }
};

/**
 * Start a class
 */
exports.startClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClassRepository.startClass(id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class started successfully',
      class: liveClass
    });

  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting class',
      error: error.message
    });
  }
};

/**
 * End a class
 */
exports.endClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClassRepository.endClass(id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class ended successfully',
      class: liveClass
    });

  } catch (error) {
    console.error('End class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending class',
      error: error.message
    });
  }
};

/**
 * Cancel a class
 */
exports.cancelClass = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClassRepository.cancelClass(id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class cancelled successfully',
      class: liveClass
    });

  } catch (error) {
    console.error('Cancel class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling class',
      error: error.message
    });
  }
};

/**
 * Get class statistics
 */
exports.getClassStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await LiveClassRepository.getStatistics(id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('Get class statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving class statistics',
      error: error.message
    });
  }
};

/**
 * Search classes
 */
exports.searchClasses = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const classes = await LiveClassRepository.search(query, limit);

    res.json({
      success: true,
      count: classes.length,
      classes
    });

  } catch (error) {
    console.error('Search classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching classes',
      error: error.message
    });
  }
};

/**
 * Delete a class
 */
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await LiveClassRepository.delete(id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

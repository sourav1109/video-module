const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const liveClassController = require('../controllers/liveClassController');

router.use(auth);

// Teacher routes
router.post('/create', authorizeRoles('teacher', 'admin'), liveClassController.createClass);
router.get('/teacher/classes', authorizeRoles('teacher', 'admin'), liveClassController.getTeacherClasses);

// Student routes
router.get('/student/classes', authorizeRoles('student', 'teacher', 'admin'), liveClassController.getStudentClasses);

// Common routes
router.get('/active', liveClassController.getActiveClasses);
router.get('/upcoming', liveClassController.getUpcomingClasses);
router.get('/search', liveClassController.searchClasses);
router.get('/:id', liveClassController.getClass);
router.get('/class/:classId', liveClassController.getClassByClassId);
router.post('/:id/start', authorizeRoles('teacher', 'admin'), liveClassController.startClass);
router.post('/:id/end', authorizeRoles('teacher', 'admin'), liveClassController.endClass);
router.post('/:id/cancel', authorizeRoles('teacher', 'admin'), liveClassController.cancelClass);
router.get('/:id/statistics', authorizeRoles('teacher', 'admin'), liveClassController.getClassStatistics);
router.delete('/:id', authorizeRoles('teacher', 'admin'), liveClassController.deleteClass);

module.exports = router;

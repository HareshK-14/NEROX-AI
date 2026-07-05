const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const o = require('../controllers/officerController');

// All routes require auth + placement_officer or admin role
router.use(auth, requireRole('placement_officer', 'admin'));

router.get('/dashboard', o.getDashboardStats);
router.get('/students', o.getAllStudents);
router.get('/students/:id', o.getStudentById);
router.get('/analytics', o.getPlacementAnalytics);
router.post('/ai/query', o.askAnalyticsAgent);

module.exports = router;

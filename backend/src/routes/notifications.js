const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const n = require('../controllers/notificationController');

// Students can read their own notifications
router.get('/my', auth, n.getStudentNotifications);
router.patch('/:id/read', auth, n.markRead);

// Officers/admins can send, view all, delete
router.use(auth, requireRole('placement_officer', 'admin'));
router.post('/', n.sendNotification);
router.get('/', n.getAllNotifications);
router.delete('/:id', n.deleteNotification);

module.exports = router;

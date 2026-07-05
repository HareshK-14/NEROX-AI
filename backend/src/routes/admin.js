const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const a = require('../controllers/adminController');

router.use(auth, requireRole('admin'));

router.get('/stats', a.getSystemStats);
router.get('/users', a.getAllUsers);
router.patch('/users/:id/role', a.updateUserRole);
router.delete('/users/:id', a.deleteUser);
router.get('/logs', a.getLogs);
router.put('/settings', a.updateSettings);

module.exports = router;

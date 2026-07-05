const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/helpdesk', campusController.helpdesk);
router.post('/timetable', campusController.timetable);
router.post('/library', campusController.library);
router.post('/events', campusController.events);

module.exports = router;

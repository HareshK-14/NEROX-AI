const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/daily', missionController.getDailyMission);
router.post('/complete', missionController.completeMission);
router.get('/points', missionController.getPoints);

module.exports = router;

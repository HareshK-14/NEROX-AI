const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/success-score', analyticsController.getSuccessScore);
router.post('/update', analyticsController.updateAnalytics);
router.get('/history', analyticsController.getHistory);

module.exports = router;

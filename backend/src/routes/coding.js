const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/mentor', codingController.mentor);
router.post('/debug', codingController.debug);
router.post('/sql', codingController.sqlAssistant);
router.post('/test', codingController.generateTest);
router.post('/test/submit', codingController.submitTest);

module.exports = router;

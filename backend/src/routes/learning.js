const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authMiddleware);

router.post('/tutor', learningController.tutor);
router.post('/notes', upload.single('file'), learningController.analyzeNotes);
router.post('/quiz', learningController.generateQuiz);
router.post('/revision', learningController.revisionPlan);
router.post('/quiz-result', learningController.saveQuizResult);

module.exports = router;

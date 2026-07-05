const express = require('express');
const router = express.Router();
const c = require('../controllers/careerController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/advise', c.advise);
router.post('/skill-gap', c.skillGap);
router.get('/roadmaps', c.getSavedRoadmaps);

module.exports = router;

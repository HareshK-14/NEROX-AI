const express = require('express');
const router = express.Router();
const p = require('../controllers/placementController');
const auth = require('../middleware/auth');

router.use(auth);

// Agent 1 — Company Readiness
router.post('/readiness', p.readiness);

// Agent 2 — Company Explorer
router.post('/company', p.exploreCompany);

// Agent 3 — Test Generator
router.post('/test', p.generateTest);
router.post('/test/save', p.saveTestResult);

// Agent 4 — Coding Evaluator
router.post('/evaluate-code', p.evaluateCode);

// Agent 5 — GD Coach
router.post('/gd/topic', p.generateGDTopic);
router.post('/gd/submit', p.submitGD);

// Agent 6 — Analytics
router.get('/analytics', p.analytics);
router.post('/analytics/update', p.updateAnalytics);

// Agent 7 — Strategy
router.post('/strategy', p.strategy);

// Agent 8 — Daily Missions
router.get('/missions', p.getDailyMissions);
router.post('/missions/complete', p.completeMission);

module.exports = router;

const express = require('express');
const router = express.Router();
const { query, history, listAgents } = require('../controllers/orchestratorController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/query', query);
router.get('/history', history);
router.get('/agents', listAgents);

module.exports = router;

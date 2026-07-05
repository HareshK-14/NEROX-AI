const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const c = require('../controllers/companyController');

// All routes require officer or admin
router.use(auth, requireRole('placement_officer', 'admin'));

router.get('/', c.getCompanies);
router.post('/', c.addCompany);
router.put('/:id', c.updateCompany);
router.delete('/:id', c.deleteCompany);
router.get('/drives', c.getDrives);
router.post('/drives', c.scheduleDrive);
router.post('/ai-prep-plan', c.generateAIPrepPlan);

module.exports = router;

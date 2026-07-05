const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/skill', profileController.addSkill);
router.delete('/skill/:id', profileController.deleteSkill);
router.post('/avatar', upload.single('avatar'), profileController.updateAvatar);
router.get('/notifications', profileController.getNotifications);

module.exports = router;

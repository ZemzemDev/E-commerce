const express = require('express');
const router = express.Router();
const { getHeroBackgrounds, updateHeroBackgrounds } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/hero-backgrounds', getHeroBackgrounds);
router.put('/hero-backgrounds', protect, admin, updateHeroBackgrounds);

module.exports = router;

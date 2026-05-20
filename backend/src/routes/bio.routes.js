const express = require('express');
const router = express.Router();
const { getMyBioPage, updateBioPage, getPublicBioPage, recordBioClick } = require('../controllers/bio.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/me', protect, getMyBioPage);
router.put('/me', protect, updateBioPage);
router.get('/:username', getPublicBioPage);
router.post('/:username/click/:linkIndex', recordBioClick);

module.exports = router;

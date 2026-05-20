const express = require('express');
const router = express.Router();
const { generateQR, generateQRSVG, getUserQRCodes } = require('../controllers/qr.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', getUserQRCodes);
router.post('/generate', generateQR);
router.post('/generate-svg', generateQRSVG);

module.exports = router;

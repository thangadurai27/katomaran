const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getLinkAnalytics, getRealTimeVisits } = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/overview', protect, getAnalyticsOverview);
router.get('/realtime', protect, getRealTimeVisits);
router.get('/link/:linkId', protect, getLinkAnalytics);

module.exports = router;

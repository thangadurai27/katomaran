const express = require('express');
const router = express.Router();
const { generateSmartSlug, getAnalyticsInsights, checkUrlSafety, predictPerformance, summarizeUrl, aiChat, getCampaignSuggestions } = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

router.use(protect);
router.use(aiLimiter);

router.post('/generate-slug', generateSmartSlug);
router.post('/analytics-insights', getAnalyticsInsights);
router.post('/check-url', checkUrlSafety);
router.post('/predict-performance', predictPerformance);
router.post('/summarize-url', summarizeUrl);
router.post('/chat', aiChat);
router.post('/campaign-suggestions', getCampaignSuggestions);

module.exports = router;

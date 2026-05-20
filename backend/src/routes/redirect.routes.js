const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirect.controller');
const { redirectLimiter } = require('../middlewares/rateLimiter');

router.get('/:shortCode', redirectLimiter, handleRedirect);

module.exports = router;

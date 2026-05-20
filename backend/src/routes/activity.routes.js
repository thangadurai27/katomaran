const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog.model');
const { success } = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth.middleware');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { action, severity } = req.query;

    const query = { user: req.user._id };
    if (action) query.action = action;
    if (severity) query.severity = severity;

    const [logs, total] = await Promise.all([
        ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ActivityLog.countDocuments(query)
    ]);

    return success(res, 'Activity logs fetched.', { logs, pagination: buildPaginationMeta(total, page, limit) });
}));

module.exports = router;

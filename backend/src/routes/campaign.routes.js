const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign.model');
const { success, error } = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth.middleware');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const [campaigns, total] = await Promise.all([
        Campaign.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Campaign.countDocuments({ user: req.user._id })
    ]);
    return success(res, 'Campaigns fetched.', { campaigns, pagination: buildPaginationMeta(total, page, limit) });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { name, description, status, startDate, endDate, tags, color, utmSource, utmMedium, utmCampaign } = req.body;
    const campaign = await Campaign.create({ user: req.user._id, name, description, status, startDate, endDate, tags, color, utmSource, utmMedium, utmCampaign });
    return success(res, 'Campaign created.', { campaign }, 201);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) return error(res, 'Campaign not found.', 404);
    return success(res, 'Campaign fetched.', { campaign });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const campaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!campaign) return error(res, 'Campaign not found.', 404);
    return success(res, 'Campaign updated.', { campaign });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!campaign) return error(res, 'Campaign not found.', 404);
    return success(res, 'Campaign deleted.');
}));

module.exports = router;

const express = require('express');
const router = express.Router();
const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const { success, error } = require('../utils/apiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Public stats for a short URL
// @route GET /api/stats/:shortCode
router.get('/:shortCode', asyncHandler(async (req, res) => {
    const link = await Link.findOne({
        $or: [{ shortCode: req.params.shortCode }, { customAlias: req.params.shortCode }],
        isTrashed: false
    }).populate('user', 'name username avatar').lean();

    if (!link) return error(res, 'Link not found.', 404);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalClicks, uniqueClicks, countryStats, deviceStats, dailyClicks] = await Promise.all([
        Visit.countDocuments({ link: link._id }),
        Visit.countDocuments({ link: link._id, isUnique: true }),
        Visit.aggregate([
            { $match: { link: link._id, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$countryCode', country: { $first: '$country' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 10 }
        ]),
        Visit.aggregate([
            { $match: { link: link._id, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$device', count: { $sum: 1 } } }
        ]),
        Visit.aggregate([
            { $match: { link: link._id, clickedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])
    ]);

    return success(res, 'Public stats fetched.', {
        link: { title: link.title, shortCode: link.shortCode, createdAt: link.createdAt, qrCode: link.qrCode },
        stats: { totalClicks, uniqueClicks },
        countryStats,
        deviceStats,
        dailyClicks
    });
}));

module.exports = router;

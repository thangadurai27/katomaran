const Visit = require('../models/Visit.model');
const Link = require('../models/Link.model');
const { success, error } = require('../utils/apiResponse');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Get analytics overview for user
// @route GET /api/analytics/overview
const getAnalyticsOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchStage = { user: userId, clickedAt: { $gte: startDate } };

    const [
        totalClicks,
        uniqueClicks,
        countryStats,
        deviceStats,
        browserStats,
        osStats,
        referrerStats,
        dailyClicks,
        botClicks
    ] = await Promise.all([
        Visit.countDocuments(matchStage),
        Visit.countDocuments({ ...matchStage, isUnique: true }),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$countryCode', country: { $first: '$country' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$device', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$os', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        Visit.aggregate([
            { $match: { ...matchStage, referer: { $ne: '' } } },
            { $group: { _id: '$referer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
                    clicks: { $sum: 1 },
                    unique: { $sum: { $cond: ['$isUnique', 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Visit.countDocuments({ ...matchStage, isBot: true })
    ]);

    return success(res, 'Analytics overview fetched.', {
        totalClicks,
        uniqueClicks,
        botClicks,
        humanClicks: totalClicks - botClicks,
        bounceRate: totalClicks > 0 ? ((1 - uniqueClicks / totalClicks) * 100).toFixed(1) : 0,
        countryStats,
        deviceStats,
        browserStats,
        osStats,
        referrerStats,
        dailyClicks,
        dateRange: { from: startDate, to: new Date(), days }
    });
});

// @desc  Get analytics for a specific link
// @route GET /api/analytics/link/:linkId
const getLinkAnalytics = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ _id: req.params.linkId, user: req.user._id });
    if (!link) return error(res, 'Link not found.', 404);

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const matchStage = { link: link._id, clickedAt: { $gte: startDate } };

    const [totalClicks, uniqueClicks, countryStats, deviceStats, browserStats, dailyClicks, hourlyPattern, topReferers] = await Promise.all([
        Visit.countDocuments(matchStage),
        Visit.countDocuments({ ...matchStage, isUnique: true }),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$countryCode', country: { $first: '$country' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 15 }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$device', count: { $sum: 1 } } }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 8 }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]),
        Visit.aggregate([
            { $match: matchStage },
            { $group: { _id: { $hour: '$clickedAt' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]),
        Visit.aggregate([
            { $match: { ...matchStage, referer: { $ne: '' } } },
            { $group: { _id: '$referer', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 10 }
        ])
    ]);

    return success(res, 'Link analytics fetched.', {
        link: { ...link.toObject() },
        totalClicks,
        uniqueClicks,
        countryStats,
        deviceStats,
        browserStats,
        dailyClicks,
        hourlyPattern,
        topReferers,
        dateRange: { from: startDate, to: new Date(), days }
    });
});

// @desc  Get real-time recent visits
// @route GET /api/analytics/realtime
const getRealTimeVisits = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentVisits = await Visit.find({
        user: userId,
        clickedAt: { $gte: tenMinutesAgo },
        isBot: false
    }).sort({ clickedAt: -1 }).limit(50).populate('link', 'shortCode title').lean();

    const liveCount = recentVisits.length;

    return success(res, 'Real-time data fetched.', { liveCount, recentVisits });
});

module.exports = { getAnalyticsOverview, getLinkAnalytics, getRealTimeVisits };

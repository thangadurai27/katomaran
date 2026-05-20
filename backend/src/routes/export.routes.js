const express = require('express');
const router = express.Router();
const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const { protect } = require('../middlewares/auth.middleware');
const { error } = require('../utils/apiResponse');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

// @desc  Export links as CSV
// @route GET /api/export/links
router.get('/links', asyncHandler(async (req, res) => {
    const links = await Link.find({ user: req.user._id, isTrashed: false }).lean();

    const csvPath = path.join(__dirname, `../../uploads/tmp/links-${req.user._id}-${Date.now()}.csv`);
    const dir = path.dirname(csvPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
            { id: 'shortCode', title: 'Short Code' },
            { id: 'originalUrl', title: 'Original URL' },
            { id: 'title', title: 'Title' },
            { id: 'totalClicks', title: 'Total Clicks' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'expiresAt', title: 'Expires At' },
            { id: 'isActive', title: 'Active' }
        ]
    });

    const records = links.map(l => ({
        shortCode: l.shortCode,
        originalUrl: l.originalUrl,
        title: l.title || '',
        totalClicks: l.stats?.totalClicks || 0,
        createdAt: l.createdAt?.toISOString() || '',
        expiresAt: l.expiresAt?.toISOString() || '',
        isActive: l.isActive
    }));

    await csvWriter.writeRecords(records);

    res.download(csvPath, 'snaplink-links.csv', (err) => {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    });
}));

// @desc  Export analytics as CSV
// @route GET /api/export/analytics
router.get('/analytics', asyncHandler(async (req, res) => {
    const { linkId } = req.query;
    const query = { user: req.user._id };
    if (linkId) query.link = linkId;

    const visits = await Visit.find(query).sort({ clickedAt: -1 }).limit(10000).lean();

    const csvPath = path.join(__dirname, `../../uploads/tmp/analytics-${req.user._id}-${Date.now()}.csv`);
    const dir = path.dirname(csvPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
            { id: 'shortCode', title: 'Short Code' },
            { id: 'clickedAt', title: 'Clicked At' },
            { id: 'country', title: 'Country' },
            { id: 'city', title: 'City' },
            { id: 'device', title: 'Device' },
            { id: 'browser', title: 'Browser' },
            { id: 'os', title: 'OS' },
            { id: 'referer', title: 'Referrer' },
            { id: 'isUnique', title: 'Unique' },
            { id: 'isBot', title: 'Bot' }
        ]
    });

    const records = visits.map(v => ({
        shortCode: v.shortCode,
        clickedAt: v.clickedAt?.toISOString() || '',
        country: v.country || '',
        city: v.city || '',
        device: v.device || '',
        browser: v.browser || '',
        os: v.os || '',
        referer: v.referer || '',
        isUnique: v.isUnique,
        isBot: v.isBot
    }));

    await csvWriter.writeRecords(records);
    res.download(csvPath, 'snaplink-analytics.csv', () => {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    });
}));

module.exports = router;

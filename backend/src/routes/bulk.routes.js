const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Link = require('../models/Link.model');
const { success, error } = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth.middleware');
const { isValidUrl } = require('../utils/helpers');
const { nanoid } = require('nanoid');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const upload = multer({ dest: 'uploads/tmp/' });

router.use(protect);

// @desc  Bulk shorten from CSV
// @route POST /api/bulk/import
router.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) return error(res, 'CSV file required.', 400);

    const results = [];
    const errors = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    fs.unlinkSync(req.file.path);

    const created = [];
    for (const row of results.slice(0, 500)) {
        const url = row.url || row.URL || row.originalUrl || row['Original URL'];
        if (!url || !isValidUrl(url)) {
            errors.push({ url: url || 'unknown', reason: 'Invalid URL' });
            continue;
        }
        try {
            const link = await Link.create({
                user: req.user._id,
                originalUrl: url,
                title: row.title || row.Title || '',
                shortCode: nanoid(7),
                tags: row.tags ? row.tags.split(',').map(t => t.trim()) : []
            });
            created.push({ originalUrl: url, shortCode: link.shortCode });
        } catch (err) {
            errors.push({ url, reason: err.message });
        }
    }

    return success(res, `Bulk import complete. ${created.length} links created, ${errors.length} errors.`, { created, errors });
}));

// @desc  Bulk create from JSON array
// @route POST /api/bulk/create
router.post('/create', asyncHandler(async (req, res) => {
    const { urls } = req.body;
    if (!urls?.length) return error(res, 'URLs array required.', 400);

    const created = [];
    const errors = [];

    for (const item of urls.slice(0, 100)) {
        const url = typeof item === 'string' ? item : item.url;
        if (!url || !isValidUrl(url)) {
            errors.push({ url, reason: 'Invalid URL' });
            continue;
        }
        try {
            const link = await Link.create({
                user: req.user._id,
                originalUrl: url,
                title: item.title || '',
                shortCode: nanoid(7)
            });
            created.push(link);
        } catch (err) {
            errors.push({ url, reason: err.message });
        }
    }

    return success(res, `${created.length} links created.`, { created, errors });
}));

module.exports = router;

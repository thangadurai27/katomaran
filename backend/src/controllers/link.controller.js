const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const Campaign = require('../models/Campaign.model');
const ActivityLog = require('../models/ActivityLog.model');
const { success, error, paginated } = require('../utils/apiResponse');
const { getClientIP, parseUserAgent, getGeoData, detectBot, hashIP, getPaginationOptions, buildPaginationMeta, isValidUrl } = require('../utils/helpers');
const { generateContent } = require('../configs/gemini');
const qrcode = require('qrcode');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Create new short link
// @route POST /api/links
const createLink = asyncHandler(async (req, res) => {
    const { originalUrl, customAlias, title, description, expiresAt, password, isPasswordProtected, isOneTime, utmParams, campaignId, tags, deepLink, geoRestrictions, scheduledAt } = req.body;

    if (!isValidUrl(originalUrl)) {
        return error(res, 'Invalid URL format.', 400);
    }

    // Check custom alias availability
    if (customAlias) {
        const aliasExists = await Link.findOne({ $or: [{ customAlias }, { shortCode: customAlias }] });
        if (aliasExists) {
            return error(res, 'Custom alias is already taken. Please choose another.', 409);
        }
    }

    // AI spam detection via Gemini
    let spamScore = 0;
    let isSpam = false;
    let aiCategory = 'general';
    let aiEngagementScore = 50;

    try {
        const aiPrompt = `Analyze this URL and respond ONLY with valid JSON (no markdown):
URL: ${originalUrl}
{
  "spamScore": <0-100 number>,
  "isSpam": <true/false>,
  "category": "<category>",
  "engagementScore": <0-100 number>,
  "summary": "<brief one sentence about what this URL links to>"
}`;
        const aiResult = await generateContent(aiPrompt);
        const cleanResult = aiResult.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanResult);
        spamScore = parsed.spamScore || 0;
        isSpam = parsed.isSpam || false;
        aiCategory = parsed.category || 'general';
        aiEngagementScore = parsed.engagementScore || 50;
    } catch (aiErr) {
        // AI failed, continue without
    }

    if (isSpam && spamScore > 80) {
        return error(res, 'URL flagged as potentially malicious. Short link creation denied.', 422);
    }

    // Generate metadata (try to fetch)
    let metadata = {};
    try {
        const axios = require('axios');
        const response = await axios.get(originalUrl, { timeout: 5000, headers: { 'User-Agent': 'SnapLinkBot/1.0' } });
        const html = response.data;
        const titleMatch = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
        const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] || '';
        const imageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] || '';
        metadata = { title: titleMatch.substring(0, 200), description: descMatch.substring(0, 500), image: imageMatch };
    } catch { }

    // Hash password if protected
    let hashedPassword;
    if (isPasswordProtected && password) {
        const bcrypt = require('bcryptjs');
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const linkData = {
        user: req.user._id,
        originalUrl,
        title: title || metadata.title,
        description: description || metadata.description,
        customAlias,
        isPasswordProtected: !!isPasswordProtected,
        password: hashedPassword,
        isOneTime: !!isOneTime,
        expiresAt: expiresAt || null,
        scheduledAt: scheduledAt || null,
        utmParams,
        campaign: campaignId || null,
        tags: tags || [],
        deepLink,
        geoRestrictions,
        metadata,
        spamScore,
        isSpam,
        aiCategory,
        aiEngagementScore
    };

    if (customAlias) linkData.shortCode = customAlias;

    const link = await Link.create(linkData);

    // Generate QR code automatically
    try {
        const shortUrl = `${process.env.SHORT_URL_BASE}${link.shortCode}`;
        const qrDataUrl = await qrcode.toDataURL(shortUrl, { errorCorrectionLevel: 'M', width: 300 });
        await Link.findByIdAndUpdate(link._id, { 'qrCode.url': qrDataUrl, 'qrCode.generatedAt': new Date() });
        link.qrCode = { url: qrDataUrl, generatedAt: new Date() };
    } catch { }

    // Update campaign stats
    if (campaignId) {
        await Campaign.findByIdAndUpdate(campaignId, { $inc: { 'stats.totalLinks': 1 } });
    }

    // Update user stats
    const User = require('../models/User.model');
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalLinks': 1 } });

    await ActivityLog.create({ user: req.user._id, action: 'link_created', description: `Created short link: ${link.shortCode}`, metadata: { linkId: link._id } });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.to(`user:${req.user._id}`).emit('link:created', link);

    return success(res, 'Short link created successfully!', { link }, 201);
});

// @desc  Get all links for user
// @route GET /api/links
const getLinks = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, status, campaign, sortBy = 'createdAt', sortOrder = '-1' } = req.query;

    const query = { user: req.user._id, isTrashed: req.query.trashed === 'true' };

    if (!req.query.archived) query.isArchived = false;
    if (req.query.archived === 'true') query.isArchived = true;
    if (req.query.favorites === 'true') query.isFavorited = true;

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { originalUrl: { $regex: search, $options: 'i' } },
            { shortCode: { $regex: search, $options: 'i' } },
            { customAlias: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    if (status === 'active') { query.isActive = true; query.isArchived = false; }
    if (status === 'expired') query.expiresAt = { $lt: new Date() };
    if (campaign) query.campaign = campaign;

    const sort = { [sortBy]: parseInt(sortOrder) };

    const [links, total] = await Promise.all([
        Link.find(query).populate('campaign', 'name color').sort(sort).skip(skip).limit(limit).lean(),
        Link.countDocuments(query)
    ]);

    return paginated(res, 'Links fetched successfully.', links, buildPaginationMeta(total, page, limit));
});

// @desc  Get single link
// @route GET /api/links/:id
const getLinkById = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id }).populate('campaign');
    if (!link) return error(res, 'Link not found.', 404);
    return success(res, 'Link fetched.', { link });
});

// @desc  Update link
// @route PUT /api/links/:id
const updateLink = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
    if (!link) return error(res, 'Link not found.', 404);

    const allowedFields = ['title', 'description', 'originalUrl', 'tags', 'expiresAt', 'isActive', 'utmParams', 'deepLink', 'geoRestrictions', 'isFavorited', 'isPinned'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) link[field] = req.body[field];
    });

    await link.save();
    await ActivityLog.create({ user: req.user._id, action: 'link_updated', description: `Updated link: ${link.shortCode}` });

    return success(res, 'Link updated successfully.', { link });
});

// @desc  Delete link (soft delete to trash)
// @route DELETE /api/links/:id
const deleteLink = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
    if (!link) return error(res, 'Link not found.', 404);

    if (req.query.permanent === 'true') {
        await Visit.deleteMany({ link: link._id });
        await link.deleteOne();
        await ActivityLog.create({ user: req.user._id, action: 'link_deleted', description: `Permanently deleted link: ${link.shortCode}` });
        return success(res, 'Link permanently deleted.');
    }

    await Link.findByIdAndUpdate(link._id, { isTrashed: true, isActive: false });
    await ActivityLog.create({ user: req.user._id, action: 'link_deleted', description: `Moved link to trash: ${link.shortCode}` });
    return success(res, 'Link moved to trash.');
});

// @desc  Archive / unarchive link
// @route PATCH /api/links/:id/archive
const toggleArchive = asyncHandler(async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
    if (!link) return error(res, 'Link not found.', 404);
    link.isArchived = !link.isArchived;
    await link.save();
    return success(res, `Link ${link.isArchived ? 'archived' : 'unarchived'}.`, { link });
});

// @desc  Bulk operations
// @route POST /api/links/bulk
const bulkOperation = asyncHandler(async (req, res) => {
    const { ids, operation } = req.body;
    if (!ids?.length) return error(res, 'No link IDs provided.', 400);

    const query = { _id: { $in: ids }, user: req.user._id };

    switch (operation) {
        case 'delete':
            await Link.updateMany(query, { isTrashed: true, isActive: false });
            break;
        case 'archive':
            await Link.updateMany(query, { isArchived: true });
            break;
        case 'activate':
            await Link.updateMany(query, { isActive: true, isArchived: false, isTrashed: false });
            break;
        case 'deactivate':
            await Link.updateMany(query, { isActive: false });
            break;
        default:
            return error(res, 'Invalid operation.', 400);
    }

    return success(res, `Bulk ${operation} completed for ${ids.length} links.`);
});

// @desc  Get dashboard stats
// @route GET /api/links/stats/overview
const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
        totalLinks,
        activeLinks,
        expiredLinks,
        totalClicks,
        clicksThisWeek,
        clicksLastWeek,
        recentLinks,
        topLink
    ] = await Promise.all([
        Link.countDocuments({ user: userId, isTrashed: false }),
        Link.countDocuments({ user: userId, isActive: true, isTrashed: false }),
        Link.countDocuments({ user: userId, expiresAt: { $lt: now }, isTrashed: false }),
        Visit.countDocuments({ user: userId }),
        Visit.countDocuments({ user: userId, clickedAt: { $gte: sevenDaysAgo } }),
        Visit.countDocuments({ user: userId, clickedAt: { $gte: thirtyDaysAgo, $lt: sevenDaysAgo } }),
        Link.find({ user: userId, isTrashed: false }).sort({ createdAt: -1 }).limit(5).lean(),
        Link.findOne({ user: userId }).sort({ 'stats.totalClicks': -1 }).lean()
    ]);

    const clickGrowth = clicksLastWeek > 0
        ? (((clicksThisWeek - clicksLastWeek) / clicksLastWeek) * 100).toFixed(1)
        : clicksThisWeek > 0 ? 100 : 0;

    // Daily clicks for chart (last 7 days)
    const dailyClicks = await Visit.aggregate([
        { $match: { user: userId, clickedAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    // Device breakdown
    const deviceStats = await Visit.aggregate([
        { $match: { user: userId, clickedAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    return success(res, 'Dashboard stats fetched.', {
        totalLinks,
        activeLinks,
        expiredLinks,
        totalClicks,
        clickGrowth: parseFloat(clickGrowth),
        recentLinks,
        topLink,
        charts: { dailyClicks, deviceStats }
    });
});

module.exports = { createLink, getLinks, getLinkById, updateLink, deleteLink, toggleArchive, bulkOperation, getDashboardStats };

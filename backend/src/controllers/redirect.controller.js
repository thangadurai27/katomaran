const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const { success, error } = require('../utils/apiResponse');
const { getClientIP, parseUserAgent, getGeoData, detectBot, hashIP } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Handle short URL redirect
// @route GET /r/:shortCode
const handleRedirect = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || req.headers.referrer || '';

    // Find link (check customAlias OR shortCode)
    const link = await Link.findOne({
        $or: [{ shortCode }, { customAlias: shortCode }],
        isTrashed: false
    }).select('+password');

    if (!link) {
        return res.redirect(`${process.env.FRONTEND_URL}/404?code=${shortCode}`);
    }

    // Check if scheduled and not yet active
    if (link.scheduledAt && link.scheduledAt > new Date()) {
        return res.redirect(`${process.env.FRONTEND_URL}/scheduled?code=${shortCode}`);
    }

    // Check expiry
    if (link.expiresAt && link.expiresAt < new Date()) {
        return res.redirect(`${process.env.FRONTEND_URL}/expired?code=${shortCode}`);
    }

    // Check if active
    if (!link.isActive) {
        return res.redirect(`${process.env.FRONTEND_URL}/inactive?code=${shortCode}`);
    }

    // Password protection
    if (link.isPasswordProtected) {
        const providedPassword = req.query.p || req.headers['x-link-password'];
        if (!providedPassword) {
            return res.redirect(`${process.env.FRONTEND_URL}/protected/${shortCode}`);
        }
        const isValid = await bcrypt.compare(providedPassword, link.password);
        if (!isValid) {
            return res.redirect(`${process.env.FRONTEND_URL}/protected/${shortCode}?error=1`);
        }
    }

    // Parse analytics data
    const uaData = parseUserAgent(userAgent);
    const geoData = getGeoData(ip);
    const ipHash = hashIP(ip);
    const isBot = detectBot(userAgent);

    // Check geo restrictions
    if (link.geoRestrictions?.allowed?.length > 0) {
        if (!link.geoRestrictions.allowed.includes(geoData.countryCode)) {
            return res.redirect(`${process.env.FRONTEND_URL}/geo-blocked`);
        }
    }
    if (link.geoRestrictions?.blocked?.includes(geoData.countryCode)) {
        return res.redirect(`${process.env.FRONTEND_URL}/geo-blocked`);
    }

    // Device restrictions
    if (uaData.device === 'mobile' && !link.deviceRestrictions?.allowMobile) {
        return res.redirect(`${process.env.FRONTEND_URL}/device-blocked`);
    }

    // Check unique click
    const existingVisit = await Visit.findOne({ ipHash, link: link._id });
    const isUnique = !existingVisit;

    // Record visit asynchronously (don't block redirect)
    const visitData = {
        link: link._id,
        user: link.user,
        shortCode,
        ip,
        ipHash,
        userAgent,
        referer,
        ...geoData,
        ...uaData,
        isUnique,
        isBot,
        clickedAt: new Date()
    };

    // Parse UTM from referer/querystring
    if (req.query.utm_source) visitData.utmSource = req.query.utm_source;
    if (req.query.utm_medium) visitData.utmMedium = req.query.utm_medium;
    if (req.query.utm_campaign) visitData.utmCampaign = req.query.utm_campaign;

    Visit.create(visitData).then(async (visit) => {
        // Update link stats
        const update = { $inc: { 'stats.totalClicks': 1 }, 'stats.lastClickAt': new Date() };
        if (isUnique) update.$inc['stats.uniqueClicks'] = 1;
        await Link.findByIdAndUpdate(link._id, update);

        // Emit real-time event
        // Get io from app
        const { app } = require('../server'); // Circular dep workaround

        // One-time link deactivation
        if (link.isOneTime) {
            await Link.findByIdAndUpdate(link._id, { isActive: false });
        }
    }).catch(() => { });

    // Build redirect URL with UTM
    let redirectUrl = link.originalUrl;
    const utmSource = link.utmParams?.source || req.query.utm_source;
    if (utmSource && !redirectUrl.includes('utm_source')) {
        const url = new URL(redirectUrl);
        if (link.utmParams?.source) url.searchParams.set('utm_source', link.utmParams.source);
        if (link.utmParams?.medium) url.searchParams.set('utm_medium', link.utmParams.medium);
        if (link.utmParams?.campaign) url.searchParams.set('utm_campaign', link.utmParams.campaign);
        redirectUrl = url.toString();
    }

    // Deep link handling
    if (uaData.device === 'mobile' && uaData.os === 'Android' && link.deepLink?.android) {
        redirectUrl = link.deepLink.android;
    } else if (uaData.device === 'mobile' && uaData.os === 'iOS' && link.deepLink?.ios) {
        redirectUrl = link.deepLink.ios;
    }

    return res.redirect(301, redirectUrl);
});

module.exports = { handleRedirect };

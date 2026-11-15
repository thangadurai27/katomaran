const mongoose = require('mongoose');
const qrcode = require('qrcode');
const User = require('../models/User.model');
const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const Campaign = require('../models/Campaign.model');
const ActivityLog = require('../models/ActivityLog.model');
const logger = require('./logger');
const { createNotification } = require('./notification.helper');

const DEMO_EMAIL = 'demo@gmail.com';
const DEMO_PASSWORD = 'demo123';

const SHORT_URL_BASE = process.env.SHORT_URL_BASE || 'https://katomaran-y789.onrender.com/r/';

// Canonical demo sample links. Missing entries are re-seeded on every boot,
// so demo visitors always have data to explore even after deletions.
const SAMPLE_LINKS = [
    {
        title: 'Product Launch — SnapLink AI',
        description: 'Landing page for our latest product launch announcement.',
        originalUrl: 'https://example.com/product-launch',
        tags: ['product', 'launch'],
        campaignName: 'Spring Product Launch',
        category: 'marketing',
        engagement: 78,
        clicks: 324,
        favorited: true,
    },
    {
        title: 'Summer Sale — 40% Off Everything',
        description: 'Limited-time summer discount campaign.',
        originalUrl: 'https://example.com/summer-sale',
        tags: ['sale', 'promo'],
        campaignName: 'Summer Sale 2026',
        category: 'ecommerce',
        engagement: 85,
        clicks: 187,
    },
    {
        title: 'Webinar: Growing Links with AI',
        description: 'Registration page for our AI growth webinar.',
        originalUrl: 'https://example.com/webinar-ai-growth',
        tags: ['webinar', 'event'],
        campaignName: 'Spring Product Launch',
        category: 'events',
        engagement: 66,
        clicks: 96,
    },
    {
        title: 'GitHub — snaplink-ai/snaplink',
        description: 'Open-source repository for the SnapLink project.',
        originalUrl: 'https://github.com/example/snaplink-ai',
        tags: ['github', 'dev'],
        campaignName: 'Content Marketing',
        category: 'developer',
        engagement: 72,
        clicks: 214,
    },
    {
        title: 'Blog: 10 Link Tracking Tips',
        description: 'Latest blog post about link tracking best practices.',
        originalUrl: 'https://example.com/blog/link-tracking-tips',
        tags: ['blog', 'content'],
        campaignName: 'Content Marketing',
        category: 'content',
        engagement: 58,
        clicks: 52,
        expired: true,
    },
];

const CAMPAIGNS = [
    {
        name: 'Spring Product Launch',
        description: 'Launch campaign for the new SnapLink AI release.',
        color: '#7C3AED',
        status: 'active',
        utmSource: 'newsletter',
        utmMedium: 'email',
        utmCampaign: 'spring-product-launch',
    },
    {
        name: 'Summer Sale 2026',
        description: 'Seasonal promotion across social channels.',
        color: '#F59E0B',
        status: 'active',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'summer-sale-2026',
    },
    {
        name: 'Content Marketing',
        description: 'Ongoing blog and developer content distribution.',
        color: '#06B6D4',
        status: 'paused',
        utmSource: 'twitter',
        utmMedium: 'social',
        utmCampaign: 'content-marketing',
    },
];

const DEVICE_MIX = [
    { device: 'mobile', weight: 0.55 },
    { device: 'desktop', weight: 0.35 },
    { device: 'tablet', weight: 0.10 },
];

const GEO_MIX = [
    { country: 'United States', countryCode: 'US', weight: 0.38 },
    { country: 'India', countryCode: 'IN', weight: 0.24 },
    { country: 'United Kingdom', countryCode: 'GB', weight: 0.14 },
    { country: 'Germany', countryCode: 'DE', weight: 0.12 },
    { country: 'Canada', countryCode: 'CA', weight: 0.12 },
];

const BROWSER_MIX = [
    { browser: 'Chrome', os: 'Windows', weight: 0.42 },
    { browser: 'Safari', os: 'iOS', weight: 0.24 },
    { browser: 'Chrome', os: 'Android', weight: 0.18 },
    { browser: 'Firefox', os: 'Windows', weight: 0.09 },
    { browser: 'Edge', os: 'macOS', weight: 0.07 },
];

const REFERER_MIX = [
    { referer: 'direct', weight: 0.30 },
    { referer: 'https://twitter.com', weight: 0.22 },
    { referer: 'https://www.google.com', weight: 0.20 },
    { referer: 'https://www.linkedin.com', weight: 0.16 },
    { referer: 'https://news.ycombinator.com', weight: 0.12 },
];

const pick = (mix) => {
    const r = Math.random();
    let acc = 0;
    for (const entry of mix) {
        acc += entry.weight;
        if (r <= acc) return entry;
    }
    return mix[mix.length - 1];
};

const pickIpHash = () => {
    const hex = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < 24; i += 1) out += hex[Math.floor(Math.random() * 16)];
    return out;
};

let lastSeedStatus = 'pending';

const ensureDemoUser = async () => {
    let user = await User.findOne({ email: DEMO_EMAIL }).select('+password');

    if (!user) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: 'Demo User',
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            username: 'demo',
            isDemo: true,
            isEmailVerified: true,
            plan: 'free',
            bio: 'Explore SnapLink AI with this shared demo account.',
        });
        // demo123 is intentionally shorter than the 8-char signup minimum;
        // skip validation but keep the pre-save hook so it is bcrypt-hashed.
        await user.save({ validateBeforeSave: false });
        logger.info('Demo account created (demo@gmail.com).');
    } else {
        // Always force demo flags and clear any lockout FIRST — even if the
        // credential check below fails, the demo must stay reachable.
        await User.updateOne(
            { _id: user._id },
            { $set: { isDemo: true, isActive: true, isBanned: false, loginAttempts: 0 }, $unset: { lockUntil: 1 } }
        );

        let passwordOk = false;
        try {
            passwordOk = !!(user.password && (await user.comparePassword(DEMO_PASSWORD)));
        } catch {
            passwordOk = false;
        }

        if (!passwordOk) {
            // demo@gmail.com is reserved for the shared demo account. If an
            // earlier signup or a changed password made the credentials drift,
            // reclaim it so "Try Demo Account" always works.
            user.password = DEMO_PASSWORD;
            user.isDemo = true;
            user.isActive = true;
            user.isBanned = false;
            await user.save({ validateBeforeSave: false });
            logger.info('Demo account credentials were reclaimed for demo@gmail.com.');
        }
    }

    return User.findOne({ email: DEMO_EMAIL });
};

const seedCampaign = async (demoUser, spec) => {
    const existing = await Campaign.findOne({ user: demoUser._id, name: spec.name });
    if (existing) return existing;

    return Campaign.create({
        user: demoUser._id,
        name: spec.name,
        description: spec.description,
        status: spec.status,
        color: spec.color,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        utmSource: spec.utmSource,
        utmMedium: spec.utmMedium,
        utmCampaign: spec.utmCampaign,
    });
};

const seedVisits = async (demoUser, link, totalClicks) => {
    const visits = [];
    let uniqueCount = 0;
    let lastClickAt = null;

    for (let i = 0; i < totalClicks; i += 1) {
        // Skew towards recent days so charts look alive.
        const daysAgo = Math.floor(Math.pow(Math.random(), 1.35) * 14);
        const clickedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 24) * 60 * 60 * 1000);
        if (!lastClickAt || clickedAt > lastClickAt) lastClickAt = clickedAt;

        const isUnique = Math.random() < 0.62;
        if (isUnique) uniqueCount += 1;

        const device = pick(DEVICE_MIX);
        const geo = pick(GEO_MIX);
        const browser = pick(BROWSER_MIX);
        const source = pick(REFERER_MIX);

        visits.push({
            link: link._id,
            user: demoUser._id,
            shortCode: link.shortCode,
            ipHash: isUnique ? pickIpHash() : pickIpHash(),
            userAgent: 'Mozilla/5.0 (demo seed)',
            device: device.device,
            browser: browser.browser,
            os: browser.os,
            country: geo.country,
            countryCode: geo.countryCode,
            referer: source.referer,
            isUnique,
            clickedAt,
            createdAt: clickedAt,
            updatedAt: clickedAt,
        });
    }

    // insertMany in chunks to keep memory sane
    for (let i = 0; i < visits.length; i += 500) {
        await Visit.insertMany(visits.slice(i, i + 500), { ordered: false });
    }

    await Link.findByIdAndUpdate(link._id, {
        'stats.totalClicks': totalClicks,
        'stats.uniqueClicks': uniqueCount,
        'stats.lastClickAt': lastClickAt,
    });

    return { totalClicks, uniqueCount };
};

const seedLink = async (demoUser, campaignMap, sample) => {
    const campaignDoc = sample.campaignName ? campaignMap.get(sample.campaignName) : null;
    const now = Date.now();

    const link = new Link({
        user: demoUser._id,
        originalUrl: sample.originalUrl,
        title: sample.title,
        description: sample.description,
        tags: sample.tags || [],
        category: sample.category || 'marketing',
        isFavorited: !!sample.favorited,
        campaign: campaignDoc ? campaignDoc._id : null,
        expiresAt: sample.expired ? new Date(now - 3 * 24 * 60 * 60 * 1000) : null,
        utmParams: campaignDoc
            ? {
                  source: campaignDoc.utmSource,
                  medium: campaignDoc.utmMedium,
                  campaign: campaignDoc.utmCampaign,
              }
            : undefined,
        aiCategory: sample.category || 'marketing',
        aiEngagementScore: sample.engagement || 60,
        createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
    });

    await link.save(); // pre-save hook generates shortCode

    // Real, scannable QR code for the generated short URL.
    try {
        const shortUrl = `${SHORT_URL_BASE}${link.shortCode}`;
        const qrDataUrl = await qrcode.toDataURL(shortUrl, { errorCorrectionLevel: 'M', width: 300, margin: 2 });
        await Link.findByIdAndUpdate(link._id, {
            'qrCode.url': qrDataUrl,
            'qrCode.generatedAt': new Date(now - 15 * 24 * 60 * 60 * 1000),
        });
    } catch (err) {
        logger.warn(`Demo seed: QR generation failed for ${link.shortCode}: ${err.message}`);
    }

    const { totalClicks, uniqueCount } = await seedVisits(demoUser, link, sample.clicks);

    if (campaignDoc) {
        await Campaign.findByIdAndUpdate(campaignDoc._id, {
            $inc: {
                'stats.totalLinks': 1,
                'stats.totalClicks': totalClicks,
                'stats.uniqueClicks': uniqueCount,
            },
        });
    }

    await ActivityLog.create({
        user: demoUser._id,
        action: 'link_created',
        description: `Created short link: ${link.shortCode}`,
        metadata: { linkId: link._id },
        createdAt: link.createdAt,
    });

    await createNotification({
        userId: demoUser._id,
        type: 'system',
        title: 'Link created',
        message: `Short link /${link.shortCode} was created successfully.`,
        data: { linkId: link._id, shortCode: link.shortCode },
        link: '/dashboard/links',
        priority: 'low',
    });

    return { totalClicks, uniqueCount };
};

const seedWelcomeContent = async (demoUser) => {
    const existing = await Notification.exists({ user: demoUser._id, type: 'system', title: 'Welcome to SnapLink AI Demo' });
    if (existing) return;

    await Notification.create({
        user: demoUser._id,
        type: 'ai_insight',
        title: 'Welcome to SnapLink AI Demo',
        message: 'Explore your dashboard, analytics, QR center and AI assistant. Everything you see belongs to this shared demo account.',
        icon: 'sparkles',
        link: '/dashboard/overview',
        priority: 'medium',
    });
};

const ensureDemoData = async (demoUser) => {
    const campaignMap = new Map();
    for (const spec of CAMPAIGNS) {
        campaignMap.set(spec.name, await seedCampaign(demoUser, spec));
    }

    let totalClicks = 0;
    let newLinks = 0;
    let newQR = 0;

    for (const sample of SAMPLE_LINKS) {
        const exists = await Link.exists({ user: demoUser._id, title: sample.title });
        if (exists) continue;
        const { totalClicks: clicks } = await seedLink(demoUser, campaignMap, sample);
        newLinks += 1;
        newQR += 1;
        totalClicks += clicks;
    }

    if (totalClicks > 0 || newLinks > 0) {
        await User.updateOne(
            { _id: demoUser._id },
            { $inc: { 'stats.totalLinks': newLinks, 'stats.totalClicks': totalClicks, 'stats.totalQRGenerated': newQR } }
        );
    }

    await seedWelcomeContent(demoUser);
};

// Called once after MongoDB connects on every boot. Idempotent: it only
// creates what is missing, so demo data can never be duplicated.
const ensureDemoAccount = async () => {
    try {
        const demoUser = await ensureDemoUser();
        await ensureDemoData(demoUser);
        lastSeedStatus = 'ok';
        logger.info('Demo account ready (demo@gmail.com).');
    } catch (err) {
        lastSeedStatus = `error: ${err.message}`;
        logger.error(`Demo account seeding failed: ${err.message}`);
    }
};

module.exports = { ensureDemoAccount, DEMO_EMAIL, DEMO_PASSWORD, getSeedStatus: () => lastSeedStatus };

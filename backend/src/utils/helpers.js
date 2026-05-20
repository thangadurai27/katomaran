const crypto = require('crypto');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const generateToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const hashIP = (ip) => {
    return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');
};

const getClientIP = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '127.0.0.1'
    );
};

const parseUserAgent = (userAgentString) => {
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    let device = 'desktop';
    if (result.device.type === 'mobile') device = 'mobile';
    else if (result.device.type === 'tablet') device = 'tablet';
    else if (result.device.type === 'bot') device = 'bot';

    return {
        browser: result.browser.name || 'unknown',
        browserVersion: result.browser.version || '',
        os: result.os.name || 'unknown',
        osVersion: result.os.version || '',
        device,
        userAgent: userAgentString
    };
};

const getGeoData = (ip) => {
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
        return { country: 'Local', countryCode: 'LO', city: 'Local', region: '' };
    }
    const geo = geoip.lookup(ip);
    return {
        country: geo?.country ? geo.country : 'Unknown',
        countryCode: geo?.country || 'XX',
        city: geo?.city || 'Unknown',
        region: geo?.region || ''
    };
};

const detectBot = (userAgent) => {
    const botPatterns = /bot|crawler|spider|scraper|headless|lighthouse|pingdom|uptimerobot/i;
    return botPatterns.test(userAgent);
};

const getPaginationOptions = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const buildPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

module.exports = {
    generateToken,
    hashToken,
    hashIP,
    getClientIP,
    parseUserAgent,
    getGeoData,
    detectBot,
    getPaginationOptions,
    buildPaginationMeta,
    slugify,
    isValidUrl
};

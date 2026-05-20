const qrcode = require('qrcode');
const Link = require('../models/Link.model');
const { success, error } = require('../utils/apiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Generate QR code
// @route POST /api/qr/generate
const generateQR = asyncHandler(async (req, res) => {
    const { url, linkId, options = {} } = req.body;

    const targetUrl = url || (linkId ? `${process.env.SHORT_URL_BASE}${linkId}` : null);
    if (!targetUrl) return error(res, 'URL or link ID required.', 400);

    const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        type: 'image/png',
        quality: 0.92,
        margin: options.margin !== undefined ? options.margin : 2,
        width: Math.min(Math.max(options.width || 300, 100), 1000),
        color: {
            dark: options.foreground || '#000000',
            light: options.background || '#ffffff'
        }
    };

    const qrDataUrl = await qrcode.toDataURL(targetUrl, qrOptions);

    // Update link QR record
    if (linkId) {
        const link = await Link.findOne({ _id: linkId, user: req.user._id });
        if (link) {
            await Link.findByIdAndUpdate(linkId, {
                'qrCode.url': qrDataUrl,
                'qrCode.generatedAt': new Date()
            });
            const User = require('../models/User.model');
            await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalQRGenerated': 1 } });
        }
    }

    return success(res, 'QR code generated.', { qrCode: qrDataUrl, url: targetUrl });
});

// @desc  Get QR code as SVG string
// @route POST /api/qr/generate-svg
const generateQRSVG = asyncHandler(async (req, res) => {
    const { url, options = {} } = req.body;
    if (!url) return error(res, 'URL is required.', 400);

    const svgString = await qrcode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        margin: options.margin !== undefined ? options.margin : 2,
        color: {
            dark: options.foreground || '#000000',
            light: options.background || '#ffffff'
        }
    });

    return success(res, 'QR SVG generated.', { svg: svgString, url });
});

// @desc  Get all QR codes for user's links
// @route GET /api/qr
const getUserQRCodes = asyncHandler(async (req, res) => {
    const links = await Link.find({
        user: req.user._id,
        'qrCode.url': { $exists: true, $ne: null },
        isTrashed: false
    }).select('title shortCode originalUrl qrCode stats createdAt').sort({ 'qrCode.generatedAt': -1 }).limit(50).lean();

    return success(res, 'QR codes fetched.', { qrCodes: links });
});

module.exports = { generateQR, generateQRSVG, getUserQRCodes };

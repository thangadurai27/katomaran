const rateLimit = require('express-rate-limit');
const { error } = require('../utils/apiResponse');

const createLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { success: false, message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            return error(res, message, 429);
        }
    });
};

const generalLimiter = createLimiter(
    15 * 60 * 1000, // 15 min
    200,
    'Too many requests. Please slow down.'
);

const authLimiter = createLimiter(
    15 * 60 * 1000, // 15 min
    10,
    'Too many authentication attempts. Please try again after 15 minutes.'
);

const aiLimiter = createLimiter(
    60 * 1000, // 1 min
    10,
    'AI request limit reached. Please wait before making more AI requests.'
);

const createLinkLimiter = createLimiter(
    60 * 1000, // 1 min
    30,
    'Link creation limit reached. Please slow down.'
);

const redirectLimiter = createLimiter(
    60 * 1000, // 1 min
    100,
    'Too many redirect requests.'
);

module.exports = { generalLimiter, authLimiter, aiLimiter, createLinkLimiter, redirectLimiter };

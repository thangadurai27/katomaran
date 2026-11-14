const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { error } = require('../utils/apiResponse');

const requireDb = (req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    // Log the disconnection but don't crash; provide helpful message
    logger.warn(`Database not connected (readyState: ${mongoose.connection.readyState}), API features will be limited`);

    return error(
        res,
        'Database is not connected. Check MONGODB_URI on Render and MongoDB Atlas Network Access (allow 0.0.0.0/0).',
        503
    );
};

module.exports = requireDb;

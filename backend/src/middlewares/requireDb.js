const mongoose = require('mongoose');
const { error } = require('../utils/apiResponse');

const requireDb = (req, res, next) => {
    if (mongoose.connection.readyState === 1) return next();

    return error(
        res,
        'Database is not connected. Check MONGODB_URI on Render and MongoDB Atlas Network Access (allow 0.0.0.0/0).',
        503
    );
};

module.exports = requireDb;

const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');
const { error } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return error(res, 'Access denied. No token provided.', 401);
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return error(res, 'User not found. Token invalid.', 401);
        }

        if (!user.isActive || user.isBanned) {
            return error(res, 'Account suspended. Please contact support.', 403);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return error(res, 'Invalid token.', 401);
        }
        if (err.name === 'TokenExpiredError') {
            return error(res, 'Token expired. Please refresh.', 401);
        }
        return error(res, 'Authentication failed.', 401);
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select('-password -refreshToken');
            if (user && user.isActive && !user.isBanned) {
                req.user = user;
            }
        }
        next();
    } catch {
        next(); // Continue without auth
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return error(res, 'Authentication required.', 401);
        if (!roles.includes(req.user.role)) {
            return error(res, 'Insufficient permissions.', 403);
        }
        next();
    };
};

const requireAdmin = requireRole('admin', 'superadmin');

module.exports = { protect, optionalAuth, requireRole, requireAdmin };

const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Link = require('../models/Link.model');
const Visit = require('../models/Visit.model');
const { success, error } = require('../utils/apiResponse');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect, requireAdmin);

// Admin dashboard stats
router.get('/stats', asyncHandler(async (req, res) => {
    const [totalUsers, totalLinks, totalClicks, newUsersToday, activeToday] = await Promise.all([
        User.countDocuments(),
        Link.countDocuments({ isTrashed: false }),
        Visit.countDocuments(),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        Visit.countDocuments({ clickedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    return success(res, 'Admin stats fetched.', { totalUsers, totalLinks, totalClicks, newUsersToday, activeToday });
}));

// Ban user
router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: req.body.reason || 'Violation of terms' }, { new: true });
    if (!user) return error(res, 'User not found.', 404);
    return success(res, 'User banned.', { user });
}));

// Unban user
router.patch('/users/:id/unban', asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, $unset: { banReason: 1 } }, { new: true });
    if (!user) return error(res, 'User not found.', 404);
    return success(res, 'User unbanned.', { user });
}));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const [users, total] = await Promise.all([
        User.find(query).select('-password -refreshToken').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
    ]);
    return success(res, 'Users fetched.', { users, pagination: buildPaginationMeta(total, page, limit) });
}));

// Delete link (admin)
router.delete('/links/:id', asyncHandler(async (req, res) => {
    await Link.findByIdAndDelete(req.params.id);
    return success(res, 'Link deleted by admin.');
}));

module.exports = router;

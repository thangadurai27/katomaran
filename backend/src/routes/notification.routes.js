const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification.model');
const { success } = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth.middleware');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
        Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);
    return success(res, 'Notifications fetched.', { notifications, unreadCount });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true, readAt: new Date() });
    return success(res, 'Notification marked as read.');
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    return success(res, 'All notifications marked as read.');
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return success(res, 'Notification deleted.');
}));

module.exports = router;

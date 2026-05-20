const User = require('../models/User.model');
const { success, error } = require('../utils/apiResponse');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// @desc  Get current user profile
// @route GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    if (!user) return error(res, 'User not found.', 404);
    return success(res, 'Profile fetched.', { user });
});

// @desc  Update profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'username', 'bio', 'website', 'location', 'company', 'timezone', 'preferences'];
    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.username) {
        const existing = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
        if (existing) return error(res, 'Username already taken.', 409);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return success(res, 'Profile updated successfully.', { user });
});

// @desc  Change password
// @route PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, 'Current password is incorrect.', 401);

    user.password = newPassword;
    await user.save();

    return success(res, 'Password changed successfully.');
});

// @desc  Upload avatar
// @route POST /api/users/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) return error(res, 'No file uploaded.', 400);

    const avatarUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    return success(res, 'Avatar updated.', { avatar: avatarUrl });
});

// @desc  Delete account
// @route DELETE /api/users/account
const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Incorrect password.', 401);

    await User.findByIdAndUpdate(req.user._id, { isActive: false, isBanned: true, banReason: 'Account deleted by user' });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return success(res, 'Account deleted. We\'re sorry to see you go.');
});

// @desc  Get all users (admin)
// @route GET /api/users (admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, role, plan, status } = req.query;

    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    if (plan) query.plan = plan;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isBanned = true;

    const [users, total] = await Promise.all([
        User.find(query).select('-password -refreshToken -passwordResetToken -emailVerificationToken').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
    ]);

    return success(res, 'Users fetched.', { users, pagination: buildPaginationMeta(total, page, limit) });
});

module.exports = { getProfile, updateProfile, changePassword, uploadAvatar, deleteAccount, getAllUsers };

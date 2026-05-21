const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog.model');
const User = require('../models/User.model');

const toPublicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    plan: user.plan,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
});

const resolveUsername = async (email) => {
    let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 26);
    if (username.length < 3) username = `user${Date.now().toString(36).slice(-6)}`;
    if (await User.exists({ username })) {
        username = `${username}${Math.floor(Math.random() * 9999)}`;
    }
    return username;
};

const logActivityAsync = (payload) => {
    setImmediate(() => {
        ActivityLog.create(payload).catch(() => {});
    });
};

const createUserId = () => new mongoose.Types.ObjectId();

module.exports = { toPublicUser, resolveUsername, logActivityAsync, createUserId };

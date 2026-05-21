const User = require('../models/User.model');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.utils');
const { generateToken, hashToken, getClientIP } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.utils');
const { toPublicUser, resolveUsername, logActivityAsync, createUserId } = require('../utils/auth.helpers');
const { success, error } = require('../utils/apiResponse');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const setAuthCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const queueVerificationEmail = (user, verificationToken) => {
    setImmediate(() => {
        sendVerificationEmail(user, verificationToken).catch(() => {});
    });
};

// @desc  Register user
// @route POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const ip = getClientIP(req);

    if (await User.exists({ email })) {
        return error(res, 'Email already in use. Please login or use a different email.', 409);
    }

    const [username, userId] = await Promise.all([
        resolveUsername(email),
        Promise.resolve(createUserId()),
    ]);

    const verificationToken = generateToken();
    const verificationHash = hashToken(verificationToken);
    const { accessToken, refreshToken } = generateTokenPair(userId);

    const user = await User.create({
        _id: userId,
        name,
        email,
        password,
        username,
        refreshToken,
        emailVerificationToken: verificationHash,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        lastLoginIP: ip,
    });

    queueVerificationEmail(user, verificationToken);
    setAuthCookies(res, accessToken, refreshToken);
    logActivityAsync({
        user: user._id,
        action: 'login',
        description: 'Account created',
        ip,
        userAgent: req.headers['user-agent'],
    });

    return success(res, 'Account created successfully!', {
        user: toPublicUser(user),
        accessToken,
        refreshToken,
    }, 201);
});

// @desc  Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ip = getClientIP(req);

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
        return error(res, 'Invalid email or password.', 401);
    }

    if (user.isLocked) {
        return error(res, 'Account temporarily locked due to multiple failed attempts. Try again after 2 hours.', 423);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        user.incLoginAttempts().catch(() => {});
        logActivityAsync({
            user: user._id,
            action: 'login_failed',
            description: 'Failed login attempt',
            ip,
            severity: 'warning',
        });
        return error(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive || user.isBanned) {
        return error(res, 'Account suspended. Please contact support.', 403);
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id);

    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                loginAttempts: 0,
                lastLoginAt: Date.now(),
                lastLoginIP: ip,
                refreshToken,
            },
            $unset: { lockUntil: 1 },
        }
    );

    setAuthCookies(res, accessToken, refreshToken);
    logActivityAsync({
        user: user._id,
        action: 'login',
        description: 'Successful login',
        ip,
        userAgent: req.headers['user-agent'],
    });

    return success(res, 'Login successful!', {
        user: toPublicUser(user),
        accessToken,
        refreshToken,
    });
});

// @desc  Logout user
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: 1 } });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    logActivityAsync({ user: req.user._id, action: 'logout', description: 'User logged out' });
    return success(res, 'Logged out successfully.');
});

// @desc  Refresh access token
// @route POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return error(res, 'Refresh token required.', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken').lean();

    if (!user || user.refreshToken !== token) {
        return error(res, 'Invalid refresh token.', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id);
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });
    setAuthCookies(res, accessToken, newRefreshToken);

    return success(res, 'Token refreshed.', { accessToken, refreshToken: newRefreshToken });
});

// @desc  Verify email
// @route GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return error(res, 'Invalid or expired verification link.', 400);

    await User.updateOne(
        { _id: user._id },
        {
            isEmailVerified: true,
            $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
        }
    );

    return success(res, 'Email verified successfully! You can now enjoy all features.');
});

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('_id name email');

    if (!user) {
        return success(res, 'If an account exists with that email, a reset link has been sent.');
    }

    const resetToken = generateToken();
    const hashedToken = hashToken(resetToken);

    await User.updateOne(
        { _id: user._id },
        {
            passwordResetToken: hashedToken,
            passwordResetExpires: Date.now() + 60 * 60 * 1000,
        }
    );

    setImmediate(() => {
        sendPasswordResetEmail(user, resetToken).catch(() => {});
    });

    return success(res, 'If an account exists with that email, a reset link has been sent.');
});

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) return error(res, 'Invalid or expired reset token.', 400);

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logActivityAsync({
        user: user._id,
        action: 'password_changed',
        description: 'Password reset via email',
        severity: 'warning',
    });

    return success(res, 'Password reset successfully! Please login with your new password.');
});

// @desc  Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    return success(res, 'User profile fetched.', { user: toPublicUser(req.user) });
});

module.exports = { signup, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9_-]{3,30}$/, 'Username must be 3-30 chars (letters, numbers, _, -)']
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'pro', 'enterprise'],
        default: 'free'
    },
    planExpiresAt: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: String,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    googleId: String,
    githubId: String,
    provider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    bio: {
        type: String,
        maxlength: 500
    },
    website: String,
    location: String,
    company: String,
    timezone: {
        type: String,
        default: 'UTC'
    },
    preferences: {
        theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false }
    },
    stats: {
        totalLinks: { type: Number, default: 0 },
        totalClicks: { type: Number, default: 0 },
        totalQRGenerated: { type: Number, default: 0 }
    },
    lastLoginAt: Date,
    lastLoginIP: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    devices: [{
        userAgent: String,
        ip: String,
        lastSeen: Date,
        trusted: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ createdAt: -1 });

// Password hashing (rounds 10 ≈ 4× faster than 12, still secure for web auth)
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Account lockout check
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema);

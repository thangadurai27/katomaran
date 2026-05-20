const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const linkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        default: null
    },
    originalUrl: {
        type: String,
        required: [true, 'Original URL is required'],
        trim: true
    },
    shortCode: {
        type: String,
        unique: true,
        trim: true
    },
    customAlias: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        maxlength: 500
    },
    tags: [{ type: String, trim: true }],
    category: {
        type: String,
        default: 'general'
    },
    // Link features
    isActive: {
        type: Boolean,
        default: true
    },
    isPasswordProtected: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        select: false
    },
    isOneTime: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isTrashed: {
        type: Boolean,
        default: false
    },
    isFavorited: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: null
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    // UTM Parameters
    utmParams: {
        source: String,
        medium: String,
        campaign: String,
        term: String,
        content: String
    },
    // Metadata
    metadata: {
        title: String,
        description: String,
        image: String,
        favicon: String,
        siteName: String
    },
    // AI Features
    aiEngagementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    aiPredictedClicks: {
        type: Number,
        default: 0
    },
    aiCategory: String,
    aiSummary: String,
    isSpam: {
        type: Boolean,
        default: false
    },
    spamScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    // Deep Link
    deepLink: {
        android: String,
        ios: String
    },
    // QR Code
    qrCode: {
        url: String,
        generatedAt: Date,
        downloads: { type: Number, default: 0 }
    },
    // Geo-blocking
    geoRestrictions: {
        allowed: [String], // country codes
        blocked: [String]
    },
    deviceRestrictions: {
        allowDesktop: { type: Boolean, default: true },
        allowMobile: { type: Boolean, default: true },
        allowTablet: { type: Boolean, default: true }
    },
    // Stats (cached)
    stats: {
        totalClicks: { type: Number, default: 0 },
        uniqueClicks: { type: Number, default: 0 },
        lastClickAt: Date
    }
}, {
    timestamps: true
});

// Indexes
linkSchema.index({ user: 1, createdAt: -1 });
linkSchema.index({ shortCode: 1 }, { unique: true });
linkSchema.index({ customAlias: 1 }, { unique: true, sparse: true });
linkSchema.index({ campaign: 1 });
linkSchema.index({ expiresAt: 1 });
linkSchema.index({ isActive: 1, isArchived: 1, isTrashed: 1 });
linkSchema.index({ 'stats.totalClicks': -1 });

// Auto-generate short code
linkSchema.pre('save', function () {
    if (!this.shortCode) {
        this.shortCode = nanoid(7);
    }
});

// Virtual for short URL
linkSchema.virtual('shortUrl').get(function () {
    return `${process.env.SHORT_URL_BASE}${this.shortCode}`;
});

// Check if expired
linkSchema.virtual('isExpired').get(function () {
    return this.expiresAt && this.expiresAt < new Date();
});

linkSchema.set('toJSON', { virtuals: true });
linkSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Link', linkSchema);

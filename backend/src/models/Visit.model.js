const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shortCode: {
        type: String,
        required: true,
        index: true
    },
    // Request info
    ip: String,
    ipHash: String, // For unique click detection
    userAgent: String,
    referer: String,
    // Parsed info
    country: String,
    countryCode: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number,
    // Device info
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
        default: 'unknown'
    },
    // Traffic source
    source: String,
    medium: String,
    campaign: String,
    // Engagement
    isUnique: {
        type: Boolean,
        default: false
    },
    isBot: {
        type: Boolean,
        default: false
    },
    isSuspicious: {
        type: Boolean,
        default: false
    },
    // UTM data
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    clickedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for analytics aggregation
visitSchema.index({ link: 1, clickedAt: -1 });
visitSchema.index({ shortCode: 1, clickedAt: -1 });
visitSchema.index({ clickedAt: -1 });
visitSchema.index({ country: 1 });
visitSchema.index({ device: 1 });
visitSchema.index({ browser: 1 });
visitSchema.index({ isBot: 1 });
visitSchema.index({ ipHash: 1, link: 1 }); // for unique detection

module.exports = mongoose.model('Visit', visitSchema);

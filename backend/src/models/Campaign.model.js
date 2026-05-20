const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: String,
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed', 'archived'],
        default: 'active'
    },
    startDate: Date,
    endDate: Date,
    tags: [String],
    color: {
        type: String,
        default: '#6366f1'
    },
    // UTM Defaults
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    // Stats cache
    stats: {
        totalLinks: { type: Number, default: 0 },
        totalClicks: { type: Number, default: 0 },
        uniqueClicks: { type: Number, default: 0 }
    },
    // AI Generated
    aiSuggestions: {
        title: String,
        tags: [String],
        bestTime: String,
        targetAudience: String
    }
}, { timestamps: true });

campaignSchema.index({ user: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);

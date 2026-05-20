const mongoose = require('mongoose');

const bioPageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: { type: String, trim: true },
    bio: { type: String, maxlength: 300 },
    avatar: String,
    coverImage: String,
    theme: {
        type: String,
        enum: ['dark', 'light', 'gradient', 'minimal', 'vibrant', 'neon', 'elegant'],
        default: 'dark'
    },
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    links: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        icon: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        backgroundColor: String,
        textColor: String
    }],
    socialProfiles: {
        twitter: String,
        instagram: String,
        linkedin: String,
        github: String,
        youtube: String,
        tiktok: String,
        facebook: String,
        discord: String
    },
    stats: {
        totalViews: { type: Number, default: 0 },
        totalClicks: { type: Number, default: 0 },
        uniqueVisitors: { type: Number, default: 0 }
    },
    isPublic: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
    customDomain: String
}, { timestamps: true });

bioPageSchema.index({ username: 1 });
bioPageSchema.index({ user: 1 });

module.exports = mongoose.model('BioPage', bioPageSchema);

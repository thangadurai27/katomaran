const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    avatar: String,
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'pro', 'enterprise'],
        default: 'free'
    },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
        joinedAt: { type: Date, default: Date.now },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    invitations: [{
        email: String,
        role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
        token: String,
        expiresAt: Date,
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    settings: {
        allowMemberInvites: { type: Boolean, default: false },
        defaultLinkExpiry: Number,
        sharedAnalytics: { type: Boolean, default: true }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ slug: 1 });

module.exports = mongoose.model('Team', teamSchema);

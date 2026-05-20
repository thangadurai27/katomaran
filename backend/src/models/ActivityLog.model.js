const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'link_created', 'link_updated', 'link_deleted', 'link_archived', 'link_restored',
            'qr_generated', 'qr_downloaded',
            'campaign_created', 'campaign_updated', 'campaign_deleted',
            'team_created', 'team_updated', 'member_invited', 'member_removed',
            'profile_updated', 'password_changed', 'email_changed',
            'login', 'logout', 'login_failed',
            'export_generated', 'bulk_import',
            'bio_updated', 'notification_read'
        ]
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info'
    }
}, { timestamps: true });

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

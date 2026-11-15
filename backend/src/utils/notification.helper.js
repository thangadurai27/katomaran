const Notification = require('../models/Notification.model');

const createNotification = async ({
    userId,
    type,
    title,
    message,
    data = null,
    icon = null,
    link = null,
    priority = 'medium',
}) => {
    try {
        return await Notification.create({
            user: userId,
            type,
            title,
            message,
            data,
            icon,
            link,
            priority,
        });
    } catch (err) {
        // Notifications must never break core flows.
        return null;
    }
};

module.exports = { createNotification };
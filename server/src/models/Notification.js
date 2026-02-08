const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['invite', 'friend_req', 'system', 'match_result'],
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fetching unread notifications quickly
NotificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);

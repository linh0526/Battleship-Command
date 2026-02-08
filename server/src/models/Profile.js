const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: 'Unknown'
    },
    settings: {
        theme: { type: String, default: 'default' },
        soundEnabled: { type: Boolean, default: true },
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true }
    },
    socialLinks: {
        discord: String,
        twitter: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);

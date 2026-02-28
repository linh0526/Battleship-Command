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
    
    // Stats tổng hợp - KHÔNG lưu chi tiết từng trận
    stats: {
        pvp: {
            matches: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            draws: { type: Number, default: 0 },
            shots: {
                total: { type: Number, default: 0 },
                hit: { type: Number, default: 0 }
            },
            accuracy: { type: Number, default: 0 }, // % - cached for performance
            elo: { type: Number, default: 1000 },
            avgShotsPerMatch: { type: Number, default: 0 }
        },
        pve: {
            matches: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            shots: {
                total: { type: Number, default: 0 },
                hit: { type: Number, default: 0 }
            },
            accuracy: { type: Number, default: 0 },
            avgShotsPerMatch: { type: Number, default: 0 }
        }
    },
    achievements: {
        matchesPlayed: { type: Number, default: 0 },
        matchesWon: { type: Number, default: 0 },
        totalShots: { type: Number, default: 0 },
        hitShots: { type: Number, default: 0 },
        shipsDestroyed: { type: Number, default: 0 },
        winStreak: { type: Number, default: 0 },
        lossStreak: { type: Number, default: 0 },
        unlocked: [{ type: String }]
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

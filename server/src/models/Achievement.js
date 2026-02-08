const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievementId: {
        type: String, // Unique code for achievement, e.g., 'FIRST_WIN'
        required: true
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number, // Percentage or count (e.g., 50/100 wins)
        default: 100
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Extra data if needed
    }
});

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);

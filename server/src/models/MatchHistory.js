const mongoose = require('mongoose');

const MatchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opponentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for PvE or if opponent is deleted
    },
    opponentName: {
        type: String, // Store name in case of PvE or opponent deletion
        default: 'Unknown'
    },
    result: {
        type: String,
        enum: ['win', 'loss', 'draw'],
        required: true
    },
    mode: {
        type: String,
        enum: ['PvP', 'PvE'],
        required: true
    },
    duration: {
        type: Number, // In seconds
        default: 0
    },
    endedAt: {
        type: Date,
        default: Date.now
    },
    replayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Replay'
    }
});

MatchHistorySchema.index({ userId: 1, endedAt: -1 });

module.exports = mongoose.model('MatchHistory', MatchHistorySchema);

const mongoose = require('mongoose');

const MatchHistorySchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
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
    
    // Shots stats - CHỈ lưu tổng số, KHÔNG lưu từng phát bắn
    shots: {
        player: {
            total: { type: Number, default: 0 },
            hit: { type: Number, default: 0 }
        },
        opponent: {
            total: { type: Number, default: 0 },
            hit: { type: Number, default: 0 }
        }
    },
    
    duration: {
        type: Number, // In seconds
        default: 0
    },
    endReason: {
        type: String,
        enum: ['VICTORY', 'DEFEAT', 'OPPONENT_LEFT', 'PLAYER_LEFT', 'TIMEOUT'],
        default: 'VICTORY'
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
MatchHistorySchema.index({ roomId: 1 });

module.exports = mongoose.model('MatchHistory', MatchHistorySchema);

const mongoose = require('mongoose');

const ReplaySchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId, // Can reference MatchHistory if needed, or just be a unique ID
        required: true,
        index: true
    },
    player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Or null for AI
    initialFleets: {
        type: mongoose.Schema.Types.Mixed, // Stores fleet positions for both players
        required: true
    },
    moves: [{
        turn: Number,
        playerId: String, // ID of who made the move
        row: Number,
        col: Number,
        result: String, // 'hit', 'miss', 'sunk'
        timestamp: Number // Relative time from start
    }],
    chatLog: [{
        sender: String,
        message: String,
        timestamp: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Auto-delete replays after 30 days to save space? Optional.
    }
});

module.exports = mongoose.model('Replay', ReplaySchema);

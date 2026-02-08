const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'friend', 'blocked'],
        default: 'pending'
    },
    since: {
        type: Date,
        default: Date.now
    }
});

// Ensure unique relationship between two users
RelationshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);

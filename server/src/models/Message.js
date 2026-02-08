const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'msg'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);

const express = require('express');
const router = express.Router();
const { rooms } = require('../state');

// Check if a room exists
router.get('/exists/:roomId', (req, res) => {
    const { roomId } = req.params;
    const exists = rooms.has(roomId);
    res.json({ exists });
});

module.exports = router;

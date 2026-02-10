const express = require('express');
const router = express.Router();
const MatchHistory = require('../models/MatchHistory');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// GET /api/history - Get match history for current user
router.get('/', verifyToken, async (req, res) => {
    try {
        const history = await MatchHistory.find({ userId: req.user.id })
            .sort({ endedAt: -1 })
            .limit(20);

        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

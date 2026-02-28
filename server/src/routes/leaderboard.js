const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { getRank } = require('../services/eloService');

/**
 * GET /api/leaderboard
 * Returns top players by wins
 */
router.get('/', async (req, res) => {
    try {
        // Fetch top 100 profiles sorted by PvP ELO descending
        const profiles = await Profile.find({})
            .sort({ 'stats.pvp.elo': -1 })
            .limit(100)
            .populate('userId', 'username avatar status');

        const leaderboard = profiles.map((p, index) => {
            const user = p.userId;
            const wins = p.stats.pvp.wins || 0;
            const matches = p.stats.pvp.matches || 0;
            const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) + '%' : '0%';
            


            return {
                rank: index + 1,
                name: user ? user.username : 'Unknown Warrior',
                winRate: winRate,
                wins: wins,
                matches: matches,
                accuracy: p.stats.pvp.accuracy || 0,
                userId: user ? user._id : null,
                elo: p.stats.pvp.elo || 0, 
                level: getRank(matches),
                img: user?.avatar || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown')
            };
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('[LEADERBOARD] Fetch error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bảng xếp hạng' });
    }
});

module.exports = router;

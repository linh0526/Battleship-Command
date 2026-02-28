const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/**
 * GET /api/notifications
 * Get all notifications for user
 */
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark as read
 */
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        if (notif.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        notif.read = true;
        await notif.save();
        res.json(notif);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        if (notif.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

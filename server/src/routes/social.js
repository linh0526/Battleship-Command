const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Relationship = require('../models/Relationship');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { userSockets, rooms, activePve } = require('../state');

function getUserStatus(userId) {
    if (!userSockets.has(userId.toString())) return 'offline';
    const sid = userSockets.get(userId.toString());
    
    for (const [, room] of rooms) {
        if (room.players && room.players.some(p => p.id === sid)) {
            return 'ingame';
        }
    }
    for (const [, session] of activePve) {
        if (session.playerId === sid) {
            return 'ingame';
        }
    }
    return 'online';
}

function notifyUser(req, userId, eventName) {
    const io = req.app.get('io');
    const sid = userSockets.get(userId.toString());
    if (io && sid) {
        io.to(sid).emit(eventName);
    }
}

/**
 * GET /api/social/search?q={username}
 * Search for players by username
 */
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query too short' });
        }

        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user.id } // Don't include self
        })
        .select('username avatar status')
        .limit(10);

        // For each user, check relationship status
        const usersWithStatus = await Promise.all(users.map(async (u) => {
            const rel = await Relationship.findOne({
                $or: [
                    { requester: req.user.id, recipient: u._id },
                    { requester: u._id, recipient: req.user.id }
                ]
            });
            
            return {
                ...u.toObject(),
                status: getUserStatus(u._id),
                relationship: rel ? rel.status : 'none',
                isRequester: rel ? rel.requester.toString() === req.user.id : false
            };
        }));

        res.json(usersWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during search' });
    }
});

/**
 * POST /api/social/request
 * Send friend request
 */
router.post('/request', auth, async (req, res) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) return res.status(400).json({ message: 'Recipient ID required' });
        if (recipientId === req.user.id) return res.status(400).json({ message: 'Cannot friend yourself' });

        // Check if relationship already exists
        const existing = await Relationship.findOne({
            $or: [
                { requester: req.user.id, recipient: recipientId },
                { requester: recipientId, recipient: req.user.id }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: 'Relationship already exists' });
        }

        const rel = new Relationship({
            requester: req.user.id,
            recipient: recipientId,
            status: 'pending'
        });
        await rel.save();

        // Create notification
        const sender = await User.findById(req.user.id);
        const notification = new Notification({
            recipient: recipientId,
            title: 'Yêu cầu kết bạn',
            message: `${sender.username} muốn kết bạn với bạn.`,
            type: 'friend_req',
            payload: {
                requestId: rel._id,
                senderId: req.user.id,
                senderName: sender.username
            }
        });
        await notification.save();

        notifyUser(req, recipientId, 'social_update');
        res.status(201).json({ message: 'Friend request sent', relationship: rel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/social/accept
 * Accept friend request
 */
router.post('/accept', auth, async (req, res) => {
    try {
        const { requestId } = req.body;
        const rel = await Relationship.findById(requestId);
        
        if (!rel) return res.status(404).json({ message: 'Request not found' });
        if (rel.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        rel.status = 'friend';
        await rel.save();

        // Notify the requester
        const receiver = await User.findById(req.user.id);
        const notification = new Notification({
            recipient: rel.requester,
            title: 'Chấp nhận kết bạn',
            message: `${receiver.username} đã chấp nhận lời mời kết bạn của bạn.`,
            type: 'system',
            payload: { friendId: req.user.id }
        });
        await notification.save();

        notifyUser(req, rel.requester, 'social_update');
        notifyUser(req, req.user.id, 'social_update');
        res.json({ message: 'Friend request accepted', relationship: rel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/social/reject
 * Reject/Cancel friend request
 */
router.post('/reject', auth, async (req, res) => {
    try {
        const { requestId } = req.body;
        const rel = await Relationship.findById(requestId);
        
        if (!rel) return res.status(404).json({ message: 'Request not found' });
        if (rel.recipient.toString() !== req.user.id && rel.requester.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Relationship.findByIdAndDelete(requestId);
        
        notifyUser(req, rel.requester, 'social_update');
        notifyUser(req, rel.recipient, 'social_update');
        res.json({ message: 'Request rejected/cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/social/friends
 * Get friend list
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await Relationship.find({
            $or: [{ requester: req.user.id }, { recipient: req.user.id }],
            status: 'friend'
        })
        .populate('requester', 'username avatar status')
        .populate('recipient', 'username avatar status');

        const friendList = await Promise.all(friends.map(async rel => {
            const isRequester = rel.requester._id.toString() === req.user.id;
            const friendData = isRequester ? rel.recipient : rel.requester;
            
            // Query the most recent tactical message between both commanders
            const latestMsg = await Message.findOne({
                type: 'private',
                $or: [
                    { sender: req.user.id, recipient: friendData._id },
                    { sender: friendData._id, recipient: req.user.id }
                ]
            }).sort({ timestamp: -1 });

            return {
                id: friendData._id,
                username: friendData.username,
                avatar: friendData.avatar,
                status: getUserStatus(friendData._id),
                since: rel.since,
                lastMessage: latestMsg ? {
                    msg: latestMsg.msg,
                    timestamp: latestMsg.timestamp,
                    senderId: latestMsg.sender.toString()
                } : null
            };
        }));

        res.json(friendList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/social/requests
 * Get pending requests
 */
router.get('/requests', auth, async (req, res) => {
    try {
        const requests = await Relationship.find({
            $or: [{ requester: req.user.id }, { recipient: req.user.id }],
            status: 'pending'
        })
        .populate('requester', 'username avatar status')
        .populate('recipient', 'username avatar status');

        const incoming = [];
        const outgoing = [];

        requests.forEach(rel => {
            if (rel.recipient._id.toString() === req.user.id) {
                incoming.push({
                    requestId: rel._id,
                    user: rel.requester,
                    date: rel.since
                });
            } else {
                outgoing.push({
                    requestId: rel._id,
                    user: rel.recipient,
                    date: rel.since
                });
            }
        });

        res.json({ incoming, outgoing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/social/remove/:friendId
 * Unfriend
 */
router.delete('/remove/:friendId', auth, async (req, res) => {
    try {
        const friendId = req.params.friendId;
        await Relationship.findOneAndDelete({
            $or: [
                { requester: req.user.id, recipient: friendId },
                { requester: friendId, recipient: req.user.id }
            ]
        });
        
        notifyUser(req, req.user.id, 'social_update');
        notifyUser(req, friendId, 'social_update');
        res.json({ message: 'Friend removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/social/chat/:friendId
 * Get chat history with a friend
 */
router.get('/chat/:friendId', auth, async (req, res) => {
    try {
        const friendId = req.params.friendId;
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: friendId },
                { sender: friendId, recipient: req.user.id }
            ]
        })
        .sort({ timestamp: 1 })
        .limit(50);
        
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

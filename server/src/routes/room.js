const express = require('express');
const router = express.Router();
const { rooms, activePve } = require('../state');

const { GamePhase } = require('../constants');

// Check if a room exists and return its status
router.get('/exists/:roomId', (req, res) => {
    const { roomId } = req.params;
    let room = rooms.get(roomId);
    let type = 'PVP';

    if (!room) {
        room = activePve.get(roomId);
        type = 'PVE';
    }

    if (!room) {
        return res.status(200).json({  // Return 200 with exists: false is better for frontend handling
            exists: false,
            reason: 'ROOM_NOT_FOUND'
        });
    }

    // Map GamePhase to a simpler status for frontend
    let status = 'waiting';
    if (room.phase === GamePhase.ENDED) {
        status = 'ended';
    } else if (room.phase === GamePhase.PLACING) {
        status = 'placing';
    } else if (room.phase === GamePhase.PLAYING) {
        status = 'playing';
    } else if (room.phase === GamePhase.PVE) {
        status = 'PVE';
    } else {
        status = 'waiting';
    }

    const maxPlayers = room.maxPlayers || 2;
    const activePlayersCount = room.players.filter(p => p.status !== 'disconnected').length;
    const isFull = activePlayersCount >= maxPlayers;
    const playerIds = room.players.map(p => p.clientId);

    const canJoin = !isFull && status === 'waiting';

    res.json({ 
        exists: true,
        type: type,
        status: status,
        phase: room.phase,
        isFull: isFull,
        players: activePlayersCount,
        totalPlayers: room.players.length, // Total including disconnected
        maxPlayers: maxPlayers,
        canJoin: canJoin, // General public joinability
        canReconnect: true, // Assuming reconnection is always allowed if you are in playerIds
        playerIds: playerIds
    });
});

module.exports = router;

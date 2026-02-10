const { GamePhase } = require('./constants');

function createPlayer({ clientId, socketId, name, userId = null, fleet = [] }) {
    return {
        clientId,
        socketId,
        userId, // MongoDB ObjectId - null for guests
        name,
        status: 'connected',
        ready: false, // For fleet placement
        roomReady: false, // For lobby/matching readiness
        fleet: fleet,
        shotsReceived: new Set(),
        stats: { shots: 0, hits: 0, misses: 0, score: 0, shipsSunk: 0 },
        disconnectTimer: null
    };
}

function createRoom({ roomId, players = [], mode = 'classic', isPvE = false }) {
    return {
        id: roomId,
        players,
        turn: null,
        phase: GamePhase.WAITING,
        mode,
        isPvE,
        maxPlayers: 2, // Added maxPlayers property
        logs: [],
        createdAt: Date.now()
    };
}

module.exports = {
    createPlayer,
    createRoom
};

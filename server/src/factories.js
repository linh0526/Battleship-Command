const { GamePhase } = require('./constants');

function createPlayer({ clientId, socketId, name, fleet = [] }) {
    return {
        clientId,
        socketId,
        name,
        status: 'connected',
        ready: false, // For fleet placement
        roomReady: false, // For lobby/matching readiness
        fleet: fleet,
        shotsReceived: new Set(),
        stats: { shots: 0, hits: 0, misses: 0, score: 0 },
        disconnectTimer: null
    };
}

function createRoom({ roomId, players = [], mode = 'classic', isPvE = false }) {
    return {
        id: roomId,
        players,
        turn: null,
        phase: GamePhase.LOBBY,
        mode,
        isPvE,
        logs: [],
        createdAt: Date.now()
    };
}

module.exports = {
    createPlayer,
    createRoom
};

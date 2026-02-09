const { rooms } = require('./state');
const { sendSystemLog } = require('./utils');
const { GamePhase } = require('./constants');

function startGame(io, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Transition to BATTLE phase
    room.phase = GamePhase.BATTLE;

    // Ngẫu nhiên lượt chơi
    const firstTurnClientId = room.players[Math.floor(Math.random() * room.players.length)].clientId;
    room.turn = firstTurnClientId;

    console.log(`[GAME START] Room ${roomId} initiated.`);
    room.players.forEach(p => {
        console.log(` - Player: ${p.name} (${p.clientId}) | Fleet: ${p.fleet.length} ships`);
        
        // Use socketId for delivery, clientId for firstTurn logic
        io.to(p.socketId).emit('game_start', { 
            firstTurn: firstTurnClientId === p.clientId ? 'player' : 'opponent' 
        });
    });

    sendSystemLog(io, roomId, `Battle phase initiated. All fleets confirmed ready.`);
}

module.exports = {
    startGame
};

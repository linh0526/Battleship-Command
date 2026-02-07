const { rooms } = require('./state');
const { sendSystemLog } = require('./utils');

function startGame(io, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Ngẫu nhiên lượt chơi
    const firstTurnClientId = room.players[Math.floor(Math.random() * room.players.length)].clientId;
    room.turn = firstTurnClientId;

    console.log(`[GAME START] Room ${roomId} initiated.`);
    room.players.forEach(p => {
        console.log(` - Player: ${p.name} (${p.clientId}) | Fleet: ${p.fleet.length} ships`);
        p.fleet.forEach(s => {
            console.log(`    > ${s.name} at [${s.row}, ${s.col}] orient: ${s.orientation}`);
        });
        
        // Use socketId for delivery, clientId for firstTurn logic
        io.to(p.socketId).emit('game_start', { 
            firstTurn: firstTurnClientId === p.clientId ? 'player' : 'opponent' 
        });
    });

    console.log(`[TURN] ${room.players.find(p => p.clientId === firstTurnClientId).name} starts.`);
    sendSystemLog(io, roomId, `Battle phase initiated. All fleets confirmed ready.`);
}

module.exports = {
    startGame
};

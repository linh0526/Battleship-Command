const { rooms, waitingPlayers, activePve } = require('../state');
const { getRoomsList } = require('../utils');

const handlePlayerLeave = (io, socket, reason = 'left') => {
    const clientId = socket.clientId;

    for (const [roomId, room] of rooms.entries()) {
        const index = room.players.findIndex(p => p.clientId === clientId);
        if (index === -1) continue;

        console.log(`[EXIT] Player ${socket.playerName || 'Unknown'} (${clientId}) ${reason} from Room ${roomId}`);

        // Remove the leaver
        const leavingPlayer = room.players[index];
        room.players.splice(index, 1);
        socket.leave(roomId);

        // If someone is still in the room, they win instantly
        if (room.players.length > 0) {
            const winner = room.players[0];
            
            console.log(`[WIN] Player ${winner.name} wins by default. Reason: opponent_${reason}`);

            // Emit match_ended with reason opponent_left (Client will show Victory modal)
            io.to(winner.socketId).emit('match_ended', {
                reason: 'opponent_left',
                winner: winner.clientId
            });

            // Signal cleanup
            io.to(winner.socketId).emit('opponent_left');
        }

        // ROOM LIFE-CYCLE ENDS HERE: Always destroy room
        rooms.delete(roomId);
        console.log(`[ROOM] Room ${roomId} destroyed.`);
        
        io.emit('rooms_update', getRoomsList());
        return;
    }
};

module.exports = (io, socket) => {
    socket.on('disconnect', (reason) => {
        console.log(`[DISCONNECT] Socket ${socket.id} (${reason})`);
        
        // Remove from global waiting pool
        const waitIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitIndex !== -1) waitingPlayers.splice(waitIndex, 1);

        // Handle room exit
        handlePlayerLeave(io, socket, 'disconnected');

        if (activePve.has(socket.id)) activePve.delete(socket.id);
        
        io.emit('player_count', io.engine.clientsCount);
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('start_pve', (data) => {
        const playerName = data?.name || 'Commander';
        socket.playerName = playerName;
        activePve.set(socket.id, playerName);
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('end_pve', () => {
        if (activePve.has(socket.id)) {
            activePve.delete(socket.id);
            io.emit('rooms_update', getRoomsList());
        }
    });

    return { handlePlayerLeave };
};

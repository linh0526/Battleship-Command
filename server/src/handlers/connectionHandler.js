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
        
        io.emit('player_count', io.engine.clientsCount);
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('start_pve', (data) => {
        const playerName = data?.name || 'Commander';
        socket.playerName = playerName;
        const clientId = socket.clientId;

        // Ensure not in any previous room
        handlePlayerLeave(io, socket, 'left');
        
        let roomId;
        do {
            roomId = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(roomId));

        socket.join(roomId);
        console.log(`[PBE] Created: ${roomId} by ${playerName}`);

        rooms.set(roomId, {
            players: [
                { 
                    id: clientId,
                    clientId: clientId,
                    socketId: socket.id,
                    status: 'connected',
                    name: playerName, 
                    ready: false, 
                    fleet: [], 
                    shotsReceived: new Set(),
                    stats: { shots: 0, hits: 0, misses: 0, score: 0 }
                }
            ],
            turn: null,
            state: 'LOBBY',
            isPvE: true,
            mode: data?.mode || 'classic',
            logs: []
        });

        socket.emit('room_joined', { roomId, mode: data?.mode || 'classic', isPvE: true });
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('set_name', (name) => {
        if (name && typeof name === 'string') {
             socket.playerName = name.trim();
        }
    });

    socket.on('end_pve', () => {
        handlePlayerLeave(io, socket, 'left');
    });

    return { handlePlayerLeave };
};

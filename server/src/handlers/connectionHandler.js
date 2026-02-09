const { rooms, activePve } = require('../state');
const { getRoomsList } = require('../utils');
const { createPlayer, createRoom } = require('../factories');
const { GamePhase } = require('../constants');

const handlePlayerLeave = (io, socket, reason = 'left') => {
    const clientId = socket.clientId;

    // Check rooms (PvP)
    for (const [roomId, room] of rooms.entries()) {
        const index = room.players.findIndex(p => p.clientId === clientId);
        if (index === -1) continue;

        const player = room.players[index];
        const isBattle = room.phase === GamePhase.PLAYING;
        console.log(`[EXIT] Player ${player.name} (${clientId}) ${reason} from Room ${roomId} (Phase: ${room.phase})`);

        if (reason === 'disconnected') {
            player.status = 'disconnected';
            io.to(roomId).emit('opponent_status_update', { status: 'disconnected' });
            
            if (player.disconnectTimer) clearTimeout(player.disconnectTimer);

            player.disconnectTimer = setTimeout(() => {
                if (player.status === 'disconnected') {
                    console.log(`[CLEANUP] Grace period expired for ${player.name} in Room ${roomId}`);
                    if (rooms.has(roomId)) {
                        const remainingPlayer = rooms.get(roomId).players.find(p => p.clientId !== clientId);
                        if (remainingPlayer) {
                            if (isBattle) {
                                io.to(remainingPlayer.socketId).emit('match_ended', {
                                    reason: 'opponent_left',
                                    winner: remainingPlayer.clientId
                                });
                            }
                            io.to(remainingPlayer.socketId).emit('opponent_left');
                        }
                        rooms.delete(roomId);
                        console.log(`[ROOM] Room ${roomId} destroyed after grace period.`);
                        io.emit('rooms_update', getRoomsList());
                    }
                }
            }, 10000);
            
            return;
        }

        room.players.splice(index, 1);
        socket.leave(roomId);

        if (room.players.length > 0) {
            const remaining = room.players[0];
            if (isBattle) {
                console.log(`[WIN] Player ${remaining.name} wins. Reason: opponent_left`);
                io.to(remaining.socketId).emit('match_ended', {
                    reason: 'opponent_left',
                    winner: remaining.clientId
                });
            }
            io.to(remaining.socketId).emit('opponent_left');
        }

        rooms.delete(roomId);
        console.log(`[ROOM] Room ${roomId} destroyed immediately.`);
        io.emit('rooms_update', getRoomsList());
        return;
    }

    // Check activePve (PvE)
    for (const [roomId, room] of activePve.entries()) {
        const index = room.players.findIndex(p => p.clientId === clientId);
        if (index !== -1) {
            console.log(`[PVE] Player ${room.players[index].name} left PVE session ${roomId}`);
            activePve.delete(roomId);
            io.emit('rooms_update', getRoomsList());
            return;
        }
    }
};

module.exports = (io, socket) => {
    socket.on('disconnect', (reason) => {
        console.log(`[DISCONNECT] Socket ${socket.id} (${reason})`);
        
        handlePlayerLeave(io, socket, 'disconnected');
        
        io.emit('player_count', io.engine.clientsCount);
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('start_pve', (data) => {
        const playerName = data?.name || 'Commander';
        socket.playerName = playerName;
        const mode = data?.mode || 'classic';

        // Clean up any existing room before starting PvE
        handlePlayerLeave(io, socket, 'left');
        
        // Use a static-looking ID internally but keep it unique with clientId
        const roomId = `PVE_SESSION-${socket.clientId}`;

        socket.join(roomId);
        console.log(`[PVE] PVE_SESSION Started for ${playerName}`);
        console.log(`[PVE] Room ID: ${roomId}`);
        const player = createPlayer({ clientId: socket.clientId, socketId: socket.id, name: playerName });
        const room = createRoom({ roomId, players: [player], mode, isPvE: true });
        room.phase = GamePhase.PVE;
        activePve.set(roomId, room);

        socket.emit('room_joined', { roomId: 'PVE_SESSION', mode, isPvE: true });
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

module.exports.registerConnectionHandlers = module.exports;
module.exports.handlePlayerLeave = handlePlayerLeave;

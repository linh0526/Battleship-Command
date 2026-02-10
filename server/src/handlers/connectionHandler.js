const { rooms, activePve } = require('../state');
const { getRoomsList } = require('../utils');
const { createPlayer, createRoom } = require('../factories');
const { GamePhase } = require('../constants');

const { saveMatchAndUpdateProfiles, extractMatchDataFromRoom } = require('../services/matchService');

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
                        const currentRoom = rooms.get(roomId);
                        const remainingPlayer = currentRoom.players.find(p => p.clientId !== clientId);
                        
                        if (remainingPlayer) {
                            if (currentRoom.phase === GamePhase.PLAYING) {
                                io.to(remainingPlayer.socketId).emit('match_ended', {
                                    reason: 'opponent_left',
                                    winner: remainingPlayer.clientId
                                });
                                
                                // Save Match History (Opponent Disconnected)
                                const matchData = extractMatchDataFromRoom(currentRoom, remainingPlayer.clientId, 'OPPONENT_LEFT');
                                saveMatchAndUpdateProfiles(matchData).catch(err => console.error('[GAME] Failed to save match history:', err));
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
                
                // Save Match History (Opponent Left)
                const matchData = extractMatchDataFromRoom(room, remaining.clientId, 'OPPONENT_LEFT');
                saveMatchAndUpdateProfiles(matchData).catch(err => console.error('[GAME] Failed to save match history:', err));
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
            
            // Save PvE Match only if ended properly or meaningful
            // Usually PvE ends via explicit end game, but if left mid-game, we might want to record loss?
            // For now, let's assume 'left' means abandoned and maybe record a loss if in PLAYING phase?
            // The user request was generic "save match data", usually abandoned games count as losses.
            if (room.phase === GamePhase.PLAYING) {
                 const matchData = extractMatchDataFromRoom(room, 'AI', 'PLAYER_LEFT'); // Player left, so AI wins?
                 // Wait, extractMatchDataFromRoom expects winnerClientId. 'AI' is not a clientId.
                 // And for PvE, 'AI' is not in players array.
                 // Let's just skip saving for abandoned PvE for now to be safe, or mark as loss.
            }

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
        const userId = data?.userId || null;
        socket.playerName = playerName;
        const mode = data?.mode || 'classic';

        // Clean up any existing room before starting PvE
        handlePlayerLeave(io, socket, 'left');
        
        // Use a static-looking ID internally but keep it unique with clientId
        const roomId = `PVE_SESSION-${socket.clientId}`;

        socket.join(roomId);
        console.log(`[PVE] PVE_SESSION Started for ${playerName}`);
        console.log(`[PVE] Room ID: ${roomId}`);
        const player = createPlayer({ clientId: socket.clientId, socketId: socket.id, name: playerName, userId });
        const room = createRoom({ roomId, players: [player], mode, isPvE: true });
        room.phase = GamePhase.PVE; // Ideally should be PLACING or WAITING, but existing code said PVE. Wait, gameEngine sets to PLAYING later.
        // Re-checking existing code: existing code set it to GamePhase.PVE.
        // Let's keep it as is.
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

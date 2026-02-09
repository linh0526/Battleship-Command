const { rooms, waitingPlayers } = require('../state');
const { getRoomsList } = require('../utils');
const { GamePhase } = require('../constants');
const { createPlayer, createRoom } = require('../factories');
const connectionHandler = require('./connectionHandler');

module.exports = (io, socket) => {
    const handlePlayerLeave = connectionHandler.handlePlayerLeave;

    const cleanupWaiting = () => {
        const index = waitingPlayers.findIndex(p => p.socketId === socket.id);
        if (index !== -1) waitingPlayers.splice(index, 1);
    };

    socket.on('create_room', (data) => {
        const playerName = data?.name || 'Commander';
        const mode = data?.mode || 'classic';
        socket.playerName = playerName;
        
        handlePlayerLeave(io, socket, 'left');
        cleanupWaiting();

        let roomId;
        do {
            roomId = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(roomId));

        socket.join(roomId);
        console.log(`[ROOM] Created: ${roomId} by ${playerName} (Mode: ${mode})`);

        const player = createPlayer({ 
            clientId: socket.clientId, 
            socketId: socket.id, 
            name: playerName 
        });

        const room = createRoom({ roomId, players: [player], mode });
        rooms.set(roomId, room);

        socket.emit('room_joined', { roomId, mode });
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('join_random', (data) => {
        const playerName = data?.name || 'Commander';
        const mode = data?.mode || 'classic';
        socket.playerName = playerName;
        
        handlePlayerLeave(io, socket, 'left');
        cleanupWaiting();

        if (waitingPlayers.length > 0) {
            const oppData = waitingPlayers.shift();
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            const p1 = createPlayer({ clientId: socket.clientId, socketId: socket.id, name: socket.playerName });
            const p2 = createPlayer({ clientId: oppData.clientId, socketId: oppData.socketId, name: oppData.name });

            const room = createRoom({ roomId, players: [p1, p2], mode });
            rooms.set(roomId, room);

            socket.join(roomId);
            const opponentSocket = io.sockets.sockets.get(oppData.socketId);
            if (opponentSocket) opponentSocket.join(roomId);

            const oppInfo = { name: p2.name, fleetReady: false, status: 'connected' };
            const selfInfo = { name: p1.name, fleetReady: false, status: 'connected' };

            io.to(socket.id).emit('room_joined', { roomId, opponent: oppInfo, mode });
            io.to(oppData.socketId).emit('room_joined', { roomId, opponent: selfInfo, mode });
            io.to(oppData.socketId).emit('opponent_joined', selfInfo);
            
            io.emit('rooms_update', getRoomsList());
        } else {
            waitingPlayers.push({
                socketId: socket.id,
                clientId: socket.clientId,
                name: playerName,
                waitingMode: mode
            });
            socket.emit('waiting_for_opponent');
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('join_specific', (data) => {
        const playerName = data?.name || 'Commander';
        const targetId = data?.targetId;
        const clientId = socket.clientId;
        socket.playerName = playerName;

        if (!targetId) return;

        // Check if already in target room (reconnection)
        if (rooms.has(targetId)) {
            const room = rooms.get(targetId);
            const isParticipant = room.players.some(p => p.clientId === clientId);

            if (isParticipant) {
                const player = room.players.find(p => p.clientId === clientId);
                player.socketId = socket.id;
                player.status = 'connected';
                if (player.disconnectTimer) {
                    clearTimeout(player.disconnectTimer);
                    player.disconnectTimer = null;
                }
                socket.join(targetId);
                const opponent = room.players.find(p => p.clientId !== clientId);
                socket.emit('room_joined', { 
                    roomId: targetId, 
                    opponent: opponent ? { 
                        name: opponent.name, 
                        fleetReady: opponent.ready, 
                        roomReady: opponent.roomReady,
                        status: opponent.status 
                    } : null,
                    mode: room.mode
                });

                if (room.turn) {
                    socket.emit('game_start', { firstTurn: room.turn === clientId ? 'player' : 'opponent' });
                } else if (room.phase === GamePhase.PLACING) {
                    socket.emit('match_start_init');
                }

                socket.to(targetId).emit('opponent_status_update', { status: 'connected' });
                return;
            }
        }

        // If not reconnecting to SAME room, leave any other rooms first
        handlePlayerLeave(io, socket, 'left');
        cleanupWaiting();

        // Case 1: Target is an existing ROOM (New Joiner)
        if (rooms.has(targetId)) {
            const room = rooms.get(targetId);

            if (room.players.length >= 2) {
                socket.emit('error', { msg: 'Phòng đã đầy hoặc trận đấu đang diễn ra!' });
                return;
            }

            socket.join(targetId);
            const host = room.players[0];
            const guest = createPlayer({ clientId, socketId: socket.id, name: playerName });
            room.players.push(guest);

            // Reset everybody for the fresh lobby
            room.players.forEach(p => {
                p.ready = false;
                p.roomReady = false;
            });

            socket.emit('room_joined', { 
                roomId: targetId, 
                opponent: { name: host.name, fleetReady: false, roomReady: false, status: host.status }, 
                mode: room.mode 
            });
            io.to(host.socketId).emit('opponent_joined', { 
                name: playerName, 
                fleetReady: false, 
                roomReady: false, 
                status: 'connected' 
            });
            
            io.emit('rooms_update', getRoomsList());
            return;
        }

        // Case 2: Target is a WAITING PLAYER
        const oppIndex = waitingPlayers.findIndex(p => p.socketId === targetId);
        if (oppIndex !== -1) {
            const oppData = waitingPlayers.splice(oppIndex, 1)[0];
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            const p1 = createPlayer({ clientId: socket.clientId, socketId: socket.id, name: socket.playerName });
            const p2 = createPlayer({ clientId: oppData.clientId, socketId: oppData.socketId, name: oppData.name });

            const room = createRoom({ roomId, players: [p1, p2], mode: oppData.waitingMode || 'classic' });
            rooms.set(roomId, room);

            socket.join(roomId);
            const opponentSocket = io.sockets.sockets.get(oppData.socketId);
            if (opponentSocket) opponentSocket.join(roomId);

            io.to(socket.id).emit('room_joined', { roomId, opponent: { name: p2.name, fleetReady: false, status: 'connected' }, mode: room.mode });
            io.to(oppData.socketId).emit('room_joined', { roomId, opponent: { name: p1.name, fleetReady: false, status: 'connected' }, mode: room.mode });
            io.to(oppData.socketId).emit('opponent_joined', { name: p1.name, fleetReady: false, status: 'connected' });
            
            io.emit('rooms_update', getRoomsList());
            return;
        }

        socket.emit('error', { msg: 'Phòng không tồn tại hoặc đối thủ đã rời đi.' });
    });

    socket.on('leave_matchmaking', () => {
        cleanupWaiting();
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('leave_room', () => {
        handlePlayerLeave(io, socket, 'left');
    });

    socket.on('get_active_rooms', () => {
        socket.emit('rooms_update', getRoomsList());
    });

    return { handlePlayerLeaving: handlePlayerLeave };
};

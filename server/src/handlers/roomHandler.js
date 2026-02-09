const { rooms } = require('../state');
const { getRoomsList } = require('../utils');
const { GamePhase } = require('../constants');
const { createPlayer, createRoom } = require('../factories');
const connectionHandler = require('./connectionHandler');

module.exports = (io, socket) => {
    const handlePlayerLeave = connectionHandler.handlePlayerLeave;

    /**
     * CREATE ROOM - Tạo room mới (Open Room Model)
     * Khi player bấm "Tìm trận" hoặc "Tạo phòng"
     */
    socket.on('create_room', (data) => {
        const playerName = data?.name || 'Commander';
        const userId = data?.userId || null; // For authenticated users
        const mode = data?.mode || 'classic';
        socket.playerName = playerName;
        
        // Cleanup: Leave any existing room
        handlePlayerLeave(io, socket, 'left');

        // Generate unique room ID
        let roomId;
        do {
            roomId = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(roomId));

        socket.join(roomId);
        console.log(`[ROOM] Created: ${roomId} by ${playerName} (Mode: ${mode})`);

        const player = createPlayer({ 
            clientId: socket.clientId, 
            socketId: socket.id, 
            userId,
            name: playerName 
        });

        const room = createRoom({ roomId, players: [player], mode });
        rooms.set(roomId, room);

        socket.emit('room_joined', { roomId, mode, opponent: null });
        io.emit('rooms_update', getRoomsList());
    });

    /**
     * JOIN RANDOM - Tìm room WAITING bất kỳ và join
     */
    socket.on('join_random', (data) => {
        const playerName = data?.name || 'Commander';
        const userId = data?.userId || null;
        const mode = data?.mode || 'classic';
        socket.playerName = playerName;
        
        handlePlayerLeave(io, socket, 'left');

        // Tìm room WAITING (1/2 players)
        let targetRoom = null;
        let targetRoomId = null;

        for (const [roomId, room] of rooms.entries()) {
            const activePlayers = room.players.filter(p => p.status !== 'disconnected');
            
            if (
                room.phase === GamePhase.WAITING &&
                activePlayers.length < 2 &&
                room.mode === mode &&
                !room.isPvE
            ) {
                targetRoom = room;
                targetRoomId = roomId;
                break;
            }
        }

        // Nếu tìm thấy room -> Join
        if (targetRoom) {
            socket.join(targetRoomId);
            
            const host = targetRoom.players[0];
            const guest = createPlayer({ 
                clientId: socket.clientId, 
                socketId: socket.id, 
                userId,
                name: playerName 
            });
            targetRoom.players.push(guest);

            // Reset ready states
            targetRoom.players.forEach(p => {
                p.ready = false;
                p.roomReady = false;
            });

            const hostInfo = { name: host.name, fleetReady: false, roomReady: false, status: host.status };
            const guestInfo = { name: playerName, fleetReady: false, roomReady: false, status: 'connected' };

            socket.emit('room_joined', { roomId: targetRoomId, opponent: hostInfo, mode: targetRoom.mode });
            io.to(host.socketId).emit('opponent_joined', guestInfo);
            
            io.emit('rooms_update', getRoomsList());
            console.log(`[ROOM] ${playerName} joined ${targetRoomId} (Random)`);
        } else {
            // Không tìm thấy room -> Tạo room mới
            socket.emit('create_room', { name: playerName, userId, mode });
        }
    });

    /**
     * JOIN SPECIFIC - Join room cụ thể hoặc reconnect
     */
    socket.on('join_specific', (data) => {
        const playerName = data?.name || 'Commander';
        const userId = data?.userId || null;
        const targetId = data?.targetId;
        const clientId = socket.clientId;
        socket.playerName = playerName;

        if (!targetId) {
            socket.emit('error', { msg: 'Room ID không hợp lệ' });
            return;
        }

        // RECONNECT: Check if player is already in this room
        if (rooms.has(targetId)) {
            const room = rooms.get(targetId);
            const existingPlayer = room.players.find(p => p.clientId === clientId);

            if (existingPlayer) {
                // RECONNECTION FLOW
                existingPlayer.socketId = socket.id;
                existingPlayer.status = 'connected';
                
                if (existingPlayer.disconnectTimer) {
                    clearTimeout(existingPlayer.disconnectTimer);
                    existingPlayer.disconnectTimer = null;
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

                // Restore game state
                if (room.turn) {
                    socket.emit('game_start', { firstTurn: room.turn === clientId ? 'player' : 'opponent' });
                } else if (room.phase === GamePhase.PLACING) {
                    socket.emit('match_start_init');
                }

                socket.to(targetId).emit('opponent_status_update', { status: 'connected' });
                console.log(`[RECONNECT] ${playerName} reconnected to ${targetId}`);
                return;
            }
        }

        // NEW JOIN: Leave any existing room first
        handlePlayerLeave(io, socket, 'left');

        // Check if target room exists and is joinable
        if (!rooms.has(targetId)) {
            socket.emit('error', { msg: 'Phòng không tồn tại' });
            return;
        }

        const room = rooms.get(targetId);

        // RULE 1: Chỉ join được nếu phase = WAITING
        if (room.phase !== GamePhase.WAITING) {
            socket.emit('error', { msg: 'Trận đấu đang diễn ra, không thể tham gia' });
            return;
        }

        // RULE 2: Chỉ join được nếu chưa full
        const activePlayers = room.players.filter(p => p.status !== 'disconnected');
        if (activePlayers.length >= 2) {
            socket.emit('error', { msg: 'Phòng đã đầy' });
            return;
        }

        // OK - Allow join
        socket.join(targetId);
        const host = room.players[0];
        const guest = createPlayer({ 
            clientId, 
            socketId: socket.id, 
            userId,
            name: playerName 
        });
        room.players.push(guest);

        // Reset ready states
        room.players.forEach(p => {
            p.ready = false;
            p.roomReady = false;
        });

        const hostInfo = { name: host.name, fleetReady: false, roomReady: false, status: host.status };
        const guestInfo = { name: playerName, fleetReady: false, roomReady: false, status: 'connected' };

        socket.emit('room_joined', { roomId: targetId, opponent: hostInfo, mode: room.mode });
        io.to(host.socketId).emit('opponent_joined', guestInfo);
        
        io.emit('rooms_update', getRoomsList());
        console.log(`[ROOM] ${playerName} joined ${targetId}`);
    });

    /**
     * LEAVE ROOM
     */
    socket.on('leave_room', () => {
        handlePlayerLeave(io, socket, 'left');
    });

    /**
     * GET ACTIVE ROOMS
     */
    socket.on('get_active_rooms', () => {
        socket.emit('rooms_update', getRoomsList());
    });

    return { handlePlayerLeaving: handlePlayerLeave };
};

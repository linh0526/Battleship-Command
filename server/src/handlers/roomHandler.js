const { rooms, waitingPlayers } = require('../state');
const { getRoomsList } = require('../utils');
const connectionHandler = require('./connectionHandler');

module.exports = (io, socket) => {
    // Import the shared leave logic from connectionHandler
    const { handlePlayerLeave } = connectionHandler(io, socket);

    socket.on('create_room', (data) => {
        const playerName = data?.name || 'Commander';
        const fleet = data?.fleet || [];
        socket.playerName = playerName;
        const clientId = socket.clientId;
        
        // Ensure not in any previous room
        handlePlayerLeave(io, socket, 'left');
        
        const waitIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitIndex !== -1) waitingPlayers.splice(waitIndex, 1);

        let roomId;
        do {
            roomId = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(roomId));

        socket.join(roomId);
        console.log(`[ROOM] Created: ${roomId} by ${playerName}`);

        rooms.set(roomId, {
            players: [
                { 
                    id: clientId,
                    clientId: clientId,
                    socketId: socket.id,
                    status: 'connected',
                    name: playerName, 
                    ready: false, 
                    fleet: fleet, 
                    shotsReceived: new Set(),
                    stats: { shots: 0, hits: 0, misses: 0, score: 0 }
                }
            ],
            turn: null,
            state: 'LOBBY',
            logs: []
        });

        socket.emit('room_joined', { roomId });
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('join_random', (data) => {
        const playerName = data?.name || 'Commander';
        const fleet = data?.fleet || [];
        socket.playerName = playerName;
        
        handlePlayerLeave(io, socket, 'left');
        const nameIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (nameIndex !== -1) waitingPlayers.splice(nameIndex, 1);

        if (waitingPlayers.length > 0) {
            const opponentSocket = waitingPlayers.shift();
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            socket.join(roomId);
            opponentSocket.join(roomId);

            rooms.set(roomId, {
                players: [
                    { id: socket.clientId, clientId: socket.clientId, socketId: socket.id, status: 'connected', name: socket.playerName, ready: false, fleet: fleet, shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } },
                    { id: opponentSocket.clientId, clientId: opponentSocket.clientId, socketId: opponentSocket.id, status: 'connected', name: opponentSocket.playerName, ready: false, fleet: opponentSocket.waitingFleet || [], shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } }
                ],
                turn: null,
                state: 'LOBBY',
                logs: []
            });

            const oppInfo = { name: opponentSocket.playerName, fleetReady: false, status: 'connected' };
            const selfInfo = { name: socket.playerName, fleetReady: false, status: 'connected' };

            io.to(socket.id).emit('room_joined', { roomId, opponent: oppInfo });
            io.to(opponentSocket.id).emit('room_joined', { roomId, opponent: selfInfo });
            io.to(opponentSocket.id).emit('opponent_joined', selfInfo);
            
            io.emit('rooms_update', getRoomsList());
        } else {
            socket.waitingFleet = fleet;
            waitingPlayers.push(socket);
            socket.emit('waiting_for_opponent');
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('join_specific', (data) => {
        const playerName = data?.name || 'Commander';
        const targetId = data?.targetId;
        const fleet = data?.fleet || [];
        const clientId = socket.clientId;
        socket.playerName = playerName;

        if (!targetId) return;

        handlePlayerLeave(io, socket, 'left');
        const waitIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitIndex !== -1) waitingPlayers.splice(waitIndex, 1);

        // Case 1: Target is an existing ROOM
        if (rooms.has(targetId)) {
            const room = rooms.get(targetId);
            if (room.players.length >= 2) {
                socket.emit('error', { msg: 'Phòng đầy!' });
                return;
            }

            socket.join(targetId);
            const host = room.players[0];
            
            room.players.push({ 
                id: clientId,
                clientId: clientId,
                socketId: socket.id,
                status: 'connected',
                name: playerName, 
                ready: false, 
                fleet: fleet, 
                shotsReceived: new Set(),
                stats: { shots: 0, hits: 0, misses: 0, score: 0 }
            });

            host.ready = false;
            const hostInfo = { name: host.name, fleetReady: false, status: host.status };
            socket.emit('room_joined', { roomId: targetId, opponent: hostInfo });
            const guestInfo = { name: playerName, fleetReady: false, status: 'connected' };
            io.to(host.socketId).emit('opponent_joined', guestInfo);
            
            io.emit('rooms_update', getRoomsList());
            return;
        }

        // Case 2: Target is a WAITING PLAYER (from lobby list)
        const opponentIndex = waitingPlayers.findIndex(p => p.id === targetId);
        if (opponentIndex !== -1) {
            const opponentSocket = waitingPlayers.splice(opponentIndex, 1)[0];
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            socket.join(roomId);
            opponentSocket.join(roomId);

            rooms.set(roomId, {
                players: [
                    { id: socket.clientId, clientId: socket.clientId, socketId: socket.id, status: 'connected', name: socket.playerName, ready: false, fleet: fleet, shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } },
                    { id: opponentSocket.clientId, clientId: opponentSocket.clientId, socketId: opponentSocket.id, status: 'connected', name: opponentSocket.playerName, ready: false, fleet: opponentSocket.waitingFleet || [], shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } }
                ],
                turn: null,
                state: 'LOBBY',
                logs: []
            });

            const oppInfo = { name: opponentSocket.playerName, fleetReady: false, status: 'connected' };
            const selfInfo = { name: socket.playerName, fleetReady: false, status: 'connected' };

            io.to(socket.id).emit('room_joined', { roomId, opponent: oppInfo });
            io.to(opponentSocket.id).emit('room_joined', { roomId, opponent: selfInfo });
            io.to(opponentSocket.id).emit('opponent_joined', selfInfo);
            
            io.emit('rooms_update', getRoomsList());
            return;
        }

        socket.emit('error', { msg: 'Phòng không tồn tại hoặc đối thủ đã rời đi.' });
    });

    socket.on('leave_matchmaking', () => {
        const index = waitingPlayers.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('leave_room', () => {
        handlePlayerLeave(io, socket, 'left');
    });

    socket.on('get_active_rooms', () => {
        socket.emit('rooms_update', getRoomsList());
    });

    return { handlePlayerLeaving: handlePlayerLeave };
};

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Import state, utils, and handlers
const { rooms, waitingPlayers, activePve } = require('./src/state');
const { getRoomsList } = require('./src/utils');
const registerRoomHandlers = require('./src/handlers/roomHandler');
const registerGameHandlers = require('./src/handlers/gameHandler');
const registerConnectionHandlers = require('./src/handlers/connectionHandler');

io.on('connection', (socket) => {
    const clientId = socket.handshake.auth?.clientId;
    if (!clientId) {
        console.log(`[CONN] Rejected connection: Missing clientId`);
        socket.disconnect();
        return;
    }

    socket.clientId = clientId;
    console.log(`[CONN] ${socket.id} connected (clientId: ${clientId})`);
    
    // Recovery Logic: Check if player was in a room
    let recoveredRoomId = null;
    for (const [rid, room] of rooms.entries()) {
        const player = room.players.find(p => p.clientId === clientId);
        if (player) {
            recoveredRoomId = rid;
            player.socketId = socket.id;
            socket.playerName = player.name; // Restore playerName on socket
            player.status = 'connected';
            if (player.disconnectTimer) {
                clearTimeout(player.disconnectTimer);
                player.disconnectTimer = null;
            }
            socket.join(rid);
            console.log(`[RECOVERY] ${player.name} reconnected to room ${rid}`);
            
            // Sync current state to recovered player
            const opponent = room.players.find(p => p.clientId !== clientId);
            socket.emit('room_joined', { 
                roomId: rid, 
                opponent: opponent ? { 
                    name: opponent.name, 
                    fleetReady: opponent.ready,
                    status: opponent.status 
                } : null 
            });
            
            if (room.turn) {
                socket.emit('turn_change', { turn: room.turn });
                socket.emit('game_start', { 
                    firstTurn: room.turn === clientId ? 'player' : 'opponent' 
                });
            }

            // Notify opponent
            socket.to(rid).emit('opponent_status_update', { status: 'connected' });
            break;
        }
    }

    io.emit('player_count', io.engine.clientsCount);

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerConnectionHandlers(io, socket);

    // Initial broadcast
    socket.emit('rooms_update', getRoomsList());
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

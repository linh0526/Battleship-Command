const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allow parsing JSON bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('[DB] MongoDB Connected'))
    .catch(err => console.error('[DB] Connection Error:', err));

// Auth Routes
const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/room');
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

const Message = require('./src/models/Message');

// Import state, utils, and handlers
const { rooms, waitingPlayers } = require('./src/state');
const { getRoomsList } = require('./src/utils');
const { GamePhase } = require('./src/constants');
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
                } : null,
                mode: room.mode,
                isPvE: room.isPvE
            });
            
            if (room.turn && room.phase === GamePhase.BATTLE) {
                socket.emit('turn_change', { turn: room.turn });
                socket.emit('game_start', { 
                    firstTurn: room.turn === clientId ? 'player' : 'opponent' 
                });
            } else if (room.phase === GamePhase.PLACING) {
                socket.emit('match_start_init');
            }

            // Notify opponent
            socket.to(rid).emit('opponent_status_update', { status: 'connected' });
            break;
        }
    }

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerConnectionHandlers(io, socket);

    // Initial broadcast
    io.emit('player_count', io.engine.clientsCount);
    socket.emit('rooms_update', getRoomsList());
    
    // Send chat history
    const sendChatHistory = () => {
        Message.find().sort({ timestamp: -1 }).limit(20)
            .then(messages => {
                socket.emit('chat_history', messages.reverse());
            })
            .catch(err => console.error('[CHAT] Fetch error:', err));
    };

    sendChatHistory();

    socket.on('get_chat_history', sendChatHistory);

    socket.on('send_chat', async (data) => {
        try {
            const newMessage = new Message({
                user: socket.playerName || 'Guest',
                msg: data.msg,
                type: 'msg'
            });
            
            await newMessage.save();
            io.emit('chat_update', newMessage);
        } catch (err) {
            console.error('[CHAT] Save error:', err);
        }
    });

    socket.on('get_player_count', () => {
        socket.emit('player_count', io.engine.clientsCount);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

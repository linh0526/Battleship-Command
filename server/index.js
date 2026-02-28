const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(cors());
app.use(express.json()); // Allow parsing JSON bodies

// Mongoose Config
mongoose.set('bufferCommands', false);

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[DB] MongoDB Connected');
    } catch (err) {
        console.error('[DB] Connection Error:', err);
        process.exit(1);
    }
};

// Auth Routes
const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/room');
const historyRoutes = require('./src/routes/history');
const leaderboardRoutes = require('./src/routes/leaderboard');
const socialRoutes = require('./src/routes/social');
const notificationRoutes = require('./src/routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

const PORT = process.env.PORT || 3001;

const Message = require('./src/models/Message');
const User = require('./src/models/User');

// Import state, utils, and handlers
const { rooms, waitingPlayers, userSockets } = require('./src/state');
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

    // Remove automatic mapping by UUID
    // userSockets registration is handled explicitly by 'register_user' event.

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerConnectionHandlers(io, socket);

    socket.on('register_user', (userId) => {
        if (userId) {
            socket.userId = userId;
            userSockets.set(userId.toString(), socket.id);
            console.log(`[STATE] User ${userId} mapped to socket ${socket.id}`);
            io.emit('social_update'); // Ping friends list refresh
        }
    });

    // Friend/Chat Handlers
    socket.on('send_private_msg', async (data) => {
        const { recipientId, msg } = data;
        const senderId = socket.userId;
        if (!senderId || !recipientId || !msg) return;

        try {
            const sender = await User.findById(senderId);
            if (!sender) return;

            // Save to DB
            const chatMsg = new Message({
                sender: senderId,
                recipient: recipientId,
                user: sender.username,
                msg: msg,
                type: 'private'
            });
            await chatMsg.save();

            // Notify recipient if online
            const recipientSocketId = userSockets.get(recipientId.toString());
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private_msg', {
                    senderId: senderId,
                    senderName: sender.username,
                    msg: msg,
                    timestamp: chatMsg.timestamp
                });
            }

            // Confirm to sender
            socket.emit('private_msg_sent', {
                recipientId,
                msg,
                timestamp: chatMsg.timestamp
            });
        } catch (error) {
            console.error('[SOCIAL] Private chat error:', error);
        }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        if (socket.userId && userSockets.get(socket.userId.toString()) === socket.id) {
            userSockets.delete(socket.userId.toString());
            console.log(`[STATE] User ${socket.userId} removed from socket map`);
            io.emit('social_update');
        }
    });

    // Initial broadcast
    io.emit('player_count', io.engine.clientsCount);
    socket.emit('rooms_update', getRoomsList());
    
    // Send chat history (Global only for now by default)
    const sendChatHistory = () => {
        if (mongoose.connection.readyState !== 1) {
            console.log('[CHAT] DB not ready, skipping history fetch');
            socket.emit('chat_history', []);
            return;
        }

        Message.find({ recipient: null }).sort({ timestamp: -1 }).limit(20)
            .then(messages => {
                socket.emit('chat_history', messages.reverse());
            })
            .catch(err => console.error('[CHAT] Fetch error:', err));
    };

    socket.on('get_chat_history', sendChatHistory);

    socket.on('send_chat', async (data) => {
        if (mongoose.connection.readyState !== 1) {
            socket.emit('chat_update', {
                user: 'SYSTEM',
                msg: 'Chat service currently unavailable (DB link offline).',
                type: 'sys',
                color: 'text-error'
            });
            return;
        }

        try {
            const senderId = socket.userId || null;
            let sender = null;
            if (senderId) {
                sender = await User.findById(senderId);
            }
            
            const username = sender ? sender.username : (data.user || 'Guest');

            const chatMsg = new Message({
                sender: senderId,
                user: username,
                msg: data.msg,
                type: 'msg'
            });
            await chatMsg.save();

            io.emit('chat_update', {
                user: username,
                msg: data.msg,
                type: 'msg',
                clientId: clientId || null,
                timestamp: chatMsg.timestamp
            });
        } catch (error) {
            console.error('[CHAT] Save error:', error);
        }
    });

    socket.on('get_player_count', () => {
        socket.emit('player_count', io.engine.clientsCount);
    });
});

const start = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`[SERVER] Fleet Command Center online at port ${PORT}`);
    });
};

start();

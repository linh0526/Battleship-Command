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

// Lưu trữ trạng thái trò chơi
const rooms = new Map();
const waitingPlayers = [];
const activePve = new Map(); // Theo dõi phiên PvE: socket.id -> playerName

io.on('connection', (socket) => {
    console.log(`[CONN] ${socket.playerName || socket.id} connected`);
    io.emit('player_count', io.engine.clientsCount);

    socket.on('start_pve', (data) => {
        const playerName = data?.name || 'Commander';
        socket.playerName = playerName;
        activePve.set(socket.id, playerName);
        console.log(`[PBE] ${playerName} started a Ghost AI match`);
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('end_pve', () => {
        if (activePve.has(socket.id)) {
            console.log(`[PBE] ${activePve.get(socket.id)} ended Ghost AI match`);
            activePve.delete(socket.id);
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('create_room', (data) => {
        const playerName = data?.name || 'Commander';
        const fleet = data?.fleet || [];
        socket.playerName = playerName;
        
        // Ensure player leaves any existing room or waitlist first
        handlePlayerLeaving(socket);
        const waitIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitIndex !== -1) waitingPlayers.splice(waitIndex, 1);

        // Generate unique Room ID
        let roomId;
        do {
            roomId = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(roomId));

        socket.join(roomId);
        console.log(`[ROOM] Created Room: ${roomId} by ${playerName}`);

        rooms.set(roomId, {
            players: [
                { 
                    id: socket.id, 
                    name: playerName, 
                    ready: fleet.length > 0, 
                    fleet: fleet, 
                    shotsReceived: new Set(),
                    stats: { shots: 0, hits: 0, misses: 0, score: 0 }
                }
            ],
            turn: null,
            logs: []
        });

        socket.emit('room_joined', { roomId });
        io.emit('rooms_update', getRoomsList());
    });

    socket.on('join_random', (data) => {
        const playerName = data?.name || 'Commander';
        const fleet = data?.fleet || [];
        socket.playerName = playerName;
        console.log(`[MATCH] ${playerName} (${socket.id}) requested random match`);

        // Ensure player leaves any existing room or waitlist first
        handlePlayerLeaving(socket);
        const nameIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (nameIndex !== -1) {
            waitingPlayers.splice(nameIndex, 1);
        }

        if (waitingPlayers.length > 0) {
            const opponentSocket = waitingPlayers.shift();
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            socket.join(roomId);
            opponentSocket.join(roomId);
            console.log(`[ROOM] Random Match Ready: ${roomId} for ${socket.playerName} and ${opponentSocket.playerName}`);

            rooms.set(roomId, {
                players: [
                    { id: socket.id, name: socket.playerName, ready: true, fleet: fleet, shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } },
                    { id: opponentSocket.id, name: opponentSocket.playerName, ready: true, fleet: opponentSocket.waitingFleet || [], shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } }
                ],
                turn: null,
                logs: []
            });

            const oppInfo = { name: opponentSocket.playerName, fleetReady: true };
            const selfInfo = { name: socket.playerName, fleetReady: true };

            io.to(socket.id).emit('room_joined', { roomId, opponent: oppInfo });
            io.to(opponentSocket.id).emit('room_joined', { roomId, opponent: selfInfo });
            
            io.to(opponentSocket.id).emit('opponent_joined', selfInfo);
            
            setTimeout(() => {
                startGame(roomId);
            }, 500);
            
            io.emit('rooms_update', getRoomsList());
        } else {
            // Lưu tạm thời đội hình vào socket để dùng khi tìm thấy trận đấu
            socket.waitingFleet = fleet;
            waitingPlayers.push(socket);
            socket.emit('waiting_for_opponent');
            console.log(`[MATCH] ${socket.playerName} added to waitlist (READY)`);
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('join_specific', (data) => {
        const playerName = data?.name || 'Commander';
        const targetId = data?.targetId;
        const fleet = data?.fleet || [];
        socket.playerName = playerName;
        console.log(`[JOIN] ${playerName} requesting join to: ${targetId}`);

        // Ensure player leaves any existing room or waitlist first
        handlePlayerLeaving(socket);
        const waitIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitIndex !== -1) waitingPlayers.splice(waitIndex, 1);

        if (targetId === socket.id) {
            socket.emit('error', { msg: 'Bạn không thể tham gia trận đấu của chính mình.' });
            return;
        }

        // 1. Check if targetId is an existing Room (Created via Create Room)
        if (rooms.has(targetId)) {
            const room = rooms.get(targetId);
            if (room.players.length >= 2) {
                socket.emit('error', { msg: 'Phòng đầy!' });
                return;
            }

            console.log(`[ROOM] ${playerName} joining room ${targetId}`);
            socket.join(targetId);
            
            // Host is already in room.players[0]
            const host = room.players[0];
            
            // Add Guest
            room.players.push({ 
                id: socket.id, 
                name: playerName, 
                ready: false, // Force User to press Ready again 
                fleet: fleet, 
                shotsReceived: new Set(),
                stats: { shots: 0, hits: 0, misses: 0, score: 0 }
            });

            // Reset Host Ready Status
            host.ready = false;

            // Notify Guest (Success Join)
            const hostInfo = { name: host.name, fleetReady: false };
            socket.emit('room_joined', { roomId: targetId, opponent: hostInfo });

            // Notify Host (Opponent Joined)
            const guestInfo = { name: playerName, fleetReady: false };
            io.to(host.id).emit('opponent_joined', guestInfo);
            
            io.emit('rooms_update', getRoomsList());
            return;
        }

        // 2. Check if targetId is a Player ID in Waiting List (Legacy/Direct specific match)
        const opponentIndex = waitingPlayers.findIndex(p => p.id === targetId);

        if (opponentIndex !== -1) {
            const opponentSocket = waitingPlayers.splice(opponentIndex, 1)[0];
            const roomId = Math.floor(1000 + Math.random() * 9000).toString();

            socket.join(roomId);
            opponentSocket.join(roomId);
            console.log(`[ROOM] Matched via Player ID: ${roomId} (${opponentSocket.playerName} vs ${playerName})`);

            rooms.set(roomId, {
                players: [
                    { id: opponentSocket.id, name: opponentSocket.playerName, ready: true, fleet: opponentSocket.waitingFleet || [], shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } }, // Host/Waiter
                    { id: socket.id, name: socket.playerName, ready: true, fleet: fleet, shotsReceived: new Set(), stats: { shots: 0, hits: 0, misses: 0, score: 0 } } // Guest
                ],
                turn: null,
                logs: []
            });

            const hostInfo = { name: opponentSocket.playerName, fleetReady: true };
            const guestInfo = { name: socket.playerName, fleetReady: true };

            io.to(socket.id).emit('room_joined', { roomId, opponent: hostInfo });
            io.to(opponentSocket.id).emit('room_joined', { roomId, opponent: guestInfo });
            
            io.to(opponentSocket.id).emit('opponent_joined', guestInfo);
            
            setTimeout(() => {
                startGame(roomId);
            }, 500);

            io.emit('rooms_update', getRoomsList());
        } else {
             socket.emit('error', { msg: 'Phòng không tồn tại hoặc đối thủ đã rời đi.' });
        }
    });

    socket.on('fire_shot', (data) => {
        const { r, c } = data;
        
        let roomId = null;
        let room = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.id === socket.id)) {
                roomId = id;
                room = rm;
                break;
            }
        }

        if (roomId && room) {
            
            // Xác thực lượt chơi
            if (room.turn !== socket.id) return;

            const opponent = room.players.find(p => p.id !== socket.id);
            if (!opponent) return;

            // Kiểm tra nếu đã bắn rồi
            const coordKey = `${r}-${c}`;
            if (opponent.shotsReceived && opponent.shotsReceived.has(coordKey)) return;

            if (opponent.shotsReceived) opponent.shotsReceived.add(coordKey);
            
            // Console log formatted coordinate (e.g., A1, J10)
            const friendlyCoord = `${String.fromCharCode(65 + c)}${r + 1}`;
            const attacker = room.players.find(p => p.id === socket.id);
            if (attacker) attacker.stats.shots++;

            console.log(`[BATTLE] ${socket.playerName} -> [${friendlyCoord}] (${r},${c})`);

            // Tính toán Logic Trúng/Trượt
            let result = 'miss';
            let sunkShip = null;
            let hitShip = null;

            // Kiểm tra va chạm với đội hình đã lưu của đối thủ
            if (opponent.fleet) {
                for (const ship of opponent.fleet) {
                    for (let i = 0; i < ship.size; i++) {
                        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
                        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
                        if (sr === r && sc === c) {
                            result = 'hit';
                            hitShip = ship;
                            break;
                        }
                    }
                    if (result === 'hit') break;
                }
            }

            if (attacker) {
                if (result === 'hit') {
                    attacker.stats.hits++;
                    attacker.stats.score += 20;
                } else {
                    attacker.stats.misses++;
                }
            }

            // Kiểm tra Logic Chìm
            if (result === 'hit' && hitShip && opponent.shotsReceived) {
                let isSunk = true;
                for (let i = 0; i < hitShip.size; i++) {
                    const sr = hitShip.orientation === 'horizontal' ? hitShip.row : hitShip.row + i;
                    const sc = hitShip.orientation === 'horizontal' ? hitShip.col + i : hitShip.col;
                    if (!opponent.shotsReceived.has(`${sr}-${sc}`)) {
                        isSunk = false;
                        break;
                    }
                }
                if (isSunk) {
                    result = 'sunk';
                    sunkShip = hitShip;
                    if (attacker) attacker.stats.score += 50; // Bonus for sinking
                }
            }

            console.log(`[RESULT] ${result.toUpperCase()}${result === 'sunk' ? ' (' + (sunkShip ? sunkShip.name : 'Unknown') + ')' : ''}`);
            
            // Log Stats
            room.players.forEach(p => {
                const acc = p.stats.shots > 0 ? Math.round((p.stats.hits / p.stats.shots) * 100) : 0;
                console.log(` > ${p.name.padEnd(15)} | Sh: ${p.stats.shots} | Hi: ${p.stats.hits} | Mi: ${p.stats.misses} | Acc: ${acc}% | Sc: ${p.stats.score}`);
            });

            // Gửi phản hồi cho CẢ HAI người chơi
            io.to(roomId).emit('shot_processed', {
                attackerId: socket.id,
                r, c, result, sunkShip
            });

            // Ghi nhật ký
            io.to(roomId).emit('new_log', {
                msg: `${socket.playerName} fired at ${friendlyCoord}`,
                result: result === 'hit' ? 'DIRECT HIT!' : result === 'sunk' ? 'SHIP DESTROYED!' : 'MISS',
                type: result === 'hit' ? 'hit' : result === 'sunk' ? 'enemy-hit' : 'miss'
            });

            // Kiểm tra Điều kiện Thắng
            let isWin = false;
            if ((result === 'hit' || result === 'sunk') && opponent.fleet && opponent.shotsReceived) {
                const shipsStatus = opponent.fleet.map(ship => {
                    let shipHits = 0;
                    for (let i = 0; i < ship.size; i++) {
                        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
                        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
                        if (opponent.shotsReceived.has(`${sr}-${sc}`)) shipHits++;
                    }
                    return { name: ship.name, sunk: shipHits === ship.size, health: `${shipHits}/${ship.size}` };
                });

                const allSunk = shipsStatus.every(s => s.sunk);
                console.log(`[WIN CHECK] Ships: ${shipsStatus.map(s => `${s.name}(${s.health})`).join(', ')}`);

                if (allSunk) {
                    isWin = true;
                    if (attacker) attacker.stats.score += 200; // Win bonus
                    console.log(`[VICTORY] ${socket.playerName} won the match in room ${roomId}`);
                    // Thông báo chiến thắng
                    io.to(socket.id).emit('player_victory'); 
                    io.to(opponent.id).emit('player_defeat'); 

                    io.to(roomId).emit('new_log', {
                        msg: `GAME OVER! ${socket.playerName} is the winner!`,
                        result: 'VICTORY',
                        type: 'sys'
                    });
                }
            }

            // Logic Đổi Lượt
            if (!isWin) {
                if (result === 'miss') {
                   room.turn = opponent.id;
                   io.to(roomId).emit('turn_change', { turn: opponent.id });
                } else {
                   // Trúng được thêm lượt
                   io.to(roomId).emit('turn_change', { turn: socket.id });
                }
            }
        }
    });

    socket.on('rematch_request', () => {
        let roomId = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.id === socket.id)) {
                roomId = id;
                break;
            }
        }
        if (roomId) {
            console.log(`[REMATCH] ${socket.playerName || socket.id} in ${roomId} requested rematch`);
            socket.to(roomId).emit('rematch_requested', { from: socket.playerName || socket.id });
        }
    });

    socket.on('rematch_accept', () => {
        let roomId = null;
        let room = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.id === socket.id)) {
                roomId = id;
                room = rm;
                break;
            }
        }
        if (roomId && room) {
            console.log(`[REMATCH] Rematch accepted in ${roomId}`);
            room.players.forEach(p => p.ready = false);
            io.to(roomId).emit('rematch_started');
        }
    });

    socket.on('fleet_ready', (fleet) => {
        // Find the room where this player is registered
        let roomId = null;
        let room = null;
        
        for (const [id, r] of rooms.entries()) {
            if (r.players.some(p => p.id === socket.id)) {
                roomId = id;
                room = r;
                break;
            }
        }

        if (roomId && room) {
            console.log(`[READY] ${socket.playerName || socket.id} fleet confirmed in ${roomId}`);
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.ready = true;
                player.fleet = fleet || [];
                player.shotsReceived = new Set();
            }

            socket.to(roomId).emit('opponent_fleet_ready');

            console.log(`[READY CHECK] Room ${roomId} players: ${room.players.length}. Status: ${room.players.map(p => p.name + '=' + p.ready).join(', ')}`);

            if (room.players.length === 2 && room.players.every(p => p.ready)) {
                startGame(roomId);
            }
        } else {
            console.log(`[WARN] fleet_ready received but no active room found for ${socket.id}`);
        }
    });

    socket.on('player_unready', () => {
        let roomId = null;
        let room = null;
        
        for (const [id, r] of rooms.entries()) {
            if (r.players.some(p => p.id === socket.id)) {
                roomId = id;
                room = r;
                break;
            }
        }

        if (roomId && room) {
            console.log(`[UNREADY] ${socket.playerName || socket.id} cancelled ready in ${roomId}`);
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.ready = false;
            }
            socket.to(roomId).emit('opponent_unready');
        }
    });

    socket.on('leave_matchmaking', () => {
        const index = waitingPlayers.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
            console.log(`[MATCH] ${socket.playerName || socket.id} canceled search`);
            io.emit('rooms_update', getRoomsList());
        }
    });

    socket.on('get_active_rooms', () => {
        socket.emit('rooms_update', getRoomsList());
    });

    const handlePlayerLeaving = (socket) => {
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                console.log(`[EXIT] ${socket.playerName || socket.id} leaving room ${roomId}`);
                room.players.splice(playerIndex, 1);
                socket.leave(roomId); // CRITICAL: Actually leave the socket.io room
                
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                    console.log(`[ROOM] Room ${roomId} destroyed (empty)`);
                } else {
                    // Reset remaining player status to WAITING
                    room.players.forEach(p => p.ready = false);
                    socket.to(roomId).emit('opponent_left');
                    sendSystemLog(roomId, `Commander ${socket.playerName || 'Unknown'} has deserted the post.`);
                    console.log(`[EXIT] Opponent notified in ${roomId}, host status reset.`);
                }
                io.emit('rooms_update', getRoomsList());
                break;
            }
        }
    };

    socket.on('leave_room', () => {
        handlePlayerLeaving(socket);
        // Instead of leaveAll, find any room ID and leave it specifically to avoid clearing socket.id
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) {
                socket.leave(roomId);
                console.log(`[EXIT] Socket ${socket.id} left room ${roomId} via leave_room`);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`[DISCONN] User ${socket.playerName || socket.id} disconnected`);
        io.emit('player_count', io.engine.clientsCount);
        const index = waitingPlayers.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
            console.log(`[MATCH] ${socket.playerName || socket.id} removed from waitlist on disconnect`);
        }
        handlePlayerLeaving(socket);
        if (activePve.has(socket.id)) {
            activePve.delete(socket.id);
            console.log(`[PBE] ${socket.playerName || socket.id} removed from active PBE on disconnect`);
        }
        io.emit('rooms_update', getRoomsList());
    });

    // Phát sóng ban đầu khi kết nối
    socket.emit('rooms_update', getRoomsList());
});

function getRoomsList() {
    const list = [];
    // Thêm người chơi đang chờ vào phòng "Mở"
    waitingPlayers.forEach(p => {
        list.push({
            id: p.id,
            name: `Mission: ${p.playerName || 'Unknown'}`,
            captains: '1/2',
            status: 'WAITING',
            statusColor: 'bg-amber-400'
        });
    });
    // Thêm các trận đấu đang diễn ra
    rooms.forEach((room, roomId) => {
        const p1 = room.players[0]?.name || 'Unknown';
        const p2 = room.players[1]?.name || 'Waiting...';
        
        let status = 'WAITING';
        let statusColor = 'bg-amber-400';
        
        if (room.players.length === 1) {
            status = 'WAITING';
            statusColor = 'bg-amber-400';
        } else if (room.players.length === 2) {
            const allReady = room.players.every(p => p.ready);
            if (allReady) {
                status = 'BATTLE';
                statusColor = 'bg-red-500';
            } else {
                status = 'PLACING';
                statusColor = 'bg-blue-400';
            }
        }

        list.push({
            id: roomId,
            name: `Battle: ${p1} vs ${p2}`,
            captains: `${room.players.length}/2`,
            status: status,
            statusColor: statusColor,
            difficulty: 'VETERAN'
        });
    });
    // Thêm các trận PvE đang diễn ra
    activePve.forEach((playerName, socketId) => {
        list.push({
            id: 'GhostAI',
            name: `PBE: ${playerName}`,
            captains: '1/1',
            status: 'DANGER',
            statusColor: 'bg-error'
        });
    });
    return list;
}

function startGame(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Ngẫu nhiên lượt chơi
    const firstTurnSocketId = room.players[Math.floor(Math.random() * room.players.length)].id;
    room.turn = firstTurnSocketId;

    console.log(`[GAME START] Room ${roomId} initiated.`);
    room.players.forEach(p => {
        console.log(` - Player: ${p.name} (${p.id}) | Fleet: ${p.fleet.length} ships`);
        p.fleet.forEach(s => {
            console.log(`    > ${s.name} at [${s.row}, ${s.col}] orient: ${s.orientation}`);
        });
        
        io.to(p.id).emit('game_start', { 
            firstTurn: firstTurnSocketId === p.id ? 'player' : 'opponent' 
        });
    });

    console.log(`[TURN] ${room.players.find(p => p.id === firstTurnSocketId).name} starts.`);
    sendSystemLog(roomId, `Battle phase initiated. All fleets confirmed ready.`);
}

function sendSystemLog(roomId, msg) {
    io.to(roomId).emit('new_log', {
        msg,
        result: 'SYSTEM',
        type: 'sys'
    });
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const { rooms, activePve } = require('../state');
const { startGame } = require('../gameEngine');
const { GamePhase } = require('../constants');
const { createRoom } = require('../factories');
const { getRoomsList } = require('../utils');

module.exports = (io, socket) => {
    const findRoom = () => {
        // Check PvP rooms
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.clientId === socket.clientId)) {
                return { roomId: id, room: rm };
            }
        }
        // Check PvE rooms
        for (const [id, rm] of activePve.entries()) {
            if (rm.players.some(p => p.clientId === socket.clientId)) {
                return { roomId: id, room: rm };
            }
        }
        return { roomId: null, room: null };
    };

    socket.on('fire_shot', (data) => {
        const { r, c } = data;
        const { roomId, room } = findRoom();

        if (roomId && room && room.phase === GamePhase.PLAYING) {
            if (room.turn !== socket.clientId) return;

            const friendlyCoord = `${String.fromCharCode(65 + c)}${r + 1}`;
            const attacker = room.players.find(p => p.clientId === socket.clientId);
            const opponent = room.players.find(p => p.clientId !== socket.clientId);
            if (!opponent) return;

            const coordKey = `${r}-${c}`;
            if (opponent.shotsReceived.has(coordKey)) return;

            opponent.shotsReceived.add(coordKey);
            attacker.stats.shots++;

            console.log(`[BATTLE] ${socket.playerName} -> [${friendlyCoord}] (${r},${c})`);

            let result = 'miss';
            let sunkShip = null;
            let hitShip = null;

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

            if (result === 'hit') {
                attacker.stats.hits++;
                attacker.stats.score += 20;
                
                // Check Sink
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
                    attacker.stats.score += 50;
                    attacker.stats.shipsSunk++;
                }
            } else {
                attacker.stats.misses++;
            }

            io.to(roomId).emit('shot_processed', {
                attackerId: socket.clientId,
                r, c, result, sunkShip
            });

            io.to(roomId).emit('new_log', {
                msg: `${socket.playerName} fired at ${friendlyCoord}`,
                result: result === 'hit' ? 'DIRECT HIT!' : result === 'sunk' ? 'SHIP DESTROYED!' : 'MISS',
                type: result === 'hit' ? 'hit' : result === 'sunk' ? 'enemy-hit' : 'miss'
            });

            // Check Win
            const isWin = opponent.fleet.every(ship => {
                for (let i = 0; i < ship.size; i++) {
                    const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
                    const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
                    if (!opponent.shotsReceived.has(`${sr}-${sc}`)) return false;
                }
                return true;
            });

            if (isWin) {
                room.phase = GamePhase.ENDED;
                attacker.stats.score += 200;
                io.to(socket.id).emit('player_victory'); 
                io.to(opponent.socketId).emit('player_defeat'); 
                io.to(roomId).emit('new_log', {
                    msg: `GAME OVER! ${socket.playerName} is the winner!`,
                    result: 'VICTORY',
                    type: 'sys'
                });

                // Save Match History & Update Stats
                const { saveMatchAndUpdateProfiles, extractMatchDataFromRoom } = require('../services/matchService');
                const matchData = extractMatchDataFromRoom(room, socket.clientId, 'VICTORY');
                
                saveMatchAndUpdateProfiles(matchData).catch(err => {
                    console.error('[GAME] Failed to save match history:', err);
                });

            } else if (result === 'miss') {
                room.turn = opponent.clientId;
                io.to(roomId).emit('turn_change', { turn: opponent.clientId });
            } else {
                io.to(roomId).emit('turn_change', { turn: socket.clientId });
            }
        }
    });

    socket.on('fleet_ready', (fleet) => {
        const { roomId, room } = findRoom();
        if (roomId && room && room.phase === GamePhase.PLACING) {
            const player = room.players.find(p => p.clientId === socket.clientId);
            if (player) {
                player.ready = true;
                player.fleet = fleet || [];
                player.shotsReceived = new Set();
            }
            socket.to(roomId).emit('opponent_fleet_ready');
            if (room.players.every(p => p.ready)) {
                startGame(io, roomId);
            }
        }
    });

    socket.on('player_unready', () => {
        const { roomId, room } = findRoom();
        if (roomId && room && room.phase === GamePhase.PLACING) {
            const player = room.players.find(p => p.clientId === socket.clientId);
            if (player) player.ready = false;
            socket.to(roomId).emit('opponent_unready');
        }
    });

    socket.on('rematch_request', () => {
        const { roomId } = findRoom();
        if (roomId) socket.to(roomId).emit('rematch_requested', { from: socket.playerName || socket.id });
    });

    socket.on('rematch_accept', () => {
        const { roomId: oldRoomId, room: oldRoom } = findRoom();
        if (oldRoomId && oldRoom) {
            const players = [...oldRoom.players];
            
            // 1. Generate new Room ID
            let newRoomId;
            do {
                newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
            } while (rooms.has(newRoomId));

            // 2. Prepare players for new room
            players.forEach(p => {
                p.ready = false;
                p.roomReady = false;
                p.shotsReceived = new Set();
                p.stats = { shots: 0, hits: 0, misses: 0, score: 0 };
            });

            // 3. Create new room
            const newRoom = createRoom({ 
                roomId: newRoomId, 
                players, 
                mode: oldRoom.mode 
            });
            rooms.set(newRoomId, newRoom);

            // 4. Move sockets to new room
            players.forEach(p => {
                const s = io.sockets.sockets.get(p.socketId);
                if (s) {
                    s.leave(oldRoomId);
                    s.join(newRoomId);
                }
            });

            // 5. Notify both players about the rematch starting (to clear state)
            io.to(oldRoomId).emit('rematch_started');

            // 6. Notify both players about the new room
            players.forEach(p => {
                const opponent = players.find(opp => opp.clientId !== p.clientId);
                const opponentInfo = opponent ? { 
                    name: opponent.name, 
                    fleetReady: false, 
                    roomReady: false, 
                    status: opponent.status 
                } : null;

                io.to(p.socketId).emit('room_joined', { 
                    roomId: newRoomId, 
                    opponent: opponentInfo, 
                    mode: newRoom.mode 
                });
            });

            // 7. Destroy old room
            rooms.delete(oldRoomId);

            io.emit('rooms_update', getRoomsList());
            console.log(`[REMATCH] Managed transition: Old ${oldRoomId} -> New ${newRoomId}`);
        }
    });

    socket.on('player_room_ready', (data) => {
        const { ready } = data;
        const { roomId, room } = findRoom();
        if (room && room.phase === GamePhase.WAITING) {
            const player = room.players.find(p => p.clientId === socket.clientId);
            if (player) {
                player.roomReady = ready;
                io.to(roomId).emit('room_ready_update', { playerId: socket.id, ready });
            }
        }
    });

    socket.on('room_start_match', () => {
        const { roomId, room } = findRoom();
        if (room && room.phase === GamePhase.WAITING && room.players.length === 2 && room.players.every(p => p.roomReady)) {
            room.phase = GamePhase.PLACING;
            console.log(`[LOBBY] ${socket.playerName} started match in ${roomId}`);
            io.to(roomId).emit('match_start_init');
        }
    });
};

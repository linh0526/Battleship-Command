const { rooms, activePve } = require('../state');
const { startGame } = require('../gameEngine');
const { GamePhase } = require('../constants');

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
        const { roomId, room } = findRoom();
        if (roomId && room) {
            room.phase = GamePhase.WAITING;
            room.turn = null;
            room.players.forEach(p => {
                p.ready = false;
                p.roomReady = false;
                p.shotsReceived = new Set();
            });
            io.to(roomId).emit('rematch_started');
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

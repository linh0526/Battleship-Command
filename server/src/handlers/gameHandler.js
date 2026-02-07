const { rooms } = require('../state');
const { startGame } = require('../gameEngine');

module.exports = (io, socket) => {
    socket.on('fire_shot', (data) => {
        const { r, c } = data;
        let roomId = null;
        let room = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.clientId === socket.clientId)) {
                roomId = id;
                room = rm;
                break;
            }
        }

        if (roomId && room) {
            if (room.turn !== socket.clientId) return;

            const friendlyCoord = `${String.fromCharCode(65 + c)}${r + 1}`;
            const attacker = room.players.find(p => p.clientId === socket.clientId);
            const opponent = room.players.find(p => p.clientId !== socket.clientId);
            if (!opponent) return;

            const coordKey = `${r}-${c}`;
            if (opponent.shotsReceived && opponent.shotsReceived.has(coordKey)) return;

            if (opponent.shotsReceived) opponent.shotsReceived.add(coordKey);
            if (attacker) attacker.stats.shots++;

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

            if (attacker) {
                if (result === 'hit') {
                    attacker.stats.hits++;
                    attacker.stats.score += 20;
                } else {
                    attacker.stats.misses++;
                }
            }

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
                    if (attacker) attacker.stats.score += 50;
                }
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

            let isWin = false;
            if ((result === 'hit' || result === 'sunk') && opponent.fleet && opponent.shotsReceived) {
                const shipsStatus = opponent.fleet.map(ship => {
                    let shipHits = 0;
                    for (let i = 0; i < ship.size; i++) {
                        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
                        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
                        if (opponent.shotsReceived.has(`${sr}-${sc}`)) shipHits++;
                    }
                    return { name: ship.name, sunk: shipHits === ship.size };
                });

                if (shipsStatus.every(s => s.sunk)) {
                    isWin = true;
                    if (attacker) attacker.stats.score += 200;
                    io.to(socket.id).emit('player_victory'); 
                    io.to(opponent.socketId).emit('player_defeat'); 

                    io.to(roomId).emit('new_log', {
                        msg: `GAME OVER! ${socket.playerName} is the winner!`,
                        result: 'VICTORY',
                        type: 'sys'
                    });
                }
            }

            if (!isWin) {
                if (result === 'miss') {
                    room.turn = opponent.clientId;
                    io.to(roomId).emit('turn_change', { turn: opponent.clientId });
                } else {
                    io.to(roomId).emit('turn_change', { turn: socket.clientId });
                }
            }
        }
    });

    socket.on('fleet_ready', (fleet) => {
        let roomId = null;
        let room = null;
        for (const [id, r] of rooms.entries()) {
            if (r.players.some(p => p.socketId === socket.id)) {
                roomId = id;
                room = r;
                break;
            }
        }

        if (roomId && room) {
            const player = room.players.find(p => p.clientId === socket.clientId);
            if (player) {
                player.ready = true;
                player.fleet = fleet || [];
                player.shotsReceived = new Set();
            }
            socket.to(roomId).emit('opponent_fleet_ready');
            if (room.players.length === 2 && room.players.every(p => p.ready)) {
                startGame(io, roomId);
            }
        }
    });

    socket.on('player_unready', () => {
        let roomId = null;
        let room = null;
        for (const [id, r] of rooms.entries()) {
            if (r.players.some(p => p.socketId === socket.id)) {
                roomId = id;
                room = r;
                break;
            }
        }
        if (roomId && room) {
            const player = room.players.find(p => p.clientId === socket.clientId);
            if (player) player.ready = false;
            socket.to(roomId).emit('opponent_unready');
        }
    });

    socket.on('rematch_request', () => {
        let roomId = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.clientId === socket.clientId)) {
                roomId = id;
                break;
            }
        }
        if (roomId) socket.to(roomId).emit('rematch_requested', { from: socket.playerName || socket.id });
    });

    socket.on('rematch_accept', () => {
        let roomId = null;
        let room = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.clientId === socket.clientId)) {
                roomId = id;
                room = rm;
                break;
            }
        }
        if (roomId && room) {
            room.players.forEach(p => {
                p.ready = false;
                p.roomReady = false;
            });
            io.to(roomId).emit('rematch_started');
        }
    });

    socket.on('player_room_ready', (data) => {
        const { ready } = data;
        let room = null;
        let roomId = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.socketId === socket.id)) {
                room = rm;
                roomId = id;
                break;
            }
        }
        if (room) {
            const player = room.players.find(p => p.socketId === socket.id);
            if (player) {
                player.roomReady = ready;
                io.to(roomId).emit('room_ready_update', { playerId: socket.id, ready });
            }
        }
    });

    socket.on('room_start_match', () => {
        let room = null;
        let roomId = null;
        for (const [id, rm] of rooms.entries()) {
            if (rm.players.some(p => p.socketId === socket.id)) {
                room = rm;
                roomId = id;
                break;
            }
        }
        if (room && room.players.length === 2 && room.players.every(p => p.roomReady)) {
            room.state = 'IN_GAME'; // Mark as in-game (placement + battle)
            console.log(`[LOBBY] ${socket.playerName} started match in ${roomId}`);
            io.to(roomId).emit('match_start_init');
        }
    });
};

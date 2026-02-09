const { waitingPlayers, rooms } = require('./state');
const { GamePhase } = require('./constants');

function getRoomsList() {
    const list = [];
    // Thêm người chơi đang chờ vào phòng "Mở"
    waitingPlayers.forEach(p => {
        list.push({
            id: p.socketId,
            name: `${p.name || 'Unknown'}`,
            captains: '1/2',
            status: 'WAITING',
            statusColor: 'bg-amber-400',
            mode: p.waitingMode || 'classic'
        });
    });
    // Thêm các trận đấu đang diễn ra
    rooms.forEach((room, roomId) => {
        const p1 = room.players[0]?.name || 'Unknown';
        const p2 = room.players[1]?.name || 'Waiting...';
        
        if (room.isPvE) {
            list.push({
                id: roomId,
                name: `${p1} (Training vs AI)`,
                captains: '1/1',
                status: 'TRAINING',
                statusColor: 'bg-indigo-500',
                mode: room.mode || 'classic',
                isPvE: true
            });
            return;
        }

        let status = 'WAITING';
        let statusColor = 'bg-amber-400';
        
        if (room.players.length === 1) {
            status = 'WAITING';
            statusColor = 'bg-amber-400';
        } else if (room.players.length === 2) {
            if (room.phase === GamePhase.BATTLE) {
                status = 'BATTLE';
                statusColor = 'bg-red-500';
            } else if (room.phase === GamePhase.PLACING) {
                status = 'PLACING';
                statusColor = 'bg-blue-400';
            } else {
                status = 'LOBBY';
                statusColor = 'bg-emerald-500';
            }
        }

        list.push({
            id: roomId,
            name: room.players.length === 1 ? p1 : `${p1} vs ${p2}`,
            captains: `${room.players.length}/2`,
            status: status,
            statusColor: statusColor,
            mode: room.mode || 'classic',
            isPvE: false
        });
    });

    // Sort: PvP First, PvE Last
    return list.sort((a, b) => {
        if (a.isPvE && !b.isPvE) return 1;
        if (!a.isPvE && b.isPvE) return -1;
        return 0;
    });
}

function sendSystemLog(io, roomId, msg) {
    io.to(roomId).emit('new_log', {
        msg,
        result: 'SYSTEM',
        type: 'sys'
    });
}

module.exports = {
    getRoomsList,
    sendSystemLog
};

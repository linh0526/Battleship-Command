const { waitingPlayers, rooms, activePve } = require('./state');

function getRoomsList() {
    const list = [];
    // Thêm người chơi đang chờ vào phòng "Mở"
    waitingPlayers.forEach(p => {
        list.push({
            id: p.id,
            name: `Mission: ${p.playerName || 'Unknown'}`,
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
        
        let status = 'WAITING';
        let statusColor = 'bg-amber-400';
        
        if (room.players.length === 1) {
            status = 'WAITING';
            statusColor = 'bg-amber-400';
        } else if (room.players.length === 2) {
            const allReady = room.players.every(p => p.ready);
            const allRoomReady = room.players.every(p => p.roomReady);
            if (allReady) {
                status = 'BATTLE';
                statusColor = 'bg-red-500';
            } else if (room.players.length === 2 && !allRoomReady) {
                status = 'LOBBY';
                statusColor = 'bg-emerald-500';
            } else {
                status = 'PLACING';
                statusColor = 'bg-blue-400';
            }
        }

        list.push({
            id: roomId,
            name: room.players.length === 1 ? p1 : `${p1} vs ${p2}`,
            captains: `${room.players.length}/2`,
            status: status,
            statusColor: statusColor,
            mode: room.mode || 'classic',
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

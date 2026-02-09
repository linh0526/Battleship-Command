const { rooms, activePve } = require('./state');
const { GamePhase } = require('./constants');

function getRoomsList() {
    const list = [];

    // 1. ROOMS: Active PvP Rooms (Open Room Model)
    rooms.forEach((room, roomId) => {
        // Chỉ đếm players đang connected
        const activePlayers = room.players.filter(p => p.status !== 'disconnected');
        const p1 = activePlayers[0]?.name || 'Unknown';
        const p2 = activePlayers[1]?.name || 'Waiting...';
        
        let status = 'WAITING';
        let statusColor = 'bg-amber-400';
        
        // Logic status dựa vào phase và số người
        if (activePlayers.length < 2) {
            status = 'WAITING';
            statusColor = 'bg-amber-400'; // Đang chờ người join
        } else {
            // Full room (2 active players)
            if (room.phase === GamePhase.PLAYING) {
                status = 'PLAYING';
                statusColor = 'bg-red-500';
            } else if (room.phase === GamePhase.PLACING) {
                status = 'PLACING';
                statusColor = 'bg-blue-400';
            } else if (room.phase === GamePhase.WAITING) {
                status = 'READY'; // Full và đang ở lobby
                statusColor = 'bg-emerald-500';
            }
        }

        list.push({
            id: roomId,
            type: 'ROOM',
            name: activePlayers.length === 1 ? p1 : `${p1} vs ${p2}`,
            captains: `${activePlayers.length}/2`,
            status: status,
            statusColor: statusColor,
            mode: room.mode || 'classic',
            isPvE: false
        });
    });

    // 2. PVE: Active PvE Sessions
    activePve.forEach((room, roomId) => {
        const p1 = room.players[0]?.name || 'Commander';
        list.push({
            id: roomId,
            type: 'ROOM',
            name: `${p1} (Training vs AI)`,
            captains: '1/1',
            status: 'PVE',
            statusColor: 'bg-indigo-500',
            mode: room.mode || 'classic',
            isPvE: true
        });
    });

    // Sort: WAITING rooms first, then PLAYING, then PVE
    return list.sort((a, b) => {
        // PvE last
        if (a.isPvE && !b.isPvE) return 1;
        if (!a.isPvE && b.isPvE) return -1;

        // WAITING rooms first (joinable)
        if (a.status === 'WAITING' && b.status !== 'WAITING') return -1;
        if (a.status !== 'WAITING' && b.status === 'WAITING') return 1;

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

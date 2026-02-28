const rooms = new Map(); // PvP rooms only
const activePve = new Map(); // PvE sessions
const globalChat = [];
const userSockets = new Map(); // userId -> socketId

module.exports = {
    rooms,
    activePve,
    globalChat,
    userSockets
};

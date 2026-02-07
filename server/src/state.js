// server/src/state.js
const rooms = new Map();
const waitingPlayers = [];
const activePve = new Map();

module.exports = {
    rooms,
    waitingPlayers,
    activePve
};

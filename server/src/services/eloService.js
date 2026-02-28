/**
 * Simplified Point System Logic
 * Win: +1
 * Loss: -1
 * Draw: 0
 */

/**
 * Calculate Score change
 * @param {number} ratingA Current score of player A
 * @param {number} ratingB Current score of opponent B
 * @param {number} score Actual score (1=win, 0.5=draw, 0=loss)
 * @returns {number} The change (e.g., +1 or -1)
 */
function calculateEloChange(ratingA, ratingB, score) {
    if (score === 1) return 1;
    if (score === 0) return -1;
    return 0; // Draw
}

/**
 * Military Rank Logic based on Matches
 */
const RANK_THRESHOLDS = [
    { min: 1800, title: 'Đô đốc' },
    { min: 1401, title: 'Đại tướng' },
    { min: 1101, title: 'Trung tướng' },
    { min: 851, title: 'Thiếu tướng' },
    { min: 651, title: 'Đại tá' },
    { min: 501, title: 'Thượng tá' },
    { min: 401, title: 'Trung tá' },
    { min: 311, title: 'Thiếu tá' },
    { min: 231, title: 'Đại úy' },
    { min: 161, title: 'Trung úy' },
    { min: 111, title: 'Thiếu úy' },
    { min: 71, title: 'Thượng sĩ' },
    { min: 41, title: 'Trung sĩ' },
    { min: 21, title: 'Hạ sĩ' },
    { min: 11, title: 'Tân binh III' },
    { min: 6, title: 'Tân binh II' },
    { min: 0, title: 'Tân binh I' }
];

const getRank = (m) => {
    const rank = RANK_THRESHOLDS.find(r => m >= r.min);
    return rank ? rank.title : 'Tân binh I';
};

module.exports = {
    calculateEloChange,
    getRank
};

/**
 * Tính toán sự thay đổi điểm Chiến Lực (Battle Power)
 * Sử dụng thuật toán ELO chuẩn với K-factor mặc định là 32
 * @param {number} ratingA Điểm hiện tại của người chơi A
 * @param {number} ratingB Điểm hiện tại của đối thủ B
 * @param {number} score Kết quả trận đấu (1=thắng, 0.5=hòa, 0=thua)
 * @returns {number} Số điểm thay đổi (ví dụ: +20 hoặc -15)
 */
function calculateEloChange(ratingA, ratingB, score) {
    // Nếu điểm quá thấp (lưới 0), giả định base là 1000 để tính toán công bằng
    const rA = ratingA || 1000;
    const rB = ratingB || 1000;
    
    const K = 32; // K-factor xác định mức độ biến động tối đa
    
    // Tính toán xác suất thắng (Expected Score)
    const expectedScore = 1 / (1 + Math.pow(10, (rB - rA) / 400));
    
    // Tính toán điểm thay đổi
    const change = Math.round(K * (score - expectedScore));
    
    // Đảm bảo thắng ít nhất 10 điểm, thua mất ít nhất 5 điểm (trừ khi hòa)
    if (score === 1 && change < 10) return 10;
    if (score === 0 && change > -5) return -5;
    
    return change;
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

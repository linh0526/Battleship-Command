const ACHIEVEMENTS = [
    // 1. Matches Played
    { id: 'ROOKIE', title: 'Tân binh biển cả', desc: 'Chơi 1 trận', condition: (p) => p.achievements.matchesPlayed >= 1 },
    { id: 'SKIRMISHER', title: 'Làm quen chiến trường', desc: 'Chơi 5 trận', condition: (p) => p.achievements.matchesPlayed >= 5 },
    { id: 'SAILOR', title: 'Thủy thủ chính hiệu', desc: 'Chơi 10 trận', condition: (p) => p.achievements.matchesPlayed >= 10 },
    { id: 'VETERAN', title: 'Lão làng đại dương', desc: 'Chơi 50 trận', condition: (p) => p.achievements.matchesPlayed >= 50 },
    { id: 'LEGEND', title: 'Huyền thoại Battleship', desc: 'Chơi 100 trận', condition: (p) => p.achievements.matchesPlayed >= 100 },

    // 2. Matches Won
    { id: 'FIRST_VICTORY', title: 'Chiến thắng đầu tiên', desc: 'Thắng 1 trận', condition: (p) => p.achievements.matchesWon >= 1 },
    { id: 'CAPTAIN', title: 'Thuyền trưởng', desc: 'Thắng 5 trận', condition: (p) => p.achievements.matchesWon >= 5 },
    { id: 'ADMIRAL', title: 'Đô đốc', desc: 'Thắng 10 trận', condition: (p) => p.achievements.matchesWon >= 10 },
    { id: 'INVINCIBLE', title: 'Bất khả chiến bại', desc: 'Thắng 25 trận', condition: (p) => p.achievements.matchesWon >= 25 },
    { id: 'SEA_RULER', title: 'Thống trị đại dương', desc: 'Thắng 50 trận', condition: (p) => p.achievements.matchesWon >= 50 },

    // 3. Total Shots
    { id: 'OPEN_FIRE', title: 'Khai hỏa', desc: 'Bắn 10 phát', condition: (p) => p.achievements.totalShots >= 10 },
    { id: 'GUNNER_TRAINEE', title: 'Xạ thủ tập sự', desc: 'Bắn 50 phát', condition: (p) => p.achievements.totalShots >= 50 },
    { id: 'CANNONEER', title: 'Pháo thủ', desc: 'Bắn 100 phát', condition: (p) => p.achievements.totalShots >= 100 },
    { id: 'RAIN_OF_FIRE', title: 'Mưa đạn', desc: 'Bắn 500 phát', condition: (p) => p.achievements.totalShots >= 500 },
    { id: 'FIRESTORM', title: 'Bão lửa', desc: 'Bắn 1000 phát', condition: (p) => p.achievements.totalShots >= 1000 },

    // 4. Hit Shots
    { id: 'FIRST_HIT', title: 'Trúng rồi', desc: 'Trúng 1 phát', condition: (p) => p.achievements.hitShots >= 1 },
    { id: 'SHARP_NOSE', title: 'Đánh hơi tốt', desc: 'Trúng 10 phát', condition: (p) => p.achievements.hitShots >= 10 },
    { id: 'SEA_ASSASSIN', title: 'Sát thủ biển khơi', desc: 'Trúng 50 phát', condition: (p) => p.achievements.hitShots >= 50 },
    { id: 'LIVING_RADAR', title: 'Máy quét sống', desc: 'Trúng 200 phát', condition: (p) => p.achievements.hitShots >= 200 },

    // 5. Ships Destroyed
    { id: 'SINKER', title: 'Chìm rồi', desc: 'Đánh chìm 1 tàu', condition: (p) => p.achievements.shipsDestroyed >= 1 },
    { id: 'SHIP_HUNTER', title: 'Kẻ săn tàu', desc: 'Đánh chìm 5 tàu', condition: (p) => p.achievements.shipsDestroyed >= 5 },
    { id: 'DESTROYER', title: 'Kẻ hủy diệt', desc: 'Đánh chìm 20 tàu', condition: (p) => p.achievements.shipsDestroyed >= 20 },
    { id: 'SEA_NIGHTMARE', title: 'Ác mộng đại dương', desc: 'Đánh chìm 50 tàu', condition: (p) => p.achievements.shipsDestroyed >= 50 },

    // 6. Win Streak
    { id: 'WIN_STREAK_3', title: 'Chuỗi chiến thắng', desc: 'Thắng liên tiếp 3 trận', condition: (p) => p.achievements.winStreak >= 3 },
    { id: 'WIN_STREAK_5', title: 'Không thể cản phá', desc: 'Thắng liên tiếp 5 trận', condition: (p) => p.achievements.winStreak >= 5 },
    { id: 'WAR_GOD', title: 'Thần chiến tranh', desc: 'Thắng liên tiếp 10 trận', condition: (p) => p.achievements.winStreak >= 10 },

    // 7. Special / Fun
    { id: 'SALTY', title: 'Cay cú', desc: 'Thua 5 trận liên tiếp', condition: (p) => p.achievements.lossStreak >= 5 },
];

/**
 * Check and unlock achievements
 * @param {Object} profile - User profile document
 * @param {Object} matchData - Data from the completed match
 * @returns {Array} - List of newly unlocked achievements
 */
function checkAchievements(profile, matchData) {
    const newUnlocks = [];

    // Pre-calculation for special achievements that rely on single match data
    // GUESSING_MASTER: Win with accuracy < 30%
    if (matchData.result === 'win' && matchData.accuracy < 30 && !profile.achievements.unlocked.includes('GUESSING_MASTER')) {
        newUnlocks.push({ id: 'GUESSING_MASTER', title: 'Cao thủ đoán mò', desc: 'Thắng trận khi độ chính xác < 30%' });
        profile.achievements.unlocked.push('GUESSING_MASTER');
    }

    // BLITZKRIEG: Win in under 20 shots
    if (matchData.result === 'win' && matchData.shots.total < 20 && !profile.achievements.unlocked.includes('BLITZKRIEG')) {
         newUnlocks.push({ id: 'BLITZKRIEG', title: 'Đánh nhanh thắng gọn', desc: 'Thắng trong dưới 20 lượt bắn' });
         profile.achievements.unlocked.push('BLITZKRIEG');
    }

    // Standard Accumulation Checks
    ACHIEVEMENTS.forEach(ach => {
        if (!profile.achievements.unlocked.includes(ach.id)) {
            if (ach.condition(profile)) {
                profile.achievements.unlocked.push(ach.id);
                newUnlocks.push(ach);
            }
        }
    });

    return newUnlocks;
}

module.exports = {
    ACHIEVEMENTS,
    checkAchievements
};

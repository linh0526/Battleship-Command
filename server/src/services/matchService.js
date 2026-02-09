const MatchHistory = require('../models/MatchHistory');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Lưu match history và cập nhật profile stats
 * QUAN TRỌNG: Chỉ gọi SAU KHI trận đấu kết thúc hợp lệ
 */
async function saveMatchAndUpdateProfiles(matchData) {
    const { 
        roomId, 
        players, // [{ userId, name, shots: { total, hit }, result }]
        mode, // 'PvP' or 'PvE'
        duration,
        endReason 
    } = matchData;

    // RULE: Không lưu nếu trận đấu quá ngắn (disconnect sớm)
    if (endReason === 'OPPONENT_LEFT' && duration < 30) {
        console.log(`[MATCH] Skipping save - match too short (${duration}s)`);
        return;
    }

    try {
        // 1. LƯU MATCH HISTORY cho từng player
        const matchPromises = players.map(async (player) => {
            const opponent = players.find(p => p.userId !== player.userId);
            
            const match = new MatchHistory({
                roomId,
                userId: player.userId,
                opponentId: opponent?.userId || null,
                opponentName: opponent?.name || 'AI',
                result: player.result, // 'win', 'loss', 'draw'
                mode,
                shots: {
                    player: {
                        total: player.shots.total,
                        hit: player.shots.hit
                    },
                    opponent: {
                        total: opponent?.shots.total || 0,
                        hit: opponent?.shots.hit || 0
                    }
                },
                duration,
                endReason,
                endedAt: new Date()
            });

            return match.save();
        });

        await Promise.all(matchPromises);
        console.log(`[MATCH] Saved match history for room ${roomId}`);

        // 2. CẬP NHẬT PROFILE STATS (chỉ cho user đã đăng ký)
        const profilePromises = players.map(async (player) => {
            if (!player.userId) return; // Skip guest players

            await updatePlayerProfile(player, mode);
        });

        await Promise.all(profilePromises);
        console.log(`[MATCH] Updated player profiles`);

    } catch (error) {
        console.error('[MATCH] Error saving match:', error);
        throw error;
    }
}

/**
 * Cập nhật profile stats SAU KHI lưu match
 */
async function updatePlayerProfile(playerData, mode) {
    const { userId, shots, result } = playerData;

    try {
        // Tìm hoặc tạo profile
        let profile = await Profile.findOne({ userId });
        
        if (!profile) {
            profile = new Profile({ 
                userId,
                stats: {
                    pvp: { matches: 0, wins: 0, losses: 0, draws: 0, shots: { total: 0, hit: 0 }, accuracy: 0, avgShotsPerMatch: 0 },
                    pve: { matches: 0, wins: 0, losses: 0, shots: { total: 0, hit: 0 }, accuracy: 0, avgShotsPerMatch: 0 }
                }
            });
        }

        // Chọn stats category (pvp hoặc pve)
        const statsKey = mode === 'PvP' ? 'pvp' : 'pve';
        const stats = profile.stats[statsKey];

        // Cập nhật matches
        stats.matches += 1;

        // Cập nhật win/loss/draw
        if (result === 'win') stats.wins += 1;
        else if (result === 'loss') stats.losses += 1;
        else if (result === 'draw') stats.draws += 1;

        // Cập nhật shots
        stats.shots.total += shots.total;
        stats.shots.hit += shots.hit;

        // Tính toán accuracy (cached)
        stats.accuracy = stats.shots.total > 0 
            ? Math.round((stats.shots.hit / stats.shots.total) * 100) 
            : 0;

        // Tính toán avg shots per match
        stats.avgShotsPerMatch = stats.matches > 0
            ? Math.round(stats.shots.total / stats.matches)
            : 0;

        profile.updatedAt = new Date();
        await profile.save();

        console.log(`[PROFILE] Updated ${userId} - ${mode} stats`);
    } catch (error) {
        console.error('[PROFILE] Error updating profile:', error);
        throw error;
    }
}

/**
 * Lấy stats từ room khi game kết thúc
 */
function extractMatchDataFromRoom(room, winnerClientId, endReason) {
    const players = room.players.map(player => {
        const isWinner = player.clientId === winnerClientId;
        
        return {
            userId: player.userId || null, // Có thể null nếu là guest
            name: player.name,
            shots: {
                total: player.stats.shots,
                hit: player.stats.hits
            },
            result: isWinner ? 'win' : 'loss'
        };
    });

    const duration = Math.floor((Date.now() - room.createdAt) / 1000);

    return {
        roomId: room.id,
        players,
        mode: room.isPvE ? 'PvE' : 'PvP',
        duration,
        endReason
    };
}

module.exports = {
    saveMatchAndUpdateProfiles,
    extractMatchDataFromRoom
};

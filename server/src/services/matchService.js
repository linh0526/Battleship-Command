const MatchHistory = require('../models/MatchHistory');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { checkAchievements } = require('./achievementService');

/**
 * Lưu match history và cập nhật profile stats
 * QUAN TRỌNG: Chỉ gọi SAU KHI trận đấu kết thúc hợp lệ
 */
async function saveMatchAndUpdateProfiles(matchData) {
    const { 
        roomId, 
        players, 
        mode, 
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
                result: player.result,
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

            await updatePlayerProfile(player, mode, duration);
        });

        await Promise.all(profilePromises);
        console.log(`[MATCH] Updated player profiles`);

    } catch (error) {
        console.error('[MATCH] Error saving match:', error);
        throw error;
    }
}

async function updatePlayerProfile(playerData, mode, duration) {
    const { userId, shots, result, shipsSunk } = playerData;

    try {
        // Tìm hoặc tạo profile
        let profile = await Profile.findOne({ userId });
        
        if (!profile) {
            profile = new Profile({ 
                userId,
                stats: {
                    pvp: { matches: 0, wins: 0, losses: 0, draws: 0, shots: { total: 0, hit: 0 }, accuracy: 0, avgShotsPerMatch: 0 },
                    pve: { matches: 0, wins: 0, losses: 0, shots: { total: 0, hit: 0 }, accuracy: 0, avgShotsPerMatch: 0 }
                },
                achievements: {
                    matchesPlayed: 0, matchesWon: 0, totalShots: 0, hitShots: 0, 
                    shipsDestroyed: 0, winStreak: 0, lossStreak: 0, unlocked: []
                }
            });
        }

        // Chọn stats category (pvp hoặc pve)
        const statsKey = mode === 'PvP' ? 'pvp' : 'pve';
        const stats = profile.stats[statsKey];

        // Cập nhật stats cơ bản
        stats.matches += 1;
        if (result === 'win') stats.wins += 1;
        else if (result === 'loss') stats.losses += 1;
        else if (result === 'draw') stats.draws += 1;

        stats.shots.total += shots.total;
        stats.shots.hit += shots.hit;

        stats.accuracy = stats.shots.total > 0 
            ? Math.round((stats.shots.hit / stats.shots.total) * 100) 
            : 0;

        stats.avgShotsPerMatch = stats.matches > 0
            ? Math.round(stats.shots.total / stats.matches)
            : 0;

        // Cập nhật Achievements Stats
        if (!profile.achievements) {
             profile.achievements = {
                matchesPlayed: 0, matchesWon: 0, totalShots: 0, hitShots: 0, 
                shipsDestroyed: 0, winStreak: 0, lossStreak: 0, unlocked: []
            };
        }
        
        profile.achievements.matchesPlayed += 1;
        if (result === 'win') {
            profile.achievements.matchesWon += 1;
            profile.achievements.winStreak += 1;
            profile.achievements.lossStreak = 0;
        } else if (result === 'loss') {
            profile.achievements.lossStreak += 1;
            profile.achievements.winStreak = 0;
        }
        
        profile.achievements.totalShots += shots.total;
        profile.achievements.hitShots += shots.hit;
        profile.achievements.shipsDestroyed += (shipsSunk || 0);

        // Check Unlock Achievements
        const matchDataForAch = {
            result,
            shots,
            accuracy: shots.total > 0 ? (shots.hit / shots.total) * 100 : 0,
            shipsSunk: shipsSunk || 0,
            duration
        };
        
        const newUnlocks = checkAchievements(profile, matchDataForAch);
        if (newUnlocks.length > 0) {
            console.log(`[ACHIEVEMENT] Unlocked ${newUnlocks.length} badges for ${userId}`);
        }

        profile.updatedAt = new Date();
        await profile.save();

        console.log(`[PROFILE] Updated ${userId} - ${mode} stats`);
    } catch (error) {
        console.error('[PROFILE] Error updating profile:', error);
        throw error;
    }
}

function extractMatchDataFromRoom(room, winnerClientId, endReason) {
    const players = room.players.map(player => {
        const isWinner = player.clientId === winnerClientId;
        
        return {
            userId: player.userId || null,
            name: player.name,
            shots: {
                total: player.stats.shots,
                hit: player.stats.hits
            },
            shipsSunk: player.stats.shipsSunk || 0,
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

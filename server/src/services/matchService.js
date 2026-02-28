const MatchHistory = require('../models/MatchHistory');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { checkAchievements } = require('./achievementService');
const { calculateEloChange } = require('./eloService');

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

    console.log(`[MATCH] Processing: room=${roomId}, ranked=${matchData.isRanked}, mode=${mode}`);

    try {
        const registreredPlayers = players.filter(p => p.userId);
        
        // 1. SAVE MATCH HISTORY
        const matchPromises = registreredPlayers.map(async (player) => {
            const opponent = players.find(p => p !== player);
            const match = new MatchHistory({
                roomId,
                userId: player.userId,
                opponentId: opponent?.userId || null,
                opponentName: opponent?.name || (mode === 'PvE' ? 'Ghost AI' : 'Guest'),
                result: player.result,
                mode,
                isRanked: matchData.isRanked || false,
                shots: {
                    player: { total: player.shots.total, hit: player.shots.hit },
                    opponent: { total: opponent?.shots.total || 0, hit: opponent?.shots.hit || 0 }
                },
                duration,
                endReason,
                endedAt: new Date()
            });
            return match.save();
        });

        await Promise.all(matchPromises);

        // 2. CALCULATE ELO FOR RANKED PVP
        let eloResults = {}; 
        if (matchData.isRanked && mode === 'PvP' && registreredPlayers.length === 2) {
            const playerA = registreredPlayers[0];
            const playerB = registreredPlayers[1];

            let profileA = await Profile.findOne({ userId: playerA.userId });
            let profileB = await Profile.findOne({ userId: playerB.userId });

            if (profileA && profileB) {
                const ratingA = profileA.stats.pvp.elo || 0;
                const ratingB = profileB.stats.pvp.elo || 0;

                const scoreA = playerA.result === 'win' ? 1 : (playerA.result === 'draw' ? 0.5 : 0);
                const scoreB = playerB.result === 'win' ? 1 : (playerB.result === 'draw' ? 0.5 : 0);

                const changeA = calculateEloChange(ratingA, ratingB, scoreA);
                const changeB = calculateEloChange(ratingB, ratingA, scoreB);

                eloResults[playerA.userId] = changeA;
                eloResults[playerB.userId] = changeB;

                console.log(`[ELO] ${playerA.name}: ${ratingA} -> ${ratingA + changeA} (${changeA > 0 ? '+' : ''}${changeA})`);
                console.log(`[ELO] ${playerB.name}: ${ratingB} -> ${ratingB + changeB} (${changeB > 0 ? '+' : ''}${changeB})`);
            }
        }

        // 3. UPDATE PROFILES
        const profilePromises = players.map(async (player) => {
            if (!player.userId) return; 
            if (matchData.isRanked || mode === 'PvE') {
                const eloChange = eloResults[player.userId] || 0;
                await updatePlayerProfile(player, mode, duration, eloChange);
            }
        });

        await Promise.all(profilePromises);
        
        // Return elo changes for front-end push
        return { eloChanges: eloResults };

    } catch (error) {
        console.error('[MATCH] Error saving match:', error);
        throw error;
    }
}

async function updatePlayerProfile(playerData, mode, duration, eloChange = 0) {
    const { userId, shots, result, shipsSunk } = playerData;

    try {
        // Tìm hoặc tạo profile
        let profile = await Profile.findOne({ userId });
        
        if (!profile) {
            profile = new Profile({ 
                userId,
                stats: {
                    pvp: { matches: 0, wins: 0, losses: 0, draws: 0, shots: { total: 0, hit: 0 }, accuracy: 0, elo: 0, avgShotsPerMatch: 0 },
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

        if (statsKey === 'pvp') {
            stats.elo = (stats.elo || 0) + eloChange;
        }

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
        
        // Cần markModified để Mongoose nhận diện thay đổi trong Object lồng nhau
        profile.markModified('stats');
        profile.markModified('achievements');
        
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
        isRanked: room.isRanked || false,
        duration,
        endReason
    };
}

module.exports = {
    saveMatchAndUpdateProfiles,
    extractMatchDataFromRoom
};

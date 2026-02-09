"use client";

import { useState, useEffect, useCallback } from 'react';
import { Target } from 'lucide-react';
import { useRouter, useSearchParams, notFound, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { useGame, ShipInstance, GamePhase } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';
import GlobalLoading from '@/components/layout/GlobalLoading';
import { useSettings } from '@/context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

import BattleGrid from '@/components/battle/BattleGrid';
import BattleHeader from '@/components/battle/BattleHeader';
import BattleModals from '@/components/battle/BattleModals';
import FleetStatusPanel from '@/components/battle/FleetStatusPanel';
import BattleStatusPanel from '@/components/battle/BattleStatusPanel';
import BattleFooter from '@/components/battle/BattleFooter';

export function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');
  const { t } = useLanguage();
  const { 
    emitMove, emitRematchRequest, 
    emitRematchAccept, onRematchRequested, onRematchAccepted, 
    socket, leaveRoom, endPve, clientId: myClientId, joinRandomRoom
  } = useSocket();
  const { 
    gameState, addLog, setTurn, resetGame, prepareRematch, addScore, setRoomId, setGameStatus
  } = useGame();
  const { 
    battleLayout, enableSound, enableVibration, healthBarStyle
  } = useSettings();
  const [showOpponentLeftModal, setShowOpponentLeftModal] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  // Track shots
  const [playerShots, setPlayerShots] = useState<Map<string, 'hit' | 'miss' | 'sunk'>>(new Map());
  const [enemyShots, setEnemyShots] = useState<Map<string, 'hit' | 'miss' | 'sunk'>>(new Map());
  const [aiFleet, setAiFleet] = useState<ShipInstance[]>([]);
  const [revealedEnemyShips, setRevealedEnemyShips] = useState<ShipInstance[]>([]); // Sunk ships revealed by server

  const [showTurnNotify, setShowTurnNotify] = useState(false);
  const [hasShownInitialNotify, setHasShownInitialNotify] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [turnTimer, setTurnTimer] = useState(30);
  const [rematchTimer, setRematchTimer] = useState(10);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
  const [aiShotNonce, setAiShotNonce] = useState(0);
  const [impactEffect, setImpactEffect] = useState<'hit' | 'enemy-hit' | null>(null);

  const triggerImpact = useCallback((type: 'hit' | 'enemy-hit') => {
    if (!enableVibration) return;
    setImpactEffect(type);
    setTimeout(() => setImpactEffect(null), 500);
  }, [enableVibration]);

  // Listen for opponent leaving
  useEffect(() => {
    const handleOpponentLeft = () => {
      console.warn('[BATTLE] Opponent left/disconnected');
      // Always show modal if we are in battle stage
      if (gameState.gameStatus === GamePhase.PLAYING || gameState.gameStatus === GamePhase.PLACING) {
        setGameStatus(GamePhase.ENDED);
        setGameResult('win'); // They left, you win!
        setShowAbortModal(false);
        setShowOpponentLeftModal(true);
        addLog({ msg: t('log_opponent_disconnected'), result: t('log_victory_by_default'), type: 'sys' });
      }
    };
    
    if (socket) {
      socket.on('opponent_left', handleOpponentLeft);
      // Also listen to match_ended specifically
      socket.on('match_ended', (data) => {
        if (data.reason === 'opponent_left') {
          handleOpponentLeft();
        }
      });

      return () => {
        socket.off('opponent_left', handleOpponentLeft);
        socket.off('match_ended');
      };
    }
  }, [socket, gameState.gameStatus, addLog, t]);

  // Notify server on tab close
  useEffect(() => {
    const handleUnload = () => {
      leaveRoom();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [leaveRoom]);

  // We handle endPve explicitly via Abort or Return to Base buttons
  // to avoid clearing the session during transitions.

  // Auto-fire timer logic
  useEffect(() => {
    if (gameResult || gameState.gameStatus === GamePhase.WAITING || !gameState.currentTurn) return;

    if (turnTimer === 0) {
      if (gameState.currentTurn === 'player') {
          // Auto-fire random cell
          let r, c, key;
          do {
            r = Math.floor(Math.random() * 10);
            c = Math.floor(Math.random() * 10);
            key = `${r}-${c}`;
          } while (playerShots.has(key));
          
          addLog({ msg: t('log_auto_fire'), result: t('log_strike_authorized'), type: 'sys' });
          handleEnemyCellClick(r, c);
          setTurnTimer(30);
      }
      return;
    }

    const interval = setInterval(() => {
      setTurnTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.currentTurn, turnTimer, gameResult]);

  // Reset timer and show notification when turn changes
  useEffect(() => {
    if (gameState.currentTurn && gameState.gameStatus === GamePhase.PLAYING) {
      setTurnTimer(30);
      
      // Only show turn notification for PvP
      if (gameState.gameMode !== 'PvE') {
        const timer = setTimeout(() => {
          setShowTurnNotify(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.currentTurn, gameState.gameStatus, gameState.gameMode]);

  // Stats calculation


  // Check for Game End
  useEffect(() => {
    if (gameResult) return;

    const checkWin = (ships: ShipInstance[], shots: Map<string, string>) => {
      if (ships.length === 0) return false;
      return ships.every(ship => {
        let shipHits = 0;
        for (let i = 0; i < ship.size; i++) {
          const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
          const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
          const shot = shots.get(`${sr}-${sc}`);
          if (shot === 'hit' || shot === 'sunk') shipHits++;
        }
        return shipHits === ship.size;
      });
    };

    if (gameState.gameMode === 'PvE' && aiFleet.length > 0 && checkWin(aiFleet, playerShots)) {
      setGameResult('win');
      addScore('player', 1);
      addLog({ msg: t('log_victory'), result: t('log_mission_complete'), type: 'sys' });
    } else if (gameState.gameMode === 'PvE' && gameState.playerFleet.length > 0 && checkWin(gameState.playerFleet, enemyShots)) {
      setGameResult('loss');
      addScore('opponent', 1);
      addLog({ msg: t('log_retreat'), result: t('log_mission_failed'), type: 'sys' });
    }
  }, [playerShots, enemyShots, aiFleet, gameState.playerFleet, gameResult, addLog, gameState.gameMode, addScore]);

  // Turn Notification Trigger
  useEffect(() => {
    if (gameState.currentTurn && !hasShownInitialNotify) {
      setHasShownInitialNotify(true);
      setShowTurnNotify(true);
    }
  }, [gameState.currentTurn, hasShownInitialNotify]);

  // Turn Notification Auto-hide logic
  useEffect(() => {
    if (showTurnNotify) {
      const timer = setTimeout(() => setShowTurnNotify(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTurnNotify]);

  // Handle Server-Authoritative Events
  useEffect(() => {
    if (socket && gameState.gameMode === 'PvP') {
      const handleShotProcessed = (data: { attackerId: string, r: number, c: number, result: 'hit' | 'miss' | 'sunk', sunkShip?: ShipInstance }) => {
        const { attackerId, r, c, result, sunkShip } = data;
        const key = `${r}-${c}`;
        const isMyShot = attackerId === myClientId;

        if (isMyShot) {
            // My shot feedback
            setPlayerShots(prev => {
                 const newShots = new Map(prev);
                 if (result === 'sunk' && sunkShip) {
                     for (let i = 0; i < sunkShip.size; i++) {
                        const sr = sunkShip.orientation === 'horizontal' ? sunkShip.row : sunkShip.row + i;
                        const sc = sunkShip.orientation === 'horizontal' ? sunkShip.col + i : sunkShip.col;
                        newShots.set(`${sr}-${sc}`, 'sunk');
                     }
                 } else {
                     newShots.set(key, result);
                 }
                 return newShots;
            });
            
            if (result === 'hit' || result === 'sunk') {
                 if (enableSound) {
                    const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3');
                    audio.play().catch(() => {});
                 }
                 
                 if (result === 'sunk' && sunkShip) {
                     setRevealedEnemyShips(prev => [...prev, sunkShip]);
                     addLog({ msg: t('log_confirmed_kill'), result: t('log_target_neutralized'), type: 'hit' });
                 }
                 triggerImpact('hit');
            } else {
                 if (enableSound) new Audio('/shot-miss.mp3').play().catch(() => {});
            }

        } else {
            // Opponent's shot (Incoming Attack)
            setEnemyShots(prev => {
                const newShots = new Map(prev);
                newShots.set(key, result);
                return newShots;
            });

            if (result === 'hit' || result === 'sunk') {
                 if (enableSound) {
                    const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3'); 
                    audio.play().catch(() => {});
                 }
                 
                 if (result === 'sunk') {
                     addLog({ msg: t('log_warning_sunk', { name: sunkShip?.name || t('opponent') }), result: t('log_critical_damage'), type: 'enemy-hit' });
                 }
                 triggerImpact('enemy-hit');
            } else {
                 if (enableSound) new Audio('/shot-miss.mp3').play().catch(() => {});
            }
        }
      };

      const handleTurnChange = (data: { turn: string }) => {
        setTimeout(() => {
          setTurn(data.turn === myClientId ? 'player' : 'opponent');
          setTurnTimer(30); // Reset timer on turn change
          // Ensure we are in PLAYING phase
          if (gameState.gameStatus !== GamePhase.PLAYING) setGameStatus(GamePhase.PLAYING);
        }, 1500);
      };

      const handleVictory = () => {
        if (gameResult) return;
        setGameResult('win');
        addScore('player', 1);
        addLog({ msg: t('log_victory'), result: t('log_mission_complete'), type: 'sys' });
        if (enableSound) new Audio('/victory.mp3').play().catch(() => {}); 
      };

      const handleDefeat = () => {
        if (gameResult) return;
        setGameResult('loss');
        addScore('opponent', 1);
        addLog({ msg: t('log_defeat'), result: t('log_mission_failed'), type: 'sys' });
      };

      const handleMatchStart = () => {
        // No need for router.push, state update is enough
      };

      socket.on('shot_processed', handleShotProcessed);
      socket.on('turn_change', handleTurnChange);
      socket.on('player_victory', handleVictory);
      socket.on('player_defeat', handleDefeat);
      socket.on('match_start_init', handleMatchStart);
      
      // Auto-ready if we join a room while in waiting state (from Continue Searching)
      const handleRoomJoined = () => {
        if (gameState.gameStatus === GamePhase.WAITING) {
          socket.emit('player_room_ready', { ready: true });
        }
      };
      socket.on('room_joined', handleRoomJoined);
      
      // Handle match termination (handled by the unified opponent_left listener above for most cases)
      // but keeping this for explicit game end reasons if needed later.

      return () => {
        socket.off('shot_processed', handleShotProcessed);
        socket.off('turn_change', handleTurnChange);
        socket.off('player_victory', handleVictory);
        socket.off('player_defeat', handleDefeat);
        socket.off('match_start_init', handleMatchStart);
        socket.off('room_joined', handleRoomJoined);
        socket.off('match_ended');
      };
    }
  }, [socket, gameState.gameMode, addLog, gameResult, addScore, setTurn]);

  // PvP Rematch Handlers
  useEffect(() => {
     if (socket && gameState.gameMode === 'PvP') {
         onRematchRequested(() => {
             setOpponentWantsRematch(true);
         });

         onRematchAccepted(() => {
             prepareRematch();
             
         });

         return () => {
             socket.off('rematch_requested');
             socket.off('rematch_started');
         };
     }
  }, [socket, gameState.gameMode, onRematchRequested, onRematchAccepted, prepareRematch, router]);

  // Initialize AI Fleet for PvE
  useEffect(() => {
    if (gameState.gameMode === 'PvE' && aiFleet.length === 0) {
      const mockAiFleet: ShipInstance[] = [];
      const shipSpecs = [
        { name: 'Carrier', size: 5, color: 'bg-indigo-500' },
        { name: 'Battleship', size: 4, color: 'bg-emerald-500' },
        { name: 'Cruiser', size: 3, color: 'bg-amber-500' },
        { name: 'Submarine', size: 3, color: 'bg-fuchsia-500' },
        { name: 'Destroyer', size: 2, color: 'bg-sky-500' },
      ];

      shipSpecs.forEach((spec, idx) => {
        let placed = false;
        while (!placed) {
          const r = Math.floor(Math.random() * 10);
          const c = Math.floor(Math.random() * 10);
          const orient: 'horizontal' | 'vertical' = Math.random() > 0.5 ? 'horizontal' : 'vertical';
          const cells = [];
          for (let i = 0; i < spec.size; i++) {
            cells.push(orient === 'horizontal' ? { r, c: c + i } : { r: r + i, c });
          }
          const outOfBounds = cells.some(cell => cell.r > 9 || cell.c > 9);
          const overlap = cells.some(cell => 
            mockAiFleet.some(s => {
              for (let j = 0; j < s.size; j++) {
                const sr = s.orientation === 'horizontal' ? s.row : s.row + j;
                const sc = s.orientation === 'horizontal' ? s.col + j : s.col;
                if (sr === cell.r && sc === cell.c) return true;
              }
              return false;
            })
          );
          if (!outOfBounds && !overlap) {
            mockAiFleet.push({
              id: `ai-${idx}`, name: spec.name, size: spec.size, row: r, col: c, orientation: orient,
              icon: '', shipBgColor: spec.color, shipTextColor: 'text-white', shipBorderColor: ''
            });
            placed = true;
          }
        }
      });
      setAiFleet(mockAiFleet);
      setTurn('player');
    }
  }, [gameState.gameMode, aiFleet.length, addLog, setTurn]);

  // Rematch Timer
  useEffect(() => {
    if (gameResult && rematchTimer > 0) {
        const timer = setTimeout(() => setRematchTimer(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [gameResult, rematchTimer]);

  // AI Logic Response
  useEffect(() => {
    if (gameState.gameMode === 'PvP') return; 

    if (gameState.gameMode === 'PvE' && gameState.currentTurn === 'opponent' && !gameResult) {
      const timer = setTimeout(() => {
        handleAiTurn();
      }, 2999); // Reduced initial AI think time
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.gameMode, aiShotNonce, gameResult]);

  const handleAiTurn = () => {
    let r: number, c: number;

    // AI Strategy: Probability Map (Determines the most likely cell to contain a ship)
    const probMap = Array(10).fill(0).map(() => Array(10).fill(0));
    
    // Calculate remaining ships in player's fleet
    const playerFleetStatus = gameState.playerFleet.map(ship => {
      let shipHits = 0;
      for (let i = 0; i < ship.size; i++) {
        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        const shotStatus = enemyShots.get(`${sr}-${sc}`);
        if (shotStatus === 'hit' || shotStatus === 'sunk') {
          shipHits++;
        }
      }
      return { ...ship, isSunk: shipHits === ship.size };
    });

    const remainingShips = playerFleetStatus.filter(s => !s.isSunk);

    // Target Mode weighting: If we have active hits (not sunk), weigh neighbors heavily
    const activeHits: {r: number, c: number}[] = [];
    enemyShots.forEach((val, k) => {
      if (val === 'hit') {
        const [hr, hc] = k.split('-').map(Number);
        activeHits.push({r: hr, c: hc});
      }
    });

    if (activeHits.length > 0) {
      activeHits.forEach(hit => {
        const neighbors = [
          {r: hit.r - 1, c: hit.c}, {r: hit.r + 1, c: hit.c},
          {r: hit.r, c: hit.c - 1}, {r: hit.r, c: hit.c + 1}
        ];
        neighbors.forEach(n => {
          if (n.r >= 0 && n.r <= 9 && n.c >= 0 && n.c <= 9 && !enemyShots.has(`${n.r}-${n.c}`)) {
            probMap[n.r][n.c] += 100; // Prioritize finishing off ships
          }
        });
      });
    }

    // Hunt Mode weighting: Simulate every possible ship placement to build probability map
    remainingShips.forEach(ship => {
      const size = ship.size;
      // Horizontal check
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col <= 10 - size; col++) {
          let possible = true;
          for (let i = 0; i < size; i++) {
            const status = enemyShots.get(`${row}-${col + i}`);
            if (status === 'miss' || status === 'sunk') {
              possible = false;
              break;
            }
          }
          if (possible) {
            for (let i = 0; i < size; i++) probMap[row][col + i]++;
          }
        }
      }
      // Vertical check
      for (let row = 0; row <= 10 - size; row++) {
        for (let col = 0; col < 10; col++) {
          let possible = true;
          for (let i = 0; i < size; i++) {
            const status = enemyShots.get(`${row + i}-${col}`);
            if (status === 'miss' || status === 'sunk') {
              possible = false;
              break;
            }
          }
          if (possible) {
            for (let i = 0; i < size; i++) probMap[row + i][col]++;
          }
        }
      }
    });

    // Selection: Pick from cells with the highest probability value
    let maxVal = -1;
    let candidates: {r: number, c: number}[] = [];
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (!enemyShots.has(`${row}-${col}`)) {
          if (probMap[row][col] > maxVal) {
            maxVal = probMap[row][col];
            candidates = [{r: row, c: col}];
          } else if (probMap[row][col] === maxVal) {
            candidates.push({r: row, c: col});
          }
        }
      }
    }

    // Fallback just in case
    if (candidates.length === 0) {
      do {
        r = Math.floor(Math.random() * 10);
        c = Math.floor(Math.random() * 10);
      } while (enemyShots.has(`${r}-${c}`));
    } else {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      r = target.r;
      c = target.c;
    }
    
    const key = `${r}-${c}`;

    // 2. Check Hit
    const hitShip = gameState.playerFleet.find(s => {
      for (let i = 0; i < s.size; i++) {
        const sr = s.orientation === 'horizontal' ? s.row : s.row + i;
        const sc = s.orientation === 'horizontal' ? s.col + i : s.col;
        if (sr === r && sc === c) return true;
      }
      return false;
    });

    const isHit = !!hitShip;
    let result: 'hit' | 'miss' | 'sunk' = isHit ? 'hit' : 'miss';
    const newShots = new Map(enemyShots);
    
    // 3. Handle Sunk Logic
    if (isHit && hitShip) {
        let hitsOnShip = 0;
        const shipCells: {r: number, c: number}[] = [];
        for (let i = 0; i < hitShip.size; i++) {
           const sr = hitShip.orientation === 'horizontal' ? hitShip.row : hitShip.row + i;
           const sc = hitShip.orientation === 'horizontal' ? hitShip.col + i : hitShip.col;
           shipCells.push({r: sr, c: sc});
           if ((sr === r && sc === c) || enemyShots.get(`${sr}-${sc}`) === 'hit') {
              hitsOnShip++;
           }
        }
        
        if (hitsOnShip === hitShip.size) {
            result = 'sunk';
            shipCells.forEach(cell => {
                newShots.set(`${cell.r}-${cell.c}`, 'sunk');
            });
        } else {
            newShots.set(key, 'hit');
        }
    } else {
        newShots.set(key, 'miss');
    }

    setEnemyShots(newShots);

    // Logs & Effects
    addLog({ 
      msg: t('log_enemy_fired', { pos: `${String.fromCharCode(65 + c)}${r + 1}` }), 
      result: result === 'sunk' ? t('log_warning_sunk', { name: hitShip?.name || 'Target' }) : isHit ? t('log_direct_hit') : t('log_splash_miss'), 
      type: isHit ? 'enemy-hit' : 'miss' 
    });
    
    if (!isHit) {
      if (enableSound) new Audio('/shot-miss.mp3').play().catch(() => {});
      setTimeout(() => setTurn('player'), 100); 
    } else {
      if (enableSound) new Audio('/shot-thaydan.mp3').play().catch(() => {});
      triggerImpact('enemy-hit');
      setTimeout(() => {
        if (!gameResult) setAiShotNonce(prev => prev + 1);
      }, 100); 
    }
  };

  const handleEnemyCellClick = (r: number, c: number) => {
    if (gameState.currentTurn !== 'player') return;
    const key = `${r}-${c}`;
    if (playerShots.has(key)) return;

    if (gameState.gameMode === 'PvP') {
      // PvP: Send move to server
      emitMove(r, c);
      // Optimistically assume 'miss' or just wait? Better wait.
      // For now, let's just wait for feedback.
    } else {
      // PvE: Local logic
      const hitShip = aiFleet.find(s => {
        for (let i = 0; i < s.size; i++) {
          const sr = s.orientation === 'horizontal' ? s.row : s.row + i;
          const sc = s.orientation === 'horizontal' ? s.col + i : s.col;
          if (sr === r && sc === c) return true;
        }
        return false;
      });

      const isHit = !!hitShip;
      let result: 'hit' | 'miss' | 'sunk' = isHit ? 'hit' : 'miss';
      const newShots = new Map(playerShots);
      
      if (isHit && hitShip) {
        // Check if this hit sinks the ship
        let hitsOnShip = 0;
        for (let i = 0; i < hitShip.size; i++) {
          const sr = hitShip.orientation === 'horizontal' ? hitShip.row : hitShip.row + i;
          const sc = hitShip.orientation === 'horizontal' ? hitShip.col + i : hitShip.col;
          if ((sr === r && sc === c) || playerShots.get(`${sr}-${sc}`) === 'hit') {
            hitsOnShip++;
          }
        }

        if (hitsOnShip === hitShip.size) {
            result = 'sunk';
            // Mark all cells of the sunk ship
            for (let i = 0; i < hitShip.size; i++) {
                const sr = hitShip.orientation === 'horizontal' ? hitShip.row : hitShip.row + i;
                const sc = hitShip.orientation === 'horizontal' ? hitShip.col + i : hitShip.col;
                newShots.set(`${sr}-${sc}`, 'sunk');
            }
            setRevealedEnemyShips(prev => [...prev, hitShip]);
        } else {
            newShots.set(key, 'hit');
        }
      } else {
        newShots.set(key, 'miss');
      }

      setPlayerShots(newShots);

      addLog({ 
        msg: t('log_you_fired', { pos: `${String.fromCharCode(65 + c)}${r + 1}` }), 
        result: result === 'sunk' ? t('log_target_eliminated') : isHit ? t('log_direct_hit') : t('log_water_impact'), 
        type: isHit ? 'hit' : 'miss' 
      });

      if (!isHit) {
        if (enableSound) new Audio('/shot-miss.mp3').play().catch(() => {});
        addLog({ msg: t('log_negative_impact'), result: t('log_switching_defense'), type: 'sys' });
        setTurn('opponent');
      } else {
        if (enableSound) {
           const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3');
           audio.play().catch(() => {});
        }
        triggerImpact('hit');
        if (result === 'sunk') {
            addLog({ msg: t('log_confirmed_neutralized', { name: hitShip?.name }), result: t('log_target_destroyed'), type: 'hit' });
        }
      }
    }
  };

  const totalPlayerShots = playerShots.size;
  const playerHits = Array.from(playerShots.values()).filter(s => s === 'hit' || s === 'sunk').length;
  const playerAccuracy = totalPlayerShots > 0 ? Math.round((playerHits / totalPlayerShots) * 100) : 0;

  const totalEnemyShots = enemyShots.size;
  const enemyHits = Array.from(enemyShots.values()).filter(s => s === 'hit' || s === 'sunk').length;
  const enemyAccuracy = totalEnemyShots > 0 ? Math.round((enemyHits / totalEnemyShots) * 100) : 0;

  const getSunkCount = (fleet: ShipInstance[], shots: Map<string, string>) => {
    return fleet.filter(ship => {
      let shipHits = 0;
      for (let i = 0; i < ship.size; i++) {
        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        const shot = shots.get(`${sr}-${sc}`);
        if (shot === 'hit' || shot === 'sunk') shipHits++;
      }
      return shipHits === ship.size;
    }).length;
  };

  const sunkEnemyShips = gameState.gameMode === 'PvE' ? getSunkCount(aiFleet, playerShots) : revealedEnemyShips.length;
  const sunkPlayerShips = getSunkCount(gameState.playerFleet, enemyShots);

  const handleRematch = () => {
    if (gameState.gameMode === 'PvP') {
        if (opponentWantsRematch) {
            emitRematchAccept();
        } else {
            setRematchRequested(true);
            emitRematchRequest();
        }
    } else {
        // PvE Rematch
        setRematchRequested(true);
        prepareRematch();
        // Force PLACEMENT state for PvE to avoid triggering matchmaking logic
        setGameStatus(GamePhase.PLACING); 
    }
  };

  const handleExitToLobby = useCallback(() => {
    setShowAbortModal(false);
    setShowOpponentLeftModal(false);
    if (gameState.gameMode === 'PvE') endPve();
    leaveRoom();
    resetGame();
    router.push('/');
  }, [gameState.gameMode, endPve, leaveRoom, resetGame, router]);

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden flex items-start justify-center p-0">
      <BattleModals 
        key="battle-modals-system"
        showTurnNotify={showTurnNotify}
        setShowTurnNotify={setShowTurnNotify}
        currentTurn={gameState.currentTurn}
        gameStatus={gameState.gameStatus}
        onCancelSearch={handleExitToLobby}
        gameResult={gameResult}
        gameMode={gameState.gameMode}
        opponentWantsRematch={opponentWantsRematch}
        rematchRequested={rematchRequested}
        rematchTimer={rematchTimer}
        onRematch={handleRematch}
        onReturnToBase={handleExitToLobby}
        showOpponentLeftModal={showOpponentLeftModal}
        setShowOpponentLeftModal={setShowOpponentLeftModal}
        onExitToLobby={handleExitToLobby}
        showAbortModal={showAbortModal}
        setShowAbortModal={setShowAbortModal}
        onConfirmAbort={handleExitToLobby}
        stats={{
          player: {
            totalShots: totalPlayerShots,
            hits: playerHits,
            accuracy: playerAccuracy,
            sunkShips: sunkEnemyShips
          },
          opponent: {
            totalShots: totalEnemyShots,
            hits: enemyHits,
            accuracy: enemyAccuracy,
            sunkShips: sunkPlayerShips
          }
        }}
      />

      <motion.div 
        animate={impactEffect === 'hit' ? {
          scale: [1, 1.015, 1],
          x: [0, -3, 3, -3, 3, 0],
          y: [0, 3, -3, 3, -3, 0]
        } : impactEffect === 'enemy-hit' ? {
          scale: [1, 0.985, 1],
          x: [0, 8, -8, 8, -8, 0],
          y: [0, -8, 8, -8, 8, 0]
        } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full h-full max-w-[1440px] flex flex-col gap-3 relative"
      >
        <BattleHeader 
            currentTurn={gameState.currentTurn}
            scores={gameState.scores}
            playerName={gameState.playerName}
            opponentName={gameState.opponent?.name}
            opponentStatus={gameState.opponent?.status}
            gameMode={gameState.gameMode}
            turnTimer={turnTimer}
            onAbort={() => setShowAbortModal(true)}
            roomId={gameState.roomId || roomFromUrl}
        />

        {/* TACTICAL INTERFACE */}
        {battleLayout === 'tactical' ? (
          <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 overflow-y-auto lg:overflow-hidden">
            
            {/* LEFT: ENEMY DATA & TARGETING (DOMINANT) */}
            <section className="flex flex-col min-h-[400px] lg:min-h-0 lg:col-span-8 bg-slate-950/20 rounded-2xl border border-white/5 relative overflow-hidden shrink-0 lg:shrink">
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5 shrink-0 bg-slate-900/10">
                   <div className="flex items-center gap-3">
                    <Target className={`w-4 h-4 ${(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? 'text-error' : 'text-primary'}`} />
                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">
                      {(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? t('targeting_matrix') : (t('defensive_grid') || 'Defensive Grid')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded border border-white/5">
                      <span className="text-xs font-black text-slate-500 uppercase">ID</span>
                      <span className="text-sm font-bold text-white uppercase tracking-widest">{gameState.isPlayingPvE ? 'ghostAI' : (gameState.roomId || roomFromUrl || t('scanning'))}</span>
                    </div>
                  </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0ea5e9 0px, transparent 200px)', backgroundSize: '100% 100%' }}></div>
                 
                 <div className="h-full aspect-square max-h-full max-w-full overflow-hidden flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? (
                        <motion.div
                          key="grid-turn-player"
                          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4 }}
                          className="w-full h-full p-1"
                        >
                          <BattleGrid type="enemy" fleet={aiFleet} revealedShips={revealedEnemyShips} shots={playerShots} onCellClick={handleEnemyCellClick} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="grid-turn-enemy"
                          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4 }}
                          className="w-full h-full p-1"
                        >
                          <BattleGrid type="player" fleet={gameState.playerFleet} shots={enemyShots} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
            </section>

            {/* RIGHT: DEFENSIVE & LOGISTICS */}
            <section className="flex flex-col gap-4 min-h-0 lg:col-span-4 pb-4 lg:pb-0 lg:h-full lg:overflow-hidden">
               <FleetStatusPanel 
                   playerFleet={(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? gameState.playerFleet : aiFleet}
                   enemyShots={(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? enemyShots : playerShots}
                   healthBarStyle={healthBarStyle}
                   type={(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? 'player' : 'enemy'}
                   revealedShips={(gameState.currentTurn === 'player' || gameState.gameMode === 'PvE') ? [] : revealedEnemyShips}
               />
               <BattleStatusPanel 
                   playerFleet={gameState.playerFleet}
                   enemyFleet={gameState.gameMode === 'PvE' ? aiFleet.map((s, i) => {
                     const isSunk = revealedEnemyShips.some(rs => rs.id === s.id);
                     return isSunk ? s : { ...s, isUnknown: true };
                   }) : [
                     ...revealedEnemyShips,
                     ...Array.from({ length: Math.max(0, 5 - revealedEnemyShips.length) }).map((_, i) => ({ id: `unknown-${i}`, name: 'Scanning...', size: 3, isUnknown: true }))
                   ]}
                   playerShots={playerShots}
                   enemyShots={enemyShots}
                   gameMode={gameState.gameMode}
                   healthBarStyle={healthBarStyle}
                   isCompact={true}
               />
            </section>
          </div>
        ) : null}

        <BattleFooter accuracy={playerAccuracy} sunkEnemyShips={sunkEnemyShips} />
      </motion.div>
    </div>
  );
}


export default function BattlePage() {
  return (
    <Suspense fallback={<GlobalLoading messageKey="reconnecting_op_zone" />}>
      <BattleContent />
    </Suspense>
  );
}

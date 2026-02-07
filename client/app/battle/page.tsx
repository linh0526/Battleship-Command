"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Target } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useGame, ShipInstance, GamePhase } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';
import { useSettings } from '@/context/SettingsContext';

import BattleGrid from '@/components/battle/BattleGrid';
import BattleHeader from '@/components/battle/BattleHeader';
import BattleModals from '@/components/battle/BattleModals';
import FleetStatusPanel from '@/components/battle/FleetStatusPanel';
import BattleLog from '@/components/battle/BattleLog';
import BattleFooter from '@/components/battle/BattleFooter';
import { Shield } from 'lucide-react';

function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');
  const { t } = useLanguage();
  const { 
    emitMove, notifyDefeat, emitRematchRequest, 
    emitRematchAccept, onRematchRequested, onRematchAccepted, 
    socket, leaveRoom, endPve, clientId: myClientId, joinRandomRoom
  } = useSocket();
  const { 
    gameState, addLog, setTurn, resetGame, prepareRematch, addScore, setRoomId, setGameStatus
  } = useGame();
  
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

  // Listen for opponent leaving
  useEffect(() => {
    const handleOpponentLeft = () => {
      console.warn('[BATTLE] Opponent left/disconnected');
      // Always show modal if we are in battle stage
      if (gameState.gameStatus === GamePhase.PLAYING || gameState.gameStatus === GamePhase.PLACEMENT) {
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
    if (gameResult || gameState.gameStatus === GamePhase.MATCHMAKING || !gameState.currentTurn) return;

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

  // Reset timer when turn changes
  useEffect(() => {
    if (gameState.currentTurn) {
      setTurnTimer(30);
    }
  }, [gameState.currentTurn]);

  // Stats calculation
  const totalPlayerShots = playerShots.size;
  const playerHits = Array.from(playerShots.values()).filter(s => s === 'hit' || s === 'sunk').length;
  const accuracy = totalPlayerShots > 0 ? Math.round((playerHits / totalPlayerShots) * 100) : 0;

  const sunkEnemyShips = aiFleet.filter(ship => {
    let shipHits = 0;
    for (let i = 0; i < ship.size; i++) {
        const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
        const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
        if (playerShots.get(`${sr}-${sc}`) === 'hit') shipHits++;
    }
    return shipHits === ship.size;
  }).length;

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
  }, [playerShots, enemyShots, aiFleet, gameState.playerFleet, gameResult, addLog, gameState.gameMode, notifyDefeat, addScore]);

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
      const timer = setTimeout(() => setShowTurnNotify(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showTurnNotify]);

  // Handle Server-Authoritative Events
  useEffect(() => {
    if (socket && gameState.gameMode === 'PvP') {
      const handleShotProcessed = (data: { attackerId: string, r: number, c: number, result: 'hit' | 'miss' | 'sunk', sunkShip?: any }) => {
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
                 const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3');
                 audio.play().catch(() => {});
                 
                 if (result === 'sunk' && sunkShip) {
                     setRevealedEnemyShips(prev => [...prev, sunkShip]);
                     addLog({ msg: t('log_confirmed_kill'), result: t('log_target_neutralized'), type: 'hit' });
                 }
            } else {
                 new Audio('/shot-miss.mp3').play().catch(() => {});
            }

        } else {
            // Opponent's shot (Incoming Attack)
            setEnemyShots(prev => {
                const newShots = new Map(prev);
                newShots.set(key, result);
                return newShots;
            });

            if (result === 'hit' || result === 'sunk') {
                 const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3'); 
                 audio.play().catch(() => {});
                 if (result === 'sunk') {
                     addLog({ msg: t('log_warning_sunk', { name: sunkShip?.name || t('opponent') }), result: t('log_critical_damage'), type: 'enemy-hit' });
                 }
            } else {
                 new Audio('/shot-miss.mp3').play().catch(() => {});
            }
        }
      };

      const handleTurnChange = (data: { turn: string }) => {
      setTurn(data.turn === myClientId ? 'player' : 'opponent');
      setTurnTimer(30); // Reset timer on turn change
      // Ensure we are in PLAYING phase
      if (gameState.gameStatus !== GamePhase.PLAYING) setGameStatus(GamePhase.PLAYING);
    };

      const handleVictory = () => {
        if (gameResult) return;
        setGameResult('win');
        addScore('player', 1);
        addLog({ msg: t('log_victory'), result: t('log_mission_complete'), type: 'sys' });
        new Audio('/victory.mp3').play().catch(() => {}); 
      };

      const handleDefeat = () => {
        if (gameResult) return;
        setGameResult('loss');
        addScore('opponent', 1);
        addLog({ msg: t('log_defeat'), result: t('log_mission_failed'), type: 'sys' });
      };

      const handleMatchStart = () => {
        router.push('/placement');
      };

      socket.on('shot_processed', handleShotProcessed);
      socket.on('turn_change', handleTurnChange);
      socket.on('player_victory', handleVictory);
      socket.on('player_defeat', handleDefeat);
      socket.on('match_start_init', handleMatchStart);
      
      // Auto-ready if we join a room while in waiting state (from Continue Searching)
      const handleRoomJoined = () => {
        if (gameState.gameStatus === GamePhase.MATCHMAKING) {
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
             router.push('/placement');
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
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.gameMode, aiShotNonce, gameResult]);

  const handleAiTurn = () => {
    let r, c, key;
    do {
      r = Math.floor(Math.random() * 10);
      c = Math.floor(Math.random() * 10);
      key = `${r}-${c}`;
    } while (enemyShots.has(key));

    const isHit = gameState.playerFleet.some(s => {
      for (let i = 0; i < s.size; i++) {
        const sr = s.orientation === 'horizontal' ? s.row : s.row + i;
        const sc = s.orientation === 'horizontal' ? s.col + i : s.col;
        if (sr === r && sc === c) return true;
      }
      return false;
    });

    const result: 'hit' | 'miss' = isHit ? 'hit' : 'miss';
    const newShots = new Map(enemyShots);
    newShots.set(key, result);
    setEnemyShots(newShots);
    addLog({ 
      msg: t('log_enemy_fired', { pos: `${String.fromCharCode(65 + c)}${r + 1}` }), 
      result: isHit ? t('log_direct_hit') : t('log_splash_miss'), 
      type: isHit ? 'enemy-hit' : 'miss' 
    });
    
    if (!isHit) {
      new Audio('/shot-miss.mp3').play().catch(() => {});
      setTurn('player');
    } else {
      new Audio('/shot-thaydan.mp3').play().catch(() => {});
      // In PvE, if AI hits, it triggers another turn cycles via aiShotNonce
      setTimeout(() => {
        if (!gameResult) setAiShotNonce(prev => prev + 1);
      }, 1500);
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
      // But we can mark it as 'pending' if we had that state.
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
        new Audio('/shot-miss.mp3').play().catch(() => {});
        addLog({ msg: t('log_negative_impact'), result: t('log_switching_defense'), type: 'sys' });
        setTurn('opponent');
      } else {
        const audio = new Audio(result === 'sunk' ? '/sink.mp3' : '/shot-thaydan.mp3');
        audio.play().catch(() => {});
        if (result === 'sunk') {
            addLog({ msg: t('log_confirmed_neutralized', { name: hitShip?.name }), result: t('log_target_destroyed'), type: 'hit' });
        }
      }
    }
  };

  const handleRematch = () => {
    if (gameState.gameMode === 'PvP') {
        if (opponentWantsRematch) {
            emitRematchAccept();
        } else {
            setRematchRequested(true);
            emitRematchRequest();
        }
    } else {
        setRematchRequested(true);
        prepareRematch();
        router.push('/placement');
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

  const { battleLayout } = useSettings();

  return (
    <div className="fixed inset-0 bg-[#060912] overflow-hidden flex items-center justify-center p-6 lg:p-10">
      <BattleModals 
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
          totalShots: totalPlayerShots,
          hits: playerHits,
          misses: totalPlayerShots - playerHits,
          accuracy: accuracy
        }}
      />

      <div className="w-full h-full max-w-[1440px] flex flex-col gap-6 relative">
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
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
            
            {/* LEFT: ENEMY DATA & TARGETING (DOMINANT) */}
            <section className="col-span-8 flex flex-col min-h-0 bg-slate-950/20 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0 bg-slate-900/10">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-error" />
                    <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{t('targeting_matrix')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded border border-white/5">
                      <span className="text-xs font-black text-slate-500 uppercase">ID</span>
                      <span className="text-sm font-bold text-white uppercase tracking-widest">{gameState.isPlayingPvE ? 'ghostAI' : (gameState.roomId || roomFromUrl || t('scanning'))}</span>
                    </div>
                  </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center p-6">
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0ea5e9 0px, transparent 200px)', backgroundSize: '100% 100%' }}></div>
                 
                 <div className="h-full aspect-square max-h-full">
                   <BattleGrid type="enemy" fleet={aiFleet} revealedShips={revealedEnemyShips} shots={playerShots} onCellClick={handleEnemyCellClick} />
                 </div>

                 <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                    <div className="w-[200%] h-1 bg-primary absolute top-0 left-[-50%] animate-[scan_5s_linear_infinite]"></div>
                 </div>
              </div>
            </section>

            {/* RIGHT: DEFENSIVE & LOGISTICS */}
            <section className="col-span-4 flex flex-col gap-6 min-h-0">
               <FleetStatusPanel 
                   playerFleet={gameState.playerFleet}
                   enemyShots={enemyShots}
               />

               <BattleLog logs={gameState.battleLogs} />
            </section>
          </div>
        ) : (
          /* PARALLEL LAYOUT */
          <div className="flex-1 min-h-0 flex flex-col gap-6">
            {/* TOP ROW: GRIDS */}
            <div className="flex-[3] min-h-0 grid grid-cols-2 gap-8">
              {/* LEFT: MY FLEET */}
              <section className="flex flex-col min-h-0 bg-slate-950/20 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0 bg-slate-900/10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{t('defensive_grid') || 'Defensive Grid'}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">{t('fleet_active')}</span>
                    </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                   <div className="h-full aspect-square max-h-full">
                     <BattleGrid type="player" fleet={gameState.playerFleet} shots={enemyShots} />
                   </div>
                </div>
              </section>

              {/* RIGHT: ENEMY FLEET */}
              <section className="flex flex-col min-h-0 bg-slate-950/20 rounded-2xl border border-error/5 relative overflow-hidden shadow-[inset_0_0_100px_rgba(239,68,68,0.02)]">
                <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0 bg-slate-900/10">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-error" />
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{t('targeting_matrix')}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase">RADAR</span>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{gameState.isPlayingPvE ? 'ghostAI' : (gameState.roomId || roomFromUrl || 'SCAN')}</span>
                    </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                   <div className="h-full aspect-square max-h-full">
                     <BattleGrid type="enemy" fleet={aiFleet} revealedShips={revealedEnemyShips} shots={playerShots} onCellClick={handleEnemyCellClick} />
                   </div>
                </div>
              </section>
            </div>

            {/* BOTTOM ROW: STATUS & LOGS */}
            <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 h-[220px]">
              {/* STATUS PANEL */}
              <section className="col-span-4 bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-0">
                <div className="p-3 border-b border-white/5 bg-slate-900/20 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('battle_status')}</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                  {/* TWO COLUMNS FOR STATUS IN HORIZONTAL VIEW? NO, STACK THEM WITH GRID */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* PLAYER VITAL SIGNS */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">{t('your_fleet_status')}</span>
                      <div className="space-y-2">
                        {gameState.playerFleet.map(ship => {
                          const hitsOnShip = Array.from(enemyShots.entries()).filter(([key, res]) => {
                            if (res !== 'hit') return false;
                            const [r, c] = key.split('-').map(Number);
                            for (let j = 0; j < ship.size; j++) {
                              const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + j;
                              const sc = ship.orientation === 'horizontal' ? ship.col + j : ship.col;
                              if (sr === r && sc === c) return true;
                            }
                            return false;
                          }).length;
                          const isSunk = hitsOnShip === ship.size;
                          const health = ship.size - hitsOnShip;

                          return (
                            <div key={ship.id} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-black uppercase">
                                <span className={isSunk ? "text-slate-700" : (ship.shipTextColor || "text-slate-400")}>{ship.name}</span>
                                <span className={isSunk ? "text-slate-700" : "text-slate-300"}>{isSunk ? 'KO' : `${health}/${ship.size}`}</span>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: ship.size }).map((_, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                      idx < health 
                                        ? `${ship.shipBgColor} shadow-[0_0_8px_currentColor] opacity-90` 
                                        : 'bg-slate-800/80 border border-white/5'
                                    }`} 
                                    style={{ color: !isSunk && idx < health ? 'var(--primary)' : 'transparent' }} // Using color for currentColor if needed
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* ENEMY VITAL SIGNS */}
                    <div className="space-y-3 border-l border-white/5 pl-4">
                      <span className="text-[10px] font-black text-red uppercase tracking-[0.2em] px-1">{t('enemy_fleet_status')}</span>
                      <div className="space-y-2">
                        {(gameState.gameMode === 'PvE' ? aiFleet : [
                          ...revealedEnemyShips,
                          ...Array(Math.max(0, 5 - revealedEnemyShips.length)).fill(null).map((_, i) => ({ id: `unknown-${i}`, name: 'Scanning...', size: 3, isUnknown: true }))
                        ]).map((ship: any, i) => {
                          if (ship.isUnknown) {
                            return (
                              <div key={ship.id} className="flex flex-col gap-0.5 opacity-20">
                                <div className="flex justify-between text-[7px] font-black text-red/40 uppercase">
                                  <span>Sector {i+1}</span>
                                  <span>?/?</span>
                                </div>
                                <div className="h-1 w-full bg-slate-900/50 rounded-full" />
                              </div>
                            )
                          }
                          let hitsOnShip = 0;
                          if (gameState.gameMode === 'PvP') hitsOnShip = ship.size;
                          else {
                            for (let j = 0; j < ship.size; j++) {
                              const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + j;
                              const sc = ship.orientation === 'horizontal' ? ship.col + j : ship.col;
                              if (playerShots.get(`${sr}-${sc}`) === 'hit' || playerShots.get(`${sr}-${sc}`) === 'sunk') hitsOnShip++;
                            }
                          }
                          const isSunk = hitsOnShip === ship.size;
                          const health = ship.size - hitsOnShip;

                          return (
                            <div key={ship.id} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-black uppercase">
                                <span className={isSunk ? "text-red/30" : "text-red/80"}>{ship.name}</span>
                                <span className="text-red/40">{isSunk ? 'SUNK' : `${health}/${ship.size}`}</span>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: ship.size }).map((_, idx) => (
                                  <div key={idx} className={`h-1 flex-1 rounded-full border border-red/5 ${
                                    idx < health 
                                      ? 'bg-red/40 shadow-[0_0_5px_rgba(244,56,56,0.2)]' 
                                      : 'bg-slate-900/60'
                                  }`} />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* LOGS PANEL */}
              <section className="col-span-8 flex flex-col min-h-0 bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden">
                <BattleLog logs={gameState.battleLogs} isCompact={true} />
              </section>
            </div>
          </div>
        )}

        <BattleFooter accuracy={accuracy} sunkEnemyShips={sunkEnemyShips} />
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-[#060912]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">
            Neural Link Active - Reconnecting to Combat Sector...
          </p>
        </div>
      </div>
    }>
      <BattleContent />
    </Suspense>
  );
}

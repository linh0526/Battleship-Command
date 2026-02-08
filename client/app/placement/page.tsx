"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useGame, ShipInstance, Orientation, GamePhase } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

import PlacementGrid from '@/components/placement/PlacementGrid';
import ShipManifest from '@/components/placement/ShipManifest';
import PlacementControls from '@/components/placement/PlacementControls';
import PlacementHeader from '@/components/placement/PlacementHeader';
import PlacementAction from '@/components/placement/PlacementAction';
import PlacementModals from '@/components/placement/PlacementModals';
import GlobalLoading from '@/components/layout/GlobalLoading';

const SHIP_TYPES = [
  { name: 'ship_carrier', size: 5, icon: '🚢', id: 'CV-01', color: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/50' },
  { name: 'ship_battleship', size: 4, icon: '⚓', id: 'BB-04', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  { name: 'ship_cruiser', size: 3, icon: '🛳️', id: 'CA-12', color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/50' },
  { name: 'ship_submarine', size: 3, icon: '🌊', id: 'SS-21', color: 'bg-fuchsia-500', text: 'text-fuchsia-400', border: 'border-fuchsia-500/50' },
  { name: 'ship_destroyer', size: 2, icon: '⛵', id: 'DD-08', color: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/50' },
];

function PlacementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');
  const pathname = usePathname();
  const { t } = useLanguage();
  const { 
    gameState, setPlayerFleet, setFleetReady, setGameStatus, 
    setRoomId, setTurn, setGameMode, resetGame, 
    setOpponent, setOpponentFleetReady, resetScores 
  } = useGame();
  const { socket, joinRandomRoom, isConnected, emitFleetReady, leaveMatchmaking, leaveRoom, endPve, startPve, createRoom, joinSpecificRoom, emitUnready } = useSocket();
  const [showOpponentLeftModal, setShowOpponentLeftModal] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const isTransitioningRef = useRef(false);
  
  const statusRef = useRef(gameState.gameStatus);
  useEffect(() => {
    statusRef.current = gameState.gameStatus;
  }, [gameState.gameStatus]);

  // Ensure we are in PLACEMENT phase
  useEffect(() => {
    if (gameState.gameStatus !== GamePhase.PLACEMENT && gameState.gameStatus !== GamePhase.PLAYING) {
        setGameStatus(GamePhase.PLACEMENT);
    }
  }, []);

  useEffect(() => {
    return () => {
      leaveMatchmaking();
      // Only end PvE if we are leaving the flow without starting the game
      // We check ref to avoid closure issues with state in cleanup
      if (gameState.gameMode === 'PvE' && statusRef.current !== GamePhase.PLAYING && !isTransitioningRef.current) {
        endPve();
      }
    };
  }, [leaveMatchmaking, gameState.gameMode, endPve]);

  // Listen for opponent leaving
  useEffect(() => {
    const handleOpponentLeft = () => {
      console.warn('[PLACEMENT] Opponent left room');
      // If we are in a room (not just waiting lobby), show the modal
      if ((gameState.roomId || roomFromUrl) && gameState.roomId !== 'waiting-room') {
        setGameStatus(GamePhase.ENDED);
        setShowAbortModal(false);
        setShowOpponentLeftModal(true);
      }
    };
    
    if (socket) {
      const handleMatchStart = () => {
        // Clear waiting overlay, back to placement mode
        setGameStatus(GamePhase.PLACEMENT);
      };

      const handleRoomJoined = () => {
        if (gameState.gameStatus === GamePhase.MATCHMAKING) {
          socket.emit('player_room_ready', { ready: true });
        }
      };

      socket.on('opponent_left', handleOpponentLeft);
      socket.on('match_ended', (data: any) => {
        console.log('[MATCH] Terminated by server:', data.reason);
        handleOpponentLeft();
      });
      socket.on('match_start_init', handleMatchStart);
      socket.on('room_joined', handleRoomJoined);

      return () => {
        socket.off('opponent_left', handleOpponentLeft);
        socket.off('match_ended');
        socket.off('match_start_init', handleMatchStart);
        socket.off('room_joined', handleRoomJoined);
      };
    }
  }, [socket, gameState.roomId, gameState.gameStatus, gameState.currentTurn]);

  // Notify server on tab close
  useEffect(() => {
    const handleUnload = () => {
      leaveRoom();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [leaveRoom]);

  const [placedShips, setPlacedShips] = useState<ShipInstance[]>(gameState.playerFleet);
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>('horizontal');
  const [hoverPos, setHoverPos] = useState<{r: number, c: number} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeRooms, setActiveRooms] = useState<{id: string; status: string; [key: string]: any}[]>([]);

  const [isReady, setIsReady] = useState(false);
  // Unlock if fleet is cleared or incomplete
  useEffect(() => {
      if (placedShips.length < SHIP_TYPES.length) {
          if (!gameState.isFleetReady) {
             setIsReady(false);
          }
      }
  }, [placedShips, gameState.isFleetReady]);

  // Reset searching state when room is joined
  useEffect(() => {
    if (gameState.roomId) {
      setIsSearching(false);
    }
  }, [gameState.roomId]);

  // Listen for rooms update to show live feed while searching
  useEffect(() => {
    if (socket) {
      socket.on('rooms_update', (rooms: any[]) => {
        setActiveRooms(rooms);
      });
      socket.emit('get_active_rooms');
      return () => {
        socket.off('rooms_update');
      };
    }
  }, [socket]);

  // Sync with context on load if context has data
  useEffect(() => {
    if (gameState.playerFleet.length > 0 && placedShips.length === 0) {
      setPlacedShips(gameState.playerFleet);
    }
  }, [gameState.playerFleet]);

  const unplacedShips = SHIP_TYPES.filter(type => 
    !placedShips.some(placed => placed.name === type.name)
  );

  const isPlaced = (name: string) => placedShips.some(s => s.name === name);

  const rotateShip = () => {
    if (isReady) return;
    setSelectedOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Keyboard shortcut for rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isReady && e.key.toLowerCase() === 'r') {
        rotateShip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady]); 

  const isValidPlacement = (ship: typeof SHIP_TYPES[0], r: number, c: number, orientation: Orientation) => {
    // Out of bounds check
    if (orientation === 'horizontal') {
      if (c + ship.size > 10) return false;
    } else {
      if (r + ship.size > 10) return false;
    }

    // Overlap check
    const newShipCells = [];
    for (let i = 0; i < ship.size; i++) {
      if (orientation === 'horizontal') {
        newShipCells.push({ r, c: c + i });
      } else {
        newShipCells.push({ r: r + i, c });
      }
    }

    for (const placed of placedShips) {
      for (let i = 0; i < placed.size; i++) {
        const pr = placed.orientation === 'horizontal' ? placed.row : placed.row + i;
        const pc = placed.orientation === 'horizontal' ? placed.col + i : placed.col;
        
        if (newShipCells.some(nc => nc.r === pr && nc.c === pc)) {
          return false;
        }
      }
    }

    return true;
  };

  const handleCellClick = (r: number, c: number) => {
    // Prevent edits if locked or searching
    if (isReady || isSearching || gameState.isFleetReady) return;

    // If a ship is selected from manifest, try to place it
    if (selectedShipIndex !== null) {
      const shipType = unplacedShips[selectedShipIndex];
      // ... existing placement logic ...
      if (isValidPlacement(shipType, r, c, selectedOrientation)) {
        const newShip: ShipInstance = {
          ...shipType,
          row: r,
          col: c,
          orientation: selectedOrientation,
          shipBgColor: shipType.color,
          shipTextColor: shipType.text,
          shipBorderColor: shipType.border
        };
        const newFleet = [...placedShips, newShip];
        setPlacedShips(newFleet);
        setSelectedShipIndex(null);
      }
    } else {
      // If no ship selected, check if clicking on a placed ship to remove it
      const shipToRemove = placedShips.find(ship => {
        for (let i = 0; i < ship.size; i++) {
          const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + i;
          const sc = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
          if (sr === r && sc === c) return true;
        }
        return false;
      });

      if (shipToRemove) {
        setPlacedShips(prev => prev.filter(s => s.name !== shipToRemove.name));
      }
    }
  };

  const getCellStatus = (r: number, c: number) => {
    // Check if cell has a placed ship
    const ship = placedShips.find(s => {
      for (let i = 0; i < s.size; i++) {
        const sr = s.orientation === 'horizontal' ? s.row : s.row + i;
        const sc = s.orientation === 'horizontal' ? s.col + i : s.col;
        if (sr === r && sc === c) return true;
      }
      return false;
    });

    if (ship) return { type: 'ship', ship };

    // Check if cell is part of hover preview
    if (hoverPos && selectedShipIndex !== null && !isReady) {
      const shipType = unplacedShips[selectedShipIndex];
      const { r: hr, c: hc } = hoverPos;
      
      let inPreview = false;
      if (selectedOrientation === 'horizontal') {
        if (r === hr && c >= hc && c < hc + shipType.size && hc + shipType.size <= 10) inPreview = true;
      } else {
        if (c === hc && r >= hr && r < hr + shipType.size && hr + shipType.size <= 10) inPreview = true;
      }

      if (inPreview) {
        const valid = isValidPlacement(shipType, hr, hc, selectedOrientation);
        return { type: 'preview', valid, color: shipType.color };
      }
    }

    return { type: 'empty' };
  };

  const handleAction = async () => {
    // CASE 1: Not in a room OR PvE (treat PvE session as local)
    if (!gameState.roomId || gameState.gameMode === 'PvE') {
        if (placedShips.length !== SHIP_TYPES.length) {
            alert(t('units_missing'));
            return;
        }

        // Always sync local fleet to global context before proceeding
        setPlayerFleet(placedShips);

        // PvE Mode
        if (gameState.gameMode === 'PvE') {
             isTransitioningRef.current = true;
             setGameStatus('playing');
             // Refresh Session ID
             setRoomId('pve-session-' + Date.now());
             setTurn('player');
             router.push('/battle');
        } else {
            // PvP Mode
            setIsSearching(true);
             // join room waiting or create room if no waiting room
             const waitingRoom = activeRooms.find(r => 
                 (r.status === 'waiting' || r.status === 'WAITING' || r.status === t('room_waiting')) && 
                 r.id !== socket?.id
             );
             
             if (waitingRoom) {
                joinSpecificRoom(waitingRoom.id, undefined, placedShips);
                // Sẽ tự động redirect nhờ useEffect bên dưới
             } else {
                createRoom(undefined, placedShips);
             }
        }
        return;
    }

    // CASE 2: In a Room (PvP only) -> ACTION: ready / cancel ready
    if (gameState.roomId || roomFromUrl) {
        if (gameState.isFleetReady || isReady) {
             setIsReady(false);
             setFleetReady(false);
             emitUnready();
             return;
        }

        if (placedShips.length === SHIP_TYPES.length) {
            // Update global state
            setPlayerFleet(placedShips);
            // Lock & Emit
            setIsReady(true);
            setFleetReady(true);
            emitFleetReady(placedShips);
        }
    }
  };

  // Redirect to battle when room and opponent are ready
  useEffect(() => {
    // Transitions to battle only when both conditions are met:
    // 1. The player has confirmed their fleet (isFleetReady)
    // 2. The game session is officially starting (gameStatus === PLAYING)
    // 3. Current screen is relevant to the game flow (Golden Rule)
    if (
        pathname !== '/placement' &&
        pathname !== '/waiting'
    ) return;
    if (gameState.gameStatus === GamePhase.PLAYING) {
      console.log('>>> REDIRECTING TO BATTLE');
      router.push(`/battle?room=${gameState.roomId || roomFromUrl}`);
    }
  }, [gameState.gameStatus, router, pathname, gameState.roomId, roomFromUrl]);

  const clearFleet = () => {
    if (isReady) return;
    setPlacedShips([]);
    setSelectedShipIndex(null);
  };

  const autoDeploy = () => {
    if (isReady) return;
    const newFleet: ShipInstance[] = [];
    const types = [...SHIP_TYPES];

    for (const shipType of types) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const r = Math.floor(Math.random() * 10);
        const c = Math.floor(Math.random() * 10);
        const orientation: Orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

        // Temporary placement check for overlap within the new build
        const isValid = (s: typeof SHIP_TYPES[0], row: number, col: number, orient: Orientation, currentFleet: ShipInstance[]) => {
          if (orient === 'horizontal') {
            if (col + s.size > 10) return false;
          } else {
            if (row + s.size > 10) return false;
          }

          const newCells = [];
          for (let i = 0; i < s.size; i++) {
            newCells.push(orient === 'horizontal' ? { r: row, c: col + i } : { r: row + i, c: col });
          }

          for (const ps of currentFleet) {
            for (let i = 0; i < ps.size; i++) {
              const pr = ps.orientation === 'horizontal' ? ps.row : ps.row + i;
              const pc = ps.orientation === 'horizontal' ? ps.col + i : ps.col;
              if (newCells.some(nc => nc.r === pr && nc.c === pc)) return false;
            }
          }
          return true;
        };

        if (isValid(shipType, r, c, orientation, newFleet)) {
          newFleet.push({
            ...shipType,
            row: r,
            col: c,
            orientation,
            shipBgColor: shipType.color,
            shipTextColor: shipType.text,
            shipBorderColor: shipType.border
          });
          placed = true;
        }
        attempts++;
      }
    }
    setPlacedShips(newFleet);
    setSelectedShipIndex(null);
  };

  const handleExitToLobby = useCallback(() => {
    setShowAbortModal(false);
    setShowOpponentLeftModal(false);
    if (gameState.gameMode === 'PvE') endPve();
    leaveRoom();
    resetGame();
    router.push('/');
  }, [gameState.gameMode, endPve, leaveRoom, resetGame, router]);

  const isFleetComplete = placedShips.length === SHIP_TYPES.length;

  return (
    <div className="fixed inset-0 bg-[#060912] overflow-y-auto flex flex-col items-center p-2 z-[100]">
      <div className="w-full max-w-[1440px] flex flex-col">
        <PlacementHeader 
          gameState={{ ...gameState, roomId: gameState.roomId || roomFromUrl }} 
          onAbort={() => setShowAbortModal(true)} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: TACTICAL PLACEMENT FRAME */}
          <main className="lg:col-span-9 flex flex-col gap-8 h-full">
            <div className="glass-panel p-2 bg-[#1e293b]/10 border-slate-800/40 flex flex-row items-stretch gap-2 min-h-[600px] rounded-3xl overflow-hidden">
                {/* TOOLBAR SIDEBAR */}
                <div className="flex flex-col gap-4 p-2 bg-slate-950/40 rounded-2xl border border-white/5">
                  <PlacementControls 
                      rotateShip={rotateShip}
                      autoDeploy={autoDeploy}
                      clearFleet={clearFleet}
                      selectedShipIndex={selectedShipIndex}
                      selectedOrientation={selectedOrientation}
                      gameState={gameState}
                      isReady={isReady}
                  />
                </div>
                
                {/* GRID SECTION */}
                <div className="flex-1 relative bg-slate-950/20 rounded-2xl overflow-hidden group">
                  <PlacementGrid
                    placedShips={placedShips}
                    hoverPos={hoverPos}
                    handleCellClick={handleCellClick}
                    setHoverPos={setHoverPos}
                    getCellStatus={getCellStatus}
                    isSearching={isSearching}
                    activeRooms={activeRooms}
                    socketId={socket?.id}
                    isReady={isReady} 
                    isOpponentReady={gameState.opponent?.fleetReady}
                    opponentStatus={gameState.opponent?.status}
                  />
                </div>
            </div>
          </main>

          {/* RIGHT: UNIT MANIFEST & ACTION */}
          <aside className="lg:col-span-3 flex flex-col gap-8">
            <ShipManifest 
                placedShips={placedShips}
                selectedShipIndex={selectedShipIndex}
                setSelectedShipIndex={setSelectedShipIndex}
                SHIP_TYPES={SHIP_TYPES}
                unplacedShips={unplacedShips}
                isPlaced={isPlaced}
                isReady={isReady}
            />

            <PlacementAction 
                isFleetComplete={isFleetComplete}
                isSearching={isSearching}
                gameState={gameState}
                handleAction={handleAction}
                isReady={isReady}
            />
          </aside>
        </div>
      </div>

      <PlacementModals 
        showAbortModal={showAbortModal}
        setShowAbortModal={setShowAbortModal}
        showOpponentLeftModal={showOpponentLeftModal}
        setShowOpponentLeftModal={setShowOpponentLeftModal}
        onConfirmAbort={handleExitToLobby}
        onExitToLobby={handleExitToLobby}
      />
    </div>
  );
}

export default function PlacementPage() {
  return (
    <Suspense fallback={<GlobalLoading messageKey="loading_tactical_interface" />}>
      <PlacementContent />
    </Suspense>
  );
}

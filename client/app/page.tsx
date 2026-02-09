"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGame, GamePhase } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

// Splitted Components
import CallsignModal from '@/components/lobby/CallsignModal';
import MatchingModal from '@/components/lobby/MatchingModal';
import LobbyHero from '@/components/lobby/LobbyHero';
import ActiveOperations from '@/components/lobby/ActiveOperations';
import TopCommanders from '@/components/lobby/TopCommanders';
import LobbyChat from '@/components/lobby/LobbyChat';
import ConnectionOverlay from '@/components/lobby/ConnectionOverlay';
import GlobalLoading from '@/components/layout/GlobalLoading';

// Game Content Components
import { PlacementContent } from './placement/page';
import { BattleContent } from './battle/page';


function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { gameState, setGameMode, resetGame, setPlayerName, resetScores, prepareRematch, setRoomId } = useGame();
  const { socket, isConnected, startPve, joinSpecificRoom, createRoom, joinRandomRoom, updatePlayerName } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerName);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pendingAction, setPendingAction] = useState<'pvp' | 'create' | 'join' | 'pve' | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [customGameMode, setCustomGameMode] = useState<'classic' | 'salvo'>('classic');

  const lastProcessedRoomId = React.useRef<string | null>(null);

  // Clear lastProcessedRoomId when status is IDLE and URL is clean
  useEffect(() => {
    if (gameState.gameStatus === GamePhase.IDLE && !searchParams.get('room')) {
      lastProcessedRoomId.current = null;
    }
  }, [gameState.gameStatus, searchParams]);

  useEffect(() => {
    if (gameState.roomId && gameState.roomId !== 'waiting-room' && gameState.gameMode !== 'PvE') {
      setShowMatchingModal(true);
    } else {
      setShowMatchingModal(false);
    }
  }, [gameState.roomId, gameState.gameMode]);
  
  // Auto-sync authenticated user name to game state
  useEffect(() => {
    if (isAuthenticated && user?.username && gameState.playerName !== user.username) {
      setPlayerName(user.username);
    }
  }, [isAuthenticated, user, setPlayerName, gameState.playerName]);

  // join from url
  useEffect(() => {
    const roomId = searchParams.get('room');
    
    // Safety check: Don't auto-join if already in a game, in PvE mode, or if ID is a special PvE ID
    if (!roomId || !isConnected || gameState.gameStatus !== GamePhase.IDLE || 
        gameState.roomId || gameState.gameMode === 'PvE' || 
        roomId === lastProcessedRoomId.current || roomId === 'PVE_SESSION') return;

    const checkAndPrepareJoin = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/room/exists/${roomId}`);
        const data = await response.json();
        
        if (data.exists) {
          lastProcessedRoomId.current = roomId;
          
          if (isAuthenticated && user) {
            setPlayerName(user.username);
            setGameMode('PvP');
            joinSpecificRoom(roomId, user.username);
          } else {
            setPendingId(roomId);
            setPendingAction('join');
            setGameMode('PvP');
            // User requested to set roomId once confirmed exists
            setRoomId(roomId);
            setShowNameModal(true);
          }
        } else {
          // Room doesn't exist, clear URL parameter without full refresh
          router.replace('/', { scroll: false });
        }
      } catch (e) {
        console.error("Room check error:", e);
      }
    };

    checkAndPrepareJoin();
  }, [searchParams, isConnected, gameState.gameStatus, gameState.roomId, isAuthenticated, user, setPlayerName, setGameMode, joinSpecificRoom, router, setRoomId]);

  // Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleRoomsUpdate = (rooms: any[]) => {
      setActiveRooms(rooms);
    };

    const handlePlayerCount = (count: number) => {
      setOnlineUsers(count);
    };

    socket.on('rooms_update', handleRoomsUpdate);
    socket.on('player_count', handlePlayerCount);

    socket.emit('get_active_rooms');
    socket.emit('get_player_count');

    return () => {
      socket.off('rooms_update', handleRoomsUpdate);
      socket.off('player_count', handlePlayerCount);
    };
  }, [socket]);

  // Sync name to socket
  useEffect(() => {
    if (isConnected && gameState.playerName) {
      updatePlayerName(gameState.playerName);
    }
  }, [isConnected, gameState.playerName, updatePlayerName]);

  //random name 
  const generateRandomName = () => {
    const prefixes = [
      'Kraken', 'Abyss', 'Tempest', 'Phantom', 'Nightfall',
      'Nova', 'Void', 'Nyx', 'Flux', 'Echo'
    ];

    const suffixes = [
      'Reaper', 'Corsair', 'Destroyer', 'Hunter',
      'Prime', 'Zero', 'Vanguard', 'Raider'
    ];

    const number = Math.floor(Math.random() * 90 + 10); // 2 chữ số cho đẹp
    const name =
      prefixes[Math.floor(Math.random() * prefixes.length)] +
      suffixes[Math.floor(Math.random() * suffixes.length)] +
      number;

    setTempName(name);
    return name;
  };

  const processPvpAction = (name: string) => {
    const waitingRoom = activeRooms && activeRooms.find(r => 
      (r.status === 'WAITING' || r.status === 'waiting' || r.status === t('room_waiting')) && 
      r.captains === '1/2'
    );

    if (waitingRoom) {
      joinSpecificRoom(waitingRoom.id, name);
    } else {
      createRoom(name, undefined, 'classic'); 
    }
  };

  const handleStartPvP = () => {
    resetGame();
    setGameMode('PvP');
    if (isAuthenticated && user) {
      setPlayerName(user.username);
      processPvpAction(user.username);
    } else {
      setPendingAction('pvp');
      setShowNameModal(true);
    }
  };

  const handleStartPvE = () => {
    resetGame();
    setGameMode('PvE');
    setPendingAction('pve');
    setShowNameModal(true);
  };

  const handleCreateRoom = () => {
    resetGame();
    setGameMode('PvP');
    setCustomGameMode('classic');
    if (isAuthenticated && user) {
      setPlayerName(user.username);
      createRoom(user.username, undefined, 'classic');
    } else {
      setPendingAction('create');
      setShowNameModal(true);
    }
  };

  const handleJoinRequested = (id: string) => {
    resetScores();
    prepareRematch();
    setGameMode('PvP');
    if (isAuthenticated && user) {
      setPlayerName(user.username);
      joinSpecificRoom(id, user.username);
    } else {
      setPendingId(id);
      setPendingAction('join');
      setShowNameModal(true);
    }
  };

  const handleNameClose = useCallback(() => {
    setShowNameModal(false);
    // If we were joining via URL and cancelled, clear the room ID and URL
    if (pendingAction === 'join') {
      setRoomId(null);
      router.replace('/', { scroll: false });
    }
    setPendingAction(null);
    setPendingId(null);
  }, [pendingAction, setRoomId, router]);

  const confirmNameAndStart = () => {
    if (!tempName.trim() || !pendingAction) return;
      setPlayerName(tempName);
      const roomFromUrl = searchParams.get('room');
      const targetRoomId = pendingId || roomFromUrl;
      
      switch (pendingAction) {
        case 'pvp':
          // Tìm phòng đang chờ (WAITING) trong danh sách activeRooms
          const waitingRoom = activeRooms && activeRooms.find(r => 
            (r.status === 'WAITING' || r.status === 'waiting' || r.status === t('room_waiting')) && 
            r.captains === '1/2'
          );

          if (waitingRoom) {
            joinSpecificRoom(waitingRoom.id, tempName);
          } else {
            createRoom(tempName, undefined, 'classic'); 
          }
          break;
        case 'create':
          createRoom(tempName, undefined, customGameMode);
          break;
        case 'join':
          if (targetRoomId) {
            joinSpecificRoom(targetRoomId, tempName);
          }
          break;
        case 'pve':
          startPve(tempName);
          break;
      }

      setPendingAction(null);
      setPendingId(null);
      setShowNameModal(false);
  };


  return (
    <div className="flex flex-col gap-10 w-full mt-6 pb-20">
      {!isConnected && (
        <ConnectionOverlay />
      )}
      {/* Name Entry Modal */}
      <CallsignModal 
        show={showNameModal}
        onClose={handleNameClose}
        tempName={tempName}
        setTempName={setTempName}
        onConfirm={confirmNameAndStart}
        onGenerateRandom={generateRandomName}
        t={t}
        showModeSelection={pendingAction === 'create'}
        gameMode={customGameMode}
        setGameMode={setCustomGameMode}
      />

      <MatchingModal 
        isOpen={showMatchingModal}
        onClose={() => setShowMatchingModal(false)}
      />

      {/* TOP SECTION: Hero & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
        <div className="lg:col-span-9">
          <LobbyHero 
            onStartPvP={handleStartPvP}
            onStartPvE={handleStartPvE}
            onCreateRoom={handleCreateRoom}
            t={t}
          />
        </div>
        
        <div className="lg:col-span-3 flex flex-col">
          <TopCommanders t={t} />
        </div>

        {/* ROW 2: Active Ops & Chat */}
        <div className="lg:col-span-8 flex flex-col">
          <ActiveOperations 
            activeRooms={activeRooms}
            isConnected={isConnected}
            onJoinRoom={handleJoinRequested}
            t={t}
          />
        </div>
        
        <div className="lg:col-span-4 flex flex-col">
          <LobbyChat onlineUsers={onlineUsers} t={t} />
        </div>
      </div>
    </div>
  );
}

function MainController() {
  const router = useRouter();
  const { gameState } = useGame();
  const searchParams = useSearchParams();
  const { isConnected } = useSocket();

  // URL Sync Logic: Ensure URL always has ?room=roomId when in a room
  useEffect(() => {
    if (!isConnected) return;

    const roomIdInUrl = searchParams.get('room');
    
    // If we have a real room ID, sync it to the URL (PvP only)
    if (gameState.roomId && gameState.roomId !== 'waiting-room' && !gameState.isPlayingPvE) {
      if (roomIdInUrl !== gameState.roomId) {
        router.replace(`/?room=${gameState.roomId}`, { scroll: false });
      }
    } 
    // If we are back to IDLE or in PvE but still have room in URL, clean it up
    else if ((gameState.gameStatus === GamePhase.IDLE || gameState.isPlayingPvE) && roomIdInUrl) {
      router.replace('/', { scroll: false });
    }
  }, [gameState.roomId, gameState.gameStatus, gameState.isPlayingPvE, searchParams, isConnected, router]);

  // View Controller based on Game State
  if (gameState.gameStatus === GamePhase.PLACEMENT) {
    return <PlacementContent />;
  }

  if (gameState.gameStatus === GamePhase.PLAYING || gameState.gameStatus === GamePhase.ENDED) {
    return <BattleContent />;
  }

  return <LobbyContent />;
}


export default function LobbyPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MainController />
    </Suspense>
  );
}

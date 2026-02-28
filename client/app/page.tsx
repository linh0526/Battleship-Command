"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGame, GamePhase } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useAuth, useToast } from '@/context/AuthContext';

// Splitted Components
import CallsignModal from '@/components/lobby/CallsignModal';
import MatchingModal from '@/components/lobby/MatchingModal';
import LobbyHero from '@/components/lobby/LobbyHero';
import ActiveOperations from '@/components/lobby/ActiveOperations';
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
  const { socket, isConnected, isInitialLoad, startPve, joinSpecificRoom, createRoom, joinRandomRoom, updatePlayerName } = useSocket();
  const { user, isAuthenticated, setIsAuthOpen } = useAuth();
  const { show: showToast } = useToast();
  const { clientId } = useSocket();

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
          
          // Rank Enforcement for URL joining
          if (data.isRanked && !isAuthenticated) {
            showToast(t('login_required') + '||RANKED_PVP', 'info');
            setIsAuthOpen(true);
            router.replace('/', { scroll: false });
            return;
          }

          const isParticipant = data.playerIds?.includes(clientId);
          
          // Reconnection Case: User is already in the room
          if (isParticipant) {
            console.log("Reconnecting to room:", roomId);
            if (isAuthenticated && user) {
              setPlayerName(user.username);
              setGameMode('PvP');
              joinSpecificRoom(roomId, user.username);
            } else {
              setPendingId(roomId);
              setPendingAction('join');
              setGameMode('PvP');
              setRoomId(roomId);
              setShowNameModal(true);
            }
            return;
          }

          // Case: Room is playing and user is not a participant
          if (data.status === 'playing') {
            showToast('Phòng đang trong trận đấu!||JOIN_DENIED', 'error');
            router.replace('/', { scroll: false });
            return;
          }

          // Case: Room is full and user is not a participant
          if (data.isFull) {
            showToast('Phòng đã đầy người!||ROOM_FULL', 'error');
            router.replace('/', { scroll: false });
            return;
          }

          // Standard Join Case: Room is waiting and has space (Allowed for Guests in Custom)
          if (isAuthenticated && user) {
            setPlayerName(user.username);
            setGameMode('PvP');
            joinSpecificRoom(roomId, user.username);
          } else {
            setPendingId(roomId);
            setPendingAction('join');
            setGameMode('PvP');
            setRoomId(roomId);
            setShowNameModal(true);
          }
        } else {
          // Room doesn't exist
          showToast('Phòng không tồn tại hoặc đã bị hủy!||NOT_FOUND', 'error');
          router.replace('/', { scroll: false });
        }
      } catch (e) {
        console.error("Room check error:", e);
      }
    };

    checkAndPrepareJoin();
  }, [searchParams, isConnected, gameState.gameStatus, gameState.roomId, isAuthenticated, user, setPlayerName, setGameMode, joinSpecificRoom, router, setRoomId, clientId]);

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


  const handleStartPvP = () => {
    resetGame();
    setGameMode('PvP');
    if (isAuthenticated && user) {
      setPlayerName(user.username);
      joinRandomRoom(user.username, undefined, 'classic', true);
    } else {
      showToast(t('login_required') + '||RANKED_PVP', 'info');
      setIsAuthOpen(true);
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
      createRoom(user.username, undefined, 'classic', true);
    } else {
      setPendingAction('create');
      setShowNameModal(true);
    }
  };

  const handleJoinRequested = (id: string, isRanked?: boolean) => {
    resetScores();
    prepareRematch();
    setGameMode('PvP');

    if (isAuthenticated && user) {
      setPlayerName(user.username);
      joinSpecificRoom(id, user.username);
    } else {
      // If the room is Ranked, guests are not allowed
      if (isRanked) {
        showToast(t('login_required') + '||RANKED_PVP', 'info');
        setIsAuthOpen(true);
        return;
      }

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
          // Sử dụng Matchmaking chính thức (Ranked) thay vì tìm phòng thủ công
          joinRandomRoom(tempName, undefined, 'classic', true);
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
    <div className="flex flex-col gap-2 w-full mt-0">
      {!isInitialLoad && !isConnected && (
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

      {/* LOBBY CONTENT CONTAINER: Optimized for Single-Frame Experience */}
      <div className="flex flex-col lg:flex-row gap-4 w-full lg:h-[calc(100vh-110px)] mt-0 pb-2 overflow-hidden">
        
        {/* LEFT COLUMN: PRIMARY CONTENT (Hero + Operations) */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <LobbyHero 
            onStartPvP={handleStartPvP}
            onStartPvE={handleStartPvE}
            onCreateRoom={handleCreateRoom}
            t={t}
          />
          
          <div className="flex-1 min-h-0 bg-slate-900/5 rounded-2xl border border-white/5">
            <ActiveOperations 
              activeRooms={activeRooms}
              isConnected={isConnected}
              isAuthenticated={isAuthenticated}
              setIsAuthOpen={setIsAuthOpen}
              onJoinRoom={handleJoinRequested}
              t={t}
            />
          </div>
        </div>
      </div>
      
      {/* Floating Chat */}
      <LobbyChat onlineUsers={onlineUsers} t={t} />
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
  if (gameState.gameStatus === GamePhase.PLACING) {
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

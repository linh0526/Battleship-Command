"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
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


function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { gameState, setGameMode, resetGame, setPlayerName, resetScores, prepareRematch } = useGame();
  const { socket, isConnected, startPve, joinSpecificRoom, createRoom, joinRandomRoom, updatePlayerName } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerName);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pendingAction, setPendingAction] = useState<'pvp' | 'create' | 'join' | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [customGameMode, setCustomGameMode] = useState<'classic' | 'salvo'>('classic');


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
    if (roomId && isConnected) {
      if (isAuthenticated && user) {
        setPlayerName(user.username);
        setGameMode('PvP');
        joinSpecificRoom(roomId, user.username);
      } else {
        setPendingId(roomId);
        setPendingAction('join');
        setGameMode('PvP');
        setShowNameModal(true);
      }
      // Cleanup URL after processing
      router.replace('/', { scroll: false });
    }
  }, [searchParams, setGameMode, isAuthenticated, user, setPlayerName, joinSpecificRoom, isConnected, router]);

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
    let finalName = isAuthenticated && user ? user.username : gameState.playerName;

    if (!finalName || !finalName.trim()) {
      finalName = generateRandomName();
    }
    
    setPlayerName(finalName);
    startPve(finalName);
    router.push('/placement');
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

  const confirmNameAndStart = () => {
    if (!tempName.trim() || !pendingAction) return;
      setPlayerName(tempName);
      const roomFromUrl = searchParams.get('room');
      const targetRoomId = pendingId || roomFromUrl;
      // switch action
      switch (pendingAction) {
        case 'pvp':
          // Tìm phòng đang chờ (WAITING) trong danh sách activeRooms
          const waitingRoom = activeRooms && activeRooms.find(r => 
            (r.status === 'WAITING' || r.status === 'waiting' || r.status === t('room_waiting')) && 
            r.captains === '1/2'
          );

          if (waitingRoom) {
            console.log('[LOBBY] Found waiting room, joining:', waitingRoom.id);
            joinSpecificRoom(waitingRoom.id, tempName);
          } else {
            console.log('[LOBBY] No waiting room found, creating new one');
            createRoom(tempName, undefined, 'classic'); // PvP Quick Play always classic for now
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
        onClose={() => setShowNameModal(false)}
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


export default function LobbyPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <LobbyContent />
    </Suspense>
  );
}

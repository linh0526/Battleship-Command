"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';

// Splitted Components
import CallsignModal from '@/components/lobby/CallsignModal';
import MatchingModal from '@/components/lobby/MatchingModal';
import LobbyHero from '@/components/lobby/LobbyHero';
import ActiveOperations from '@/components/lobby/ActiveOperations';
import TopCommanders from '@/components/lobby/TopCommanders';
import LobbyChat from '@/components/lobby/LobbyChat';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { gameState, setGameMode, resetGame, setPlayerName, resetScores, prepareRematch } = useGame();
  const { socket, isConnected, startPve, joinSpecificRoom, createRoom, joinRandomRoom } = useSocket();

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerName);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pendingAction, setPendingAction] = useState<'pvp' | 'create' | 'join' | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [customGameMode, setCustomGameMode] = useState<'classic' | 'salvo'>('classic');

  // Sync state to show matching modal if we are in a room
  useEffect(() => {
    if (gameState.roomId && gameState.roomId !== 'waiting-room') {
      setShowMatchingModal(true);
    } else {
      setShowMatchingModal(false);
    }
  }, [gameState.roomId]);

  // join from url
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      setPendingId(roomId);
      setPendingAction('join');
      setGameMode('PvP');
      setShowNameModal(true);
    }
  }, [searchParams, setGameMode]);

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
    setPendingAction('pvp');
    setShowNameModal(true);
  };

  const handleStartPvE = () => {
    let finalName = gameState.playerName;

    if (!finalName || !finalName.trim()) {
      finalName = generateRandomName();
      setPlayerName(finalName);
    }

    resetGame();
    setGameMode('PvE');
    startPve(finalName);
    router.push('/placement');
  };

  const handleCreateRoom = () => {
    resetGame();
    setGameMode('PvP');
    setPendingAction('create');
    setCustomGameMode('classic'); // Reset to default when opening
    setShowNameModal(true);
  };

  const handleJoinRequested = (id: string) => {
    resetScores();
    prepareRematch();
    setGameMode('PvP');
    setPendingId(id);
    setPendingAction('join');
    setShowNameModal(true);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full h-[calc(100vh-140px)] mt-6 overflow-hidden">
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

      {/* LEFT COLUMN: Main Actions & Active Ops */}
      <main className="lg:col-span-9 flex flex-col gap-12 ">
        <LobbyHero 
          onStartPvP={handleStartPvP}
          onStartPvE={handleStartPvE}
          onCreateRoom={handleCreateRoom}
          t={t}
        />

        <ActiveOperations 
          activeRooms={activeRooms}
          isConnected={isConnected}
          onJoinRoom={handleJoinRequested}
          t={t}
        />
      </main>

      {/* RIGHT COLUMN: Leaderboard & Chat */}
      <aside className="lg:col-span-3 flex flex-col gap-10 h-full overflow-hidden">
        <TopCommanders t={t} />
        <LobbyChat onlineUsers={onlineUsers} t={t} />
      </aside>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-140px)] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">
            Establishing Neural Uplink...
          </p>
        </div>
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}

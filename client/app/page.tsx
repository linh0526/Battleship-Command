"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';

// Splitted Components
import CallsignModal from '@/components/lobby/CallsignModal';
import LobbyHero from '@/components/lobby/LobbyHero';
import ActiveOperations from '@/components/lobby/ActiveOperations';
import TopCommanders from '@/components/lobby/TopCommanders';
import LobbyChat from '@/components/lobby/LobbyChat';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { gameState, setGameMode, resetGame, setPlayerName, resetScores, prepareRematch } = useGame();
  const { socket, isConnected, startPve, joinSpecificRoom, createRoom } = useSocket();

  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerName);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pendingJoinId, setPendingJoinId] = useState<string | null>(null);

  // Handle room invitation from URL
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      setPendingJoinId(roomId);
      setGameMode('PvP');
      setShowNameModal(true);
    }
  }, [searchParams, setGameMode]);

  // Socket Events
  useEffect(() => {
    if (socket) {
      socket.on('rooms_update', (rooms: any[]) => {
        setActiveRooms(rooms);
      });
      socket.on('player_count', (count: number) => {
        setOnlineUsers(count);
      });
      socket.emit('get_active_rooms');
      
      return () => {
        socket.off('rooms_update');
        socket.off('player_count');
      };
    }
  }, [socket]);

  // Redirection when playing
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.isFleetReady) {
      router.push('/battle');
    }
  }, [gameState.gameStatus, gameState.isFleetReady, router]);

  const generateRandomName = () => {
    const prefixes = ['Sea', 'Iron', 'Storm', 'Deep', 'Night', 'Wave', 'Ghost', 'Viper', 'Omega', 'Blue', 'Red', 'Dark', 'Light', 'Cyber', 'Neon'];
    const suffixes = ['Wolf', 'Clad', 'Bringer', 'Dive', 'Raid', 'Breaker', 'Rider', 'One', 'Falcon', 'Hawk', 'Eagle', 'Shark', 'Whale', 'Dragon'];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 99)}`;
    setTempName(randomName);
  };

  const handleStartPvP = () => {
    resetGame();
    setGameMode('PvP');
    setShowNameModal(true);
  };

  const handleStartPvE = () => {
    resetGame();
    setGameMode('PvE');
    startPve(gameState.playerName);
    router.push('/placement');
  };

  const handleCreateRoom = () => {
    resetGame();
    createRoom();
    router.push('/placement');
  };

  const handleJoinRequested = (id: string) => {
    resetScores();
    prepareRematch();
    joinSpecificRoom(id);
    router.push('/placement');
  };

  const confirmNameAndStart = () => {
    if (tempName.trim()) {
      setPlayerName(tempName);
      if (pendingJoinId) {
        joinSpecificRoom(pendingJoinId);
      }
      router.push('/placement');
    }
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

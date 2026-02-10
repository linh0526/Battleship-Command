"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGame, GamePhase } from './GameContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useAuth, useToast } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isInitialLoad: boolean; // Grace period for initial connection
  joinRandomRoom: (nameOverride?: string, fleet?: any[], mode?: string) => void;
  joinSpecificRoom: (targetId: string, nameOverride?: string, fleet?: any[]) => void;
  createRoom: (nameOverride?: string, fleet?: any[], mode?: string) => void;
  emitMove: (r: number, c: number) => void;
  emitFleetReady: (fleet: any[]) => void;
  emitUnready: () => void;
  emitRematchRequest: () => void;
  emitRematchAccept: () => void;
  onRematchRequested: (callback: (data: { from: string }) => void) => void;
  onRematchAccepted: (callback: () => void) => void;
  leaveRoom: () => void;
  
  startPve: (name: string, mode?: string) => void;
  endPve: () => void;
  
  emitRoomReady: (ready: boolean) => void;
  emitStartMatch: () => void;
  updatePlayerName: (name: string) => void;
  clientId: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { 
    setRoomId, setOpponent, setGameStatus, 
    setTurn, addLog, setOpponentFleetReady, setFleetReady,
    setIsPlayingPvE, setRoomReady, setOpponentRoomReady,
    setOpponentStatus, setBattleMode, setGameMode 
  } = useGame();

  // Grace period for initial connection
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Server Disconnection / Crash
  useEffect(() => {
    if (!isInitialLoad && !isConnected && pathname !== '/') {
      console.warn('SERVER DISCONNECTED. ABORTING MISSION.');
      router.push('/');
    }
  }, [isConnected, pathname, router, t, isInitialLoad]);

  useEffect(() => {
    let storedClientId = localStorage.getItem('battleship_clientId');
    if (!storedClientId) {
      storedClientId = crypto.randomUUID();
      localStorage.setItem('battleship_clientId', storedClientId);
    }

    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      auth: { clientId: storedClientId }
    });
    setClientId(storedClientId);

    s.on('connect', () => {
      console.log('   Socket ID:', s.id);
      console.log('   Client ID:', storedClientId);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from server');
      setIsConnected(false);
    });

    s.on('room_joined', (data: { roomId: string, opponent?: any, mode?: 'classic' | 'salvo', isPvE?: boolean }) => {
      console.log('SERVER: room_joined event received for room:', data.roomId, 'Opponent data:', !!data.opponent, 'Mode:', data.mode, 'PvE:', data.isPvE);
      setRoomId(data.roomId);
      if (data.mode) setBattleMode(data.mode);
      if (data.opponent) {
        setOpponent(data.opponent);
        setFleetReady(false);
        setOpponentFleetReady(data.opponent.fleetReady || false);
        setOpponentRoomReady(data.opponent.roomReady || false);
      }
      
      if (data.isPvE) {
        setIsPlayingPvE(true);
        setGameMode('PvE');
        setGameStatus(GamePhase.PLACING);
      } else {
        setGameStatus(GamePhase.WAITING);
      }
    });

    s.on('opponent_joined', (opponent: any) => {
      console.log('SERVER: opponent_joined event received:', opponent.name);
      setOpponent(opponent);
      setFleetReady(false);
      setOpponentFleetReady(opponent.fleetReady || false);
      setRoomReady(false);
      setOpponentRoomReady(opponent.roomReady || false);
    });

    s.on('game_start', (data: { firstTurn: 'player' | 'opponent' }) => {
      console.log('SERVER: game_start event received. First turn:', data.firstTurn);
      setTurn(data.firstTurn);
      setGameStatus(GamePhase.PLAYING);
    });

    s.on('waiting_for_opponent', () => {
      console.log('Waiting for opponent...');
      setGameStatus(GamePhase.WAITING);
      setRoomId('waiting-room');
    });

    s.on('match_start_init', () => {
      console.log('SERVER: match_start_init event received');
      setGameStatus(GamePhase.PLACING);
    });

    s.on('room_ready_update', ({ playerId, ready }: { playerId: string; ready: boolean }) => {
      console.log('SERVER: room_ready_update:', playerId, ready);
      if (playerId === s.id) {
        setRoomReady(ready);
      } else {
        setOpponentRoomReady(ready);
      }
    });

    s.on('new_log', (data: any) => {
      addLog(data);
    });
    
    s.on('opponent_fleet_ready', () => {
      setOpponentFleetReady(true);
    });

    s.on('opponent_unready', () => {
      setOpponentFleetReady(false);
    });

    s.on('opponent_status_update', (data: { status: 'connected' | 'disconnected' }) => {
      console.log('SERVER: opponent_status_update:', data.status);
      setOpponentStatus(data.status);
    });

    s.on('opponent_left', () => {
      console.warn('[SOCKET] Opponent left room - cleaning up state');
      setOpponent(null);
      setOpponentFleetReady(false);
      setOpponentRoomReady(false);
      setOpponentStatus('disconnected');
      setGameStatus(GamePhase.WAITING);
    });

    s.on('error', (data: { msg: string }) => {
      console.error('[SOCKET ERROR]', data.msg);
      showToast(data.msg, 'error');
      addLog({ msg: data.msg, type: 'info', result: 'ERROR' });
      
      if (
        data.msg.includes('Phòng không tồn tại') || 
        data.msg.includes('đối thủ đã rời đi') ||
        data.msg.includes('Phòng đã đầy')
      ) {
          setRoomId(null);
          setGameStatus(GamePhase.IDLE);
          router.replace('/');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [setRoomId, setOpponent, setGameStatus, setTurn, addLog, setOpponentFleetReady, setRoomReady, setOpponentRoomReady, setOpponentStatus, setFleetReady, setBattleMode]);

  const joinRandomRoom = useCallback((nameOverride?: string, fleet?: any[], mode?: string) => {
    if (socket) socket.emit('join_random', { 
        name: nameOverride || '', 
        userId: user?.id,
        fleet, 
        mode: mode || 'classic' 
    });
  }, [socket, user]);

  const joinSpecificRoom = useCallback((targetId: string, nameOverride?: string, fleet?: any[]) => {
    if (socket) socket.emit('join_specific', { 
        name: nameOverride || '', 
        userId: user?.id,
        targetId, 
        fleet 
    });
  }, [socket, user]);

  const createRoom = useCallback((nameOverride?: string, fleet?: any[], mode?: string) => {
    if (socket) socket.emit('create_room', { 
        name: nameOverride || '', 
        userId: user?.id,
        fleet, 
        mode: mode || 'classic' 
    });
  }, [socket, user]);

  const emitMove = useCallback((r: number, c: number) => {
    if (socket) socket.emit('fire_shot', { r, c });
  }, [socket]);
  
  const emitFleetReady = useCallback((fleet: any[]) => {
    if (socket) socket.emit('fleet_ready', fleet);
  }, [socket]);

  const emitUnready = useCallback(() => {
    if (socket) socket.emit('player_unready');
  }, [socket]);

  const emitRematchRequest = useCallback(() => {
    if (socket) socket.emit('rematch_request');
  }, [socket]);

  const emitRematchAccept = useCallback(() => {
    if (socket) socket.emit('rematch_accept');
  }, [socket]);

  const onRematchRequested = useCallback((callback: (data: { from: string }) => void) => {
    if (socket) {
      socket.on('rematch_requested', callback as any);
    }
  }, [socket]);

  const onRematchAccepted = useCallback((callback: () => void) => {
    if (socket) {
      socket.on('rematch_started', callback as any);
    }
  }, [socket]);



  const leaveRoom = useCallback(() => {
    if (socket) socket.emit('leave_room');
    setRoomId(null);
    setOpponent(null);
    setGameStatus(GamePhase.IDLE);
    setFleetReady(false);
    setOpponentFleetReady(false);
    setRoomReady(false);
    setOpponentRoomReady(false);
    router.replace('/');
  }, [socket, setRoomId, setOpponent, setGameStatus, setFleetReady, setOpponentFleetReady, setRoomReady, setOpponentRoomReady, router]);



  const startPve = useCallback((name: string, mode?: string) => {
    if (socket) {
      socket.emit('start_pve', { 
          name, 
          userId: user?.id,
          mode: mode || 'classic' 
      });
      setIsPlayingPvE(true);
    }
  }, [socket, user, setIsPlayingPvE]);

  const endPve = useCallback(() => {
    if (socket) {
      socket.emit('end_pve');
      setIsPlayingPvE(false);
    }
  }, [socket, setIsPlayingPvE]);

  const emitRoomReady = useCallback((ready: boolean) => {
    if (socket) socket.emit('player_room_ready', { ready });
  }, [socket]);

  const emitStartMatch = useCallback(() => {
    if (socket) socket.emit('room_start_match');
  }, [socket]);



  const updatePlayerName = useCallback((name: string) => {
    if (socket && name) {
        socket.emit('set_name', name);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, isConnected, isInitialLoad, joinRandomRoom, joinSpecificRoom, createRoom, 
      emitMove, emitFleetReady, emitUnready, emitRematchRequest, 
      emitRematchAccept, onRematchRequested, onRematchAccepted,
      leaveRoom, startPve, endPve,
      emitRoomReady, emitStartMatch,
      updatePlayerName, clientId
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

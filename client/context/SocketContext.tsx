"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGame, GamePhase } from './GameContext';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRandomRoom: (nameOverride?: string, fleet?: any[]) => void;
  joinSpecificRoom: (targetId: string, nameOverride?: string, fleet?: any[]) => void;
  createRoom: (nameOverride?: string, fleet?: any[]) => void;
  emitMove: (r: number, c: number) => void;
  // emitAttackResult removed - Server Authoritative
  notifyDefeat: () => void;
  emitFleetReady: (fleet: any[]) => void;
  emitUnready: () => void; // Added
  emitRematchRequest: () => void;
  emitRematchAccept: () => void;
  onRematchRequested: (callback: (data: { from: string }) => void) => void;
  onRematchAccepted: (callback: () => void) => void;
  leaveMatchmaking: () => void;
  leaveRoom: () => void;
  onOpponentLeft: (callback: () => void) => void;
  onOpponentUnready: (callback: () => void) => void; // Added
  
  startPve: (name: string) => void;
  endPve: () => void;
  
  emitRoomReady: (ready: boolean) => void;
  onRoomReadyUpdated: (callback: (data: { playerId: string, ready: boolean }) => void) => void;
  emitStartMatch: () => void;
  onMatchStart: (callback: () => void) => void;
  clientId: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Hardcoded for now, should be env var in production
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { 
    gameState, setRoomId, setOpponent, setGameStatus, 
    setTurn, addLog, setOpponentFleetReady, setFleetReady,
    setIsPlayingPvE, setRoomReady, setOpponentRoomReady,
    setOpponentStatus 
  } = useGame();

  // Grace period for initial connection
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Server Disconnection / Crash
  useEffect(() => {
    if (!isInitialLoad && !isConnected && pathname !== '/') {
      console.warn('SERVER DISCONNECTED. ABORTING MISSION.');
      alert(t('server_down_msg'));
      router.push('/');
    }
  }, [isConnected, pathname, router, t, isInitialLoad]);

  useEffect(() => {
    // Persistent clientId
    let clientId = localStorage.getItem('battleship_clientId');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('battleship_clientId', clientId);
    }

    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      auth: { clientId }
    });
    setClientId(clientId);

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      setIsConnected(true);
      
      // HARD RESET ROOM STATE on reconnect to avoid ghost data
      setRoomId(null);
      setOpponent(null);
      setGameStatus(GamePhase.IDLE);
      setOpponentFleetReady(false);
      setRoomReady(false);
      setOpponentRoomReady(false);
    });

    s.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Room events
    s.on('room_joined', (data: { roomId: string, opponent?: any }) => {
      console.log('SERVER: room_joined event received for room:', data.roomId, 'Opponent data:', !!data.opponent);
      setRoomId(data.roomId);
      if (data.opponent) {
        setOpponent(data.opponent);
        // User joining a room with opponent -> Reset Ready Status
        setFleetReady(false);
      }
      setGameStatus(GamePhase.MATCHMAKING);
    });

    s.on('opponent_joined', (opponent: any) => {
      console.log('SERVER: opponent_joined event received:', opponent.name);
      setOpponent(opponent);
      // Opponent joining my room -> Reset Ready Status
      setFleetReady(false);
      setOpponentFleetReady(false);
      setRoomReady(false);
      setOpponentRoomReady(false);
      // Stay in 'waiting' status until 'game_start'
    });

    s.on('game_start', (data: { firstTurn: 'player' | 'opponent' }) => {
      console.log('SERVER: game_start event received. First turn:', data.firstTurn);
      setTurn(data.firstTurn);
      setGameStatus(GamePhase.PLAYING);
    });

    s.on('waiting_for_opponent', () => {
      console.log('Waiting for opponent...');
      setGameStatus(GamePhase.MATCHMAKING);
      setRoomId('waiting-room');
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

    // GLOBAL HANDLER: opponent_left - single source of truth cleanup
    s.on('opponent_left', () => {
      console.warn('[SOCKET] Opponent left room - cleaning up state');
      setOpponent(null);
      setOpponentFleetReady(false);
      setOpponentRoomReady(false);
      setOpponentStatus('disconnected');
      setGameStatus(GamePhase.MATCHMAKING);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [setRoomId, setOpponent, setGameStatus, setTurn, addLog, setOpponentFleetReady, setRoomReady, setOpponentRoomReady, setOpponentStatus, setFleetReady]);

  const joinRandomRoom = useCallback((nameOverride?: string, fleet?: any[]) => {
    if (socket) socket.emit('join_random', { name: nameOverride || gameState.playerName, fleet });
  }, [socket, gameState.playerName]);

  const joinSpecificRoom = useCallback((targetId: string, nameOverride?: string, fleet?: any[]) => {
    if (socket) socket.emit('join_specific', { name: nameOverride || gameState.playerName, targetId, fleet });
  }, [socket, gameState.playerName]);

  const createRoom = useCallback((nameOverride?: string, fleet?: any[]) => {
    if (socket) socket.emit('create_room', { name: nameOverride || gameState.playerName, fleet });
  }, [socket, gameState.playerName]);

  const emitMove = useCallback((r: number, c: number) => {
    if (socket) socket.emit('fire_shot', { r, c, name: gameState.playerName });
  }, [socket, gameState.playerName]);

  /* emitAttackResult removed */
  
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

  const leaveMatchmaking = useCallback(() => {
    if (socket) socket.emit('leave_matchmaking');
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) socket.emit('leave_room');
    
    // CLIENT CLEANUP IMMEDIATELY - don't wait for server response
    setRoomId(null);
    setOpponent(null);
    setGameStatus(GamePhase.IDLE);
    setFleetReady(false);
    setOpponentFleetReady(false);
    setRoomReady(false);
    setOpponentRoomReady(false);
  }, [socket, setRoomId, setOpponent, setGameStatus, setFleetReady, setOpponentFleetReady, setRoomReady, setOpponentRoomReady]);

  const onOpponentLeft = useCallback((callback: () => void) => {
    if (socket) socket.on('opponent_left', callback);
  }, [socket]);

  const onOpponentUnready = useCallback((callback: () => void) => {
    if (socket) socket.on('opponent_unready', callback);
  }, [socket]);

  const notifyDefeat = useCallback(() => {
    if (socket) socket.emit('player_defeat');
  }, [socket]);

  const startPve = useCallback((name: string) => {
    if (socket) {
      socket.emit('start_pve', { name });
      setIsPlayingPvE(true);
    }
  }, [socket, setIsPlayingPvE]);

  const endPve = useCallback(() => {
    if (socket) {
      socket.emit('end_pve');
      setIsPlayingPvE(false);
    }
  }, [socket, setIsPlayingPvE]);

  const emitRoomReady = useCallback((ready: boolean) => {
    if (socket) socket.emit('player_room_ready', { ready });
  }, [socket]);

  const onRoomReadyUpdated = useCallback((callback: (data: { playerId: string, ready: boolean }) => void) => {
    if (socket) socket.on('room_ready_update', callback);
  }, [socket]);

  const emitStartMatch = useCallback(() => {
    if (socket) socket.emit('room_start_match');
  }, [socket]);

  const onMatchStart = useCallback((callback: () => void) => {
    if (socket) socket.on('match_start_init', callback);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, isConnected, joinRandomRoom, joinSpecificRoom, createRoom, 
      emitMove, notifyDefeat, emitFleetReady, emitUnready, emitRematchRequest, 
      emitRematchAccept, onRematchRequested, onRematchAccepted, leaveMatchmaking,
      leaveRoom, onOpponentLeft, onOpponentUnready, startPve, endPve,
      emitRoomReady, onRoomReadyUpdated, emitStartMatch, onMatchStart,
      clientId
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

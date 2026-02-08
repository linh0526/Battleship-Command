"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Orientation = 'horizontal' | 'vertical';

export interface ShipInstance {
  name: string;
  size: number;
  id: string;
  row: number;
  col: number;
  orientation: Orientation;
  icon: string;
  shipBgColor: string;
  shipTextColor: string;
  shipBorderColor: string;
}

export interface LogEntry {
  time: string;
  msg: string;
  result: string;
  type: 'hit' | 'enemy-hit' | 'miss' | 'sys' | 'info';
}

export enum GamePhase {
  IDLE = 'IDLE',
  MATCHMAKING = 'MATCHMAKING',
  PLACEMENT = 'PLACEMENT',
  PLAYING = 'PLAYING',
  ENDED = 'ENDED',
}

export interface GlobalState {
  playerName: string;
  playerFleet: ShipInstance[];
  isFleetReady: boolean;
  roomId: string | null;
  gameMode: 'PvP' | 'PvE';
  battleLogs: LogEntry[];
  opponent: {
    name: string;
    fleetReady: boolean;
    status: 'connected' | 'disconnected';
  } | null;
  currentTurn: 'player' | 'opponent' | null;
  scores: {
    player: number;
    opponent: number;
  };
  gameStatus: GamePhase;
  isPlayingPvE: boolean;
  isRoomReady: boolean;
  isOpponentRoomReady: boolean;
  battleMode: 'classic' | 'salvo';
}

interface GameContextType {
  gameState: GlobalState;
  setPlayerName: (name: string) => void;
  setPlayerFleet: (fleet: ShipInstance[]) => void;
  setFleetReady: (ready: boolean) => void;
  setRoomId: (id: string | null) => void;
  setGameMode: (mode: 'PvP' | 'PvE') => void;
  setBattleMode: (mode: 'classic' | 'salvo') => void;
  addLog: (log: Omit<LogEntry, 'time'>) => void;
  setOpponent: (opp: GlobalState['opponent']) => void;
  setOpponentStatus: (status: 'connected' | 'disconnected') => void;
  setTurn: (turn: GlobalState['currentTurn']) => void;
  addScore: (winner: 'player' | 'opponent', points: number) => void;
  setGameStatus: (status: GamePhase | 'idle' | 'waiting' | 'playing' | 'ended') => void;
  resetGame: () => void;
  prepareRematch: () => void;
  setOpponentFleetReady: (ready: boolean) => void;
  resetScores: () => void;
  setIsPlayingPvE: (playing: boolean) => void;
  setRoomReady: (ready: boolean) => void;
  setOpponentRoomReady: (ready: boolean) => void;
  t: (key: string) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const INITIAL_STATE: GlobalState = {
    playerName: '',
    playerFleet: [],
    isFleetReady: false,
    roomId: null,
    gameMode: 'PvP',
    battleLogs: [],
    opponent: null,
    currentTurn: null,
    scores: { player: 0, opponent: 0 },
    gameStatus: GamePhase.IDLE,
    isPlayingPvE: false,
    isRoomReady: false,
    isOpponentRoomReady: false,
    battleMode: 'classic'
  };

  const [gameState, setGameState] = useState<GlobalState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Tải dữ liệu từ LocalStorage sau khi mount (Client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('battleship_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Chỉ khôi phục các thông tin cần thiết, reset trạng thái phòng/trận
          setGameState(prev => ({ 
            ...prev, 
            playerName: parsed.playerName || '',
            scores: parsed.scores || { player: 0, opponent: 0 },
            playerFleet: parsed.playerFleet || [],
            gameMode: parsed.gameMode || 'PvP',
            isPlayingPvE: parsed.isPlayingPvE || false,
            roomId: parsed.roomId || null,
            gameStatus: parsed.gameStatus || GamePhase.IDLE,
            isFleetReady: false,
            isRoomReady: false,
            isOpponentRoomReady: false,
            opponent: null,
            battleLogs: []
          }));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Đồng bộ ngược lại LocalStorage khi state thay đổi
  useEffect(() => {
    if (isLoaded) {
      // Chỉ lưu những thông tin cần thiết để tránh lỗi auto-join khi mở lại tab
      const stateToSave = {
        playerName: gameState.playerName,
        scores: gameState.scores,
        playerFleet: gameState.playerFleet,
        gameMode: gameState.gameMode,
        isPlayingPvE: gameState.isPlayingPvE,
        roomId: gameState.roomId,
        gameStatus: gameState.gameStatus
      };
      localStorage.setItem('battleship_state', JSON.stringify(stateToSave));
    }
  }, [gameState.playerName, gameState.scores, gameState.playerFleet, isLoaded]);

  const setPlayerName = useCallback((name: string) => {
    setGameState(prev => ({ ...prev, playerName: name }));
  }, []);

  const setPlayerFleet = useCallback((fleet: ShipInstance[]) => {
    setGameState(prev => ({ ...prev, playerFleet: fleet }));
  }, []);

  const setFleetReady = useCallback((ready: boolean) => {
    setGameState(prev => ({ ...prev, isFleetReady: ready }));
  }, []);

  const setRoomId = useCallback((id: string | null) => {
    setGameState(prev => ({ ...prev, roomId: id }));
  }, []);

  const setGameMode = useCallback((mode: 'PvP' | 'PvE') => {
    setGameState(prev => ({ ...prev, gameMode: mode }));
  }, []);

  const setBattleMode = useCallback((mode: 'classic' | 'salvo') => {
    setGameState(prev => ({ ...prev, battleMode: mode }));
  }, []);

  const addLog = useCallback((log: Omit<LogEntry, 'time'>) => {
    const newLog: LogEntry = {
      ...log,
      time: new Date().toLocaleTimeString('vi-VN', { hour12: false })
    };
    setGameState(prev => ({
      ...prev,
      battleLogs: [newLog, ...prev.battleLogs].slice(0, 50) // Giới hạn 50 logs
    }));
  }, []);

  const setOpponent = useCallback((opp: GlobalState['opponent']) => {
    setGameState(prev => ({ ...prev, opponent: opp }));
  }, []);

  const setTurn = useCallback((turn: GlobalState['currentTurn']) => {
    setGameState(prev => ({ ...prev, currentTurn: turn }));
  }, []);

  const addScore = useCallback((winner: 'player' | 'opponent', points: number) => {
    setGameState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [winner]: prev.scores[winner] + points
      }
    }));
  }, []);

  const setGameStatus = useCallback((status: GamePhase | 'idle' | 'waiting' | 'playing' | 'ended') => {
    let finalStatus: GamePhase;
    
    // If it's already one of the enum values, use it directly
    if (Object.values(GamePhase).includes(status as GamePhase)) {
      finalStatus = status as GamePhase;
    } else if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'waiting': finalStatus = GamePhase.MATCHMAKING; break;
        case 'playing': finalStatus = GamePhase.PLAYING; break;
        case 'ended': finalStatus = GamePhase.ENDED; break;
        case 'idle': default: finalStatus = GamePhase.IDLE; break;
      }
    } else {
      finalStatus = status;
    }
    setGameState(prev => ({ ...prev, gameStatus: finalStatus }));
  }, []);

  const setIsPlayingPvE = useCallback((playing: boolean) => {
    setGameState(prev => ({ ...prev, isPlayingPvE: playing }));
  }, []);

  const setRoomReady = useCallback((ready: boolean) => {
    setGameState(prev => ({ ...prev, isRoomReady: ready }));
  }, []);

  const setOpponentRoomReady = useCallback((ready: boolean) => {
    setGameState(prev => ({ ...prev, isOpponentRoomReady: ready }));
  }, []);

  const resetScores = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      scores: { player: 0, opponent: 0 }
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      playerFleet: [],
      isFleetReady: false,
      roomId: null,
      battleLogs: [],
      opponent: null,
      currentTurn: null,
      gameStatus: GamePhase.IDLE,
      scores: { player: 0, opponent: 0 },
      isPlayingPvE: false,
      isRoomReady: false,
      isOpponentRoomReady: false,
      battleMode: 'classic'
    }));
  }, []);

  const prepareRematch = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      playerFleet: [],
      isFleetReady: false,
      battleLogs: [],
      currentTurn: null,
      gameStatus: GamePhase.MATCHMAKING,
      opponent: prev.opponent ? { ...prev.opponent, fleetReady: false } : null
    }));
  }, []);

  const setOpponentFleetReady = useCallback((ready: boolean) => {
    setGameState(prev => ({
      ...prev,
      opponent: prev.opponent ? { ...prev.opponent, fleetReady: ready } : null
    }));
  }, []);

  const setOpponentStatus = useCallback((status: 'connected' | 'disconnected') => {
    setGameState(prev => ({
      ...prev,
      opponent: prev.opponent ? { ...prev.opponent, status } : null
    }));
  }, []);

  // Placeholder for translation function
  const t = (key: string) => key;

  return (
    <GameContext.Provider value={{
      gameState,
      setPlayerName,
      setPlayerFleet,
      setFleetReady,
      setRoomId,
      setGameMode,
      setBattleMode,
      addLog,
      setOpponent,
      setTurn,
      addScore,
      setGameStatus,
      resetGame,
      prepareRematch,
      setOpponentFleetReady,
      setOpponentStatus,
      resetScores,
      setIsPlayingPvE,
      setRoomReady,
      setOpponentRoomReady,
      t
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

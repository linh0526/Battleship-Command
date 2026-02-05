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

export interface GameState {
  playerName: string;
  playerFleet: ShipInstance[];
  isFleetReady: boolean;
  roomId: string | null;
  gameMode: 'PvP' | 'PvE';
  battleLogs: LogEntry[];
  opponent: {
    name: string;
    fleetReady: boolean;
  } | null;
  currentTurn: 'player' | 'opponent' | null;
  scores: {
    player: number;
    opponent: number;
  };
  gameStatus: 'idle' | 'waiting' | 'playing' | 'ended';
  isPlayingPvE: boolean;
}

interface GameContextType {
  gameState: GameState;
  setPlayerName: (name: string) => void;
  setPlayerFleet: (fleet: ShipInstance[]) => void;
  setFleetReady: (ready: boolean) => void;
  setRoomId: (id: string | null) => void;
  setGameMode: (mode: 'PvP' | 'PvE') => void;
  addLog: (log: Omit<LogEntry, 'time'>) => void;
  setOpponent: (opp: GameState['opponent']) => void;
  setTurn: (turn: GameState['currentTurn']) => void;
  addScore: (winner: 'player' | 'opponent', points: number) => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
  resetGame: () => void;
  prepareRematch: () => void;
  setOpponentFleetReady: (ready: boolean) => void;
  resetScores: () => void;
  setIsPlayingPvE: (playing: boolean) => void;
  t: (key: string) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const initialState: GameState = {
    playerName: 'Commander',
    playerFleet: [],
    isFleetReady: false,
    roomId: null,
    gameMode: 'PvP',
    battleLogs: [],
    opponent: null,
    currentTurn: null,
    scores: { player: 0, opponent: 0 },
    gameStatus: 'idle',
    isPlayingPvE: false
  };

  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Tải dữ liệu từ LocalStorage sau khi mount (Client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('battleship_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Đồng bộ ngược lại LocalStorage khi state thay đổi
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('battleship_state', JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

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

  const setOpponent = useCallback((opp: GameState['opponent']) => {
    setGameState(prev => ({ ...prev, opponent: opp }));
  }, []);

  const setTurn = useCallback((turn: GameState['currentTurn']) => {
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

  const setGameStatus = useCallback((status: GameState['gameStatus']) => {
    setGameState(prev => ({ ...prev, gameStatus: status }));
  }, []);

  const setIsPlayingPvE = useCallback((playing: boolean) => {
    setGameState(prev => ({ ...prev, isPlayingPvE: playing }));
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
      gameStatus: 'idle',
      scores: { player: 0, opponent: 0 },
      isPlayingPvE: false
    }));
  }, []);

  const prepareRematch = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      playerFleet: [],
      isFleetReady: false,
      battleLogs: [],
      currentTurn: null,
      gameStatus: 'waiting',
      opponent: prev.opponent ? { ...prev.opponent, fleetReady: false } : null
    }));
  }, []);

  const setOpponentFleetReady = useCallback((ready: boolean) => {
    setGameState(prev => ({
      ...prev,
      opponent: prev.opponent ? { ...prev.opponent, fleetReady: ready } : null
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
      addLog,
      setOpponent,
      setTurn,
      addScore,
      setGameStatus,
      resetGame,
      prepareRematch,
      setOpponentFleetReady,
      resetScores,
      setIsPlayingPvE,
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

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useGame } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Zap, LogOut, Swords, Timer, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

function MatchingContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { gameState, setRoomReady, setOpponentRoomReady, setGameStatus } = useGame();
  const { 
    socket, isConnected, emitRoomReady, onRoomReadyUpdated, 
    emitStartMatch, onMatchStart, leaveRoom, onOpponentLeft 
  } = useSocket();

  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');

  const [players, setPlayers] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Recovery logic: If URL has room but state doesn't, wait for socket recovery
  // SocketContext already handles server-side recovery on connect.

  // Countdown logic when both ready
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isRoomReady && gameState.isOpponentRoomReady) {
      if (countdown === null) {
        setCountdown(3);
      } else if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else if (countdown === 0) {
        emitStartMatch();
      }
    } else {
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [gameState.isRoomReady, gameState.isOpponentRoomReady, countdown, emitStartMatch]);

  // Safety redirect - ONLY if both state and URL are missing
  useEffect(() => {
    if (!gameState.roomId && !roomFromUrl && isConnected) {
      console.warn('[MATCHING] No room found in state or URL. Aborting.');
      router.push('/');
    }
  }, [gameState.roomId, roomFromUrl, isConnected, router]);

  useEffect(() => {
    if (!socket) return;

    onRoomReadyUpdated(({ playerId, ready }) => {
      if (playerId === socket.id) {
        setRoomReady(ready);
      } else {
        setOpponentRoomReady(ready);
      }
    });

    onMatchStart(() => {
      // Đính kèm ID phòng sang trang placement để giữ liên kết
      router.push(`/placement?room=${gameState.roomId || roomFromUrl}`);
    });

    onOpponentLeft(() => {
      setOpponentRoomReady(false);
    });

    // Cleanup
    return () => {
      socket.off('room_ready_update');
      socket.off('match_start_init');
    };
  }, [socket, onRoomReadyUpdated, onMatchStart, onOpponentLeft, setRoomReady, setOpponentRoomReady, router, gameState.roomId, roomFromUrl]);

  const handleToggleReady = () => {
    const nextReady = !gameState.isRoomReady;
    emitRoomReady(nextReady);
  };

  const handleStartMatch = () => {
    if (gameState.isRoomReady && gameState.isOpponentRoomReady) {
      emitStartMatch();
    }
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 py-10 px-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/20 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-md">
                <span className="text-primary font-mono text-xs font-bold uppercase tracking-wider">ROOM ID: {gameState.roomId || roomFromUrl}</span>
             </div>
             <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{t('connection_active')}</span>
             </div>
          </div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
            {t('squad_lobby').split(' ')[0]} <span className="text-primary">{t('squad_lobby').split(' ')[1]}</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">{t('assemble_commanders')}</p>
        </div>

        <button 
          onClick={handleLeave}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 hover:bg-error/10 border border-slate-800 hover:border-error/30 text-slate-400 hover:text-error transition-all rounded-xl group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">{t('abandon_mission')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
        {/* PLAYER SLOTS */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLAYER 1 (SELF) */}
          <div className={`glass-panel p-8 border-2 transition-all duration-500 ${gameState.isRoomReady ? 'border-primary shadow-[0_0_40px_rgba(25,93,230,0.15)] bg-primary/5' : 'border-slate-800'}`}>
            <div className="flex flex-col h-full gap-8">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/20">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                {gameState.isRoomReady && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('status_ready')}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t('commander_you')}</p>
                <h3 className="text-3xl font-black text-white italic uppercase">{gameState.playerName}</h3>
                <div className="flex items-center gap-4 mt-4 text-slate-500">
                   <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Veteran</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                   <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Ping: 24ms</span>
                   </div>
                </div>
              </div>

              <button 
                onClick={handleToggleReady}
                className={`mt-auto py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  gameState.isRoomReady 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
                  : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                }`}
              >
                {gameState.isRoomReady ? t('cancel_ready') : t('confirm_ready')}
                <ChevronRight className={`w-5 h-5 transition-transform ${gameState.isRoomReady ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* PLAYER 2 (OPPONENT) */}
          <div className={`glass-panel p-8 border-2 transition-all duration-500 ${gameState.isOpponentRoomReady ? 'border-primary shadow-[0_0_40px_rgba(25,93,230,0.15)] bg-primary/5' : 'border-slate-800'}`}>
            {gameState.opponent ? (
              <div className="flex flex-col h-full gap-8">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/40 shadow-lg shadow-secondary/20">
                    <Shield className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {gameState.opponent.status === 'disconnected' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-error/20 border border-error/40 rounded-full text-error animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('lost_connection')}</span>
                      </div>
                    )}
                    {gameState.isOpponentRoomReady && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('status_ready')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t('allied_commander')}</p>
                  <h3 className="text-3xl font-black text-white italic uppercase">{gameState.opponent.name}</h3>
                  <div className="flex items-center gap-4 mt-4 text-slate-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">Elite</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">{t('connection_syncing')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto h-[60px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl italic text-slate-600 font-mono text-xs">
                  {gameState.isOpponentRoomReady ? t('mission_confirmed') : t('waiting_confirmation')}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center p-8 text-center gap-6 border border-dashed border-slate-800 rounded-3xl">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-primary animate-spin"></div>
                <div>
                  <p className="text-white font-black uppercase tracking-widest mb-2 italic">{t('scanning_frequencies')}</p>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest leading-relaxed">{t('waiting_connection')}</p>
                </div>
                <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
                   <p className="text-[10px] font-mono text-slate-500">ENCRYPTION: AES-256-GCM</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS & INFO */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-8 border border-primary/20 space-y-8 bg-gradient-to-br from-[#0f172a] to-[#0a0e1a]">
             <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Timer className="w-6 h-6 text-primary" />
                </div>
                <div>
                   <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">{t('protocol_status')}</p>
                   <p className="text-white font-bold uppercase text-sm italic">{t('pre_match_init')}</p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wider">
                  {t('readiness_desc')}
                </p>

                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Squad Sync</span>
                      <span className={gameState.isRoomReady && gameState.isOpponentRoomReady ? 'text-primary' : 'text-slate-600'}>
                        {gameState.isRoomReady && gameState.isOpponentRoomReady ? '100%' : gameState.isRoomReady || gameState.isOpponentRoomReady ? '50%' : '0%'}
                      </span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: gameState.isRoomReady && gameState.isOpponentRoomReady ? '100%' : gameState.isRoomReady || gameState.isOpponentRoomReady ? '50%' : '5%' }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(25,93,230,0.5)]"
                      />
                   </div>
                </div>
             </div>

             <button 
                onClick={handleStartMatch}
                disabled={!(gameState.isRoomReady && gameState.isOpponentRoomReady)}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 relative overflow-hidden group shadow-2xl ${
                  gameState.isRoomReady && gameState.isOpponentRoomReady
                  ? 'bg-primary text-white hover:bg-blue-600 shadow-primary/30'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
             >
                <motion.div 
                   animate={{ x: gameState.isRoomReady && gameState.isOpponentRoomReady ? ['-100%', '200%'] : '0%' }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="absolute inset-0 bg-white/10 skew-x-12"
                />
                <Swords className={`w-6 h-6 ${gameState.isRoomReady && gameState.isOpponentRoomReady ? 'animate-bounce' : ''}`} />
                <span className="flex items-center gap-2">
                  {t('initiate_deployment')}
                  {countdown !== null && (
                    <motion.span 
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-2 text-2xl font-black bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {countdown}
                    </motion.span>
                  )}
                </span>
             </button>
             
             <p className="text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
               Authorizing Terminal: SEC-TRANS-99
             </p>
          </div>
          
          <div className="glass-panel p-6 border border-slate-800/50 flex items-center justify-between text-slate-500">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Server Latency</span>
                <span className="text-xs font-mono">12ms (Active Connection)</span>
             </div>
             <div className="w-1 h-8 bg-slate-800"></div>
             <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase tracking-widest">Fleet Control</span>
                <span className="text-xs font-mono">Standby</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchingLoading() {
  const { t } = useLanguage();
  return (
    <div className="h-[calc(100vh-140px)] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">
          {t('syncing_connection')}
        </p>
      </div>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<MatchingLoading />}>
      <MatchingContent />
    </Suspense>
  );
}

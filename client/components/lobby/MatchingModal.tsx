"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame, GamePhase } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, Zap, LogOut, Swords, Timer, 
  CheckCircle2, ChevronRight, AlertTriangle, X, Copy, Check 
} from 'lucide-react';

interface MatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchingModal({ isOpen, onClose }: MatchingModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');
  
  const { t } = useLanguage();
  const { gameState, setRoomReady, setOpponentRoomReady } = useGame();
  const { 
    socket, emitRoomReady, emitStartMatch, leaveRoom 
  } = useSocket();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareRoom = () => {
    const roomUrl = `${window.location.origin}/?room=${gameState.roomId || roomFromUrl}`;
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Countdown logic
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



  if (!isOpen) return null;

  const handleToggleReady = () => {
    emitRoomReady(!gameState.isRoomReady);
  };

  const handleLeave = () => {
    leaveRoom();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 bg-slate-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl glass-panel border border-primary/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <div className="px-2 py-0.5 bg-primary/20 border border-primary/40 rounded text-[10px] font-black text-primary uppercase tracking-wider">
                    ROOM: {gameState.roomId || roomFromUrl}
                 </div>
                 <div className={`px-2 py-0.5 border rounded text-[10px] font-black uppercase tracking-wider ${gameState.battleMode === 'salvo' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'}`}>
                    {t(`mode_${gameState.battleMode}`)}
                 </div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                {t('squad_lobby')}
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={handleShareRoom}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-primary transition-all rounded-xl group"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{copied ? t('copied') : t('share_room')}</span>
              </button>

              <button 
                onClick={handleLeave}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-error/10 border border-slate-700 hover:border-error/30 text-slate-400 hover:text-error transition-all rounded-xl group"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('abandon_mission')}</span>
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Player Self */}
           <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col ${gameState.isRoomReady ? 'border-primary bg-primary/5 shadow-[0_0_40px_rgba(25,93,230,0.2)]' : 'border-slate-800 bg-slate-900/40'}`}>
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/20">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                {gameState.isRoomReady && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('status_ready')}
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{t('commander_you')}</p>
              <h3 className="text-4xl font-black text-white italic uppercase mb-8 truncate leading-none">{gameState.playerName}</h3>
              
              <button 
                onClick={handleToggleReady}
                className={`w-full py-6 mt-auto rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  gameState.isRoomReady 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
                  : 'bg-primary hover:bg-blue-600 text-white shadow-primary/20'
                }`}
              >
                {gameState.isRoomReady ? t('cancel_ready') : t('confirm_ready')}
                <ChevronRight className={`w-6 h-6 transition-transform ${gameState.isRoomReady ? 'rotate-180' : ''}`} />
              </button>
           </div>

           {/* Opponent */}
           <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col ${gameState.isOpponentRoomReady ? 'border-primary bg-primary/5 shadow-[0_0_40px_rgba(25,93,230,0.2)]' : 'border-slate-800 bg-slate-900/40'}`}>
              {gameState.opponent ? (
                <>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/40 shadow-lg shadow-secondary/20">
                      <Shield className="w-8 h-8 text-secondary" />
                    </div>
                    {gameState.isOpponentRoomReady && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('status_ready')}
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{t('allied_commander')}</p>
                  <h3 className="text-4xl font-black text-white italic uppercase mb-8 truncate leading-none">{gameState.opponent.name}</h3>
                  <div className="mt-auto py-8 flex items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl italic text-slate-400 font-bold text-sm uppercase tracking-[0.1em]">
                    {gameState.isOpponentRoomReady ? t('mission_confirmed') : t('waiting_confirmation')}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-10 border-2 border-dashed border-slate-800/40 rounded-3xl">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary/50" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase italic tracking-widest mb-2">{t('scanning_frequencies')}</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">{t('waiting_connection')}</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Footer info */}
        <div className="p-8 bg-slate-900/60 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                 <Timer className="w-6 h-6 text-primary" />
              </div>
              <div>
                 <p className="text-white text-xs font-black uppercase tracking-widest leading-none mb-1">{t('pre_match_init')}</p>
                 <p className="text-slate-500 text-[10px] uppercase font-black italic">{t('protocol_status')}: STANDBY</p>
              </div>
           </div>

           {countdown !== null ? (
              <div className="flex items-center gap-6 bg-primary px-8 py-4 rounded-2xl shadow-2xl shadow-primary/30 ring-2 ring-white/10">
                 <Swords className="w-6 h-6 text-white" />
                 <span className="text-white font-black uppercase tracking-[0.3em] text-lg">
                    {t('initiate_deployment')}
                 </span>
                 <motion.div 
                   key={countdown}
                   initial={{ scale: 1.5, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center font-black text-2xl shadow-inner"
                 >
                    {countdown}
                 </motion.div>
              </div>
           ) : (
              <div className="flex items-center gap-8">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('readiness_desc')}</span>
                    <div className="flex gap-2">
                       <motion.div 
                        animate={{ opacity: gameState.isRoomReady ? 1 : 0.3 }}
                        className={`w-4 h-1.5 rounded-full ${gameState.isRoomReady ? 'bg-primary' : 'bg-slate-700'}`} 
                       />
                       <motion.div 
                        animate={{ opacity: gameState.isOpponentRoomReady ? 1 : 0.3 }}
                        className={`w-4 h-1.5 rounded-full ${gameState.isOpponentRoomReady ? 'bg-primary' : 'bg-slate-700'}`} 
                       />
                    </div>
                 </div>
              </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}

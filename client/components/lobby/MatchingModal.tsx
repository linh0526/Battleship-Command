"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame, GamePhase } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, Zap, LogOut, Swords, Timer, 
  CheckCircle2, ChevronRight, AlertTriangle, X 
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
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
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
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {t('squad_lobby')}
              </h2>
           </div>
           
           <button 
              onClick={handleLeave}
              className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
           >
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Player Self */}
           <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${gameState.isRoomReady ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(25,93,230,0.15)]' : 'border-slate-800 bg-slate-900/40'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                {gameState.isRoomReady && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('status_ready')}
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{t('commander_you')}</p>
              <h3 className="text-xl font-black text-white italic uppercase mb-6 truncate">{gameState.playerName}</h3>
              
              <button 
                onClick={handleToggleReady}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  gameState.isRoomReady 
                  ? 'bg-slate-800 text-slate-400' 
                  : 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/20'
                }`}
              >
                {gameState.isRoomReady ? t('cancel_ready') : t('confirm_ready')}
                <ChevronRight className={`w-4 h-4 ${gameState.isRoomReady ? 'rotate-180' : ''}`} />
              </button>
           </div>

           {/* Opponent */}
           <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${gameState.isOpponentRoomReady ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(25,93,230,0.15)]' : 'border-slate-800 bg-slate-900/40'}`}>
              {gameState.opponent ? (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/40">
                      <Shield className="w-6 h-6 text-secondary" />
                    </div>
                    {gameState.isOpponentRoomReady && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('status_ready')}
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{t('allied_commander')}</p>
                  <h3 className="text-xl font-black text-white italic uppercase mb-6 truncate">{gameState.opponent.name}</h3>
                  <div className="h-[52px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl italic text-slate-600 font-mono text-[10px] uppercase">
                    {gameState.isOpponentRoomReady ? t('mission_confirmed') : t('waiting_confirmation')}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-4">
                  <div className="w-12 h-12 border-2 border-slate-800 border-t-primary rounded-full animate-spin"></div>
                  <div>
                    <p className="text-white text-xs font-black uppercase italic">{t('scanning_frequencies')}</p>
                    <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-1">{t('waiting_connection')}</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-900/60 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                 <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                 <p className="text-white text-[11px] font-black uppercase tracking-wider">{t('pre_match_init')}</p>
                 <p className="text-slate-500 text-[9px] uppercase font-bold">{t('protocol_status')}: STANDBY</p>
              </div>
           </div>

           {countdown !== null ? (
              <div className="flex items-center gap-4 bg-primary px-6 py-3 rounded-xl shadow-xl shadow-primary/20 animate-pulse">
                 <Swords className="w-5 h-5 text-white" />
                 <span className="text-white font-black uppercase tracking-[0.2em] text-sm">
                    {t('initiate_deployment')}
                 </span>
                 <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center font-black text-lg">
                    {countdown}
                 </div>
              </div>
           ) : (
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{t('readiness_desc')}</span>
                    <div className="flex gap-1 mt-1">
                       <div className={`w-3 h-1 rounded-full ${gameState.isRoomReady ? 'bg-primary' : 'bg-slate-800'}`}></div>
                       <div className={`w-3 h-1 rounded-full ${gameState.isOpponentRoomReady ? 'bg-primary' : 'bg-slate-800'}`}></div>
                    </div>
                 </div>
                 <button 
                    onClick={handleLeave}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-error/10 border border-transparent hover:border-error/20 text-slate-500 hover:text-error transition-all rounded-lg text-[10px] font-black uppercase tracking-widest"
                 >
                    <LogOut className="w-3 h-3" />
                    {t('abandon_mission')}
                 </button>
              </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}

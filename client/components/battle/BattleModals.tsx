import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Trophy, AlertTriangle, Search, LogOut, Swords } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { GamePhase } from '@/context/GameContext';

interface BattleModalsProps {
  showTurnNotify: boolean;
  setShowTurnNotify: (show: boolean) => void;
  currentTurn: 'player' | 'opponent' | null;
  gameStatus: GamePhase;
  onCancelSearch: () => void;
  gameResult: 'win' | 'loss' | null;
  gameMode: string;
  opponentWantsRematch: boolean;
  rematchRequested: boolean;
  rematchTimer: number;
  onRematch: () => void;
  onReturnToBase: () => void;
  showOpponentLeftModal: boolean;
  setShowOpponentLeftModal: (show: boolean) => void;
  onExitToLobby: () => void;
  showAbortModal: boolean;
  setShowAbortModal: (show: boolean) => void;
  onConfirmAbort: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 }
};

const notifyVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.2, y: 20 }
};

export default function BattleModals({
  showTurnNotify,
  setShowTurnNotify,
  currentTurn,
  gameStatus,
  onCancelSearch,
  gameResult,
  gameMode,
  opponentWantsRematch,
  rematchRequested,
  rematchTimer,
  onRematch,
  onReturnToBase,
  showOpponentLeftModal,
  setShowOpponentLeftModal,
  onExitToLobby,
  showAbortModal,
  setShowAbortModal,
  onConfirmAbort
}: BattleModalsProps) {
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      
      // RULE: If Opponent Left modal is showing, ESC is disabled.
      if (showOpponentLeftModal) return;

      if (showTurnNotify) setShowTurnNotify(false);
      if (gameStatus === GamePhase.MATCHMAKING) onCancelSearch();
      if (showAbortModal) setShowAbortModal(false);
      if (gameResult) onReturnToBase();
    };
    
    const isAnyVisible = showTurnNotify || gameStatus === GamePhase.MATCHMAKING || showOpponentLeftModal || showAbortModal || gameResult;
    
    if (isAnyVisible) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showTurnNotify, gameStatus, showOpponentLeftModal, showAbortModal, gameResult, setShowTurnNotify, onCancelSearch, setShowOpponentLeftModal, setShowAbortModal, onReturnToBase]);

  return (
    <AnimatePresence>
      {showTurnNotify && (
        <motion.div 
          variants={notifyVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setShowTurnNotify(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto cursor-pointer"
        >
          <div className="bg-primary/20 backdrop-blur-xl border-y border-primary/40 w-full py-12 flex flex-col items-center gap-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
             <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
             <motion.div 
               initial={{ x: -200, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="flex items-center gap-6 relative z-10"
             >
                <Swords className="w-12 h-12 text-primary glow-primary" />
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black text-white uppercase italic tracking-tighter text-center">
                    {currentTurn === 'player' ? t('you_go_first') : t('enemy_go_first')}
                  </span>
                  <span className="text-xs font-bold text-primary tracking-[0.8em] uppercase text-center mt-2">{t('neural_link')}</span>
                </div>
                <Swords className="w-12 h-12 text-primary glow-primary scale-x-[-1]" />
             </motion.div>
          </div>
        </motion.div>
      )}

      {/* WAITING FOR OPPONENT OVERLAY */}
      {gameStatus === GamePhase.MATCHMAKING && (
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onCancelSearch}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#060912]/95 backdrop-blur-md cursor-pointer"
        >
           <div className="flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-800 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="w-24 h-24 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full absolute inset-0 animate-[spin_1.5s_linear_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wind className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                   {t('finding_opponent')}
                 </h2>
                 <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                   {t('scanning_freq')}
                 </p>
              </div>
              <button 
                onClick={onCancelSearch}
                className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 hover:border-slate-500"
              >
                {t('cancel')}
              </button>
           </div>
        </motion.div>
      )}

      {gameResult && (
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          onClick={onReturnToBase}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#060912]/90 backdrop-blur-md p-6 cursor-pointer"
        >
          <motion.div 
             variants={modalVariants}
             initial="hidden"
             animate="visible"
             onClick={(e) => e.stopPropagation()}
             className={`glass-panel max-w-md w-full p-8 flex flex-col items-center gap-6 border-2 ${
               gameResult === 'win' ? 'border-primary/50 bg-primary/5' : 'border-error/50 bg-error/5'
             }`}
          >
             <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
               gameResult === 'win' ? 'bg-primary/20 text-primary glow-primary' : 'bg-error/20 text-error glow-error'
             }`}>
                {gameResult === 'win' ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
             </div>
             
             <div className="text-center">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                   {gameResult === 'win' ? t('victory') : t('defeat')}
                </h2>
                <p className="text-slate-400 font-medium">
                   {gameResult === 'win' 
                    ? t('victory_desc')
                    : t('defeat_desc')}
                </p>
             </div>

              <div className="flex flex-col w-full gap-3">
               <button 
                 onClick={onRematch}
                 className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest transition-all"
               >
                 {gameMode === 'PvP' ? (
                   opponentWantsRematch ? t('rematch_accept') : 
                   rematchRequested ? t('waiting_opponent_rematch') : `${t('rematch_btn')} (${rematchTimer}s)`
                 ) : `${t('redeploy_btn')} (${rematchTimer}s)`}
               </button>
               <button 
                 onClick={onReturnToBase}
                 className="w-full py-3 text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-all text-xs"
               >
                 {t('return_to_base')}
               </button>
             </div>
          </motion.div>
        </motion.div>
      )}

      {showOpponentLeftModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            // Click outside disabled as per user request
          />
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-panel p-8 bg-slate-900 border-error/20 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6 border border-error/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-10 h-10 text-error animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">
              {t('opponent_left_title')}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed uppercase tracking-wider">
              {t('opponent_left_desc')}
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={onRematch}
                className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                <Swords className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('keep_fighting')}
              </button>
              <button
                onClick={onExitToLobby}
                className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('exit_to_lobby')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAbortModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowAbortModal(false)}
          />
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-panel p-8 bg-slate-900 border-error/20 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6 border border-error/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-10 h-10 text-error animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">
              {t('abort_title')}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed uppercase tracking-wider">
              {t('abort_description')}
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => setShowAbortModal(false)}
                className="w-full py-4 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/10"
              >
                {t('keep_fighting')}
              </button>
              
              <button
                onClick={onConfirmAbort}
                className="w-full py-4 bg-error text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-error/20 flex items-center justify-center gap-3 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('confirm_abort')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Trophy, AlertTriangle, Search, LogOut, Swords } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { GamePhase, useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

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
  stats?: {
    player: {
      totalShots: number;
      hits: number;
      accuracy: number;
      sunkShips: number;
    };
    opponent: {
      totalShots: number;
      hits: number;
      accuracy: number;
      sunkShips: number;
    };
  };
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
  onConfirmAbort,
  stats
}: BattleModalsProps) {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      
      // RULE: If Opponent Left modal is showing, ESC is disabled.
      if (showOpponentLeftModal) return;

      if (showTurnNotify) setShowTurnNotify(false);
      if (gameStatus === GamePhase.WAITING) onCancelSearch();
      if (showAbortModal) setShowAbortModal(false);
      if (gameResult) onReturnToBase();
    };
    
    const isAnyVisible = showTurnNotify || gameStatus === GamePhase.WAITING || showOpponentLeftModal || showAbortModal || gameResult;
    
    if (isAnyVisible) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showTurnNotify, gameStatus, showOpponentLeftModal, showAbortModal, gameResult, setShowTurnNotify, onCancelSearch, setShowOpponentLeftModal, setShowAbortModal, onReturnToBase]);

  return (
    <AnimatePresence>
      {showTurnNotify && (
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: ['-100%', '0%', '0%', '100%'] }}
          transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
          onAnimationComplete={() => setShowTurnNotify(false)}
          className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Main Sweep Bar */}
          <div className="absolute inset-x-0 h-[60vh] bg-[#060912] border-y-4 border-primary/20 flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.8)]">
             {/* Secondary accent bars */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
             
             <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex flex-col items-center gap-2"
             >
                <div className="flex items-center gap-8">
                  <Swords className={`w-16 h-16 ${currentTurn === 'player' ? 'text-primary glow-primary' : 'text-red glow-error'}`} />
                  <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter text-center scale-y-110">
                    {currentTurn === 'player' ? t('your_turn') : t('enemy_turn')}
                  </h2>
                  <Swords className={`w-16 h-16 ${currentTurn === 'player' ? 'text-primary glow-primary' : 'text-red glow-error'} scale-x-[-1]`} />
                </div>
                <div className={`h-1 w-64 bg-slate-800 relative overflow-hidden rounded-full mt-4`}>
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`absolute inset-0 ${currentTurn === 'player' ? 'bg-primary' : 'bg-red'}`}
                  />
                </div>
             </motion.div>
          </div>
          
          {/* Subtle trailing edge */}
          <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-20 transform -skew-x-12"></div>
        </motion.div>
      )}

      {/* WAITING FOR OPPONENT OVERLAY */}
      {gameStatus === GamePhase.WAITING && (
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
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#060912]/90 backdrop-blur-md p-6 cursor-pointer overflow-y-auto"
        >
          <motion.div 
             variants={modalVariants}
             initial="hidden"
             animate="visible"
             onClick={(e) => e.stopPropagation()}
             className={`glass-panel max-w-2xl w-full p-8 flex flex-col items-center gap-6 border-2 relative overflow-hidden ${
               gameResult === 'win' ? 'border-primary/50 bg-primary/5' : 'border-error/50 bg-error/5'
             }`}
          >
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>

             <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  gameResult === 'win' ? 'bg-primary/20 text-primary glow-primary' : 'bg-error/20 text-error glow-error'
                }`}>
                    {gameResult === 'win' ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                </div>
                
                <div className="text-center">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-1">
                      {gameResult === 'win' ? t('victory') : t('defeat')}
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {gameResult === 'win' ? t('victory_desc') : t('defeat_desc')}
                    </p>
                </div>
             </div>

             {stats && (
               <div className="w-full flex flex-col gap-6 py-6 border-y border-white/5 relative">
                  {/* Summary Comparison Grid */}
                  <div className="grid grid-cols-3 gap-4 items-center mb-8 border-b border-white/5 pb-6">
                    {/* PLAYER SIDE */}
                    <div className="text-right flex flex-col items-end">
                       <span className={`text-xl font-black uppercase tracking-tight ${gameResult === 'win' ? 'text-emerald-400' : 'text-slate-300'}`}>
                         {gameState.playerName || 'Commander'}
                       </span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                         {isAuthenticated ? t('admiral') : t('guest_commander')}
                       </span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${gameResult === 'win' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                         {gameResult === 'win' ? 'VICTOR' : 'DEFEAT'}
                       </span>
                    </div>

                    {/* VERSUS */}
                    <div className="flex justify-center flex-col items-center gap-1">
                       <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                       <span className="text-sm font-black text-slate-600 italic">VS</span>
                       <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* OPPONENT SIDE */}
                    <div className="text-left flex flex-col items-start">
                       <span className={`text-xl font-black uppercase tracking-tight ${gameResult === 'loss' ? 'text-emerald-400' : 'text-slate-300'}`}>
                         {gameState.opponent?.name || t('opponent')}
                       </span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                         {t('opponent_title')}
                       </span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${gameResult === 'loss' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                         {gameResult === 'loss' ? 'VICTOR' : 'DEFEAT'}
                       </span>
                    </div>
                  </div>

                  {/* Detailed Stats Comparison */}
                  <div className="space-y-4">
                    {[
                      { label: t('total_shots'), p: stats.player.totalShots, o: stats.opponent.totalShots },
                      { label: t('hits'), p: stats.player.hits, o: stats.opponent.hits },
                      { label: t('accuracy'), p: `${stats.player.accuracy}%`, o: `${stats.opponent.accuracy}%`, valP: stats.player.accuracy, valO: stats.opponent.accuracy },
                      { label: t('enemy_ships'), p: stats.player.sunkShips, o: stats.opponent.sunkShips },
                    ].map((row, idx) => (
                      <div key={idx} className="group flex flex-col gap-1">
                        <div className="flex justify-between items-center px-2">
                           <span className={`text-sm font-black transition-all ${typeof row.valP !== 'undefined' ? (row.valP > row.valO ? 'text-primary scale-110' : 'text-slate-400') : (row.p > row.o ? 'text-primary scale-110' : 'text-slate-400')}`}>
                             {row.p}
                           </span>
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{row.label}</span>
                           <span className={`text-sm font-black transition-all ${typeof row.valO !== 'undefined' ? (row.valO > row.valP ? 'text-error scale-110' : 'text-slate-400') : (row.o > row.p ? 'text-error scale-110' : 'text-slate-400')}`}>
                             {row.o}
                           </span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full flex overflow-hidden">
                           <div 
                              className={`h-full bg-primary transition-all duration-1000 delay-300`} 
                              style={{ width: `${(row.valP ?? row.p) / ((row.valP ?? row.p) + (row.valO ?? row.o) || 1) * 100}%` }}
                           ></div>
                           <div 
                              className={`h-full bg-error transition-all duration-1000 delay-300`} 
                              style={{ width: `${(row.valO ?? row.o) / ((row.valP ?? row.p) + (row.valO ?? row.o) || 1) * 100}%` }}
                           ></div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}

              <div className="flex flex-col sm:flex-row w-full gap-4 mt-2">
               <button 
                 onClick={onRematch}
                 className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 text-sm overflow-hidden relative group"
               >
                 <span className="relative z-10 flex items-center justify-center gap-2">
                   <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                   {gameMode === 'PvP' ? (
                     opponentWantsRematch ? t('rematch_accept') : 
                     rematchRequested ? t('waiting_opponent_rematch') : t('rematch_btn')
                   ) : t('redeploy_btn')}
                 </span>
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
               </button>
               <button 
                 onClick={onReturnToBase}
                 className="flex-1 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/20 text-xs flex items-center justify-center gap-2 group"
               >
                 <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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

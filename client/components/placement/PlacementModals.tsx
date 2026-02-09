import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, AlertCircle, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PlacementModalsProps {
  showAbortModal: boolean;
  setShowAbortModal: (show: boolean) => void;
  showOpponentLeftModal: boolean;
  setShowOpponentLeftModal: (show: boolean) => void;
  onConfirmAbort: () => void;
  onExitToLobby: () => void;
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

export default function PlacementModals({
  showAbortModal,
  setShowAbortModal,
  showOpponentLeftModal,
  setShowOpponentLeftModal,
  onConfirmAbort,
  onExitToLobby
}: PlacementModalsProps) {
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showOpponentLeftModal) return; 

      if (showAbortModal) setShowAbortModal(false);
    };
    if (showAbortModal || showOpponentLeftModal) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAbortModal, showOpponentLeftModal, setShowAbortModal, setShowOpponentLeftModal]);

  return (
    <AnimatePresence>
      {/* ABORT CONFIRMATION MODAL */}
      {showAbortModal && (
        <div key="abort-modal-container" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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

      {/* OPPONENT LEFT MODAL */}
      {showOpponentLeftModal && (
        <div key="opponent-left-modal-container" className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            // Non-dismissible
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
              <AlertCircle className="w-10 h-10 text-error animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">
              {t('opponent_left_title')}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed uppercase tracking-wider">
              {t('opponent_left_desc')}
            </p>
            
            <div className="flex flex-col w-full gap-3">
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
    </AnimatePresence>
  );
}

"use client";

import React from 'react';
import { User, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallsignModalProps {
  show: boolean;
  onClose: () => void;
  tempName: string;
  setTempName: (name: string) => void;
  onConfirm: () => void;
  onGenerateRandom: () => void;
  t: (key: string) => string;
}

export default function CallsignModal({
  show,
  onClose,
  tempName,
  setTempName,
  onConfirm,
  onGenerateRandom,
  t
}: CallsignModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-panel max-w-md w-full p-8 border border-primary/30 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t('enter_callsign')}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('identify_commander')}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative flex items-center group/input">
                <User className="absolute left-6 w-5 h-5 text-slate-500 pointer-events-none z-10" />
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={t('placeholder_name')}
                  className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-xl py-4 !pl-16 pr-14 text-white font-bold focus:outline-none focus:border-primary transition-all relative"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
                />
                <button 
                  onClick={onGenerateRandom}
                  className="absolute right-4 p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-800 rounded-lg active:scale-95 z-20"
                  title="Generate Random Callsign"
                >
                  <Dices className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={!tempName.trim()}
                  className="flex-1 py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_20px_rgba(25,93,230,0.3)]"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from 'react';
import { Coffee, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useGame, GamePhase } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';

export default function SupportAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { gameState } = useGame();
  const { t } = useLanguage();

  // Only show on the main lobby page
  if (pathname !== '/') return null;

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white transition-all border border-white/20 group relative overflow-hidden"
        title={t('support_admin')}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <Coffee className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
            className="absolute bottom-full left-0 mb-4 w-72 glass-panel border border-amber-500/30 overflow-hidden"
          >
            {/* Header decoration */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 w-full" />
            
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                  </div>
                  <h3 className="text-amber-500 font-extrabold uppercase text-[10px] tracking-[0.2em]">{t('support_admin')}</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-5">
                <div className="relative group/qr w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)] p-2">
                   <div className="absolute inset-0 border-2 border-amber-500/10 rounded-2xl pointer-events-none group-hover/qr:border-amber-500/30 transition-colors" />
                   <img 
                    src="/qr.jpg" 
                    alt="QR Coffee" 
                    className="w-full h-full object-contain"
                  />
                  {/* Scanning animation overlay */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-[scan_3s_ease-in-out_infinite] z-10" />
                </div>
                
                <div className="space-y-3 text-center">
                  <p className="text-[12px] text-white font-bold leading-relaxed px-2">
                    {t('coffee_msg')}
                  </p>
                  <div className="h-px bg-white/5 w-12 mx-auto" />
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    {t('coffee_thanks')}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle bottom tag */}
            <div className="bg-amber-500/5 py-2 px-4 border-t border-white/5 flex justify-center">
               <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60 font-mono">{t('coffee_status')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0% }
          50% { top: 100% }
        }
      `}</style>
    </div>
  );
}

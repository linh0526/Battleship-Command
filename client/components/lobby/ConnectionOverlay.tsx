"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Home, ServerCrash } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ConnectionOverlayProps {
}

export default function ConnectionOverlay({ }: ConnectionOverlayProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [showActions, setShowActions] = useState(false);


  // Fake Progress Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Stay at 95% until connected
        const increment = Math.random() * 5;
        return Math.min(prev + increment, 95);
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Step changing logic
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 3000), // After 3s
      setTimeout(() => setStep(2), 7000), // After 7s
      setTimeout(() => setShowActions(true), 10000), // After 10s
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const getStepText = () => {
    switch (step) {
      case 0: return t('establishing_uplink');
      case 1: return t('connection_status_wait');
      case 2: return t('connection_status_retry');
      default: return t('taking_longer');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md p-8 flex flex-col items-center text-center gap-8"
      >
        {/* Animated Icon Container */}
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
          ></motion.div>
          
          <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border border-primary/40 flex items-center justify-center shadow-2xl shadow-primary/20">
            {step < 2 ? (
              <Wifi className="w-10 h-10 text-primary animate-pulse" />
            ) : (
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-3">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter py-1">
            {t('connecting_server')}
          </h2>
          <AnimatePresence mode="wait">
            <motion.p 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-sm leading-relaxed"
            >
              {getStepText()}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-4">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary to-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
            
            {/* Animated Scan Line */}
            <motion.div 
              animate={{ left: ["-10%", "110%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            ></motion.div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            <span>{t('uplink_status')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Status Info (Show after 10s) */}
        <AnimatePresence>
          {showActions && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 w-full mt-4"
            >
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                  {t('wait_msg')}
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                    {t('come_back_later')}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] text-slate-700 font-mono tracking-tighter uppercase">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Auto-reconnect active
                  </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technical Info Footnote */}
        <div className="mt-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-slate-700 animate-pulse"></div>
            PROTOCOL ERROR STACK: TCP_TIMEOUT_A72
        </div>
      </motion.div>
    </div>
  );
}

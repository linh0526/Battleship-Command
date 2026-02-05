"use client";

import React from 'react';
import { Play, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface LobbyHeroProps {
  onStartPvP: () => void;
  onStartPvE: () => void;
  onCreateRoom: () => void;
  t: (key: string) => string;
}

export default function LobbyHero({
  onStartPvP,
  onStartPvE,
  onCreateRoom,
  t
}: LobbyHeroProps) {
  return (
    <section className="shrink-0">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-5xl font-black tracking-tight mb-2 text-white italic uppercase"
      >
        {t('deployment_zone')}
      </motion.h1>
      <p className="text-slate-500 font-medium mb-10 uppercase tracking-widest text-xs">
        {t('deployment_desc')}
      </p>

      <div className="flex flex-wrap items-center gap-6 w-full">
        <button 
          onClick={onStartPvP}
          className="flex-1 min-w-[320px] h-[100px] bg-primary hover:bg-blue-600 rounded-2xl flex items-center justify-between px-8 transition-all group relative overflow-hidden shadow-[0_20px_40px_rgba(25,93,230,0.2)]"
        >
          <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Play className="w-8 h-8 fill-white text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black uppercase tracking-tighter text-white italic">{t('quick_play')}</p>
              <p className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em]">{t('ranked_match')}</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onStartPvE}
          className="flex-1 min-w-[320px] h-[100px] bg-slate-900 border border-emerald-500/20 hover:bg-slate-800 rounded-2xl flex items-center justify-between px-8 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldAlert className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black uppercase tracking-tighter text-emerald-400 italic font-black">{t('pve_training')}</p>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-[0.2em]">PBE (Ghost AI Simulated Combat)</p>
            </div>
          </div>
        </button>

        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={onCreateRoom}
            className="flex-1 sm:flex-none px-6 h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:border-slate-500 group"
          >
            <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{t('create_room')}</span>
          </button>
          
          <button className="w-[100px] h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex items-center justify-center transition-all group hover:border-slate-500">
            <RefreshCw className="w-8 h-8 text-slate-500 group-hover:rotate-180 transition-all duration-700 group-hover:text-slate-300" />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from 'react';
import { Play, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface LobbyHeroProps {
  onStartPvP: () => void;
  onStartPvE: () => void;
  onCreateRoom: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export default function LobbyHero({     
  onStartPvP,
  onStartPvE,
  onCreateRoom,
  t
}: LobbyHeroProps) {
  return (
    <section className="shrink-0 p-1">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-4xl font-black tracking-tight mb-1 text-white italic uppercase"
      >
        {t('team_lobby')}
      </motion.h1>
      <p className="text-slate-500 font-medium mb-4 uppercase tracking-widest text-xs">
        {t('create_or_join_squad')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 w-full">
        {/* MAIN ACTION: TEAM LOBBY */}
        <button 
          onClick={onStartPvP}
          className="lg:col-span-5 h-[80px] md:h-[100px] bg-primary hover:bg-blue-600 rounded-2xl flex items-center justify-between px-6 transition-all group relative overflow-hidden shadow-[0_20px_40px_rgba(25,93,230,0.3)]"
        >
          <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Play className="w-6 h-6 md:w-8 md:h-8 fill-white text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black uppercase tracking-tighter text-white italic">{t('team_lobby_btn')}</p>
            </div>
          </div>
        </button>

        {/* SECONDARY ACTION: PvE TRAINING */}
        <button 
          onClick={onStartPvE}
          className="lg:col-span-4 h-[80px] md:h-[100px] bg-slate-900 border border-emerald-500/20 hover:bg-slate-800 rounded-2xl flex items-center justify-between px-6 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-emerald-400 italic">{t('pve_training_title')}</p>
              <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-[0.2em]">{t('ghost_pve')}</p>
            </div>
          </div>
        </button>

        <div className="lg:col-span-3 flex gap-3">
          <button 
            onClick={onCreateRoom}
            className="flex-1 h-[80px] md:h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:border-slate-500 group"
          >
            <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <div className="text-center px-1">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.05em] text-white group-hover:text-primary block whitespace-nowrap leading-tight">{t('create_room')}</span>
              <span className="text-[7px] font-medium text-slate-600 uppercase tracking-widest block mt-0.5">FRIENDLY MATCH</span>
            </div>
          </button>
          
          <button className="w-16 md:w-20 h-[80px] md:h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex items-center justify-center transition-all group hover:border-slate-500">
            <RefreshCw className="w-6 h-6 text-slate-500 group-hover:rotate-180 transition-all duration-700 group-hover:text-slate-300" />
          </button>
        </div>
      </div>
    </section>
  );
}


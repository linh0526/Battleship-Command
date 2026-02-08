"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Play, Shield, Target, Award, ChevronRight, HelpCircle, 
  Layout, Ship, Crosshair, Trophy, Info, AlertOctagon 
} from 'lucide-react';

export default function HowToPlayPage() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] w-full flex justify-center py-12 px-4 sm:px-6 lg:px-10">
      <div className="w-full max-w-[1600px]">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-12"
      >
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Operational Briefing</span>
          </div>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter">
            {t('how_to_play_title').split(' ')[0]} <span className="text-primary">{t('how_to_play_title').split(' ')[1]}</span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-[0.3em] text-sm">
            {t('how_to_play_desc')}
          </p>
        </motion.div>

        {/* DETAILED MANUAL SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Section 1: Overview & Components */}
           <motion.div variants={itemVariants} className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/40">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Layout className="w-6 h-6 text-indigo-400" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic">{t('manual_overview_title')}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 {t('manual_overview_desc')}
              </p>
              <div className="space-y-4 pt-4 border-t border-slate-800">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('manual_components_title')}</h3>
                 <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></div>
                       {t('manual_ocean_grid')}
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></div>
                       {t('manual_target_grid')}
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                       {t('manual_peg_red')}
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                       <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></div>
                       {t('manual_peg_white')}
                    </li>
                 </ul>
              </div>
           </motion.div>

           {/* Section 2: Fleet Composition */}
           <motion.div variants={itemVariants} className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/40">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Ship className="w-6 h-6 text-emerald-400" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic">{t('manual_fleet_title')}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 {t('manual_fleet_desc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 {[
                   { name: t('manual_ship_carrier'), size: 5, color: 'text-indigo-400' },
                   { name: t('manual_ship_battleship'), size: 4, color: 'text-emerald-400' },
                   { name: t('manual_ship_cruiser'), size: 3, color: 'text-amber-400' },
                   { name: t('manual_ship_submarine'), size: 3, color: 'text-fuchsia-400' },
                   { name: t('manual_ship_destroyer'), size: 2, color: 'text-sky-400' }
                 ].map((ship, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
                       <span className={`text-[11px] font-black uppercase tracking-tight ${ship.color}`}>{ship.name.split(':')[0]}</span>
                       <div className="flex gap-0.5">
                          {Array.from({ length: ship.size }).map((_, i) => (
                             <div key={i} className={`w-2.5 h-2.5 rounded-sm bg-slate-800 group-hover:bg-slate-700 transition-colors`}></div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* Section 3: Placement Rules */}
           <motion.div variants={itemVariants} className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/40 lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-10">
                 <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4 text-white">
                       <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Shield className="w-6 h-6 text-amber-400" />
                       </div>
                       <h2 className="text-2xl font-black uppercase italic">{t('manual_placement_title')}</h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                       {t('manual_placement_desc')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 pt-4 border-t border-slate-800">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest col-span-full mb-2">{t('manual_placement_rules_title')}</h3>
                       {[1,2,3,4,5,6].map((num) => (
                          <div key={num} className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase tracking-tight">
                             <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-primary text-[10px]">{num}</div>
                             {t(`manual_rule_${num}`)}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Section 4: Gameplay & Combat */}
           <motion.div variants={itemVariants} className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/40">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Crosshair className="w-6 h-6 text-primary" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic">{t('manual_gameplay_title')}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 {t('manual_gameplay_desc')}
              </p>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-primary/20 space-y-2">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t('neural_feed')}</p>
                 <p className="text-xs text-slate-300 italic font-mono">
                    {t('manual_turn_process')}
                 </p>
              </div>
           </motion.div>

           {/* Section 5: Victory & Sinking */}
           <motion.div variants={itemVariants} className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/40">
              <div className="flex items-center gap-4 text-white">
                 <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center border border-error/20">
                    <AlertOctagon className="w-6 h-6 text-error" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic">{t('manual_sinking_title')}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 {t('manual_sinking_desc')}
              </p>
              <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
                 <div className="flex-1">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">{t('manual_victory_title')}</h3>
                    <p className="text-xs text-slate-500 font-medium">{t('manual_victory_desc')}</p>
                 </div>
                 <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-emerald-500" />
                 </div>
              </div>
           </motion.div>
        </div>

        {/* RE-ORDERED VIDEO SECTION */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-4 px-2">
             <div className="h-px flex-1 bg-slate-800"></div>
             <h2 className="text-xl font-black text-slate-400 uppercase italic tracking-widest">{t('how_to_play_video')}</h2>
             <div className="h-px flex-1 bg-slate-800"></div>
          </div>
          <div className="w-full aspect-video rounded-3xl overflow-hidden border-4 border-slate-800 shadow-[0_0_80px_rgba(25,93,230,0.15)] relative group bg-slate-900">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/tiv6ziliKYs?autoplay=0&controls=1&showinfo=0&rel=0&modestbranding=1" 
              title="Battleship Gameplay & Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>

        {/* CALL TO ACTION */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-12 text-center space-y-8"
        >
          <div className="max-w-[600px] mx-auto space-y-4">
            <h2 className="text-3xl font-black text-white uppercase italic">{t('ready_to_deploy')}</h2>
            <p className="text-slate-500 font-medium">
              The enemy is approaching. Our neural links are synchronized and the fleet is on standby. Admiral, your presence is required on the bridge.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(25,93,230,0.3)] hover:bg-blue-600 transition-all text-sm"
          >
            {t('come_to_battle')}
          </motion.button>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}

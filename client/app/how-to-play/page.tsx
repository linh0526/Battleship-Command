"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Play, Shield, Target, Award, ChevronRight, HelpCircle, 
  Layout, Ship, Crosshair, Trophy, Info, AlertOctagon,
  Anchor, Navigation, Zap, Radio
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HowToPlayPage() {
   const { t } = useLanguage();
   const router = useRouter();
   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
         staggerChildren: 0.15
         }
      }
   };

   const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-20 w-full pb-20"
    >
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="text-center space-y-6 pt-10">
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter py-2">
            {(() => {
              const title = t('how_to_play_title');
              const words = title.split(' ');
              const mid = Math.ceil(words.length / 2);
              return (
                <>
                  {words.slice(0, mid).join(' ')} <span className="text-primary">{words.slice(mid).join(' ')}</span>
                </>
              );
            })()}
          </h1>
          <p className="w-full text-slate-400 font-medium uppercase tracking-[0.4em] text-base md:text-lg max-w-5xl mx-auto leading-relaxed text-center pl-[0.4em]">
            {t('how_to_play_desc')}
          </p>
        </motion.div>

        {/* DETAILED MANUAL SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Section 1: Overview & Components */}
           <motion.div variants={itemVariants} className="glass-panel p-10 md:p-12 border-slate-800 space-y-8 bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Navigation className="w-32 h-32 text-white" />
              </div>
              
              <div className="flex items-center gap-5 text-white relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                    <Layout className="w-7 h-7 text-indigo-400" />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('manual_overview_title')}</h2>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed font-medium relative z-10">
                 {t('manual_overview_desc')}
              </p>
              
              <div className="space-y-6 pt-8 border-t border-slate-800/50 relative z-10">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{t('manual_components_title')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-slate-700 mt-1.5 flex-shrink-0 shadow-sm shadow-slate-900"></div>
                       <p className="text-base text-slate-300 leading-snug">{t('manual_ocean_grid')}</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-slate-700 mt-1.5 flex-shrink-0 shadow-sm shadow-slate-900"></div>
                       <p className="text-base text-slate-300 leading-snug">{t('manual_target_grid')}</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(25,93,230,0.5)]"></div>
                       <p className="text-base text-slate-300 leading-snug">{t('manual_peg_red')}</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-white mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                       <p className="text-base text-slate-300 leading-snug">{t('manual_peg_white')}</p>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Section 2: Fleet Composition */}
           <motion.div variants={itemVariants} className="glass-panel p-10 md:p-12 border-slate-800 space-y-8 bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Anchor className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center gap-5 text-white relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <Ship className="w-7 h-7 text-emerald-400" />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('manual_fleet_title')}</h2>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed font-medium relative z-10">
                 {t('manual_fleet_desc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 relative z-10">
                 {[
                   { name: t('manual_ship_carrier'), size: 5, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                   { name: t('manual_ship_battleship'), size: 4, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                   { name: t('manual_ship_cruiser'), size: 3, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                   { name: t('manual_ship_submarine'), size: 3, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/5' },
                   { name: t('manual_ship_destroyer'), size: 2, color: 'text-sky-400', bg: 'bg-sky-500/5' }
                 ].map((ship, idx) => (
                    <div key={idx} className={`p-5 ${ship.bg} rounded-2xl border border-white/5 flex items-center justify-between group/ship hover:border-white/10 transition-all`}>
                       <span className={`text-sm font-black uppercase tracking-wider ${ship.color}`}>{ship.name.split(':')[0]}</span>
                       <div className="flex gap-1">
                          {Array.from({ length: ship.size }).map((_, i) => (
                             <div key={i} className={`w-3 h-3 rounded bg-slate-800 group-hover/ship:bg-slate-700 transition-colors`}></div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* Section 3: Placement Rules */}
           <motion.div variants={itemVariants} className="glass-panel p-10 md:p-12 border-slate-800 space-y-10 bg-slate-900/40 lg:col-span-2 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-64 h-64 text-white" />
              </div>

              <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                 <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-5 text-white">
                       <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                          <Shield className="w-7 h-7 text-amber-400" />
                       </div>
                       <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('manual_placement_title')}</h2>
                    </div>
                    
                    <p className="text-slate-300 text-xl leading-relaxed font-medium">
                       {t('manual_placement_desc')}
                    </p>
                    
                    <div className="space-y-6">
                       <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t('manual_placement_rules_title')}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {[1,2,3,4,5,6].map((num) => (
                             <div key={num} className="flex items-center gap-5 group/rule">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary text-sm font-black border border-slate-700 group-hover/rule:border-primary/50 transition-colors shadow-lg">
                                  {num}
                                </div>
                                <p className="text-base text-slate-200 font-bold uppercase tracking-tight leading-snug">
                                  {t(`manual_rule_${num}`)}
                                </p>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Section 4: Gameplay & Combat */}
           <motion.div variants={itemVariants} className="glass-panel p-10 md:p-12 border-slate-800 space-y-8 bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Radio className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center gap-5 text-white relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                    <Crosshair className="w-7 h-7 text-primary" />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('manual_gameplay_title')}</h2>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed font-medium relative z-10">
                 {t('manual_gameplay_desc')}
              </p>
              
              <div className="p-8 bg-slate-950/80 rounded-[2rem] border border-primary/20 space-y-4 relative z-10 shadow-2xl">
                 <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">{t('op_log')}</p>
                 <p className="text-lg text-slate-200 italic font-mono leading-relaxed">
                    {t('manual_turn_process')}
                 </p>
              </div>
           </motion.div>

           {/* Section 5: Victory & Sinking */}
           <motion.div variants={itemVariants} className="glass-panel p-10 md:p-12 border-slate-800 space-y-8 bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center gap-5 text-white relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center border border-error/20 shadow-lg shadow-error/5">
                    <AlertOctagon className="w-7 h-7 text-error" />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('manual_sinking_title')}</h2>
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed font-medium relative z-10">
                 {t('manual_sinking_desc')}
              </p>
              
              <div className="flex items-center gap-8 pt-8 border-t border-slate-800/50 relative z-10">
                 <div className="flex-1 space-y-2">
                    <h3 className="text-base font-black text-emerald-400 uppercase tracking-widest">{t('manual_victory_title')}</h3>
                    <p className="text-base text-slate-400 font-medium leading-relaxed">{t('manual_victory_desc')}</p>
                 </div>
                 <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/5">
                    <Trophy className="w-10 h-10 text-emerald-500" />
                 </div>
              </div>
           </motion.div>
        </div>

        {/* RE-ORDERED VIDEO SECTION */}
        <motion.div variants={itemVariants} className="space-y-10 pt-10">
          <div className="flex items-center gap-6 px-4">
             <div className="h-px flex-1 bg-slate-800/50"></div>
             <h2 className="text-2xl font-black text-slate-500 uppercase italic tracking-[0.3em]">{t('how_to_play_video')}</h2>
             <div className="h-px flex-1 bg-slate-800/50"></div>
          </div>
          <div className="w-full aspect-video rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-[0_40px_100px_rgba(25,93,230,0.15)] relative group bg-slate-900">
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
          className="bg-primary/5 border border-primary/20 rounded-[3rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-20 pointer-events-none"></div>
          
          <div className="w-full max-w-4xl mx-auto space-y-6 relative z-10 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight text-center">{t('ready_to_deploy')}</h2>
            <p className="w-full text-slate-400 font-medium text-lg md:text-xl leading-relaxed text-center px-4">
              The enemy is approaching. Our connections are synchronized and the fleet is on standby. Admiral, your presence is required on the bridge.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-16 py-6 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(25,93,230,0.4)] transition-all text-base relative z-10"
          >
            {t('come_to_battle')}
          </motion.button>
        </motion.div>
      </motion.div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Trophy, Search, Loader2, User as UserIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface Commander {
  rank: number;
  name: string;
  winRate: string;
  wins: number;
  matches: number;
  accuracy: number;
  elo: number;
  status: string;
  level: string;
  img: string;
}

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setCommanders(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredCommanders = commanders.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Standings from Rank 4 to 20 for the table (excluding top 3)
  const displayCommanders = searchQuery.trim() 
    ? filteredCommanders 
    : filteredCommanders.slice(3, 20);

  // Personal Standing
  const myStanding = isAuthenticated && user 
    ? commanders.find(c => c.name.toLowerCase() === user.username.toLowerCase()) 
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em]">{t('leaderboard_loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* SECTION HEADER */}
      <section>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white py-2 uppercase italic"
        >
          {t('hall_of_valor')}
        </motion.h1>
        <p className="text-slate-500 font-medium mb-10 text-xs md:text-sm">{t('leaderboard_subtitle')}</p>

        {/* TOP 3 COMMANDERS - TACTICAL COMMAND CARDS */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 mt-12 mb-20 px-4">
           {/* Rank 2 */}
           {filteredCommanders[1] && (
             <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               whileTap={{ scale: 0.98 }}
               className="relative w-full lg:w-72 order-2 lg:order-1 cursor-pointer"
             >
                <div className="glass-panel p-6 border-slate-400/30 bg-slate-900/40 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 bg-slate-400/20 text-slate-400 font-black text-[10px] uppercase italic border-bl border-slate-400/30">RANK 02</div>
                   <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full border-2 border-slate-400/50 p-1 mb-4 shadow-[0_0_20px_rgba(148,163,184,0.3)]">
                        <img src={filteredCommanders[1].img} alt="" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{filteredCommanders[1].name}</h3>
                      <span className="text-[10px] font-mono text-slate-500 mb-6">{filteredCommanders[1].level}</span>
                      <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-white/5 pt-4">
                         <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">{t('elo_rating')}</span>
                            <span className="text-sm font-black text-slate-300">{filteredCommanders[1].elo}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">{t('win_rate')}</span>
                            <span className="text-sm font-black text-emerald-400">{filteredCommanders[1].winRate}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {/* Rank 1 - MAIN HERO */}
           {filteredCommanders[0] && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               whileTap={{ scale: 0.98 }}
               className="relative w-full lg:w-96 order-1 lg:order-2 z-20 cursor-pointer"
             >
                <div className="glass-panel p-8 border-warning/50 bg-slate-950/90 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden group">
                   {/* Scanline Animation */}
                   <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                      <motion.div 
                        animate={{ y: ['-100%', '100%'] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-full h-1/2 bg-gradient-to-b from-transparent via-warning to-transparent"
                      />
                   </div>
                   
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1 bg-warning text-slate-950 font-black text-xs uppercase italic rounded-b-xl shadow-lg z-10">
                      SUPREME COMMANDER
                   </div>

                   <div className="flex flex-col items-center relative z-10 pt-4">
                      <div className="relative mb-6">
                         <div className="w-32 h-32 rounded-3xl border-4 border-warning p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.4)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                           <img src={filteredCommanders[0].img} alt="" className="w-full h-full object-cover rounded-2xl" />
                         </div>
                         <div className="absolute -top-4 -right-4">
                            <Trophy className="w-12 h-12 text-warning fill-warning drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                         </div>
                      </div>

                      <h3 className="text-3xl font-black text-warning mb-1 drop-shadow-sm">{filteredCommanders[0].name}</h3>
                      <div className="flex items-center gap-3 mb-8">
                         <span className="h-px w-8 bg-warning/30"></span>
                         <span className="text-xs font-mono text-warning/70 uppercase tracking-[0.2em]">{filteredCommanders[0].level}</span>
                         <span className="h-px w-8 bg-warning/30"></span>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-4 text-center bg-warning/5 rounded-2xl p-4 border border-warning/10">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('elo_rating')}</span>
                            <span className="text-2xl font-black text-white">{filteredCommanders[0].elo}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('win_rate')}</span>
                            <span className="text-2xl font-black text-emerald-400">{filteredCommanders[0].winRate}</span>
                         </div>
                      </div>
                   </div>

                   {/* Corner Accents */}
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-warning/30"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-warning/30"></div>
                </div>
             </motion.div>
           )}

           {/* Rank 3 */}
           {filteredCommanders[2] && (
             <motion.div 
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               whileTap={{ scale: 0.98 }}
               className="relative w-full lg:w-72 order-3 lg:order-3 cursor-pointer"
             >
                <div className="glass-panel p-6 border-amber-800/30 bg-slate-900/40 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 bg-amber-800/20 text-amber-600 font-black text-[10px] uppercase italic border-bl border-amber-800/30">RANK 03</div>
                   <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full border-2 border-amber-800/50 p-1 mb-4 shadow-[0_0_20px_rgba(153,63,18,0.3)]">
                        <img src={filteredCommanders[2].img} alt="" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{filteredCommanders[2].name}</h3>
                      <span className="text-[10px] font-mono text-slate-500 mb-6">{filteredCommanders[2].level}</span>
                      <div className="w-full grid grid-cols-2 gap-2 text-center border-t border-white/5 pt-4">
                         <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">{t('elo_rating')}</span>
                            <span className="text-sm font-black text-amber-700">{filteredCommanders[2].elo}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">{t('win_rate')}</span>
                            <span className="text-sm font-black text-emerald-400">{filteredCommanders[2].winRate}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}
        </div>
      </section>

      {/* MY STANDING CARD (if authenticated) */}
      {isAuthenticated && myStanding && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden p-[1px] rounded-3xl bg-gradient-to-r from-primary/50 via-transparent to-primary/50 shadow-2xl"
        >
          <div className="glass-panel p-6 md:p-8 bg-slate-950/80 backdrop-blur-xl border-none">
             <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex flex-col items-center">
                   <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/40 p-1">
                         <img src={myStanding.img} alt={myStanding.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="absolute -top-3 -right-3 bg-primary text-white w-10 h-10 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-2 border-slate-900">
                         <span className="text-[8px] leading-tight">NO.</span>
                         <span className="text-sm leading-tight">{myStanding.rank}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                   <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4">
                      <h3 className="text-2xl font-black text-white">{myStanding.name}</h3>
                      <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest italic">{myStanding.level}</span>
                   </div>
                   
                   <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-10">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('elo_rating')}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-primary">{myStanding.elo}</span>
                            <div className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                         </div>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('win_rate')}</span>
                         <span className="text-xl font-black text-emerald-400">{myStanding.winRate}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('matches_label')}</span>
                         <span className="text-xl font-black text-white">{myStanding.matches}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Win Streak</span>
                         <span className="text-xl font-black text-warning">0</span>
                      </div>
                   </div>
                </div>

                <div className="hidden lg:flex flex-col items-center justify-center px-8 border-l border-white/5">
                   <TrendingUp className="w-8 h-8 text-primary/50 mb-2" />
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Operations</span>
                </div>
             </div>
          </div>
        </motion.section>
      )}

      {/* FULL RANKINGS - MATCHED TO OPERATION TABLE STYLE */}
      <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-black uppercase tracking-widest flex items-center gap-3 text-white">
              <Trophy className="w-5 h-5 text-warning" />
              {t('global_standings')}
            </h2>
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
              <input 
                type="text" 
                placeholder={t('search_commander')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-900/50 border border-slate-800 px-8 py-2 rounded-full text-[10px] font-bold focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="glass-panel overflow-x-auto bg-[#1e293b]/10 border-slate-800/50 custom-scroll mb-10">
            <table className="w-full text-[11px] font-bold uppercase tracking-widest min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="px-6 md:px-10 py-5 text-left font-bold">{t('commander')}</th>
                  <th className="px-4 md:px-6 py-5 text-center font-bold">{t('current_elo')}</th>
                  <th className="px-4 md:px-6 py-5 text-center font-bold">{t('matches_label')}</th>
                  <th className="px-4 md:px-6 py-5 text-center font-bold">{t('win_stats')}</th>
                  <th className="px-6 md:px-10 py-5 text-right font-bold">{t('record')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayCommanders.map((cmdr, i) => (
                  <tr key={i} className={`hover:bg-primary/5 transition-colors group ${myStanding?.rank === cmdr.rank ? 'bg-primary/10 border-l-2 border-primary' : ''}`}>
                    <td className="px-6 md:px-10 py-5">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-black mono flex-shrink-0 w-6 ${
                          cmdr.rank <= 3 ? 'text-warning' : 'text-slate-600'
                        }`}>
                          {cmdr.rank < 10 ? `0${cmdr.rank}` : cmdr.rank}
                        </span>
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 overflow-hidden shadow-inner border border-white/5 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                          <img src={cmdr.img} alt={cmdr.name} />
                        </div>
                        <div>
                          <p className="text-white text-[13px] tracking-normal mb-0.5">{cmdr.name}</p>
                          <p className="text-slate-500 text-[9px] font-mono leading-none tracking-normal italic opacity-70">{cmdr.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5 text-center font-mono text-primary text-[13px]">
                       {cmdr.elo}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-center font-mono text-slate-300 text-[13px]">
                       {cmdr.matches}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5 mx-auto max-w-[100px]">
                         <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                              style={{ width: cmdr.winRate }}
                            ></div>
                         </div>
                         <span className="text-[9px] text-slate-500">{cmdr.winRate} {t('ratio')}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-5 text-right">
                      <button className="text-primary hover:text-white transition-all font-black inline-block tracking-normal text-[10px]">{t('profile_btn')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-6 bg-slate-900/40 border-t border-white/5 flex justify-center items-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">{t('fleet_records_footer')}</p>
            </div>
          </div>
        </section>
    </div>
  );
}

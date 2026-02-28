"use client";

import { useState, useEffect } from 'react';
import { Trophy, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

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

        {/* TOP 3 COMMANDERS - SHOWCASED STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {filteredCommanders.slice(0, 3).map((cmdr, i) => (
             <motion.div 
               key={cmdr.name}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden bg-[#1e293b]/20 border-slate-800 ${i === 0 ? 'bg-warning/5 border-warning/20' : ''}`}
             >
                {/* Ranking Emblem */}
                <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  i === 0 ? 'bg-warning text-slate-950' : i === 1 ? 'bg-slate-400 text-slate-950' : 'bg-amber-700 text-white'
                }`}>
                  {cmdr.rank}
                </div>

                <div className="relative mb-6">
                   <div className={`w-24 h-24 rounded-2xl bg-slate-800 border-2 overflow-hidden flex items-center justify-center shadow-2xl ${
                     i === 0 ? 'border-warning' : 'border-slate-700'
                   }`}>
                      <img src={cmdr.img} alt={cmdr.name} />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-xl">
                      {cmdr.level}
                   </div>
                </div>

                <h2 className={`text-xl font-black mb-1 ${i === 0 ? 'text-warning' : 'text-white'}`}>{cmdr.name}</h2>
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mb-6 italic">{t('tactical_lead')}</p>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800/50 pt-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase">{t('win_rate')}</span>
                      <span className="text-sm font-black text-emerald-400">{cmdr.winRate}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase">{t('elo_rating')}</span>
                      <span className="text-sm font-black text-primary">{cmdr.elo}</span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

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
                {filteredCommanders.map((cmdr, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 md:px-10 py-5">
                      <div className="flex items-center gap-4">
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

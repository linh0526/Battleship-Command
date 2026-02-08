"use client";

import { Trophy, Medal, TrendingUp, TrendingDown, Minus, User, Target, Shield, Zap, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const commanders = [
    { rank: 1, name: 'AdmiralSarah', winRate: '84.2%', elo: 2840, trend: 'up', status: 'WAITING', statusColor: 'bg-amber-400', level: 'GEN', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { rank: 2, name: 'SeaWolf99', winRate: '79.8%', elo: 2735, trend: 'up', status: 'IN MATCH', statusColor: 'bg-blue-400', level: 'ADM', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wolf' },
    { rank: 3, name: 'DestroyerX', winRate: '77.5%', elo: 2690, trend: 'down', status: 'ONLINE', statusColor: 'bg-emerald-400', level: 'CPT', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rex' },
    { rank: 4, name: 'Nova_Tactician', winRate: '75.1%', elo: 2580, trend: 'up', status: 'WAITING', statusColor: 'bg-amber-400', level: 'LCDR', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova' },
    { rank: 5, name: 'Storm_Commander', winRate: '72.4%', elo: 2490, trend: 'same', status: 'IN MATCH', statusColor: 'bg-blue-400', level: 'VANG', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Storm' },
    { rank: 6, name: 'Phantom_Ghost', winRate: '70.8%', elo: 2410, trend: 'down', status: 'OFFLINE', statusColor: 'bg-slate-600', level: 'SPEC', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost' },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* SECTION HEADER */}
      <section>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-black tracking-tight mb-2 text-white py-2 uppercase italic"
        >
          {t('hall_of_valor')}
        </motion.h1>
        <p className="text-slate-500 font-medium mb-10">Real-time ranking of Global Fleet Commanders across active combat zones.</p>

        {/* TOP 3 COMMANDERS - SHOWCASED STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {commanders.slice(0, 3).map((cmdr, i) => (
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
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mb-6 italic">Tactical Fleet Lead</p>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800/50 pt-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Win Rate</span>
                      <span className="text-sm font-black text-emerald-400">{cmdr.winRate}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase">ELO Rating</span>
                      <span className="text-sm font-black text-primary">{cmdr.elo}</span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* FULL RANKINGS - MATCHED TO OPERATION TABLE STYLE */}
      <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-white">
              <Trophy className="w-5 h-5 text-warning" />
              Global Standings
            </h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
              <input 
                type="text" 
                placeholder="Search Commander..." 
                className="bg-slate-900/50 border border-slate-800 px-8 py-1.5 rounded-full text-[10px] font-bold focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="glass-panel overflow-hidden bg-[#1e293b]/20 border-slate-800">
            <table className="w-full text-[11px] font-bold uppercase tracking-widest">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="px-10 py-5 text-left font-bold">Commander</th>
                  <th className="px-6 py-5 text-center font-bold">Current ELO</th>
                  <th className="px-6 py-5 text-center font-bold">Win Statistics</th>
                  <th className="px-6 py-5 text-center font-bold">Status</th>
                  <th className="px-6 py-5 text-center font-bold">Trend</th>
                  <th className="px-6 py-5 text-right font-bold pr-10">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {commanders.map((cmdr, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shadow-inner border border-slate-700 flex items-center justify-center">
                          <img src={cmdr.img} alt={cmdr.name} />
                        </div>
                        <div>
                          <p className="text-white text-[13px] tracking-normal mb-0.5">{cmdr.name}</p>
                          <p className="text-slate-500 text-[9px] font-mono leading-none tracking-normal italic">{cmdr.level} // SECTOR 1</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-mono text-primary text-[13px]">
                       {cmdr.elo}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                              style={{ width: cmdr.winRate }}
                            ></div>
                         </div>
                         <span className="text-[10px] text-slate-500">{cmdr.winRate} Ratio</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2 tracking-normal">
                        <div className={`w-2 h-2 rounded-full ${cmdr.statusColor} shadow-[0_0_8px_currentColor]`}></div>
                        <span className="text-slate-300">{cmdr.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       {cmdr.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />}
                       {cmdr.trend === 'down' && <TrendingDown className="w-4 h-4 text-error mx-auto" />}
                       {cmdr.trend === 'same' && <Minus className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-right pr-10">
                      <button className="text-primary hover:text-white transition-all font-black inline-block tracking-normal">PROFILE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-6 bg-slate-900/40 border-t border-slate-800 flex justify-center items-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">-- CLASSIFIED FLEET RECORDS v4.0.2 --</p>
            </div>
          </div>
        </section>
    </div>
  );
}

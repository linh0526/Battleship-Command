"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TopCommandersProps {
  t: (key: string) => string;
}

interface Commander {
  rank: number;
  name: string;
  wins: number;
  matches: number;
  elo: number;
  level: string;
  img: string;
}

export default function TopCommanders({ t }: TopCommandersProps) {
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopCommanders = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setCommanders(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch top commanders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCommanders();
  }, []);

  return (
    <section className="flex flex-col gap-6 shrink-0 p-1">
      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white py-1">
         <Trophy className="w-4 h-4 text-warning" />
         {t('top_commanders')}
      </h3>
      <div className="glass-panel p-6 bg-[#1e293b]/20 border-slate-800 flex flex-col gap-5 min-h-[300px]">
         {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('loading_intel')}</span>
            </div>
         ) : commanders.length > 0 ? (
            commanders.map((pro, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                 <span className={`text-xl font-black transition-colors w-4 ${
                   pro.rank === 1 ? 'text-warning' : pro.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                 }`}>{pro.rank}</span>
                 <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shadow-inner">
                      <img src={pro.img} alt={pro.name} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase text-center whitespace-nowrap ${
                      pro.rank === 1 ? 'bg-warning' : pro.rank === 2 ? 'bg-slate-300' : 'bg-amber-600'
                    }`}>{pro.level}</div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate group-hover:text-primary transition-colors">{pro.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">{pro.elo}</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">CP</span>
                      <span className="text-[10px] text-slate-700 mx-1">|</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{pro.wins} {t('wins_label')}</span>
                    </div>
                 </div>
              </div>
            ))
         ) : (
            <div className="text-center py-8">
              <p className="text-xs font-bold text-slate-600 uppercase italic">{t('no_active_deployments')}</p>
            </div>
         )}

         <Link href="/leaderboard" className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-white text-center transition-all bg-primary/5 py-3 rounded-lg border border-primary/20 hover:bg-primary/10">
           {t('view_full_leaderboard')}
         </Link>
      </div>
    </section>
  );
}


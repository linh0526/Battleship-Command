"use client";

import React from 'react';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

interface TopCommandersProps {
  t: (key: string) => string;
}

export default function TopCommanders({ t }: TopCommandersProps) {
  const commanders = [
    { name: 'AdmiralSarah', xp: '24,500 XP', rank: 1, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { name: 'SeaWolf99', xp: '22,150 XP', rank: 2, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wolf' },
    { name: 'DestroyerX', xp: '21,890 XP', rank: 3, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rex' },
  ];

  return (
    <section className="flex flex-col gap-6 shrink-0">
      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
         <Trophy className="w-4 h-4 text-warning" />
         {t('top_commanders')}
      </h3>
      <div className="glass-panel p-6 bg-[#1e293b]/20 border-slate-800 flex flex-col gap-5">
         {commanders.map((pro, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-pointer">
               <span className="text-xl font-black text-slate-600 group-hover:text-warning transition-colors w-4">{pro.rank}</span>
               <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                    <img src={pro.img} alt={pro.name} />
                  </div>
                  {pro.rank === 1 && <div className="absolute -bottom-1 -right-1 bg-warning text-slate-950 text-[11px] font-black px-1 rounded uppercase">Gen</div>}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{pro.name}</p>
                  <p className="text-xs font-bold text-slate-500">{pro.xp}</p>
               </div>
            </div>
         ))}

         <Link href="/leaderboard" className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-white text-center transition-all bg-primary/5 py-3 rounded-lg border border-primary/20">
           View Full Leaderboard
         </Link>
      </div>
    </section>
  );
}

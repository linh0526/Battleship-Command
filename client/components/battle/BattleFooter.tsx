import React from 'react';
import { Ship } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BattleFooterProps {
  accuracy: number;
  sunkEnemyShips: number;
}

export default function BattleFooter({ accuracy, sunkEnemyShips }: BattleFooterProps) {
  const { t } = useLanguage();
  return (
    <footer className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
       <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/20 rounded-xl border border-white/5">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('accuracy')}</span>
          <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden mx-2">
             <div 
               className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500" 
               style={{ width: `${accuracy}%` }}
             ></div>
          </div>
          <span className="text-sm font-black text-white">{accuracy}%</span>
       </div>

       <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/20 rounded-xl border border-white/5">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('enemy_ships')}</span>
          <div className="flex gap-2 mx-4">
             {[1,2,3,4,5].map(i => (
               <Ship key={i} className={`w-3.5 h-3.5 transition-colors duration-500 ${i <= sunkEnemyShips ? 'text-error drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'text-slate-800'}`} />
             ))}
          </div>
          <span className="text-sm font-black text-white ml-auto">{sunkEnemyShips}/5</span>
       </div>

       <div className="flex items-center gap-4 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('momentum')}</span>
          <p className="text-sm font-black text-primary uppercase italic ml-2 group-hover:translate-x-1 transition-transform">{t('advantage_you')}</p>
           <div className="flex-1 h-3 flex items-center justify-end overflow-hidden opacity-30">
              <svg viewBox="0 0 100 20" className="w-20 h-full">
                 <path d="M 0 10 Q 12 0 25 10 T 50 10 T 75 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary animate-[wave_2s_linear_infinite]" />
              </svg>
           </div>
        </div>
      </footer>
  );
}

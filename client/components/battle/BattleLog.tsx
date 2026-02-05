import React from 'react';
import { History } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LogItem {
    time: string;
    msg: string;
    result: string;
    type: string;
}

interface BattleLogProps {
  logs: LogItem[];
}

export default function BattleLog({ logs }: BattleLogProps) {
  const { t } = useLanguage();
  return (
    <div className="h-[220px] glass-panel bg-slate-950/40 border-slate-800/50 flex flex-col shrink-0">
       <div className="p-3 border-b border-slate-800/20 flex items-center justify-between bg-slate-900/10">
          <div className="flex items-center gap-2">
             <History className="w-3.5 h-3.5 text-slate-500" />
             <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{t('neural_feed')}</span>
          </div>
          <span className="text-xs font-mono text-slate-700 tracking-widest uppercase italic">Lvl 4 Uplink</span>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
          {logs.map((log, i) => (
             <div key={i} className="flex items-start gap-3 pb-2 border-b border-white/[0.02] last:border-0">
                <span className="text-[10px] font-mono text-slate-700 pt-0.5">{log.time}</span>
                <div className="flex flex-col gap-0.5">
                   <p className="text-xs font-black text-slate-400 uppercase leading-none tracking-tight">{log.msg}</p>
                   <p className={`text-[11px] font-bold leading-none ${
                      log.type === 'hit' ? 'text-emerald-500/80' : 
                      log.type === 'enemy-hit' ? 'text-error/80' : 
                      log.type === 'miss' ? 'text-slate-600' : 'text-primary/80'
                   }`}>{log.result}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}

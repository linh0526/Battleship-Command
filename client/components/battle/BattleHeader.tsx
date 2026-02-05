import React from 'react';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BattleHeaderProps {
  currentTurn: 'player' | 'opponent' | null;
  scores: { player: number; opponent: number };
  playerName: string;
  opponentName?: string;
  gameMode: string;
  turnTimer: number;
  onAbort: () => void;
}

export default function BattleHeader({
  currentTurn,
  scores,
  playerName,
  opponentName,
  gameMode,
  turnTimer,
  onAbort
}: BattleHeaderProps) {
  const { t } = useLanguage();
  return (
    <header className="flex items-center justify-between shrink-0 py-2 border-b border-white/5">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-black tracking-[0.3em] text-slate-600 uppercase">
                 {t('score_label')}: <span className="text-white">{scores.player}</span> - <span className="text-white">{scores.opponent}</span>
              </span>
           </div>
           <div className="flex items-baseline gap-3">
              <h1 className="text-xl font-black text-white uppercase tracking-tighter">
                 {playerName || t('commander')} <span className="text-slate-600 mx-1">VS</span> {gameMode === 'PvE' ? t('ghost_ai') : (opponentName || t('opponent'))}
              </h1>
              <span className="text-xs font-bold text-slate-400/50 uppercase tracking-widest">
                {gameMode === 'PvE' ? t('simulation_mode') : t('live_combat')}
              </span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
           <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('status_label')}</span>
           <span className={`text-xl font-black uppercase italic tracking-tight leading-none transition-all ${
             currentTurn === 'player' ? 'text-primary glow-primary' : 'text-slate-600'
           }`}>
             {currentTurn === 'player' ? t('your_turn') : t('enemy_turn')}
           </span>
        </div>
        <div className="h-10 w-px bg-white/5"></div>
        <div className={`flex items-center gap-4 bg-slate-900/30 px-5 py-2 rounded-xl border transition-colors shadow-inner ${
          turnTimer <= 10 ? 'border-error/40' : 
          currentTurn === 'player' ? 'border-emerald-500/20' : 'border-white/10'
        }`}>
           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('timer')}</span>
           <span className={`text-2xl font-mono font-black leading-none ${
             turnTimer <= 10 ? 'text-error animate-pulse' : 
             currentTurn === 'player' ? 'text-emerald-500' : 'text-white'
           }`}>
             00:{turnTimer < 10 ? `0${turnTimer}` : turnTimer}
           </span>
        </div>

        <button 
          onClick={onAbort}
          className="group flex items-center gap-3 bg-error/10 hover:bg-error/20 px-4 py-2.5 rounded-xl border border-error/20 hover:border-error/40 transition-all"
          title={t('abort_title')}
        >
           <LogOut className="w-4 h-4 text-error group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-error uppercase tracking-widest hidden sm:inline">{t('abort_action')}</span>
        </button>
      </div>
    </header>
  );
}

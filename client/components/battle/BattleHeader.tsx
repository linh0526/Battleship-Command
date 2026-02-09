import { useState } from 'react';
import { LogOut, AlertTriangle, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
import SettingsModal from '@/components/settings/SettingsModal';

interface BattleHeaderProps {
  currentTurn: 'player' | 'opponent' | null;
  scores: { player: number; opponent: number };
  playerName: string;
  opponentName?: string;
  opponentStatus?: 'connected' | 'disconnected';
  gameMode: string;
  turnTimer: number;
  onAbort: () => void;
  roomId?: string | null;
}

export default function BattleHeader({
  currentTurn,
  scores,
  playerName,
  opponentName,
  opponentStatus,
  gameMode,
  turnTimer,
  onAbort,
  roomId
}: BattleHeaderProps) {
  const { t } = useLanguage();
  const { gameState } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col md:flex-row items-center md:justify-between shrink-0 pb-3 pt-0 gap-3 border-b border-white/5">
        <div className="w-full md:w-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] text-slate-600 uppercase">
                  <span className="hidden md:inline">{t('score_label')}: </span> <span className="text-white">{scores.player}</span> - <span className="text-red">{scores.opponent}</span>
                </span>
            </div>
            <div className="flex items-baseline gap-2 md:gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-base md:text-xl font-black text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">
                    {playerName || t('commander')} <span className="text-slate-600 mx-1">VS</span> <span className="text-red">{gameMode === 'PvE' ? t('ghost_ai') : (opponentName || t('opponent'))}</span>
                  </h1>
                  {gameMode !== 'PvE' && opponentStatus === 'disconnected' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-error/20 border border-error/40 rounded text-[8px] font-black text-error uppercase tracking-widest animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="hidden xs:inline">{t('lost_connection')}</span>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Turn Indicator for Mobile */}
          <div className="md:hidden flex flex-col items-end">
            <span className="hidden md:block text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{t('status_label')}</span>
            <span className={`text-sm font-black uppercase italic tracking-tight leading-none ${
              currentTurn === 'player' ? 'text-primary' : 'text-red'
            }`}>
              {currentTurn === 'player' ? 'YOUR TURN' : 'ENEMY TURN'}
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 sm:gap-8">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('status_label')}</span>
            <span className={`text-xl font-black uppercase italic tracking-tight leading-none transition-all py-0.5 ${
              currentTurn === 'player' ? 'text-primary glow-primary' : 'text-red glow-error'
            }`}>
              {currentTurn === 'player' ? t('your_turn') : t('enemy_turn')}
            </span>
          </div>
          
          <div className="hidden md:block h-10 w-px bg-white/5 mx-2"></div>
          
          <div className={`flex items-center gap-3 md:gap-4 bg-slate-900/30 px-4 md:px-5 py-2 rounded-xl border transition-colors shadow-inner ${
            turnTimer <= 10 ? 'border-error/40' : 
            currentTurn === 'player' ? 'border-emerald-500/20' : 'border-red/20'
          }`}>
            <span className="hidden md:block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">{t('timer')}</span>
            <span className={`text-xl md:text-2xl font-mono font-black leading-none ${
              turnTimer <= 10 ? 'text-error animate-pulse' : 
              currentTurn === 'player' ? 'text-emerald-500' : 'text-red'
            }`}>
              {turnTimer < 10 ? `0${turnTimer}` : turnTimer}s
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 md:p-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all"
              title={t('settings')}
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button 
              onClick={onAbort}
              className="group flex items-center gap-2 md:gap-3 bg-error/10 hover:bg-error/20 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-error/20 hover:border-error/40 transition-all"
              title={t('abort_title')}
            >
              <LogOut className="w-4 h-4 text-error group-hover:scale-110 transition-transform" />
              <span className="text-[10px] md:text-xs font-black text-error uppercase tracking-widest hidden lg:inline">{t('abort_action')}</span>
            </button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

import React, { useState } from 'react';
import { LogOut, Copy, Check, Settings, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SettingsModal from '@/components/settings/SettingsModal';

interface PlacementHeaderProps {
  gameState: any;
  onAbort: () => void;
}

export default function PlacementHeader({ gameState, onAbort }: PlacementHeaderProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCopyLink = () => {
    if (gameState.roomId) {
      const url = `${window.location.origin}/${gameState.roomId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
    <header className="relative flex flex-col md:flex-row items-center md:justify-between shrink-0 py-4 gap-4 border-b border-white/5 mb-8">
      {/* Top Mobile Row / Left Desktop Section */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-6 z-10 px-2 md:px-0">
        <div className="flex flex-col">
           <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] text-slate-600 uppercase">
                 {t('score')}: <span className="text-white">{gameState.scores.player}</span> - <span className="text-white">{gameState.scores.opponent}</span>
              </span>
           </div>
           <div className="flex items-baseline gap-2 md:gap-3">
              <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">
                 {(gameState.opponent || gameState.gameMode === 'PvE') 
                   ? <>{gameState.playerName || 'Commander'} <span className="text-slate-600 mx-1">VS</span> {gameState.gameMode === 'PvE' ? 'GHOST AI' : gameState.opponent?.name}</>
                   : <>{gameState.playerName || 'Commander'} <span className="text-slate-600 mx-1 text-sm">VS</span> <span className="text-slate-500 italic text-sm lowercase font-normal">{t('searching_opponent')}</span></>
                 }
              </h1>
           </div>
        </div>

        {/* Mobile Status Indicator (Visible only on mobile inside this row) */}
        <div className="md:hidden flex flex-col items-end">
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{t('status_label')}</span>
           <span className="text-sm font-black uppercase italic tracking-tight leading-none text-primary">
             {gameState.gameMode === 'PvE' ? 'Training' : (gameState.isFleetReady ? 'Ready' : 'Placing')}
           </span>
        </div>
      </div>

      {/* Center Room ID Display - Hidden on Mobile, Shown on Desktop */}
      {gameState.roomId && gameState.roomId !== 'waiting-room' && (
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-2xl z-20 pointer-events-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ID:</span>
          <span className="text-lg font-mono font-black text-white tracking-widest">{gameState.roomId}</span>
          <button 
            onClick={handleCopyLink}
            className="ml-2 hover:bg-white/10 p-1.5 rounded-full transition-colors relative group"
            title="Copy Invite Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      )}

      {/* Right Section / Bottom Mobile Row */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 sm:gap-8 z-10 px-2 md:px-0 mt-2 md:mt-0">
        {/* Room ID for Mobile */}
        {gameState.roomId && gameState.roomId !== 'waiting-room' && (
          <div className="lg:hidden flex items-center gap-2 bg-slate-900/40 border border-white/5 px-4 py-1.5 rounded-xl">
             <span className="text-[10px] font-mono font-black text-white/60 tracking-widest">{gameState.roomId}</span>
             <button onClick={handleCopyLink} className="p-1 hover:bg-white/5 rounded-lg">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-primary/60" />}
             </button>
          </div>
        )}

        <div className="hidden md:flex flex-col items-end">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">{t('status_label')}</span>
          <span className="text-xl font-black uppercase italic tracking-tight leading-none text-primary glow-primary">
            {gameState.gameMode === 'PvE' 
              ? t('status_training') 
              : (gameState.isFleetReady ? t('status_ready') : t('room_placing'))
            }
          </span>
        </div>

        <div className="hidden md:block h-10 w-px bg-white/5 mx-2"></div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all"
              title={t('settings')}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
                onClick={onAbort}
                className="group flex items-center gap-3 bg-error/10 hover:bg-error/20 px-4 py-2.5 rounded-xl border border-error/20 hover:border-error/40 transition-all shadow-lg shadow-error/10"
                title="Abort Session"
            >
                <LogOut className="w-4 h-4 text-error group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-error uppercase tracking-widest hidden lg:inline">{t('abort_action')}</span>
            </button>
        </div>
      </div>
    </header>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

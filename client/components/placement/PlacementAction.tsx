import React from 'react';
import { Target, ChevronRight, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PlacementActionProps {
  isFleetComplete: boolean;
  gameState: any;
  handleAction: () => void;
  isReady: boolean; 
}

export default function PlacementAction({
  isFleetComplete,
  gameState,
  handleAction,
  isReady  
}: PlacementActionProps) {
  const { t } = useLanguage();

  const isInRoom = !!gameState.roomId;

  // Button is disabled if:
  // 1. In Room AND Fleet Incomplete (Can't Ready)
  // 2. In Room AND Already Ready (Already Sent)
  const isButtonDisabled = (isInRoom && (!isFleetComplete || gameState.isFleetReady || isReady));

  return (
    <section className="flex flex-col gap-6">
      {!isFleetComplete && isInRoom && (
        <div className="flex items-center gap-3 py-3 px-4 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          {t('units_missing')}
        </div>
      )}
      
      <button 
        disabled={isButtonDisabled}
        onClick={handleAction}
        className={`w-full h-16 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 group
          ${(!isButtonDisabled)
            ? (isInRoom ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_15px_30px_rgba(16,185,129,0.3)]' : 'bg-primary hover:bg-blue-600 text-white shadow-[0_15px_30px_rgba(25,93,230,0.2)]')
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
        `}
      >
        <Target className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        <span>
          {!isInRoom 
            ? t('find_match') 
            : ((gameState.isFleetReady || isReady) 
                ? t('status_waiting') 
                : (gameState.gameMode === 'PvE' ? t('come_to_battle') : t('status_ready')))
          }
        </span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
      {gameState.gameMode !== 'PvE' && (
        <div className="px-2 flex justify-between text-[11px] font-black uppercase text-slate-600 tracking-widest">
          <span>
            {t('status_label')}: {t('status_ready')} ({(gameState.isFleetReady ? 1 : 0) + (gameState.opponent?.fleetReady ? 1 : 0)}/2)
          </span>
        </div>
      )}
    </section>
  );
}

import React from 'react';
import { RotateCw, Zap, Trash2, Dices } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Orientation } from '@/context/GameContext';

interface PlacementControlsProps {
  rotateShip: () => void;
  autoDeploy: () => void;
  clearFleet: () => void;
  selectedShipIndex: number | null;
  selectedOrientation: Orientation;
  gameState: any;
  isReady?: boolean;
}

export default function PlacementControls({
  rotateShip,
  autoDeploy,
  clearFleet,
  selectedShipIndex,
  selectedOrientation,
  gameState,
  isReady
}: PlacementControlsProps) {
  const { t } = useLanguage();

  return (
    <>
    <section className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2 md:gap-3 w-full">
          {/* ROTATE TOOL */}
          <button 
              onClick={rotateShip}
              disabled={selectedShipIndex === null}
              className={`flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl border transition-all text-center lg:text-left group/tool ${
                selectedShipIndex !== null 
                ? 'bg-slate-900 border-slate-800 hover:border-primary' 
                : 'bg-slate-950 border-slate-900/50 opacity-40 cursor-not-allowed'
              }`}
          >
              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                selectedShipIndex !== null ? 'bg-primary/10 border-primary/10 text-primary group-hover/tool:bg-primary group-hover/tool:text-white' : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}>
                  <RotateCw className={`w-4 h-4 lg:w-6 lg:h-6 ${selectedOrientation === 'vertical' ? 'rotate-90' : ''} transition-transform`} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] lg:text-sm font-black text-white uppercase tracking-tight leading-none mb-1 md:mb-0">{t('rotate_ship')}</span>
                 <span className="hidden lg:block text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedOrientation}</span>
              </div>
          </button>

          {/* AUTO DEPLOY TOOL */}
          <button 
              onClick={autoDeploy}
              className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500 group/tool transition-all text-center lg:text-left"
          >
              <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/tool:bg-emerald-500 group-hover/tool:text-white transition-all shrink-0">
                  <Dices className="w-4 h-4 lg:w-6 lg:h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] lg:text-sm font-black text-white uppercase tracking-tight leading-none mb-1 md:mb-0">{t('auto_deploy')}</span>
                 <span className="hidden lg:block text-xs text-emerald-600 font-bold uppercase tracking-widest leading-none">Smart Setup</span>
              </div>
          </button>

          {/* RESET TOOL */}
          <button 
              onClick={clearFleet}
              className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-error group/tool transition-all text-center lg:text-left"
          >
              <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg bg-error/10 border border-error/10 text-error flex items-center justify-center group-hover/tool:bg-error group-hover/tool:text-white transition-all shrink-0">
                  <Trash2 className="w-4 h-4 lg:w-6 lg:h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] lg:text-sm font-black text-white uppercase tracking-tight leading-none mb-1 md:mb-0">{t('reset_board')}</span>
                 <span className="hidden lg:block text-xs text-error/60 font-bold uppercase tracking-widest leading-none">Clear All</span>
              </div>
          </button>
      </div>

      {/* NOTES & INSTRUCTIONS - Hidden on Mobile */}
      <div className="hidden lg:flex p-4 rounded-2xl bg-slate-950/40 border border-white/5 flex-col gap-4">
          <div className="flex items-center gap-2.5 text-primary">
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-sm font-black uppercase tracking-widest">{t('placement_notes_title')}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="flex gap-3 group/item">
                <span className="text-primary font-black text-sm mt-0.5">•</span>
                <span className="text-xs text-slate-300 font-medium leading-relaxed group-hover/item:text-white transition-colors uppercase tracking-tight">
                  {t(`instruction_${i}`)}
                </span>
              </li>
            ))}
          </ul>
      </div>

      <div className="hidden lg:block mt-auto pt-2 lg:pt-4 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <span className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest">{t('selected_mode')}</span>
            <span className={`text-[10px] lg:text-xs font-black uppercase tracking-widest italic ${gameState.gameMode === 'PvP' ? 'text-primary' : 'text-emerald-400'}`}>
                {gameState.gameMode === 'PvP' ? 'PvP' : 'PvE'}
            </span>
          </div>
      </div>
    </section>
    </>
  );
}

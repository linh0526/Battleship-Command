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
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
          {/* ROTATE TOOL */}
          <button 
              onClick={rotateShip}
              disabled={selectedShipIndex === null}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group/tool ${
                selectedShipIndex !== null 
                ? 'bg-slate-900 border-slate-800 hover:border-primary' 
                : 'bg-slate-950 border-slate-900/50 opacity-40 cursor-not-allowed'
              }`}
          >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-all ${
                selectedShipIndex !== null ? 'bg-primary/10 border-primary/10 text-primary group-hover/tool:bg-primary group-hover/tool:text-white' : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}>
                  <RotateCw className={`w-6 h-6 ${selectedOrientation === 'vertical' ? 'rotate-90' : ''} transition-transform`} />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black text-white uppercase tracking-tight">{t('rotate_ship')}</span>
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedOrientation}</span>
              </div>
          </button>

          {/* AUTO DEPLOY TOOL */}
          <button 
              onClick={autoDeploy}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500 group/tool transition-all text-left"
          >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover/tool:bg-emerald-500 group-hover/tool:text-white transition-all">
                  <Dices className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black text-white uppercase tracking-tight">{t('auto_deploy')}</span>
                 <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest leading-none">Smart Setup</span>
              </div>
          </button>

          {/* RESET TOOL */}
          <button 
              onClick={clearFleet}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-error group/tool transition-all text-left"
          >
              <div className="w-12 h-12 rounded-lg bg-error/10 border border-error/10 text-error flex items-center justify-center group-hover/tool:bg-error group-hover/tool:text-white transition-all">
                  <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black text-white uppercase tracking-tight">{t('reset_board')}</span>
                 <span className="text-xs text-error/60 font-bold uppercase tracking-widest leading-none">Clear All</span>
              </div>
          </button>
      </div>

      {/* NOTES & INSTRUCTIONS */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col gap-4">
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

      {/* CURRENT MODE INDICATOR */}
      <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('selected_mode')}</span>
            <span className={`text-xs font-black uppercase tracking-widest italic ${gameState.gameMode === 'PvP' ? 'text-primary' : 'text-emerald-400'}`}>
                {gameState.gameMode === 'PvP' ? t('fleet_pvp') : t('ghost_pve')}
            </span>
          </div>
      </div>
    </section>
    </>
  );
}

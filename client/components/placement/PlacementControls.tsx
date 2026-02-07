import React from 'react';
import { RotateCw, Zap, Trash2 } from 'lucide-react';
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
    <section className="flex flex-col gap-6">
      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 text-white">
         <Zap className="w-4 h-4 text-primary" />
         {t('tactical_tools')}
      </h3>

      <div className="glass-panel p-4 bg-[#1e293b]/20 border-slate-800 grid grid-cols-1 gap-3">
         <button 
            onClick={rotateShip}
            disabled={selectedShipIndex === null}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              selectedShipIndex !== null 
              ? 'bg-slate-900 border-slate-800 hover:border-primary group/tool' 
              : 'bg-slate-950 border-slate-900/50 opacity-40 cursor-not-allowed'
            }`}
         >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${selectedShipIndex !== null ? 'bg-primary/10 border-primary/20 text-primary group-hover/tool:bg-primary group-hover/tool:text-white' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
               <RotateCw className={`w-5 h-5 ${selectedOrientation === 'vertical' ? 'rotate-90' : ''} transition-transform`} />
            </div>
             <div>
                <p className="text-xs font-black uppercase tracking-tight text-white mb-0.5">{t('rotate_ship')}</p>
                <p className="text-[11px] text-slate-500 italic">{t('rotate_desc')}</p>
             </div>
          </button>

          <button 
             onClick={autoDeploy}
             className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500 group/tool transition-all text-left"
          >
             <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover/tool:bg-emerald-500 group-hover/tool:text-white transition-all">
                <Zap className="w-5 h-5 fill-current" />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-tight text-white mb-0.5">{t('auto_deploy')}</p>
                <p className="text-[11px] text-slate-500 italic">{t('auto_desc')}</p>
             </div>
          </button>

         <button 
            onClick={clearFleet}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-error group/tool transition-all text-left"
         >
            <div className="w-10 h-10 rounded-lg bg-error/10 border border-error/20 text-error flex items-center justify-center group-hover/tool:bg-error group-hover/tool:text-white transition-all">
               <Trash2 className="w-5 h-5" />
            </div>
             <div>
                <p className="text-xs font-black uppercase tracking-tight text-white mb-0.5">{t('reset_board')}</p>
                <p className="text-[11px] text-slate-500 italic">{t('reset_desc')}</p>
             </div>
         </button>
      </div>
    </section>

    {/* CURRENT MODE INDICATOR */}
    <section className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center justify-between px-2 py-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('selected_mode')}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest italic ${gameState.gameMode === 'PvP' ? 'text-primary' : 'text-emerald-400'}`}>
            {gameState.gameMode === 'PvP' ? t('fleet_pvp') : t('ghost_pve')}
        </span>
        </div>
    </section>
    </>
  );
}

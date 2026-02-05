import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import BattleGrid from './BattleGrid';
import { ShipInstance } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';

interface FleetStatusPanelProps {
  playerFleet: ShipInstance[];
  enemyShots: Map<string, 'hit' | 'miss' | 'sunk'>;
}

export default function FleetStatusPanel({ playerFleet, enemyShots }: FleetStatusPanelProps) {
  const { t } = useLanguage();
  return (
    <div className="glass-panel bg-slate-950/40 border-slate-800/50 flex flex-col shrink-0 overflow-hidden">
       <div className="flex items-center justify-between p-3 border-b border-slate-800/20 bg-slate-900/20">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
             <Shield className="w-4 h-4 text-primary" />
             {t('tactical_minimap')}
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
             <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest leading-none">{t('fleet_active')}</span>
          </div>
       </div>
       <div className="flex flex-col p-4 gap-6">
           {/* Mini-Map Grid (Enlarged for Labels) */}
           <div className="w-56 h-56 self-center bg-slate-950/40 border border-slate-800 rounded-lg p-1 shadow-inner overflow-hidden">
              <BattleGrid type="player" fleet={playerFleet} shots={enemyShots} />
           </div>
          
          {/* Fleet Health Overview */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
             {playerFleet.map((ship, i) => {
               const hitsOnShip = Array.from(enemyShots.entries()).filter(([key, res]) => {
                 if (res !== 'hit') return false;
                 const [r, c] = key.split('-').map(Number);
                 for (let j = 0; j < ship.size; j++) {
                   const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + j;
                   const sc = ship.orientation === 'horizontal' ? ship.col + j : ship.col;
                   if (sr === r && sc === c) return true;
                 }
                 return false;
               }).length;
               const healthPercent = Math.round(((ship.size - hitsOnShip) / ship.size) * 100);
               const isCritical = healthPercent > 0 && healthPercent <= 30;

               return (
                 <div key={ship.id} className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline px-0.5">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate w-20">{ship.name}</span>
                       <span className={`text-xs font-black ${healthPercent === 0 ? 'text-slate-700' : isCritical ? 'text-error animate-pulse' : 'text-slate-300'}`}>
                         {healthPercent === 0 ? 'KO' : `${healthPercent}%`}
                       </span>
                    </div>
                    <div className="h-1 w-full bg-slate-900/80 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${healthPercent}%` }} 
                          className={`h-full ${ship.shipBgColor} shadow-[0_0_8px_currentColor]`}
                       ></motion.div>
                    </div>
                 </div>
               );
             })}
          </div>
       </div>
    </div>
  );
}

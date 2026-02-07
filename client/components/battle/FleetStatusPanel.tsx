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
           <div className="grid grid-cols-1 gap-y-4">
             {playerFleet.map((ship) => {
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
               
               const isSunk = hitsOnShip === ship.size;

               return (
                 <div key={ship.id} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                       <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isSunk ? 'text-slate-700' : 'text-slate-300'}`}>
                          {ship.name}
                       </span>
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                          {isSunk ? 'Neutralized' : 'Active'}
                       </span>
                    </div>
                    <div className="flex gap-1.5 p-1.5 bg-slate-950/40 rounded-lg border border-white/5">
                       {Array.from({ length: ship.size }).map((_, idx) => (
                          <div 
                             key={idx} 
                             className={`w-3 h-3 rounded-full border transition-all duration-500 ${
                                idx < hitsOnShip 
                                   ? 'bg-error border-error shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                                   : `bg-slate-800 border-white/10 ${!isSunk ? 'group-hover:border-primary/30' : ''}`
                             }`}
                             style={{
                                backgroundColor: idx >= hitsOnShip && !isSunk ? ship.shipBgColor.replace('bg-', '') : undefined,
                                borderColor: idx >= hitsOnShip && !isSunk ? 'rgba(255,255,255,0.2)' : undefined
                             }}
                          >
                            {/* If it's a tailwind class like bg-indigo-500, we might need a better way to map it, 
                                but since shipBgColor is often bg-indigo-500, we'll try to apply it or fallback */}
                            <div className={`w-full h-full rounded-full ${idx < hitsOnShip ? '' : ship.shipBgColor}`}></div>
                          </div>
                       ))}
                    </div>
                 </div>
               );
             })}
           </div>
       </div>
    </div>
  );
}

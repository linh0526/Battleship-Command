"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShipInstance } from '@/context/GameContext';
import { HealthBarStyle } from '@/context/SettingsContext';

interface BattleStatusPanelProps {
  playerFleet: ShipInstance[];
  enemyFleet: any[];
  playerShots: Map<string, 'hit' | 'miss' | 'sunk'>;
  enemyShots: Map<string, 'hit' | 'miss' | 'sunk'>;
  gameMode: 'PvP' | 'PvE';
  healthBarStyle: HealthBarStyle;
  isCompact?: boolean;
  side?: 'player' | 'enemy' | 'both';
}

export default function BattleStatusPanel({ 
  playerFleet, 
  enemyFleet, 
  playerShots, 
  enemyShots, 
  gameMode, 
  healthBarStyle,
  isCompact = false,
  side = 'both'
}: BattleStatusPanelProps) {
  const { t } = useLanguage();

  const renderHealthBar = (ship: any, hits: number, colorClass: string, isEnemy: boolean) => {
    const isSunk = hits === ship.size;
    const health = ship.size - hits;

    if (healthBarStyle === 'modern') {
      return (
        <div className="flex gap-0.5">
          {Array.from({ length: ship.size }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                idx < health 
                  ? `${colorClass} shadow-[0_0_8px_currentColor] opacity-90` 
                  : 'bg-slate-800/80 border border-white/5'
              }`} 
              style={{ color: !isSunk && idx < health ? (isEnemy ? 'rgba(239,68,68,0.8)' : 'var(--primary)') : 'transparent' }}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden border border-white/5">
           <div 
              className={`h-full transition-all duration-500 ${colorClass}`} 
              style={{ width: `${(health / ship.size) * 100}%` }}
           />
        </div>
      );
    }
  };

  return (
    <section className={`bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-0 ${isCompact ? 'flex-1' : ''}`}>
      <div className="flex p-3 border-b border-white/5 bg-slate-900/20">
        <div className={`grid w-full items-center ${side === 'both' ? 'grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6' : 'grid-cols-1'}`}>
          {(side === 'both' || side === 'player') && (
            <span className="text-[10px] font-black text-primary uppercase tracking-widest px-1">{t('your_fleet_status')}</span>
          )}
          {(side === 'both' || side === 'enemy') && (
            <span className={`text-[10px] font-black text-red uppercase tracking-widest px-1 ${side === 'both' ? 'hidden sm:block sm:pl-6 sm:border-l border-white/5' : ''}`}>
              {t('enemy_fleet_status')}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 p-2 md:p-4 overflow-y-auto custom-scroll">
        <div className={`grid gap-4 md:gap-6 ${side === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {/* PLAYER VITAL SIGNS */}
          {(side === 'both' || side === 'player') && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[...playerFleet].sort((a, b) => a.size - b.size).map(ship => {
                  const hits = Array.from(enemyShots.entries()).filter(([key, res]) => {
                    if (res !== 'hit') return false;
                    const [r, c] = key.split('-').map(Number);
                    for (let j = 0; j < ship.size; j++) {
                      const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + j;
                      const sc = ship.orientation === 'horizontal' ? ship.col + j : ship.col;
                      if (sr === r && sc === c) return true;
                    }
                    return false;
                  }).length;
                  const isSunk = hits === ship.size;
                  const health = ship.size - hits;

                  return (
                      <div key={ship.id} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[8px] font-black uppercase">
                          <span className={`truncate ${isSunk ? "text-slate-700" : (ship.shipTextColor || "text-slate-400")}`}>
                            {t(ship.name)}
                          </span>
                          <span className={`${isSunk ? "text-slate-700" : "text-slate-300"}`}>{isSunk ? t('ko') : `${health}/${ship.size}`}</span>
                        </div>
                      {renderHealthBar(ship, hits, ship.shipBgColor, false)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ENEMY VITAL SIGNS */}
          {(side === 'both' || side === 'enemy') && (
            <div className={`space-y-4 ${side === 'both' ? 'border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6' : ''}`}>
              {/* Mobile Only: Show Enemy Status label when stacked */}
              <span className="sm:hidden text-[10px] font-black text-red uppercase tracking-widest block px-1 mb-2">{t('enemy_fleet_status')}</span>
              <div className="space-y-3">
                {[...enemyFleet].sort((a, b) => a.size - b.size).map((ship, i) => {
                  if (ship.isUnknown) {
                    return (
                      <div key={ship.id} className="flex flex-col gap-1.5 group">
                        <div className="flex justify-between text-[8px] font-black text-red/60 uppercase tracking-widest animate-pulse">
                          <span className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-red shadow-[0_0_5px_var(--text-red)]"></div>
                            {t(ship.name)}
                          </span>
                          <span className="opacity-50">? / ?</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-red/10 group-hover:border-red/20 transition-colors">
                           <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-red/20 to-transparent animate-[loading_2s_infinite]" />
                        </div>
                      </div>
                    );
                  }

                  let hits = 0;
                  if (gameMode === 'PvP') {
                    // In PvP, revealed ships are ALWAYS sunk
                    hits = ship.size; 
                  } else {
                    for (let j = 0; j < ship.size; j++) {
                      const sr = ship.orientation === 'horizontal' ? ship.row : ship.row + j;
                      const sc = ship.orientation === 'horizontal' ? ship.col + j : ship.col;
                      if (playerShots.get(`${sr}-${sc}`) === 'hit' || playerShots.get(`${sr}-${sc}`) === 'sunk') hits++;
                    }
                  }
                  const isSunk = hits === ship.size;
                  const health = ship.size - hits;

                  return (
                    <div key={ship.id} className="flex flex-col gap-1.5 transition-all duration-500">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-wider">
                        <span className={`truncate transition-colors ${isSunk ? "text-red/40 line-through" : "text-red/90"}`}>
                          {t(ship.name)}
                        </span>
                        <span className={`transition-all ${isSunk ? "text-red font-black glow-error" : "text-red/60"}`}>
                          {isSunk ? t('neutralized') : `${health}/${ship.size}`}
                        </span>
                      </div>
                      {renderHealthBar(ship, hits, isSunk ? 'bg-red/20' : 'bg-red/80', true)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

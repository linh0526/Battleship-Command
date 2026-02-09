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
      {side === 'both' && (
        <div className="hidden md:flex p-3 border-b border-white/5 bg-slate-900/20 items-center gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('battle_status')}</span>
        </div>
      )}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto custom-scrollbar">
        <div className={`grid ${side === 'both' ? 'grid-cols-2 gap-3 md:gap-6' : 'grid-cols-1'}`}>
          {/* PLAYER VITAL SIGNS */}
          {(side === 'both' || side === 'player') && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block px-1">{t('your_fleet_status')}</span>
              <div className="space-y-3">
                {playerFleet.map(ship => {
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
                        <span className={`truncate ${isSunk ? "text-slate-700" : (ship.shipTextColor || "text-slate-400")}`}>{ship.name}</span>
                        <span className={`${isSunk ? "text-slate-700" : "text-slate-300"}`}>{isSunk ? 'KO' : `${health}/${ship.size}`}</span>
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
            <div className={`space-y-4 ${side === 'both' ? 'border-l border-white/5 pl-6' : ''}`}>
              <span className="text-[10px] font-black text-red uppercase tracking-[0.2em] block px-1">{t('enemy_fleet_status')}</span>
              <div className="space-y-3">
                {enemyFleet.map((ship, i) => {
                  if (ship.isUnknown) {
                    return (
                      <div key={ship.id} className="flex flex-col gap-1 opacity-20">
                        <div className="flex justify-between text-[7px] font-black text-red/40 uppercase">
                          <span>Sector {i + 1}</span>
                          <span>?/?</span>
                        </div>
                        <div className="h-1 w-full bg-slate-900/50 rounded-full" />
                      </div>
                    );
                  }

                  let hits = 0;
                  if (gameMode === 'PvP' && hits === 0) {
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
                    <div key={ship.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[8px] font-black uppercase">
                        <span className={`truncate ${isSunk ? "text-red/30" : "text-red/80"}`}>{ship.name}</span>
                        <span className="text-red/40">{isSunk ? 'SUNK' : `${health}/${ship.size}`}</span>
                      </div>
                      {renderHealthBar(ship, hits, 'bg-red/60', true)}
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

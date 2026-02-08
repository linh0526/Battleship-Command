import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import BattleGrid from './BattleGrid';
import { ShipInstance } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';
import { HealthBarStyle } from '@/context/SettingsContext';

interface FleetStatusPanelProps {
  playerFleet: ShipInstance[];
  enemyShots: Map<string, 'hit' | 'miss' | 'sunk'>;
  healthBarStyle?: HealthBarStyle;
  type?: 'player' | 'enemy';
  title?: string;
}

export default function FleetStatusPanel({ 
    playerFleet, 
    enemyShots, 
    healthBarStyle = 'modern',
    type = 'player',
  title,
  revealedShips = []
}: FleetStatusPanelProps & { revealedShips?: any[] }) {
  const { t } = useLanguage();
  return (
    <div className="glass-panel bg-slate-950/40 border-slate-800/50 flex flex-col shrink-0 overflow-hidden">
       <div className="flex items-center justify-between p-3 border-b border-slate-800/20 bg-slate-900/20">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
             <Shield className={`w-4 h-4 ${type === 'player' ? 'text-primary' : 'text-error'}`} />
             {title || (type === 'player' ? t('fleet_active') : t('targeting_matrix'))}
          </h3>
        </div>
        <div className="flex flex-col p-4 items-center">
            {/* Matrix Grid */}
            <div className={`w-full aspect-square max-w-[280px] bg-slate-950/40 border rounded-lg p-1 shadow-inner overflow-hidden ${type === 'player' ? 'border-slate-800' : 'border-error/20'}`}>
               <BattleGrid type={type} fleet={playerFleet} shots={enemyShots} revealedShips={revealedShips} />
            </div>
        </div>
    </div>
  );
}

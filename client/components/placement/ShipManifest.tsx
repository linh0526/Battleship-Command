import React from 'react';
import { motion } from 'framer-motion';
import { Ship, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ShipInstance } from '@/context/GameContext';

interface ShipManifestProps {
  placedShips: ShipInstance[];
  selectedShipIndex: number | null;
  setSelectedShipIndex: React.Dispatch<React.SetStateAction<number | null>>;
  SHIP_TYPES: any[];
  unplacedShips: any[];
  isPlaced: (name: string) => boolean;
  isReady?: boolean;
}

export default function ShipManifest({
  placedShips,
  selectedShipIndex,
  setSelectedShipIndex,
  SHIP_TYPES,
  unplacedShips,
  isPlaced,
  isReady
}: ShipManifestProps) {
  const { t } = useLanguage();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
           <Ship className="w-4 h-4 text-primary" />
           {t('vessel_manifest')}
        </h3>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{placedShips.length} / 5 {t('units_placed_lbl')}</span>
      </div>

      <div className="glass-panel p-6 bg-[#1e293b]/20 border-slate-800 flex flex-col gap-2">
         <div className="space-y-2">
           {SHIP_TYPES.map((s, i) => {
             const isThisShipPlaced = isPlaced(s.name);
             const isThisShipSelected = selectedShipIndex !== null && unplacedShips[selectedShipIndex]?.name === s.name;
             
             return (
              <motion.div
                key={s.name}
                onClick={() => {
                  if (!isThisShipPlaced || isReady) {
                    const idx = unplacedShips.findIndex(us => us.name === s.name);
                    setSelectedShipIndex(prev => prev === idx ? null : idx);
                  }
                }}
                className={`p-3 border rounded-xl transition-all relative overflow-hidden group/ship
                  ${isThisShipPlaced 
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-40 grayscale cursor-default' 
                    : isThisShipSelected 
                      ? `${s.color.replace('bg-', 'bg-opacity-20 ')} ${s.border.replace('border-', 'border-opacity-100 ')} shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer` 
                      : 'bg-slate-950/60 border-slate-800 hover:border-primary/40 cursor-pointer'}
                `}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all border
                      ${isThisShipSelected ? `${s.color} border-white/20` : `${s.color.replace('bg-', 'bg-opacity-10 ')} ${s.border}`}
                    `}>
                      <span className={isThisShipSelected ? 'text-white' : s.text}>{s.icon}</span>
                    </div>
                     <div>
                      <p className={`text-sm font-black uppercase tracking-tight ${isThisShipSelected ? 'text-white' : s.text}`}>{s.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono tracking-tighter italic">{t('registry')}: {s.id} // {t('length')}: {s.size}U</p>
                    </div>
                  </div>
                  {isThisShipPlaced && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              </motion.div>
             );
           })}
         </div>
      </div>
    </section>
  );
}

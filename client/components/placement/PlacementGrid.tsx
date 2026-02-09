import React from 'react';
import { motion } from 'framer-motion';
import { Ship, AlertTriangle } from 'lucide-react';
import { ShipInstance } from '@/context/GameContext';
import { useLanguage } from '@/context/LanguageContext';

interface PlacementGridProps {
  placedShips: ShipInstance[];
  hoverPos: {r: number, c: number} | null;
  handleCellClick: (r: number, c: number) => void;
  setHoverPos: (pos: {r: number, c: number} | null) => void;
  getCellStatus: (r: number, c: number) => { type: string; ship?: ShipInstance; valid?: boolean; color?: string };
  activeRooms: any[];
  socketId?: string;
  isReady?: boolean;
  isOpponentReady?: boolean;
  opponentStatus?: 'connected' | 'disconnected';
}

export default function PlacementGrid({
  handleCellClick,
  setHoverPos,
  getCellStatus,
  activeRooms,
  socketId,
  isReady,
  isOpponentReady,
  opponentStatus
}: PlacementGridProps) {
  const { t } = useLanguage();
  return (
    <div className="relative group flex items-center justify-center w-full h-full py-8">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-4 sm:p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[550px]"
      >
        <div className="grid grid-cols-[30px_repeat(10,1fr)] gap-px bg-slate-800/40 border border-slate-800/50 rounded-lg overflow-hidden select-none">
          {/* TOP LEFT CORNER */}
          <div className="bg-slate-950 w-full h-full"></div>
          
          {/* LETTER LABELS */}
          {['A','B','C','D','E','F','G','H','I','J'].map((l) => (
            <div key={l} className="flex items-center justify-center bg-slate-950 font-mono text-xs font-black text-slate-500 aspect-square">{l}</div>
          ))}

          {Array.from({ length: 10 }).map((_, r) => (
            <React.Fragment key={r}>
              {/* NUMBER LABELS */}
              <div className="flex items-center justify-center bg-slate-950 font-mono text-xs font-black text-slate-500 w-full h-full">{r + 1}</div>
              
              {/* GRID CELLS */}
              {Array.from({ length: 10 }).map((_, c) => {
                const status = getCellStatus(r, c);
                
                return (
                  <div 
                    key={`${r}-${c}`} 
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => setHoverPos({r, c})}
                    onMouseLeave={() => setHoverPos(null)}
                    className={`cell aspect-square relative group/cell transition-all cursor-crosshair
                      ${status.type === 'preview' ? (status.valid ? `${status.color} opacity-80 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]` : 'bg-red-500/60 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]') : 'bg-slate-950'}
                      ${status.type === 'ship' ? `${status.ship?.shipBgColor} border-white/10 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]` : 'hover:bg-primary/10'}
                      after:absolute after:inset-0 after:border after:border-white/0 hover:after:border-white/40 after:transition-all after:pointer-events-none
                    `}
                  >
                    <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 rounded-full opacity-20"></div>
                    {status.type === 'ship' && (
                       <div className={`absolute inset-0 flex items-center justify-center opacity-80 ${status.ship?.shipTextColor}`}>
                         <Ship className="w-[60%] h-[60%] drop-shadow-[0_0_8px_currentColor]" />
                       </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </motion.div>



      {/* WAITING FOR OPPONENT OVERLAY */}
      {isReady && !isOpponentReady && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-30 flex items-center justify-center p-12"
        >
          <div className="flex flex-col items-center gap-6 text-center max-w-sm">
             <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center relative">
                <Ship className="w-10 h-10 text-emerald-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping"></div>
             </div>
             <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{t('status_waiting')}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  {t('opponent_placing')}
                </p>
             </div>
             <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                ))}
             </div>
          </div>
        </motion.div>
      )}

      {/* OPPONENT DISCONNECTED OVERLAY */}
      {opponentStatus === 'disconnected' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-[40] flex items-center justify-center p-12"
        >
          <div className="flex flex-col items-center gap-6 text-center max-w-sm">
             <div className="w-24 h-24 rounded-full bg-error/10 border-4 border-error/20 flex items-center justify-center relative">
                <AlertTriangle className="w-10 h-10 text-error animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-error/20 animate-ping"></div>
             </div>
             <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{t('lost_connection')}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Waiting for commander to restore uplink...
                </p>
             </div>
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-6 left-6 text-[11px] font-mono text-slate-600 uppercase tracking-widest italic">
        WGS-84 COORDINATE PROTOCOL ACTIVE
      </div>
    </div>
  );
}

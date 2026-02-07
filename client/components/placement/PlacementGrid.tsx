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
  isSearching: boolean;
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
  isSearching,
  activeRooms,
  socketId,
  isReady,
  isOpponentReady,
  opponentStatus
}: PlacementGridProps) {
  const { t } = useLanguage();
  return (
    <div className="glass-panel p-12 bg-[#1e293b]/20 border-slate-800 relative group overflow-hidden flex items-center justify-center min-h-[700px]">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="grid grid-cols-11 gap-px bg-slate-800/30 p-px rounded-lg overflow-hidden select-none">
          <div className="w-12 h-12 bg-slate-950/80"></div>
          {['A','B','C','D','E','F','G','H','I','J'].map(l => (
            <div key={l} className="w-12 h-12 flex items-center justify-center bg-slate-950/80 font-mono text-xs font-black text-slate-600 border-l border-slate-900">{l}</div>
          ))}

          {Array.from({ length: 10 }).map((_, r) => (
            <div key={r} className="contents text-white">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-950/80 font-mono text-xs font-black text-slate-600 border-t border-slate-900">{r + 1}</div>
              {Array.from({ length: 10 }).map((_, c) => {
                const status = getCellStatus(r, c);
                
                return (
                  <div 
                    key={`${r}-${c}`} 
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => setHoverPos({r, c})}
                    onMouseLeave={() => setHoverPos(null)}
                    className={`cell w-12 h-12 border-t border-l border-slate-900 relative group/cell transition-all cursor-crosshair
                      ${status.type === 'preview' ? (status.valid ? `${status.color} opacity-40` : 'bg-error/30') : ''}
                      ${status.type === 'ship' ? `${status.ship?.shipBgColor} border-white/10 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]` : 'hover:bg-primary/5'}
                    `}
                  >
                    <div className="absolute top-1 left-1 w-1 h-1 bg-slate-800 rounded-full opacity-20"></div>
                    {status.type === 'ship' && (
                       <div className={`absolute inset-0 flex items-center justify-center opacity-80 ${status.ship?.shipTextColor}`}>
                         <Ship className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tactical Overlays */}
      {isSearching && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-8 bottom-8 bg-slate-900/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 shadow-2xl z-20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{t('live_feed')}</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeRooms.length} {t('sectors_active')}</span>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll pr-2">
            {activeRooms.map((room, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${room.id === socketId ? 'bg-primary/10 border-primary/30' : 'bg-slate-950/50 border-white/5'}`}>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white uppercase">{room.name}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{room.difficulty} // {room.captains}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${room.statusColor}`}></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{room.status}</span>
                </div>
              </div>
            ))}
            {activeRooms.length === 0 && (
              <div className="text-center py-4 text-slate-600 text-[10px] font-black uppercase tracking-widest italic">{t('scanning_signals')}</div>
            )}
          </div>
        </motion.div>
      )}

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

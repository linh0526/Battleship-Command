"use client";
import { Globe, User, RefreshCw } from 'lucide-react';

export type RoomStatus = 'WAITING' | 'PLACING' | 'BATTLE' | 'DANGER' | string;

export interface ActiveRoom {
  id: string;
  name: string;
  captains: string | number;
  status: RoomStatus;
  statusColor: string;
  mode: 'classic' | 'salvo' | string;
}

interface ActiveOperationsProps {
  activeRooms: ActiveRoom[];
  isConnected: boolean;
  onJoinRoom: (id: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const ActiveOperations = ({
  activeRooms,
  isConnected,
  onJoinRoom,
  t,
}: ActiveOperationsProps) => {
  
  const statusLabelMap: Record<string, string> = {
    WAITING: t('room_waiting'),
    READY: t('status_ready'),
    PLACING: t('room_placing'),
    PLAYING: t('room_battle'),
    PVE: 'PVE',
    DANGER: 'DANGER'
  };

  return (
    <section className="flex flex-col gap-6 w-full h-full p-1">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-white">
          <Globe className="w-5 h-5 text-primary" />
          {t('active_ops')}
        </h2>
        <div className="flex gap-2">
          <div className="bg-[#1e293b]/50 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-tighter">
            Server: <span className={isConnected ? "text-emerald-400" : "text-red-500"}>{isConnected ? t('server_online') : t('server_offline')}</span>
          </div>
          <div className="bg-[#1e293b]/50 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-tighter">
            Ping: <span className={isConnected ? "text-emerald-400" : "text-red-500"}>{isConnected ? `0ms` : `999ms`}</span> 
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-[#1e293b]/20 border-slate-800 w-full flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 custom-scroll">
          <table className="w-full text-xs font-bold uppercase tracking-widest min-w-[800px]">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur z-10 border-b border-slate-800">
              <tr className="text-slate-500">
                <th className="px-4 font-bold py-3">{t('op_name')}</th>
                <th className="px-4 font-bold py-3">{t('captains')}</th>
                <th className="px-4 font-bold py-3">{t('game_mode')}</th>
                <th className="px-4 font-bold py-3">{t('status')}</th>
                <th className="px-4 font-bold py-3">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {activeRooms.length > 0 ? activeRooms.map((op) => (
                <tr key={op.id} className="hover:bg-primary/5 transition-colors group cursor-pointer border-b border-slate-800/50">
                  <td className="px-4 py-3 border-r border-slate-800/30">
                    <div className="text-left">
                      <p className="text-white text-[13px] tracking-normal mb-0.5 whitespace-nowrap">{op.name}</p>
                      <p className="text-slate-500 text-[10px] font-mono leading-none tracking-normal italic">ID: {op.id.substring(0,8)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-800/30">
                    <div className="flex items-center justify-center gap-1 text-slate-400 tracking-normal text-[11px]">
                      <User className="w-2.5 h-2.5" />
                      {op.captains}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-800/30">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${op.mode === 'salvo' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {op.mode === 'salvo' ? t('mode_salvo') : t('mode_classic')}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-800/30">
                    <div className="flex items-center justify-center gap-1.5 tracking-normal text-[11px]">
                      <div className={`w-1.5 h-1.5 rounded-full ${op.statusColor} shadow-[0_0_8px_currentColor] animate-pulse`}></div>
                      <span className="text-slate-300">
                        {statusLabelMap[op.status] || op.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                        <button
                          disabled={!isConnected || op.status !== 'WAITING'}
                          onClick={(e) => {
                            if (op.status !== 'WAITING') return;
                            e.stopPropagation();
                            onJoinRoom(op.id);
                          }}
                          className={`px-4 py-1.5 rounded-lg transition-all font-black text-[11px] ${
                            op.status === 'WAITING' 
                            ? 'bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30' 
                            : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {op.status === 'WAITING' ? t('join') : t('room_full')}
                        </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 uppercase tracking-widest font-black italic">
                    {t('no_active_ops')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {t('fleet_scanning')} {t('sectors_detected', { count: activeRooms.length.toString() })}
          </p>
          <div className="flex gap-4">
            <button className="p-2 bg-slate-800/50 rounded-lg text-slate-500 hover:text-white transition-colors"><RefreshCw className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActiveOperations;

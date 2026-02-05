"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, RefreshCw, Globe, User, MessageSquare, Trophy, Zap, Send, ShieldAlert, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

export default function LobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { gameState, setGameMode, resetGame, setPlayerName, resetScores, prepareRematch } = useGame();
  const { socket, isConnected, startPve, joinSpecificRoom, createRoom } = useSocket();
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(gameState.playerName);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pendingJoinId, setPendingJoinId] = useState<string | null>(null);

  
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      setPendingJoinId(roomId);
      setGameMode('PvP');
      setShowNameModal(true);
    }
  }, [searchParams, setGameMode]);

  useEffect(() => {
    if (socket) {
      socket.on('rooms_update', (rooms: any[]) => {
        setActiveRooms(rooms);
      });
      socket.on('player_count', (count: number) => {
        setOnlineUsers(count);
      });
      // Request initial rooms
      socket.emit('get_active_rooms');
      
      return () => {
        socket.off('rooms_update');
        socket.off('player_count');
      };
    }
  }, [socket]);

  // Global redirection logic
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.isFleetReady) {
      router.push('/battle');
    }
  }, [gameState.gameStatus, gameState.isFleetReady, router]);

  const generateRandomName = () => {
    const prefixes = ['Sea', 'Iron', 'Storm', 'Deep', 'Night', 'Wave', 'Ghost', 'Viper', 'Omega', 'Blue', 'Red', 'Dark', 'Light', 'Cyber', 'Neon'];
    const suffixes = ['Wolf', 'Clad', 'Bringer', 'Dive', 'Raid', 'Breaker', 'Rider', 'One', 'Falcon', 'Hawk', 'Eagle', 'Shark', 'Whale', 'Dragon'];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 99)}`;
    setTempName(randomName);
  };

  const handleStartPvP = () => {
    resetGame();
    setGameMode('PvP');
    setShowNameModal(true);
  };

  const confirmNameAndStart = () => {
    if (tempName.trim()) {
      setPlayerName(tempName);
      if (pendingJoinId) {
        joinSpecificRoom(pendingJoinId);
      }
      router.push('/placement');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full h-[calc(100vh-140px)] mt-6 overflow-hidden">
      <AnimatePresence>
        {showNameModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel max-w-md w-full p-8 border border-primary/30 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white italic uppercase italic tracking-tighter">{t('enter_callsign')}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('identify_commander')}</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative flex items-center group/input">
                  <User className="absolute left-6 w-5 h-5 text-slate-500 pointer-events-none z-10" />
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder={t('placeholder_name')}
                    className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-xl py-4 !pl-16 pr-14 text-white font-bold focus:outline-none focus:border-primary transition-all relative"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && confirmNameAndStart()}
                  />
                  <button 
                    onClick={generateRandomName}
                    className="absolute right-4 p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-800 rounded-lg active:scale-95 z-20"
                    title="Generate Random Callsign"
                  >
                    <Dices className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowNameModal(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={confirmNameAndStart}
                    disabled={!tempName.trim()}
                    className="flex-1 py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_20px_rgba(25,93,230,0.3)]"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MAIN CONTENT AREA */}
      <main className="lg:col-span-9 flex flex-col gap-12 ">
        
        {/* DEPLOYMENT ZONE SECTION */}
        {/* FLEET INITIATION SECTION */}
        <section className="shrink-0">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black tracking-tight mb-2 text-white italic uppercase"
          >
            {t('deployment_zone')}
          </motion.h1>
          <p className="text-slate-500 font-medium mb-10 uppercase tracking-widest text-xs">
            {t('deployment_desc')}
          </p>

          <div className="flex flex-wrap items-center gap-6 w-full">
            <button 
              onClick={handleStartPvP}
              className="flex-1 min-w-[320px] h-[100px] bg-primary hover:bg-blue-600 rounded-2xl flex items-center justify-between px-8 transition-all group relative overflow-hidden shadow-[0_20px_40px_rgba(25,93,230,0.2)]"
            >
              <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Play className="w-8 h-8 fill-white text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black uppercase tracking-tighter text-white italic">{t('quick_play')}</p>
                  <p className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em]">{t('ranked_match')}</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => {
                resetGame();
                setGameMode('PvE');
                startPve(gameState.playerName);
                router.push('/placement');
              }}
              className="flex-1 min-w-[320px] h-[100px] bg-slate-900 border border-emerald-500/20 hover:bg-slate-800 rounded-2xl flex items-center justify-between px-8 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldAlert className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black uppercase tracking-tighter text-emerald-400 italic font-black">{t('pve_training')}</p>
                  <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-[0.2em]">PBE (Ghost AI Simulated Combat)</p>
                </div>
              </div>
            </button>

            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={() => {
                   resetGame();
                   createRoom();
                   router.push('/placement');
                }}
                className="flex-1 sm:flex-none px-6 h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:border-slate-500 group"
              >
                <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{t('create_room')}</span>
              </button>
              
              <button className="w-[100px] h-[100px] bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl flex items-center justify-center transition-all group hover:border-slate-500">
                <RefreshCw className="w-8 h-8 text-slate-500 group-hover:rotate-180 transition-all duration-700 group-hover:text-slate-300" />
              </button>
            </div>
          </div>
        </section>

        {/* ACTIVE OPERATIONS TABLE */}
        <section className="flex flex-col gap-6 w-full flex-1 min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-white">
              <Globe className="w-5 h-5 text-primary" />
              {t('active_ops')}
            </h2>
            <div className="flex gap-2">
              <div className="bg-[#1e293b]/50 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                Server: <span className={isConnected ? "text-emerald-400" : "text-error"}>{isConnected ? t('server_online') : t('server_offline')}</span>
              </div>
              <div className="bg-[#1e293b]/50 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                Ping: <span className="text-emerald-400">1ms</span>
              </div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden bg-[#1e293b]/20 border-slate-800 w-full flex flex-col flex-1 min-h-0">
            <div className="overflow-x-auto flex-1 custom-scroll">
              <table className="w-full text-xs font-bold uppercase tracking-widest min-w-[800px]">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur z-10 border-b border-slate-800">
                  <tr className="text-slate-500">
                    <th className="px-6 font-bold py-6">{t('op_name')}</th>
                    <th className="px-6 font-bold py-6">{t('captains')}</th>
                    <th className="px-6 font-bold py-6">{t('status')}</th>
                    <th className="px-6 font-bold py-6">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {activeRooms.length > 0 ? activeRooms.map((op, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors group cursor-pointer border-b border-slate-800/50">
                      <td className="px-6 py-6 border-r border-slate-800/30">
                        <div className="text-center">
                          <p className="text-white text-sm tracking-normal mb-0.5 whitespace-nowrap">{op.name}</p>
                          <p className="text-slate-500 text-[11px] font-mono leading-none tracking-normal italic">ID: {op.id.substring(0,8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center border-r border-slate-800/30">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400 tracking-normal">
                          <User className="w-3 h-3" />
                          {op.captains}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center border-r border-slate-800/30">
                        <div className="flex items-center justify-center gap-2 tracking-normal">
                          <div className={`w-2 h-2 rounded-full ${op.statusColor} shadow-[0_0_8px_currentColor]`}></div>
                          <span className="text-slate-300">
                            {op.status === 'WAITING' ? t('room_waiting') : 
                             op.status === 'PLACING' ? t('room_placing') : 
                             op.status === 'BATTLE' ? t('room_battle') : op.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                          {op.status === 'DANGER' ? (
                            <span className="text-[10px] font-black text-error uppercase tracking-widest italic animate-pulse">
                              IMPOSSIBLE
                            </span>
                          ) : op.status === 'WAITING' ? (
                            <button
                              onClick={() => {
                                resetScores();
                                prepareRematch();
                                joinSpecificRoom(op.id);
                                router.push('/placement');
                              }}
                              className="px-6 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-lg transition-all font-black"
                            >
                              {t('join')}
                            </button>
                          ) : (
                            <div className="flex flex-col items-center opacity-40">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">
                                {t('room_full')}
                              </span>
                            </div>
                          )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-600 uppercase tracking-widest font-black italic">
                        No active operations detected. Be the first to deploy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex justify-between items-center shrink-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Fleet Scanning... {activeRooms.length} Sectors Detected</p>
              <div className="flex gap-4">
                <button className="p-2 bg-slate-800/50 rounded-lg text-slate-500 hover:text-white transition-colors"><RefreshCw className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* RIGHT SIDEBAR AREA */}
      <aside className="lg:col-span-3 flex flex-col gap-10 h-full overflow-hidden">
        
        {/* TOP COMMANDERS SECTION */}
        <section className="flex flex-col gap-6 shrink-0">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
             <Trophy className="w-4 h-4 text-warning" />
             {t('top_commanders')}
          </h3>
          <div className="glass-panel p-6 bg-[#1e293b]/20 border-slate-800 flex flex-col gap-5">
             {[
               { name: 'AdmiralSarah', xp: '24,500 XP', rank: 1, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
               { name: 'SeaWolf99', xp: '22,150 XP', rank: 2, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wolf' },
               { name: 'DestroyerX', xp: '21,890 XP', rank: 3, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rex' },
             ].map((pro, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                   <span className="text-xl font-black text-slate-600 group-hover:text-warning transition-colors w-4">{pro.rank}</span>
                   <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                        <img src={pro.img} alt={pro.name} />
                      </div>
                      {pro.rank === 1 && <div className="absolute -bottom-1 -right-1 bg-warning text-slate-950 text-[11px] font-black px-1 rounded uppercase">Gen</div>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{pro.name}</p>
                      <p className="text-xs font-bold text-slate-500">{pro.xp}</p>
                   </div>
                </div>
             ))}

             <Link href="/leaderboard" className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-white text-center transition-all bg-primary/5 py-3 rounded-lg border border-primary/20">
               View Full Leaderboard
             </Link>
          </div>
        </section>

        {/* COMPACT WORLD CHAT SECTION */}
        <section className="flex flex-col gap-6 flex-1 min-h-0">
           <div className="flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
                <MessageSquare className="w-4 h-4 text-primary" />
                {t('community_chat')}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{onlineUsers} Online</span>
              </div>
           </div>

           <div className="glass-panel p-4 bg-slate-950/40 border-slate-800 flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Message Feed */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scroll text-xs">
                {[
                  { user: 'ViperPilot', msg: 'Operation Alpha is recruiting! Need a veteran captain.', type: 'msg', color: 'text-primary' },
                  { user: 'ADM.Sarah', msg: 'GG on the last ranked match, SeaWolf.', type: 'msg', color: 'text-warning' },
                  { user: 'System', msg: 'Daily tournament starts in 15 minutes.', type: 'sys', color: 'text-slate-500' },
                  { user: 'Ghost', msg: 'Anyone up for 14x14 custom?', type: 'msg', color: 'text-emerald-400' },
                  { user: 'BigBoss', msg: 'Sector 4 intelligence report is out.', type: 'msg', color: 'text-slate-300' },
                  { user: 'Data_Cmdr', msg: 'Connecting to neural uplink...', type: 'msg', color: 'text-blue-400' },
                ].map((chat, i) => (
                   <div key={i} className={`flex flex-col gap-0.5 ${chat.type === 'sys' ? 'bg-slate-900/40 p-2 rounded italic' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-black uppercase tracking-wider ${chat.color}`}>{chat.user}</span>
                        {chat.type === 'sys' && <ShieldAlert className="w-3 h-3 text-slate-600" />}
                      </div>
                      <p className="text-slate-300 leading-relaxed font-medium">{chat.msg}</p>
                   </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="mt-auto shrink-0 space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={t('broadcast')}
                    className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg pl-4 pr-12 py-3 text-xs focus:outline-none focus:border-primary/50 focus:bg-[#1e293b] font-medium transition-all"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-600 tracking-widest px-1">
                  <span>Enter to ship</span>
                  <span>45 / 200</span>
                </div>
              </div>
           </div>
        </section>
      </aside>
    </div>
  );
}

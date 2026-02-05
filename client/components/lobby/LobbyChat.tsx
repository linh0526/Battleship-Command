"use client";

import React from 'react';
import { MessageSquare, ShieldAlert, Send } from 'lucide-react';

interface LobbyChatProps {
  onlineUsers: number;
  t: (key: string) => string;
}

export default function LobbyChat({ onlineUsers, t }: LobbyChatProps) {
  const dummyChats = [
    { user: 'ViperPilot', msg: 'Operation Alpha is recruiting! Need a veteran captain.', type: 'msg', color: 'text-primary' },
    { user: 'ADM.Sarah', msg: 'GG on the last ranked match, SeaWolf.', type: 'msg', color: 'text-warning' },
    { user: 'System', msg: 'Daily tournament starts in 15 minutes.', type: 'sys', color: 'text-slate-500' },
    { user: 'Ghost', msg: 'Anyone up for 14x14 custom?', type: 'msg', color: 'text-emerald-400' },
    { user: 'BigBoss', msg: 'Sector 4 intelligence report is out.', type: 'msg', color: 'text-slate-300' },
    { user: 'Data_Cmdr', msg: 'Connecting to neural uplink...', type: 'msg', color: 'text-blue-400' },
  ];

  return (
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
          {dummyChats.map((chat, i) => (
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
  );
}

"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Search, MessageSquare, UserPlus, Info, Send, Phone, Video, MoreVertical, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DUMMY_FRIENDS = [
  { id: 1, name: 'KrakenHunter99', status: 'online', rank: 'Captain', avatar: '1', lastSeen: 'Active now' },
  { id: 2, name: 'StormBreaker', status: 'offline', rank: 'Commander', avatar: '2', lastSeen: '2h ago' },
  { id: 3, name: 'NeonEagle', status: 'online', rank: 'Fleet Admiral', avatar: '3', lastSeen: 'Active now' },
  { id: 4, name: 'GhostFleet', status: 'away', rank: 'Lieutenant', avatar: '4', lastSeen: '15m ago' },
  { id: 5, name: 'ShadowCommander', status: 'online', rank: 'Captain', avatar: '5', lastSeen: 'Active now' },
];

const DUMMY_MESSAGES = [
  { id: 1, sender: 'NeonEagle', text: 'Admiral, when are we starting the next operation?', time: '14:20', isMe: false },
  { id: 2, sender: 'Me', text: 'I need to refit my fleet first. Give me 10 minutes.', time: '14:22', isMe: true },
  { id: 3, sender: 'NeonEagle', text: 'Roger that. I will be in the lobby.', time: '14:23', isMe: false },
  { id: 4, sender: 'NeonEagle', text: 'Dont forget the tactical sonar this time!', time: '14:24', isMe: false },
];

export default function FriendsPage() {
  const { t } = useLanguage();
  const [selectedFriend, setSelectedFriend] = useState<any>(DUMMY_FRIENDS[2]);
  const [message, setMessage] = useState('');

  return (
    <div className="flex bg-[#0a0e1a]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-[calc(100vh-160px)] overflow-hidden shadow-2xl">
        
        {/* Friends Sidebar */}
        <aside className="w-80 border-r border-white/10 flex flex-col bg-black/20">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter scale-y-110 py-1">
                        {t('friends')}
                    </h2>
                </div>
                <button className="p-2 bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-white rounded-xl transition-all">
                    <UserPlus className="w-4 h-4" />
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search commanders..." 
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all"
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
            {DUMMY_FRIENDS.map((friend) => (
                <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`flex items-center gap-4 p-4 rounded-[1.5rem] transition-all relative group ${
                        selectedFriend.id === friend.id 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                >
                    <div className="relative">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} 
                            alt={friend.name}
                            className="w-12 h-12 rounded-2xl bg-slate-800 p-0.5 border border-white/10 shadow-lg"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${
                            selectedFriend.id === friend.id ? 'border-primary' : 'border-[#0a0e1a]'
                        } ${
                            friend.status === 'online' ? 'bg-emerald-500' : 
                            friend.status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                    </div>
                    <div className="flex flex-col items-start gap-1 overflow-hidden">
                        <span className={`text-xs font-black uppercase tracking-wide truncate w-full ${
                            selectedFriend.id === friend.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                        }`}>
                            {friend.name}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                            selectedFriend.id === friend.id ? 'text-white/60' : 'text-slate-500'
                        }`}>
                            {friend.rank}
                        </span>
                    </div>
                </button>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-black/40">
             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Recent Network Activity</h4>
             <div className="flex flex-col gap-3">
                <ActivityItem name="NeonEagle" action="Reached Level 45" time="2m ago" />
                <ActivityItem name="KrakenHunter99" action="Won vs Shadow" time="15m ago" />
             </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Chat Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFriend.name}`} 
                        alt={selectedFriend.name}
                        className="w-12 h-12 rounded-2xl bg-slate-800 p-0.5 border border-white/10"
                    />
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedFriend.name}</h3>
                        <div className="flex items-center gap-2">
                            <Circle className={`w-2 h-2 fill-current ${
                                selectedFriend.status === 'online' ? 'text-emerald-500' : 
                                selectedFriend.status === 'away' ? 'text-amber-500' : 'text-slate-500'
                            }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {selectedFriend.lastSeen}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ChatActionIcon icon={<Phone className="w-5 h-5" />} />
                    <ChatActionIcon icon={<Video className="w-5 h-5" />} />
                    <div className="w-px h-8 bg-white/5 mx-2" />
                    <ChatActionIcon icon={<Info className="w-5 h-5" />} />
                    <ChatActionIcon icon={<MoreVertical className="w-5 h-5" />} />
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(25,93,230,0.03)_0%,transparent_100%)]">
                {DUMMY_MESSAGES.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium leading-relaxed relative group ${
                            msg.isMe 
                            ? 'bg-primary text-white rounded-br-none shadow-xl shadow-primary/20' 
                            : 'bg-white/5 border border-white/10 text-white rounded-bl-none'
                        }`}>
                            {msg.text}
                            <span className={`absolute -bottom-6 ${msg.isMe ? 'right-0' : 'left-0'} text-[9px] font-black uppercase text-slate-600 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {msg.time} • Delivered
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <footer className="p-6 bg-black/40">
                <div className="relative flex items-center gap-4">
                    <div className="flex-1 relative">
                        <form onSubmit={(e) => { e.preventDefault(); setMessage(''); }}>
                            <input 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                type="text" 
                                placeholder={`Operational channel with ${selectedFriend.name}...`} 
                                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-2xl"
                            />
                        </form>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                    <button 
                        onClick={() => setMessage('')}
                        className="w-14 h-14 bg-primary hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </footer>
        </main>
    </div>
  );
}

function ChatActionIcon({ icon }: any) {
    return (
        <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            {icon}
        </button>
    );
}

function ActivityItem({ name, action, time }: { name: string, action: string, time: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                <span className="text-[10px] font-black text-white truncate">{name}</span>
                <span className="text-[9px] font-medium text-slate-600 truncate">{action}</span>
            </div>
            <span className="text-[8px] font-black text-slate-500 uppercase shrink-0">{time}</span>
        </div>
    );
}

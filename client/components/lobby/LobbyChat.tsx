"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ShieldAlert, Send, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useGame } from '@/context/GameContext';
import AuthModal from '@/components/auth/AuthModal';

interface ChatMessage {
  user: string;
  msg: string;
  type: 'msg' | 'sys';
  color?: string;
  timestamp?: string | Date;
}

interface LobbyChatProps {
  onlineUsers: number;
  t: (key: string, params?: Record<string, string>) => string;
}

const LobbyChat = ({ onlineUsers, t }: LobbyChatProps) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();
  const { gameState } = useGame();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat_update', (newMessage: ChatMessage) => {
      setMessages(prev => [...prev.slice(-19), newMessage]);
    });

    socket.emit('get_chat_history');

    return () => {
      socket.off('chat_history');
      socket.off('chat_update');
    };
  }, [socket]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 50);
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!socket || !inputValue.trim() || !isAuthenticated) return;
    socket.emit('send_chat', { msg: inputValue });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isOpen ? (
            <div className="w-[350px] h-[500px] bg-[#0a0e1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">
                                {t('community_chat')}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    {t('online_count', { count: onlineUsers.toString() })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={toggleChat}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Content - reusing existing structure */}
                <div className="relative flex-1 min-h-0 flex flex-col group p-3">
                    <div className={`p-3 bg-slate-950/40 border-slate-800 flex-1 flex flex-col gap-3 overflow-hidden rounded-xl border border-white/5 ${!isAuthenticated ? 'blur-md pointer-events-none opacity-40 select-none' : ''}`}>
                    {/* Message Feed */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scroll text-[11px]"
                    >
                        {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                            <p>{t('no_messages_yet') || 'Tower quiet... no signals detected'}</p>
                        </div>
                        ) : (
                        messages.map((chat, i) => {
                            const messageDate = chat.timestamp ? new Date(chat.timestamp) : new Date();
                            const prevMessage = i > 0 ? messages[i-1] : null;
                            const prevMessageDate = prevMessage?.timestamp ? new Date(prevMessage.timestamp) : new Date();
                            const isDifferentDay = i === 0 || messageDate.toDateString() !== prevMessageDate.toDateString();

                            return (
                                <React.Fragment key={i}>
                                    {isDifferentDay && (
                                        <div className="flex items-center gap-2 my-3 opacity-60">
                                            <div className="flex-1 h-px bg-slate-600"></div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{messageDate.toLocaleDateString('vi-VN')}</span>
                                            <div className="flex-1 h-px bg-slate-600"></div>
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-0.5 ${chat.type === 'sys' ? 'bg-slate-900/40 p-2 rounded italic' : ''}`}>
                                        <div className="flex items-center justify-between">
                                        <span className={`font-black uppercase tracking-wider ${chat.color || ((user?.username || gameState.playerName) === chat.user ? 'text-emerald-400' : 'text-slate-400')}`}>{chat.user}</span>
                                        {chat.type === 'sys' ? (
                                            <ShieldAlert className="w-3 h-3 text-slate-600" />
                                        ) : (
                                            <span className="text-[9px] text-slate-600 font-medium">
                                            {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        </div>
                                        <p className={`leading-relaxed font-medium break-words ${chat.msg === t('server_offline') ? 'text-red-500' : 'text-slate-300'}`}>{chat.msg}</p>
                                    </div>
                                </React.Fragment>
                            );
                        })
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="mt-auto shrink-0 space-y-2">
                        <div className="relative">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('broadcast')}
                            maxLength={200}
                            className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg pl-4 pr-12 py-3 text-xs focus:outline-none focus:border-primary/50 focus:bg-[#1e293b] font-medium transition-all text-white"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors disabled:opacity-30"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    </div>

                    {/* Lock Overlay */}
                    {!isAuthenticated && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(25,93,230,0.3)]">
                        <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px] mb-2">{t('login_required')}</p>
                        <button 
                            onClick={() => setIsAuthOpen(true)}
                            className="mt-4 px-6 py-2 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg transition-all"
                        >
                            {t('login')}
                        </button>
                    </div>
                    )}
                </div>
            </div>
        ) : null}
        
        {/* Toggle Button */}
        <button 
            onClick={toggleChat}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border border-white/10 ${
                isOpen 
                ? 'bg-slate-800 hover:bg-slate-700' 
                : 'bg-primary hover:bg-blue-600 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(25,93,230,0.5)]'
            }`}
        >
            {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="6 9 12 15 18 9"></polyline></svg>
            ) : (
                <MessageSquare className="w-7 h-7 text-white" />
            )}
        </button>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default LobbyChat;

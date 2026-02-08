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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !inputValue.trim() || !isAuthenticated) return;
    socket.emit('send_chat', { msg: inputValue });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <section className="flex flex-col gap-6 h-[500px] relative p-1">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
          <MessageSquare className="w-4 h-4 text-primary" />
          {t('community_chat')}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {t('online_count', { count: onlineUsers.toString() })}
          </span>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col group">
        <div className={`glass-panel p-4 bg-slate-950/40 border-slate-800 flex-1 flex flex-col gap-4 overflow-hidden transition-all duration-500 ${!isAuthenticated ? 'blur-md pointer-events-none opacity-40 select-none' : ''}`}>
          {/* Message Feed */}
          <div 
            ref={scrollRef}
            className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scroll text-xs"
          >
            {messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                  <p>{t('no_messages_yet') || 'Tower quiet... no signals detected'}</p>
               </div>
            ) : (
              messages.map((chat, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${chat.type === 'sys' ? 'bg-slate-900/40 p-2 rounded italic' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-black uppercase tracking-wider ${chat.color || ((user?.username || gameState.playerName) === chat.user ? 'text-emerald-400' : 'text-slate-400')}`}>{chat.user}</span>
                      {chat.type === 'sys' ? (
                        <ShieldAlert className="w-3 h-3 text-slate-600" />
                      ) : (
                        <span className="text-[9px] text-slate-600 font-medium">
                          {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      )}
                    </div>
                    <p className={`leading-relaxed font-medium break-words ${chat.msg === t('server_offline') ? 'text-red-500' : 'text-slate-300'}`}>{chat.msg}</p>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="mt-auto shrink-0 space-y-3">
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
            
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-600 tracking-widest px-1">
              <span>{t('enter_to_ship')}</span>
              <span className={inputValue.length >= 180 ? 'text-warning' : ''}>{inputValue.length} / 200</span>
            </div>
          </div>
        </div>

        {/* Lock Overlay */}
        {!isAuthenticated && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(25,93,230,0.3)]">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-[10px] mb-2">{t('login_required')}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-6 max-w-[200px]">
              {t('login_to_chat')}
            </p>
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="group relative px-8 py-3 bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all shadow-[0_0_20px_rgba(25,93,230,0.4)] hover:shadow-[0_0_40px_rgba(25,93,230,0.6)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <div className="relative z-10 flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('login')}
              </div>
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </section>
  );
}

export default LobbyChat;

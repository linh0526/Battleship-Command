"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Search, MessageSquare, UserPlus, Info, Send, Phone, Video, MoreVertical, Circle, Check, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function FriendsPage() {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<{incoming: any[], outgoing: any[]}>({ incoming: [], outgoing: [] });
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchFriends = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
        router.push('/');
        return;
    }
    try {
      const res = await fetch(`${API_URL}/api/social/friends`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
        if (data.length > 0 && !selectedFriend) {
          setSelectedFriend(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem('auth-token');
    try {
      const res = await fetch(`${API_URL}/api/social/requests`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async (friendId: string) => {
    const token = localStorage.getItem('auth-token');
    try {
      const res = await fetch(`${API_URL}/api/social/chat/${friendId}`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchRequests()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchChatHistory(selectedFriend.id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Socket listeners for real-time chat
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMsg = (data: any) => {
      if (selectedFriend && (data.senderId === selectedFriend.id || data.senderId === currentUser?.id)) {
        setMessages(prev => [...prev, {
            sender: data.senderId,
            user: data.senderName,
            msg: data.msg,
            timestamp: data.timestamp
        }]);
      }
      // Also update friend status or list if needed
    };

    const handleMsgSent = (data: any) => {
        if (selectedFriend && data.recipientId === selectedFriend.id) {
            setMessages(prev => [...prev, {
                sender: currentUser?.id,
                user: currentUser?.username,
                msg: data.msg,
                timestamp: data.timestamp
            }]);
        }
    };

    const handleSocialUpdate = () => {
        fetchFriends();
        fetchRequests();
    };

    socket.on('private_msg', handlePrivateMsg);
    socket.on('private_msg_sent', handleMsgSent);
    socket.on('social_update', handleSocialUpdate);

    return () => {
      socket.off('private_msg', handlePrivateMsg);
        socket.off('private_msg_sent', handleMsgSent);
        socket.off('social_update', handleSocialUpdate);
    };
  }, [socket, selectedFriend, currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    const token = localStorage.getItem('auth-token');
    try {
      const res = await fetch(`${API_URL}/api/social/search?q=${searchQuery}`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (recipientId: string) => {
    const token = localStorage.getItem('auth-token');
    try {
      const res = await fetch(`${API_URL}/api/social/request`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token || '' 
        },
        body: JSON.stringify({ recipientId })
      });
      if (res.ok) {
        fetchRequests();
        setSearchResults(prev => prev.map(u => u._id === recipientId ? {...u, relationship: 'pending', isRequester: true} : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (requestId: string) => {
    const token = localStorage.getItem('auth-token');
    try {
      const res = await fetch(`${API_URL}/api/social/accept`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token || '' 
        },
        body: JSON.stringify({ requestId })
      });
      if (res.ok) {
        fetchRequests();
        fetchFriends();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !selectedFriend || !newMessage.trim()) return;

    socket.emit('send_private_msg', {
        recipientId: selectedFriend.id,
        msg: newMessage.trim()
    });
    setNewMessage('');
  };

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
            </div>

            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_commander_placeholder')}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all"
                />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 px-3">SEARCH RESULTS</h4>
                    {searchResults.map(user => (
                        <div key={user._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-8 h-8 rounded-lg bg-slate-800" />
                                <span className="text-xs font-black text-white uppercase">{user.username}</span>
                            </div>
                            {user.relationship === 'none' ? (
                                <button onClick={() => sendFriendRequest(user._id)} className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all">
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            ) : (
                                <span className="text-[8px] font-black text-slate-600 uppercase">
                                    {user.relationship === 'pending' ? 'PENDING' : 'FRIEND'}
                                </span>
                            )}
                        </div>
                    ))}
                    <button onClick={() => setSearchResults([])} className="w-full text-[9px] font-black text-slate-600 hover:text-white py-1">CLEAR SEARCH</button>
                    <div className="h-px bg-white/5 my-4 mx-3" />
                </div>
            )}

            {/* Pending Requests */}
            {requests.incoming.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 px-3">INCOMING REQUESTS</h4>
                    {requests.incoming.map(req => (
                        <div key={req.requestId} className="flex items-center justify-between p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white uppercase">{req.user.username}</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => acceptRequest(req.requestId)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:scale-105 transition-all">
                                    <Check className="w-3 h-3" />
                                </button>
                                <button className="p-1.5 bg-error/20 text-error rounded-lg hover:bg-error hover:text-white transition-all">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Friends List */}
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-3">{t('maritime_allies')}</h4>
            {friends.length === 0 && !loading && (
                <div className="p-4 text-center text-[10px] font-bold text-slate-600 italic">
                    {t('no_allies')}
                </div>
            )}
            {friends.map((friend) => (
                <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`flex items-center gap-4 p-4 rounded-[1.5rem] transition-all relative group ${
                        selectedFriend?.id === friend.id 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'hover:bg-white/5 text-slate-400'
                    }`}
                >
                    <div className="relative">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`} 
                            alt={friend.username}
                            className="w-12 h-12 rounded-2xl bg-slate-800 p-0.5 border border-white/10 shadow-lg"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${
                            selectedFriend?.id === friend.id ? 'border-primary' : 'border-[#121826]'
                        } ${
                            friend.status === 'online' ? 'bg-emerald-500' : 
                            friend.status === 'ingame' ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden text-left flex-1 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-wide truncate w-full ${
                            selectedFriend?.id === friend.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                        }`}>
                            {friend.username}
                        </span>
                        <span className={`text-[9px] mt-0.5 font-black uppercase tracking-widest ${
                            selectedFriend?.id === friend.id ? 'text-white/60' : 'text-slate-500'
                        }`}>
                            {t(`status_${friend.status}`)}
                        </span>
                        {friend.lastMessage && (
                            <span className={`text-[10px] w-full mt-1.5 truncate ${
                                selectedFriend?.id === friend.id ? 'text-white/80 font-medium' : 'text-slate-400 font-normal group-hover:text-white/70'
                            } ${friend.lastMessage.senderId !== currentUser?.id ? 'font-black text-white/90' : ''}`}>
                                {friend.lastMessage.senderId === currentUser?.id && 'Bạn: '}{friend.lastMessage.msg}
                            </span>
                        )}
                    </div>
                </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
            {selectedFriend ? (
               <>
                {/* Chat Header */}
                <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFriend.username}`} 
                            alt={selectedFriend.username}
                            className="w-12 h-12 rounded-2xl bg-slate-800 p-0.5 border border-white/10"
                        />
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedFriend.username}</h3>
                            <div className="flex items-center gap-2">
                                <Circle className={`w-2 h-2 fill-current ${
                                    selectedFriend.status === 'online' ? 'text-emerald-500' : 
                                    selectedFriend.status === 'ingame' ? 'text-amber-500' : 'text-slate-500'
                                }`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {selectedFriend.status === 'online' ? 'ACTIVE CHANNEL' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ChatActionIcon icon={<ShieldCheck className="w-5 h-5" />} />
                        <ChatActionIcon icon={<MoreVertical className="w-5 h-5" />} />
                    </div>
                </header>

                {/* Messages */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(25,93,230,0.03)_0%,transparent_100%)]"
                >
                    {messages.length === 0 && (
                        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-600 opacity-30">
                            <MessageSquare className="w-16 h-16 stroke-[1]" />
                            <p className="text-xs font-black uppercase tracking-[0.3em]">Encrypted Channel Initialized</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender === currentUser?.id;
                        return (
                            <div 
                                key={idx} 
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-bold leading-relaxed relative group ${
                                    isMe 
                                    ? 'bg-primary text-white rounded-br-none shadow-xl shadow-primary/20' 
                                    : 'bg-white/5 border border-white/10 text-white rounded-bl-none'
                                }`}>
                                    {msg.msg}
                                    <span className={`absolute -bottom-6 ${isMe ? 'right-0' : 'left-0'} text-[9px] font-black uppercase text-slate-600 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <footer className="p-6 bg-black/40">
                    <div className="relative flex items-center gap-4">
                        <div className="flex-1 relative">
                            <form onSubmit={handleSendMessage}>
                                <input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    type="text" 
                                    placeholder={t('type_signal')}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-2xl"
                                />
                            </form>
                        </div>
                        <button 
                            onClick={handleSendMessage}
                            className="w-14 h-14 bg-primary hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </footer>
               </>
            ) : (
                <div className="flex-1 flex items-center justify-center flex-col gap-6 text-slate-700">
                    <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                        <Users className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-sm font-black text-white/50 uppercase tracking-widest mb-1">{t('fleet_directory')}</h3>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Select an ally to establish tactical link</p>
                    </div>
                </div>
            )}
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

"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Languages, Settings, LogOut, CheckCircle, ShieldCheck, Users, History, UserCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
import { useAuth, useToast } from '@/context/AuthContext';
import SettingsModal from '@/components/settings/SettingsModal';
import AuthModal from '@/components/auth/AuthModal';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { gameState } = useGame();
  const { user, isAuthenticated, logout } = useAuth();
  const { show: showToast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Handle Logout with Notification
  const handleLogout = () => {
    logout();
    showToast(t('logout_success'), 'error');
  };

  // Hide header in battle or during placement
  if (pathname === '/battle' || pathname === '/placement') return null;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.inner}>
            {/* Left Side: Logo & Nav */}
            <div className="flex items-center gap-4 lg:gap-12">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 shadow-[0_0_20px_rgba(25,93,230,0.4)] group-hover:shadow-primary transition-all">
                  <div className="w-4 h-4 rounded-full border-2 border-primary animate-pulse"></div>
                </div>
                <span className="font-black text-lg md:text-xl tracking-tighter uppercase text-white scale-y-110">
                  BATTLESHIP <span className="text-slate-400 font-light hidden xs:inline">COMMAND</span>
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-6 xl:gap-10 text-[12px] xl:text-[13px] font-black uppercase tracking-[0.2em] shrink-0">
                <NavLink href="/" active={pathname === '/'}>{t('lobby')}</NavLink>
                <NavLink href="/leaderboard" active={pathname === '/leaderboard'}>{t('leaderboard')}</NavLink>
                <NavLink href="/how-to-play" active={pathname === '/how-to-play'}>{t('how_to_play')}</NavLink>
              </nav>
            </div>

            {/* Right Side: Search, Language & User */}
            <div className="flex items-center gap-3 md:gap-6 shrink-0">


              <div className="hidden xl:block relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('search_room')} 
                  className={styles['search-input']}
                />
              </div>

              <div className="flex items-center gap-2 md:gap-4 sm:gap-6 border-l border-slate-800/50 h-8 md:h-10 pl-3 md:pl-8">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 md:p-2 text-slate-400 hover:text-white transition-all hover:scale-110"
                  title={t('settings')}
                >
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden xl:flex flex-col items-end mr-1">
                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('commander')}</span>
                       <span className="text-xs font-black uppercase text-white tracking-widest leading-none">{user?.username}</span>
                    </div>
                    <div className="relative group/user">
                       <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl border-2 border-primary/40 bg-slate-800 flex items-center justify-center overflow-hidden hover:border-primary transition-all shadow-xl shadow-primary/10">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="User" />
                       </button>
                       <div className="absolute top-12 right-0 w-56 bg-[#0a0e1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all translate-y-2 group-hover/user:translate-y-0 z-50 shadow-2xl">
                          <div className="px-3 py-2 border-b border-white/5 mb-1 flex flex-col gap-0.5">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{t('commander')}</span>
                             <span className="text-[11px] font-black text-white uppercase tracking-wider">{user?.username}</span>
                          </div>
                          
                          <Link 
                            href="/profile"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          >
                             <UserCircle className="w-4 h-4 text-primary" />
                             {t('profile')}
                          </Link>
                          
                          <Link 
                            href="/friends"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          >
                             <Users className="w-4 h-4 text-emerald-500" />
                             {t('friends')}
                          </Link>
                          
                          <Link 
                            href="/history"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          >
                             <History className="w-4 h-4 text-amber-500" />
                             {t('battle_history')}
                          </Link>

                          <div className="h-px bg-white/5 my-1" />

                          <Link 
                            href="/feedback"
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          >
                             <MessageSquare className="w-4 h-4 text-primary" />
                             {t('feedback')}
                          </Link>
                          
                          <div className="h-px bg-white/5 my-1" />
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-error hover:bg-error/10 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          >
                             <LogOut className="w-4 h-4" />
                             {t('logout')}
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-primary hover:bg-blue-600 text-white border border-primary/30 rounded-xl transition-all font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-[0_0_15px_rgba(25,93,230,0.3)] hover:shadow-[0_0_25px_rgba(25,93,230,0.5)] active:scale-95"
                  >
                    <User className="w-4 h-4 ml-[-2px]" />
                    <span className="hidden xs:inline">{t('login')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function NavLink({ 
  href, 
  children, 
  active = false, 
  restricted = false,
  onRestrictedClick
}: { 
  href: string; 
  children: React.ReactNode; 
  active?: boolean;
  restricted?: boolean;
  onRestrictedClick?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  
  if (restricted && !isAuthenticated) {
    return (
      <button 
        onClick={onRestrictedClick}
        className="transition-all relative py-2 text-slate-400 hover:text-primary group"
      >
        <div className="flex items-center gap-2">
          {children}
          <div className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
        </div>
      </button>
    );
  }

  return (
    <Link 
      href={href} 
      className={`transition-all relative py-2 ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {children}
      {active && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_1px_8px_rgba(25,93,230,0.6)]"></div>}
    </Link>
  );
}

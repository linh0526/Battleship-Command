"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, Languages, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGame } from '@/context/GameContext';
import SettingsModal from '@/components/settings/SettingsModal';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { gameState } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Hide header in battle or during rematch placement (sometimes we want to keep it if requested, but current logic hides it)
  // The user asked for settings in header, so maybe they want it visible or they want it in the battle header too.
  // Keeping it hidden in battle as per current design, but will add it to BattleHeader separately.
  if (pathname === '/battle' || (pathname === '/placement' && gameState.roomId)) return null;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.inner}>
            {/* Left Side: Logo & Nav */}
            <div className="flex items-center gap-12 text-nowrap">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 shadow-[0_0_20px_rgba(25,93,230,0.4)] group-hover:shadow-primary transition-all">
                  <div className="w-4 h-4 rounded-full border-2 border-primary animate-pulse"></div>
                </div>
                <span className="font-black text-xl tracking-tighter uppercase text-white scale-y-110">
                  BATTLESHIP <span className="text-slate-400 font-light">COMMAND</span>
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-10 text-[13px] font-black uppercase tracking-[0.2em] shrink-0">
                <NavLink href="/" active={pathname === '/'}>{t('lobby')}</NavLink>
                <NavLink href="/leaderboard" active={pathname === '/leaderboard'}>{t('leaderboard')}</NavLink>
                <NavLink href="/how-to-play" active={pathname === '/how-to-play'}>{t('how_to_play')}</NavLink>
              </nav>
            </div>

            {/* Right Side: Search, Language & User */}
            <div className="flex items-center gap-6 shrink-0">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-900/40 rounded-lg p-1 border border-slate-800/50">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all ${language === 'en' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('vi')}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all ${language === 'vi' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  VI
                </button>
              </div>

              <div className="hidden sm:block relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('search_room')} 
                  className={styles['search-input']}
                />
              </div>

              <div className="flex items-center gap-4 sm:gap-6 border-l border-slate-800/50 h-10 pl-6 sm:pl-8">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-white transition-all hover:scale-110"
                  title={t('settings')}
                >
                  <Settings className="w-6 h-6" />
                </button>
                <button className="relative p-2 text-slate-400 hover:text-white transition-all hover:scale-110">
                  <Bell className="w-6 h-6" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-[#0a0e1a] shadow-[0_0_10px_#ef4444]"></div>
                </button>
                <button className="w-10 h-10 rounded-xl border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden hover:border-primary transition-all shadow-xl">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

function NavLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
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

"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import { useGame, GamePhase } from '@/context/GameContext';

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { gameState } = useGame();

  // Hide footer on specific pages or during active game phases
  if (
    pathname === '/profile' || 
    pathname === '/messages' || 
    pathname === '/friends' ||
    pathname === '/battle' ||
    pathname === '/placement' ||
    gameState.gameStatus === GamePhase.PLACEMENT ||
    gameState.gameStatus === GamePhase.PLAYING ||
    gameState.gameStatus === GamePhase.ENDED
  ) return null;
  
  return (
    <footer className="app-footer">
      <div className="content-wrapper px-6 w-full flex justify-center">
          <p className="text-slate-400 text-[13px] font-black font-mono tracking-[0.3em] uppercase italic select-none">
            "{t('footer_quote')}"
          </p>
      </div>
    </footer>
  );
}

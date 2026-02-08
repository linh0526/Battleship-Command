"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="app-footer">
      <div className="content-wrapper px-6 w-full flex justify-center">
          <p className="text-slate-400 text-[10px] font-black font-mono tracking-[0.3em] uppercase italic select-none">
            "{t('footer_quote')}"
          </p>
      </div>
    </footer>
  );
}

"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface GlobalLoadingProps {
  message?: string;
  messageKey?: string;
  fullScreen?: boolean;
}

export default function GlobalLoading({ message, messageKey, fullScreen = true }: GlobalLoadingProps) {
  const { t } = useLanguage();
  
  const displayMessage = message || (messageKey ? t(messageKey) : t('establishing_uplink'));

  const content = (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'fixed inset-0 z-[200] bg-[#0a0e1a] w-full' : 'w-full py-20'}`}>
      <div className="relative">
        <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse text-center">
          {displayMessage}
        </p>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );

  return content;
}

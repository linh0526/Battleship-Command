"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type BattleLayout = 'tactical' | 'parallel';

interface SettingsContextType {
  battleLayout: BattleLayout;
  setBattleLayout: (layout: BattleLayout) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [battleLayout, setBattleLayoutState] = useState<BattleLayout>('tactical');

  // Load from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('battleLayout') as BattleLayout;
    if (savedLayout && (savedLayout === 'tactical' || savedLayout === 'parallel')) {
      setBattleLayoutState(savedLayout);
    }
  }, []);

  const setBattleLayout = (layout: BattleLayout) => {
    setBattleLayoutState(layout);
    localStorage.setItem('battleLayout', layout);
  };

  return (
    <SettingsContext.Provider value={{ battleLayout, setBattleLayout }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

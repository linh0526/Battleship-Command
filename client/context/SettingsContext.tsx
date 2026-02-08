"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type BattleLayout = 'tactical' | 'parallel';
export type BackgroundMode = 
  | 'tactical-grid'
  | 'radar-sweep'
  | 'dark-ocean-waves'
  | 'tactical-lines';

interface SettingsContextType {
  battleLayout: BattleLayout;
  setBattleLayout: (layout: BattleLayout) => void;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [battleLayout, setBattleLayoutState] = useState<BattleLayout>('tactical');
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>('tactical-grid');

  // Load from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('battleLayout') as BattleLayout;
    if (savedLayout && (savedLayout === 'tactical' || savedLayout === 'parallel')) {
      setBattleLayoutState(savedLayout);
    }

    const savedBgMode = localStorage.getItem('backgroundMode') as BackgroundMode;
    const validModes: BackgroundMode[] = [
      'tactical-grid', 'radar-sweep', 
      'dark-ocean-waves', 'tactical-lines'
    ];
    
    if (savedBgMode && validModes.includes(savedBgMode)) {
      setBackgroundModeState(savedBgMode);
    }
  }, []);

  const setBattleLayout = (layout: BattleLayout) => {
    setBattleLayoutState(layout);
    localStorage.setItem('battleLayout', layout);
  };

  const setBackgroundMode = (mode: BackgroundMode) => {
    setBackgroundModeState(mode);
    localStorage.setItem('backgroundMode', mode);
  };

  return (
    <SettingsContext.Provider value={{ 
      battleLayout, setBattleLayout,
      backgroundMode, setBackgroundMode
    }}>
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

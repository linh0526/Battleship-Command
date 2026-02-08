"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type BattleLayout = 'tactical' | 'parallel';
export type BackgroundMode = 
  | 'tactical-grid'
  | 'radar-sweep'
  | 'dark-ocean-waves'
  | 'tactical-lines';

export type HealthBarStyle = 'modern' | 'minimalist';

interface SettingsContextType {
  battleLayout: BattleLayout;
  setBattleLayout: (layout: BattleLayout) => void;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
  enableSound: boolean;
  setEnableSound: (enabled: boolean) => void;
  enableVibration: boolean;
  setEnableVibration: (enabled: boolean) => void;
  healthBarStyle: HealthBarStyle;
  setHealthBarStyle: (style: HealthBarStyle) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [battleLayout, setBattleLayoutState] = useState<BattleLayout>('tactical');
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>('tactical-grid');
  const [enableSound, setEnableSoundState] = useState<boolean>(true);
  const [enableVibration, setEnableVibrationState] = useState<boolean>(true);
  const [healthBarStyle, setHealthBarStyleState] = useState<HealthBarStyle>('modern');

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

    const savedSound = localStorage.getItem('enableSound');
    if (savedSound !== null) {
      setEnableSoundState(savedSound === 'true');
    }

    const savedVibration = localStorage.getItem('enableVibration');
    if (savedVibration !== null) {
      setEnableVibrationState(savedVibration === 'true');
    }

    const savedHealthStyle = localStorage.getItem('healthBarStyle') as HealthBarStyle;
    if (savedHealthStyle === 'modern' || savedHealthStyle === 'minimalist') {
      setHealthBarStyleState(savedHealthStyle);
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

  const setEnableSound = (enabled: boolean) => {
    setEnableSoundState(enabled);
    localStorage.setItem('enableSound', String(enabled));
  };

  const setEnableVibration = (enabled: boolean) => {
    setEnableVibrationState(enabled);
    localStorage.setItem('enableVibration', String(enabled));
  };

  const setHealthBarStyle = (style: HealthBarStyle) => {
    setHealthBarStyleState(style);
    localStorage.setItem('healthBarStyle', style);
  };

  return (
    <SettingsContext.Provider value={{ 
      battleLayout, setBattleLayout,
      backgroundMode, setBackgroundMode,
      enableSound, setEnableSound,
      enableVibration, setEnableVibration,
      healthBarStyle, setHealthBarStyle
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

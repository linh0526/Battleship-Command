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
  backgroundMode: BackgroundMode;
  setBackgroundMode: (mode: BackgroundMode) => void;
  enableSound: boolean;
  setEnableSound: (enabled: boolean) => void;
  enableVibration: boolean;
  setEnableVibration: (enabled: boolean) => void;
  healthBarStyle: HealthBarStyle;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const battleLayout: BattleLayout = 'tactical';
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>('tactical-grid');
  const [enableSound, setEnableSoundState] = useState<boolean>(true);
  const [enableVibration, setEnableVibrationState] = useState<boolean>(true);
  const healthBarStyle: HealthBarStyle = 'modern';

  // Load from localStorage on mount
  useEffect(() => {
    // Layout and HealthBar style are now defaults (tactical/modern)

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
  }, []);

  // setBattleLayout is now removed as it is hardcoded to 'tactical'

  const setBackgroundMode = React.useCallback((mode: BackgroundMode) => {
    setBackgroundModeState(mode);
    localStorage.setItem('backgroundMode', mode);
  }, []);

  const setEnableSound = React.useCallback((enabled: boolean) => {
    setEnableSoundState(enabled);
    localStorage.setItem('enableSound', String(enabled));
  }, []);

  const setEnableVibration = React.useCallback((enabled: boolean) => {
    setEnableVibrationState(enabled);
    localStorage.setItem('enableVibration', String(enabled));
  }, []);

  const contextValue = React.useMemo(() => ({
    battleLayout,
    backgroundMode, setBackgroundMode,
    enableSound, setEnableSound,
    enableVibration, setEnableVibration,
    healthBarStyle
  }), [backgroundMode, setBackgroundMode, enableSound, setEnableSound, enableVibration, setEnableVibration]);

  return (
    <SettingsContext.Provider value={contextValue}>
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

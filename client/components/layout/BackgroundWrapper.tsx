"use client";

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TacticalGridBackground,
  RadarSweepBackground,
  DarkOceanWavesBackground,
  TacticalLinesBackground
} from '@/components/backgrounds/MilitaryBackgrounds';

export default function BackgroundWrapper() {
  const { backgroundMode } = useSettings();

  const renderBackground = () => {
    switch (backgroundMode) {
      case 'tactical-grid':
        return <TacticalGridBackground key="tactical-grid" />;
      case 'radar-sweep':
        return <RadarSweepBackground key="radar-sweep" />;
      case 'dark-ocean-waves':
        return <DarkOceanWavesBackground key="dark-ocean-waves" />;
      case 'tactical-lines':
        return <TacticalLinesBackground key="tactical-lines" />;
      default:
        return <TacticalGridBackground key="default" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={backgroundMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 -z-50"
      >
        {renderBackground()}
      </motion.div>
    </AnimatePresence>
  );
}

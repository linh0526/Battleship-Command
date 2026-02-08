"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Common styles for full screen backgrounds
const FullScreen = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`fixed inset-0 -z-50 overflow-hidden pointer-events-none ${className}`}>
    {children}
  </div>
);

// 1. Tactical Grid (Lưới Chiến Thuật) - High Intensity
export const TacticalGridBackground = () => (
  <FullScreen className="bg-[#020508]">
    {/* Ultra Layered Grid */}
    <div className="absolute inset-0 opacity-20" 
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 255, 127, 0.2) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0, 255, 127, 0.2) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}
    />
    <div className="absolute inset-0 opacity-40" 
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 255, 127, 0.4) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0, 255, 127, 0.4) 1px, transparent 1px)`,
        backgroundSize: '100px 100px'
      }}
    />
    
    {/* Scanning Glow Bar */}
    <motion.div 
      animate={{ translateY: ['-100%', '1100%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-transparent via-green-500/20 to-transparent z-10"
    />

    {/* Focal Point Glows */}
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
    
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,5,8,0.95)_100%)]" />
  </FullScreen>
);

// 2. Radar Sweep (Radar Quét) - Intense Scanning
export const RadarSweepBackground = () => (
  <FullScreen className="bg-[#020406]">
    {/* Peripheral Rings */}
    <div className="absolute inset-0 flex items-center justify-center">
      {[40, 80, 120, 160, 200].map((size, i) => (
        <motion.div key={i} 
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
          className="rounded-full border-[2px] border-green-500/20 absolute"
          style={{ width: `${size}vh`, height: `${size}vh` }}
        />
      ))}
    </div>

    {/* Primary Beam */}
    <div className="absolute inset-0 flex items-center justify-center">
       <div className="w-[350vmax] h-[350vmax] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,0,0.3)_10deg,rgba(0,255,0,0.6)_45deg,rgba(0,255,0,0.1)_50deg,transparent_60deg)] animate-[spin_3s_linear_infinite]" />
    </div>

    {/* High-Alert Targets */}
    {[
      { t: '15%', l: '25%', c: 'bg-red-500' },
      { t: '75%', l: '65%', c: 'bg-yellow-500' },
      { t: '40%', l: '80%', c: 'bg-red-500' },
    ].map((m, i) => (
      <motion.div key={i}
        animate={{ scale: [0.5, 1.5, 0.5], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 1.2 }}
        className={`absolute w-4 h-4 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.5)] ${m.c}`}
        style={{ top: m.t, left: m.l }}
      />
    ))}

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,4,6,0.9)_90%)]" />
  </FullScreen>
);

// 3. Dark Ocean Waves (Sóng Biển Đêm) - Moody & Powerful
export const DarkOceanWavesBackground = () => (
  <FullScreen className="bg-black">
    {/* Deep blue glow pools */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128] via-black to-black opacity-60" />
    
    <div className="absolute inset-0">
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={i}
          animate={{ x: [-100, 100, -100], y: [0, 30, 0] }}
          transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[200%] h-full opacity-30"
          style={{ top: `${15 * i}%`, left: '-50%' }}
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full scale-y-50">
             <path fill="none" stroke={i === 0 ? "#1e40af" : (i === 1 ? "#3b82f6" : "#0ea5e9")} strokeWidth="8"
               d="M0,160 C320,300 420,0 640,160 C860,320 960,0 1280,160 L1440,160" />
          </svg>
        </motion.div>
      ))}
    </div>

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,50,255,0.1),transparent_70%)]" />
  </FullScreen>
);

// 4. Tactical Lines (HUD Quân Sự) - Ultra Tech
export const TacticalLinesBackground = () => (
  <FullScreen className="bg-black">
    {/* Central Target HUD */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="w-[70vh] h-[70vh] border border-cyan-500/10 rounded-full flex items-center justify-center">
        <div className="w-[68vh] h-[68vh] border-[4px] border-dashed border-cyan-500/5 rounded-full" />
      </motion.div>
      
      <div className="absolute w-[95%] h-[1px] bg-cyan-500/10" />
      <div className="absolute w-[1px] h-[95%] bg-cyan-500/10" />
    </div>

    {/* Bright HUD Brackets */}
    <div className="absolute inset-8 border border-cyan-500/10 opacity-30" />
    <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
    <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />

    {/* Scrolling Log Data */}
    <div className="absolute left-10 top-1/2 -translate-y-1/2 font-mono text-[9px] text-cyan-400/40 uppercase tracking-widest hidden lg:block">
      <p>SYSTEM_REBOOT... OK</p>
      <p>NEURAL_LINK... CONNECTED</p>
      <p>FLEET_SYNC... 100%</p>
      <p className="text-red-500/60 animate-pulse">WAR_MODE_ENGAGED</p>
    </div>
  </FullScreen>
);

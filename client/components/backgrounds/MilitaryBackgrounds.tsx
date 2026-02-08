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
  <FullScreen className="bg-[#020508]">
    {/* Subtle Base Grid */}
    <div className="absolute inset-0 opacity-5" 
      style={{
        backgroundImage: `linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(34, 211, 238, 0.2) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />

    {/* Central Target HUD - Multi Layered */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="w-[80vh] h-[80vh] border border-cyan-500/10 rounded-full flex items-center justify-center relative">
        <div className="w-[78vh] h-[78vh] border-[4px] border-dashed border-cyan-500/5 rounded-full" />
        {/* Orbiting points */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 blur-[2px] rounded-full shadow-[0_0_10px_#22d3ee]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 blur-[2px] rounded-full shadow-[0_0_10px_#22d3ee]" />
      </motion.div>

      <motion.div animate={{ rotate: -360 }} transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[60vh] h-[60vh] border border-cyan-500/5 rounded-full border-t-cyan-500/20 border-b-cyan-500/20" />
      
      <div className="absolute w-[98%] h-[1px] bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]" />
      <div className="absolute w-[1px] h-[98%] bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]" />

      {/* Target Crosshair */}
      <div className="absolute w-20 h-[2px] bg-cyan-500/40" />
      <div className="absolute h-20 w-[2px] bg-cyan-500/40" />
    </div>

    {/* HUD Brackets - All Corners */}
    <div className="absolute inset-10 border border-cyan-500/5 opacity-20 pointer-events-none" />
    
    {/* Corner Details */}
    {[
      "top-10 left-10 border-t-2 border-l-2",
      "top-10 right-10 border-t-2 border-r-2",
      "bottom-10 left-10 border-b-2 border-l-2",
      "bottom-10 right-10 border-b-2 border-r-2"
    ].map((pos, i) => (
      <div key={i} className={`absolute w-32 h-32 border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.3)] ${pos} pointer-events-none`}>
        <div className={`absolute ${pos.includes('top') ? 'top-[-2px]' : 'bottom-[-2px]'} ${pos.includes('left') ? 'left-4' : 'right-4'} w-12 h-1 bg-cyan-400/60`} />
        <div className={`absolute ${pos.includes('left') ? 'left-[-2px]' : 'right-[-2px]'} ${pos.includes('top') ? 'top-4' : 'bottom-4'} h-12 w-1 bg-cyan-400/60`} />
      </div>
    ))}

    {/* Floating HUD Elements */}
    <div className="absolute left-16 top-1/2 -translate-y-1/2 font-mono text-[9px] text-cyan-400/60 uppercase tracking-[0.3em] hidden xl:flex flex-col gap-6 pointer-events-none">
      <div className="space-y-1 bg-cyan-950/20 p-3 border-l-2 border-cyan-500/40">
        <p className="text-cyan-300">CORE_VITAL: STABLE</p>
        <p>SAT_LINK: ONLINE</p>
        <p>ENCRYPTION: AES-256</p>
        <p className="text-xs font-black mt-2">SECTOR_7A_SCAN</p>
      </div>
      
      <div className="space-y-1 opacity-40">
        <p>LAT: 35.6895° N</p>
        <p>LONG: 139.6917° E</p>
        <p>DEPTH: 2,450M</p>
      </div>

      <motion.div 
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-red-500 font-black border border-red-500/30 p-2 bg-red-500/5 text-center"
      >
        THREAT_DETECTED
      </motion.div>
    </div>

    {/* Right Side Data Stream */}
    <div className="absolute right-16 bottom-24 font-mono text-[8px] text-cyan-400/40 hidden xl:block pointer-events-none">
       <div className="flex flex-col items-end gap-1">
          {[...Array(8)].map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ x: [0, -5, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
            >
              {Math.random().toString(16).toUpperCase().substring(2, 14)}
            </motion.div>
          ))}
       </div>
    </div>

    {/* Scanning Line - HUD Style */}
    <motion.div 
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.5)] z-0 pointer-events-none"
    />

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,5,8,0.8)_100%)] pointer-events-none" />
  </FullScreen>
);

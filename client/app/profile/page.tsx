"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Shield, Trophy, Target, Zap, Waves, Settings, Award, Star, Ship } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full pb-6 overflow-hidden">
        
        {/* Left Column: Avatar & Basic Info */}
        <aside className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scroll">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent" />
            
            <div className="relative mb-6">
                <div className="w-40 h-40 rounded-[2rem] border-4 border-primary/40 p-1 bg-slate-900 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-105 duration-500">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" className="w-full h-full rounded-[1.8rem] object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-primary rounded-2xl border-4 border-[#0a0e1a] flex items-center justify-center text-white shadow-lg">
                    <Shield className="w-6 h-6" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-tighter scale-y-110 mb-1 py-1">
                {user?.username}
            </h2>
            <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                Fleet Admiral • Level 42
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
                <MiniStat label="Matches" value="2,482" />
                <MiniStat label="Win Ratio" value="68.4%" />
            </div>

            <div className="w-full mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col gap-2 text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Status</span>
                <p className="text-[11px] font-bold text-white leading-relaxed italic">
                    "Patrolling the Okhotsk sector. Sonar readings are stable."
                </p>
            </div>

            <button className="w-full mt-6 py-4 bg-primary/10 hover:bg-primary border border-primary/30 text-primary hover:text-white rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 group">
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                {t('edit_profile') || 'Edit Profile'}
            </button>
          </motion.div>

          {/* Level Progress */}
          <div className="bg-[#0a0e1a]/40 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience Points</span>
                <span className="text-xs font-black text-white tracking-widest">8,450 / 9,000 XP</span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_15px_rgba(25,93,230,0.5)]"
                />
            </div>
          </div>
        </aside>

        {/* Right Column: Detailed Stats & Achievements */}
        <main className="lg:col-span-8 flex flex-col gap-8 overflow-y-auto pr-2 custom-scroll">
          
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <BigStat icon={<Target className="text-error" />} label="Accuracy" value="72%" />
            <BigStat icon={<Zap className="text-amber-500" />} label="Sunk Ships" value="12.4k" />
            <BigStat icon={<Ship className="text-primary" />} label="Fleet Command" value="Class S" />
            <BigStat icon={<Trophy className="text-emerald-500" />} label="Medals" value="18" />
          </div>

          {/* Achievements Section */}
          <div className="bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-3 mb-8">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Hall of Achievements</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AchievementItem 
                    title="Legendary Admiral" 
                    desc="Reached Level 40 in a single season." 
                    icon={<Star className="w-6 h-6" />}
                    unlocked={true}
                />
                <AchievementItem 
                    title="Ghost in the Shell" 
                    desc="Won 50 matches without losing a single ship." 
                    icon={<Shield className="w-6 h-6" />}
                    unlocked={true}
                />
                <AchievementItem 
                    title="Kraken Slayer" 
                    desc="Eliminate 1000 opponent ships in PvP mode." 
                    icon={<Waves className="w-6 h-6" />}
                    unlocked={false}
                />
                <AchievementItem 
                    title="Perfect Salvo" 
                    desc="Sink 3 ships in a single Salvo turn." 
                    icon={<Zap className="w-6 h-6" />}
                    unlocked={true}
                />
            </div>
          </div>
        </main>

    </div>
  );
}

function MiniStat({ label, value }: any) {
    return (
        <div className="p-3 bg-white/5 rounded-2xl flex flex-col gap-0.5 border border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
            <span className="text-sm font-black text-white tracking-widest">{value}</span>
        </div>
    );
}

function BigStat({ icon, label, value }: any) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-[#0a0e1a]/40 border border-white/5 rounded-3xl flex flex-col items-center gap-2 group transition-all hover:bg-white/5"
        >
            <div className="p-3 bg-white/5 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-xl font-black text-white tracking-tighter">{value}</span>
        </motion.div>
    );
}

function AchievementItem({ title, desc, icon, unlocked }: any) {
    return (
        <div className={`p-4 rounded-3xl border flex gap-4 transition-all duration-300 ${
            unlocked 
            ? 'bg-primary/5 border-primary/20 opacity-100 hover:bg-primary/10' 
            : 'bg-black/20 border-white/5 opacity-50 grayscale'
        }`}>
            <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border ${
                unlocked ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-slate-600'
            }`}>
                {icon}
            </div>
            <div className="flex flex-col gap-1 justify-center">
                <h4 className="text-sm font-black text-white uppercase tracking-wide leading-none">{title}</h4>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">{desc}</p>
            </div>
        </div>
    );
}

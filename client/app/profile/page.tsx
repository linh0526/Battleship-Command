"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Shield, Trophy, Target, Zap, Waves, Settings, Award, Star, Ship } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ACHIEVEMENT_DATA: Record<string, { title: string; desc: string; icon: any }> = {
    // 1. Matches Played
    'ROOKIE': { title: 'Tân binh biển cả', desc: 'Chơi 1 trận', icon: <Ship /> },
    'SKIRMISHER': { title: 'Làm quen chiến trường', desc: 'Chơi 5 trận', icon: <Ship /> },
    'SAILOR': { title: 'Thủy thủ chính hiệu', desc: 'Chơi 10 trận', icon: <Ship /> },
    'VETERAN': { title: 'Lão làng đại dương', desc: 'Chơi 50 trận', icon: <Ship /> },
    'LEGEND': { title: 'Huyền thoại Battleship', desc: 'Chơi 100 trận', icon: <Ship /> },

    // 2. Matches Won
    'FIRST_VICTORY': { title: 'Chiến thắng đầu tiên', desc: 'Thắng 1 trận', icon: <Trophy /> },
    'CAPTAIN': { title: 'Thuyền trưởng', desc: 'Thắng 5 trận', icon: <Trophy /> },
    'ADMIRAL': { title: 'Đô đốc', desc: 'Thắng 10 trận', icon: <Trophy /> },
    'INVINCIBLE': { title: 'Bất khả chiến bại', desc: 'Thắng 25 trận', icon: <Trophy /> },
    'SEA_RULER': { title: 'Thống trị đại dương', desc: 'Thắng 50 trận', icon: <Trophy /> },

    // 3. Total Shots
    'OPEN_FIRE': { title: 'Khai hỏa', desc: 'Bắn 10 phát', icon: <Target /> },
    'GUNNER_TRAINEE': { title: 'Xạ thủ tập sự', desc: 'Bắn 50 phát', icon: <Target /> },
    'CANNONEER': { title: 'Pháo thủ', desc: 'Bắn 100 phát', icon: <Target /> },
    'RAIN_OF_FIRE': { title: 'Mưa đạn', desc: 'Bắn 500 phát', icon: <Target /> },
    'FIRESTORM': { title: 'Bão lửa', desc: 'Bắn 1000 phát', icon: <Target /> },

    // 4. Hit Shots
    'FIRST_HIT': { title: 'Trúng rồi', desc: 'Trúng 1 phát', icon: <Zap /> },
    'SHARP_NOSE': { title: 'Đánh hơi tốt', desc: 'Trúng 10 phát', icon: <Zap /> },
    'SEA_ASSASSIN': { title: 'Sát thủ biển khơi', desc: 'Trúng 50 phát', icon: <Zap /> },
    'LIVING_RADAR': { title: 'Máy quét sống', desc: 'Trúng 200 phát', icon: <Zap /> },

    // 5. Ships Destroyed
    'SINKER': { title: 'Chìm rồi', desc: 'Đánh chìm 1 tàu', icon: <Waves /> },
    'SHIP_HUNTER': { title: 'Kẻ săn tàu', desc: 'Đánh chìm 5 tàu', icon: <Waves /> },
    'DESTROYER': { title: 'Kẻ hủy diệt', desc: 'Đánh chìm 20 tàu', icon: <Waves /> },
    'SEA_NIGHTMARE': { title: 'Ác mộng đại dương', desc: 'Đánh chìm 50 tàu', icon: <Waves /> },

    // 6. Win Streak
    'WIN_STREAK_3': { title: 'Chuỗi chiến thắng', desc: 'Thắng liên tiếp 3 trận', icon: <Award /> },
    'WIN_STREAK_5': { title: 'Không thể cản phá', desc: 'Thắng liên tiếp 5 trận', icon: <Award /> },
    'WAR_GOD': { title: 'Thần chiến tranh', desc: 'Thắng liên tiếp 10 trận', icon: <Award /> },

    // 7. Special
    'SALTY': { title: 'Cay cú', desc: 'Thua 5 trận liên tiếp', icon: <User /> },
    'GUESSING_MASTER': { title: 'Cao thủ đoán mò', desc: 'Thắng khi chính xác < 30%', icon: <Target /> },
    'BLITZKRIEG': { title: 'Đánh nhanh thắng gọn', desc: 'Thắng dưới 20 lượt bắn', icon: <Zap /> },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile); // User model has populate('profile')
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, []);

  const stats = profile?.stats?.pvp || {};
  const ach = profile?.achievements || {};
  const unlockedIds = ach.unlocked || [];
  
  // Calculate display values
  const totalMatches = stats.matches || 0;
  const winRate = totalMatches > 0 ? ((stats.wins / totalMatches) * 100).toFixed(1) : 0;
  const rank = stats.wins >= 50 ? 'Thống trị đại dương' : 
               stats.wins >= 25 ? 'Bất khả chiến bại' : 
               stats.wins >= 10 ? 'Đô đốc' : 
               stats.wins >= 5 ? 'Thuyền trưởng' : 
               stats.wins >= 1 ? 'Chiến thắng đầu tiên' : 'Tân binh';
               
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
                {rank} • Wins: {stats.wins || 0}
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
                <MiniStat label="Matches" value={totalMatches.toString()} />
                <MiniStat label="Win Ratio" value={`${winRate}%`} />
            </div>

            <div className="w-full mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col gap-2 text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Achievements Unlocked</span>
                <p className="text-[14px] font-bold text-white leading-relaxed font-mono">
                    {unlockedIds.length} / {Object.keys(ACHIEVEMENT_DATA).length}
                </p>
            </div>

            <button className="w-full mt-6 py-4 bg-primary/10 hover:bg-primary border border-primary/30 text-primary hover:text-white rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 group">
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                {t('edit_profile') || 'Edit Profile'}
            </button>
          </motion.div>

          {/* XP Progress (Mocked based on Hits for now) */}
          <div className="bg-[#0a0e1a]/40 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Hits XP</span>
                <span className="text-xs font-black text-white tracking-widest">{ach.hitShots || 0} XP</span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((ach.hitShots || 0) / 10, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-[0_0_15px_rgba(25,93,230,0.5)]"
                />
            </div>
          </div>
        </aside>

        {/* Right Column: Detailed Stats & Achievements */}
        <main className="lg:col-span-8 flex flex-col gap-8 overflow-y-auto pr-2 custom-scroll">
          
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <BigStat icon={<Target className="text-error" />} label="Accuracy" value={`${stats.accuracy || 0}%`} />
            <BigStat icon={<Zap className="text-amber-500" />} label="Sunk Ships" value={ach.shipsDestroyed || 0} />
            <BigStat icon={<Ship className="text-primary" />} label="Total Shots" value={ach.totalShots || 0} />
            <BigStat icon={<Trophy className="text-emerald-500" />} label="Streak" value={ach.winStreak || 0} />
          </div>

          {/* Achievements Section */}
          <div className="bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-3 mb-8">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Hall of Achievements</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(ACHIEVEMENT_DATA).map(([id, data]) => {
                    const isUnlocked = unlockedIds.includes(id);
                    return (
                        <AchievementItem 
                            key={id}
                            title={data.title} 
                            desc={data.desc} 
                            icon={data.icon}
                            unlocked={isUnlocked}
                        />
                    );
                })}
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

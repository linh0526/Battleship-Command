"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { User, Shield, Trophy, Target, Zap, Waves, Settings, Award, Star, Ship, X, Camera, Check, Link as LinkIcon, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRank } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ACHIEVEMENT_CATEGORIES = [
    {
        id: 'campaign',
        label: 'Chiến Dịch',
        icon: <Ship />,
        color: '#3b82f6',
        getStat: (p: any) => p?.stats?.pvp?.matches || 0,
        tiers: [
            { id: 'ROOKIE', goal: 10, title: 'Tân binh biển cả' },
            { id: 'SAILOR', goal: 50, title: 'Thủy thủ chính hiệu' },
            { id: 'LEGEND', goal: 100, title: 'Huyền thoại hạm đội' }
        ]
    },
    {
        id: 'victory',
        label: 'Vinh Quang',
        icon: <Trophy />,
        color: '#f59e0b',
        getStat: (p: any) => p?.stats?.pvp?.wins || 0,
        tiers: [
            { id: 'FIRST_VICTORY', goal: 5, title: 'Chiến thắng đầu' },
            { id: 'CAPTAIN', goal: 25, title: 'Thuyền trưởng' },
            { id: 'ADMIRAL', goal: 50, title: 'Đô đốc đại dương' }
        ]
    },
    {
        id: 'artillery',
        label: 'Pháo Binh',
        icon: <Target />,
        color: '#ef4444',
        getStat: (p: any) => p?.achievements?.totalShots || 0,
        tiers: [
            { id: 'OPEN_FIRE', goal: 50, title: 'Khai hỏa' },
            { id: 'CANNONEER', goal: 200, title: 'Pháo thủ' },
            { id: 'FIRESTORM', goal: 1000, title: 'Bão lửa' }
        ]
    },
    {
        id: 'gunnery',
        label: 'Xạ Thủ',
        icon: <Zap />,
        color: '#06b6d4',
        getStat: (p: any) => p?.achievements?.hitShots || 0,
        tiers: [
            { id: 'FIRST_HIT', goal: 20, title: 'Trúng đích' },
            { id: 'SEA_ASSASSIN', goal: 100, title: 'Sát thủ biển' },
            { id: 'LIVING_RADAR', goal: 500, title: 'Máy quét sống' }
        ]
    },
    {
        id: 'destruction',
        label: 'Hủy Diệt',
        icon: <Waves />,
        color: '#a855f7',
        getStat: (p: any) => p?.achievements?.shipsSunk || 0,
        tiers: [
            { id: 'SINKER', goal: 5, title: 'Kẻ săn tàu' },
            { id: 'DESTROYER', goal: 25, title: 'Kẻ hủy diệt' },
            { id: 'SEA_NIGHTMARE', goal: 100, title: 'Ác mộng biển' }
        ]
    },
    {
        id: 'supremacy',
        label: 'Bất Bại',
        icon: <Award />,
        color: '#10b981',
        getStat: (p: any) => p?.achievements?.winStreak || 0,
        tiers: [
            { id: 'STREAK_3', goal: 3, title: 'Chuỗi thắng 3' },
            { id: 'STREAK_5', goal: 5, title: 'Chuỗi thắng 5' },
            { id: 'WAR_GOD', goal: 10, title: 'Thần chiến tranh' }
        ]
    }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    username: '',
    avatar: '',
    bio: ''
  });

  const AVATAR_STYLES = [
    'avataaars', 'bottts', 'adventurer', 'fun-emoji', 'pixel-art', 'lorelei'
  ];

  const router = useRouter();

  React.useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setEditForm({
                  username: data.username || '',
                  avatar: data.avatar || '',
                  bio: data.profile?.bio || ''
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
        const token = localStorage.getItem('auth-token');
        const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token || ''
            },
            body: JSON.stringify(editForm)
        });

        if (res.ok) {
            const data = await res.json();
            setProfile(data.user.profile);
            // We might need to refresh auth context or just manually update if needed
            // For now, let's just close modal and show success
            setIsEditing(false);
            window.location.reload(); // Simple way to refresh everything
        } else {
            const err = await res.json();
            alert(err.message || 'Update failed');
        }
    } catch (err) {
        console.error(err);
    } finally {
        setSaving(false);
    }
  };

  const handleAvatarSelect = (style: string) => {
    const seed = editForm.username || 'default';
    setEditForm({ ...editForm, avatar: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}` });
  };

  const stats = profile?.stats?.pvp || {};
  const ach = profile?.achievements || {};
  const unlockedIds = ach.unlocked || [];
  
  // Calculate display values
  const totalMatches = stats.matches || 0;
  const winRate = totalMatches > 0 ? ((stats.wins / totalMatches) * 100).toFixed(1) : 0;
  
  const rank = getRank(totalMatches);
               
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10 h-full pb-10 overflow-auto lg:overflow-hidden custom-scroll px-1 md:px-2 lg:px-4">
        
        {/* Left Column: Avatar & Basic Info */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 custom-scroll shrink-0 pb-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-primary/20 to-transparent" />
            
            <div className="relative mb-4 md:mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[1.2rem] md:rounded-[1.6rem] border-4 border-primary/40 p-1 bg-slate-900 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-105 duration-500 overflow-hidden">
                    <img 
                        src={(user?.avatar && user.avatar !== '/default-avatar.png') ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Guest'}`} 
                        alt="Avatar" 
                        key={user?.avatar || 'default'}
                        className="w-full h-full rounded-[1rem] md:rounded-[1.4rem] object-cover" 
                    />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl md:rounded-2xl border-4 border-[#0a0e1a] flex items-center justify-center text-white shadow-lg">
                    <Shield className="w-4 h-4 md:w-5 h-5" />
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter scale-y-110 mb-1 py-1">
                {user?.username}
            </h2>
            <p className="text-slate-400 font-medium text-[11px] mb-4 px-4 whitespace-pre-wrap italic min-h-[1.5rem] leading-relaxed">
                {profile?.bio || t('no_bio')}
            </p>
            <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-8">
                {rank} • {t('wins_label')}: {stats.wins || 0}
            </p>

            <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
                <MiniStat label={t('matches_label')} value={totalMatches.toString()} />
                <MiniStat label={t('elo_rating')} value={stats.elo || '0'} />
                <MiniStat label={t('win_rate')} value={totalMatches > 0 ? `${winRate}%` : '0%'} />
            </div>

            <div className="w-full mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col gap-2 text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('unlocked_achievements')}</span>
                <p className="text-[14px] font-bold text-white leading-relaxed font-mono">
                    {unlockedIds.length} / 18
                </p>
            </div>

            <button 
                onClick={() => setIsEditing(true)}
                className="w-full mt-6 py-4 bg-primary/10 hover:bg-primary border border-primary/30 text-primary hover:text-white rounded-2xl transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 group"
            >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {t('edit_profile') || 'Edit Profile'}
            </button>
          </motion.div>


        </aside>

        {/* Right Column: Detailed Stats & Achievements */}
        <main className="lg:col-span-8 flex flex-col gap-8 lg:overflow-y-auto lg:pr-2 custom-scroll pb-10">
          
          {/* Achievements Section */}
          <div className="bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 lg:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">{t('hall_of_achievements')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {ACHIEVEMENT_CATEGORIES.map((category) => {
                    const currentVal = category.getStat(profile);
                    return (
                        <AchievementCategoryGroup 
                            key={category.id}
                            category={category}
                            currentValue={currentVal}
                        />
                    );
                })}
            </div>
          </div>
        </main>

        {/* Edit Profile Modal */}
        <AnimatePresence>
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEditing(false)}
                        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-[calc(100vw-2rem)] md:max-w-2xl bg-[#0a0e1a] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Static Deco Side */}
                        <div className="hidden md:flex w-1/3 bg-primary/5 border-r border-white/5 p-8 flex-col items-center justify-center text-center gap-4">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                            </div>
                            <h4 className="text-white font-black uppercase tracking-widest text-sm">{t('update_intel_title')}</h4>
                            <p className="text-slate-500 text-[10px] uppercase leading-relaxed tracking-wider">
                                {t('update_intel_desc')}
                            </p>
                        </div>

                        {/* Form Area */}
                        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scroll">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{t('edit_commander_info')}</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Username */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('callsign')}</label>
                                    <div className="relative group">
                                        <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 md:py-4 pl-12 pr-6 text-sm text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('mission_briefing')}</label>
                                    <textarea 
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white font-medium focus:border-primary outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-700"
                                        placeholder={t('bio_placeholder')}
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                    />
                                </div>

                                {/* Avatar Selection */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('id_photo')}</label>
                                    
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-16 h-16 rounded-2xl border-2 border-primary/40 p-0.5 bg-slate-900 overflow-hidden shrink-0">
                                            <img 
                                                src={(editForm.avatar && editForm.avatar !== '/default-avatar.png') ? editForm.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${editForm.username || 'Guest'}`} 
                                                alt="Current" 
                                                className="w-full h-full rounded-[0.8rem] object-cover" 
                                            />
                                        </div>
                                        <div className="relative flex-1 group">
                                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                placeholder={t('custom_url')}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-2 md:py-3 pl-12 pr-6 text-[11px] text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-700"
                                                value={editForm.avatar}
                                                onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {AVATAR_STYLES.map(style => (
                                            <button 
                                                key={style}
                                                onClick={() => handleAvatarSelect(style)}
                                                className="aspect-square rounded-xl bg-slate-900 border border-white/10 hover:border-primary overflow-hidden p-1 transition-all hover:scale-105 active:scale-95"
                                                title={style}
                                            >
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=${editForm.username || 'Guest'}`} 
                                                    alt={style}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="w-full mt-4 py-4 md:py-5 bg-primary hover:bg-blue-600 text-white rounded-2xl transition-all font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    {saving ? t('updating_data') : t('save_changes')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
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

function AchievementCategoryGroup({ category, currentValue }: any) {
    // Find active tier
    let activeTierIndex = -1;
    category.tiers.forEach((tier: any, idx: number) => {
        if (currentValue >= tier.goal) activeTierIndex = idx;
    });

    const nextTier = category.tiers[activeTierIndex + 1] || category.tiers[category.tiers.length - 1];
    const isMax = activeTierIndex === category.tiers.length - 1;
    const progress = Math.min((currentValue / nextTier.goal) * 100, 100);
    const color = category.color;

    return (
        <div className="bg-[#0a1428]/40 border border-white/5 rounded-[2rem] p-6 flex flex-col gap-5 hover:border-white/10 transition-all group shadow-xl">
            <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-lg`}
                     style={{ 
                         backgroundColor: `${color}20`, 
                         borderColor: `${color}40`,
                         color: color 
                     }}>
                    {React.cloneElement(category.icon, { size: 24, strokeWidth: 2.5 })}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{category.label}</span>
                    <span className="text-[10px] font-bold text-white uppercase" style={{ color: activeTierIndex >= 0 ? color : '#64748b' }}>
                        {activeTierIndex >= 0 ? category.tiers[activeTierIndex].title : 'CHƯA ĐẠT'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        {isMax ? 'CẤP ĐỘ TỐI ĐA' : nextTier.title}
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                        {currentValue} / {nextTier.goal}
                    </span>
                </div>
                
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full shadow-lg"
                        style={{ 
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}80` 
                        }}
                    />
                </div>
                {!isMax && (
                    <p className="text-[9px] font-medium text-slate-600 uppercase tracking-wider text-right italic">
                        CẦN {nextTier.goal - currentValue} ĐỂ LÊN CẤP KẾ TIẾP
                    </p>
                )}
            </div>

            <div className="flex gap-1.5 mt-2">
                {category.tiers.map((tier: any, idx: number) => (
                    <div 
                        key={tier.id} 
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= activeTierIndex ? '' : 'bg-white/5'}`}
                        style={{ backgroundColor: idx <= activeTierIndex ? color : undefined }}
                    />
                ))}
            </div>
        </div>
    );
}

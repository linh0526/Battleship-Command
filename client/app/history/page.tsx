"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { History, Swords, Trophy, Target, Clock, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HistoryPage() {
  const { t } = useLanguage();
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/history`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchHistory();
  }, []);
  
  // Calculate win rate from actual history
  const totalGames = history.length;
  const wins = history.filter(m => m.result === 'win').length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <History className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white scale-y-110 py-1">
                {t('battle_history')}
              </h1>
            </div>
            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">
              Tactical record of all recorded naval engagements
            </p>
          </div>

          <div className="flex gap-4">
            <StatsCard label="Win Rate" value={`${winRate}%`} icon={<Trophy className="w-4 h-4 text-amber-500" />} color="amber" />
            <StatsCard label="Total Battles" value={totalGames.toString()} icon={<Swords className="w-4 h-4 text-primary" />} color="primary" />
          </div>
        </div>

        {/* History List */}
        <div className="grid gap-4">
          {loading ? (
             <div className="p-8 text-center text-slate-500 font-mono text-sm">LOADING COMM LINK...</div>
          ) : history.length === 0 ? (
             <div className="p-8 text-center text-slate-500 font-mono text-sm">NO COMBAT RECORDS FOUND</div>
          ) : (
            history.map((match, index) => (
            <motion.div
              key={match._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden bg-[#0a0e1a]/60 backdrop-blur-xl border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        match.result === 'win' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'bg-error/10 border-error/20 text-error shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    }`}>
                        {match.result === 'win' ? <Trophy className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                match.result === 'win' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-error/20 text-error'
                            }`}>
                                {match.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                            </span>
                            <span className="text-slate-600">/</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {match.mode}
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                            VS {match.opponentName || 'Unknown'}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-center md:items-end gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                        <span className="text-xl font-black text-white font-mono tracking-tighter">
                            {match.shots?.player?.hit || 0}-{match.shots?.opponent?.hit || 0}
                        </span>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</span>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(match.endedAt).toLocaleDateString()}
                        </div>
                    </div>

                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all group/btn">
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
              </div>
            </motion.div>
          )))}
        </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color }: any) {
  return (
    <div className={`p-4 bg-[#0a0e1a]/40 backdrop-blur-md border border-white/5 rounded-2xl min-w-[140px] flex flex-col gap-1 shadow-xl hover:border-${color}/30 transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
        {icon}
      </div>
      <span className="text-xl font-black text-white tracking-tighter">{value}</span>
    </div>
  );
}

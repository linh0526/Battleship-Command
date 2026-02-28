"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Github, Heart, Mail, CheckCircle, Star, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ContactItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  hoverColor: string;
}

export default function FeedbackPage() {
  const { t } = useLanguage();
  
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('linhngyn0526@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-primary"
          >
            <div className="h-px w-12 bg-primary/30" />
            <MessageSquare className="w-8 h-8" />
            <div className="h-px w-12 bg-primary/30" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white"
          >
            {t('feedback')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs max-w-2xl mx-auto leading-relaxed"
          >
            {t('contact_info')}
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Contact Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <div className="glass-panel p-8 md:p-12 bg-slate-900/40 border-slate-800 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
               
              <div className="grid grid-cols-1 gap-6 relative z-10">
                {/* 1. Email (Top) */}
                <div className="flex items-center gap-6 p-6 bg-slate-950/40 border border-white/5 rounded-2xl transition-all group hover:border-blue-500/20">
                  <div className="text-blue-400 p-4 bg-white/5 rounded-xl transition-all group-hover:scale-110 group-hover:bg-white/10">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">{t('email_support')}</h4>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider select-all">linhngyn0526@gmail.com</p>
                      <button 
                        onClick={handleCopyEmail}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                        title="Copy Email"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>



                {/* 2. GitHub + Guide Integrated (Bottom) */}
                <a 
                  href="https://github.com/linh0526/Battleship-Command"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass-panel p-8 bg-slate-950/60 border border-white/5 space-y-6 relative overflow-hidden group/star rounded-3xl transition-all hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 block"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/star:opacity-10 transition-opacity">
                    <Star className="w-32 h-32 text-amber-400" />
                  </div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="text-white p-4 bg-white/5 rounded-2xl transition-all group-hover/star:scale-110 group-hover/star:bg-white/10 border border-white/5">
                      <Github className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5 font-black uppercase tracking-tight">
                      <h4 className="text-base text-white group-hover/star:text-primary transition-colors">{t('github_repo')}</h4>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <p className="text-[11px] tracking-widest">{t('github_star')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-slate-950 relative z-10 group/img shadow-2xl">
                    <img 
                      src="/star_github.png" 
                      alt="How to star on GitHub" 
                      className="w-full h-auto opacity-70 group-hover/star:opacity-100 transition-opacity duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60 group-hover/star:opacity-10 transition-opacity" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 py-2 opacity-30 group-hover/star:opacity-100 transition-all transform translate-y-2 group-hover/star:translate-y-0">
                    <div className="h-px w-8 bg-slate-700"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Click to visit & support</span>
                    <div className="h-px w-8 bg-slate-700"></div>
                  </div>
                </a>

                {/* 3. Donate (Middle) */}
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQRModal(true);
                  }}
                  className="cursor-pointer"
                >
                  <ContactItem 
                    href="#"
                    icon={<Heart className="w-6 h-6" />}
                    title={t('donate')}
                    desc={t('donate_desc')}
                    color="text-rose-400"
                    hoverColor="hover:border-rose-500/20"
                  />
                </div>
                
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 opacity-50">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">by linh0526 with ❤️</span>
                 </div>
                 <div className="flex items-center gap-3 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">v1.0.0</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel border border-rose-500/30 p-4 bg-slate-900 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-rose-500 font-extrabold uppercase text-xs tracking-widest">{t('support_admin')}</h3>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white"
                >
                  <CheckCircle className="w-4 h-4 rotate-45" />
                </button>
              </div>
              <div className="bg-white rounded-2xl p-4 aspect-square relative overflow-hidden group">
                <img 
                  src="/qr.jpg" 
                  alt="QR Coffee" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
              </div>
              <p className="mt-4 text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Cảm ơn bạn đã ủng hộ phát triển trò chơi!
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0% }
          50% { top: 100% }
        }
      `}</style>
    </div>
  );
}

function ContactItem({ href, icon, title, desc, color, hoverColor }: ContactItemProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-6 p-6 bg-slate-950/40 border border-white/5 rounded-2xl transition-all ${hoverColor} group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5`}
    >
      <div className={`${color} p-4 bg-white/5 rounded-xl transition-all group-hover:scale-110 group-hover:bg-white/10`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">{desc}</p>
      </div>
    </a>
  );
}

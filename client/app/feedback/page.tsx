"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Github, Heart, Mail, CheckCircle } from 'lucide-react';
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

        <div className="max-w-2xl mx-auto">
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
                <ContactItem 
                  href="https://github.com/linh0526/Battleship-Command"
                  icon={<Github className="w-6 h-6" />}
                  title={t('github_repo')}
                  desc="Check out the code or open an issue"
                  color="text-white"
                  hoverColor="hover:border-white/20"
                />
                <ContactItem 
                  href="https://buymeacoffee.com"
                  icon={<Heart className="w-6 h-6" />}
                  title={t('donate')}
                  desc={t('donate_desc')}
                  color="text-rose-400"
                  hoverColor="hover:border-rose-500/20"
                />
                <ContactItem 
                  href="mailto:linhngyn0526@gmail.com"
                  icon={<Mail className="w-6 h-6" />}
                  title={t('email_support')}
                  desc="Professional inquiries & critical reports"
                  color="text-blue-400"
                  hoverColor="hover:border-blue-500/20"
                />
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 opacity-50">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stable Uplink v2.4.0</span>
                 </div>
                 <div className="flex items-center gap-3 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Service Status: Active</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
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

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Github, Heart, Mail, Send, CheckCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast, useAuth } from '@/context/AuthContext';
import emailjs from '@emailjs/browser';

interface CategoryButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
  activeBg: string;
}

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
  const { show: showToast } = useToast();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<'bug' | 'feature' | 'other'>('feature');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    try {
      const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        throw new Error('Missing EmailJS environment variables');
      }

      const templateParams = {
        category: category.toUpperCase(),
        message: message,
        timestamp: new Date().toLocaleString('vi-VN'),
        sender: user?.username ?? 'Guest',
        rank: 'Captain' // Default rank since role is not in User interface yet
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      
      showToast(t('feedback_success'), 'success');
      setMessage('');
      setCategory('feature');
    } catch (err) {
      console.error('Feedback Error:', err);
      showToast('Gửi thất bại. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
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
            {t('feedback_subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="glass-panel p-8 bg-slate-900/40 border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {/* Category Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {t('feedback_category')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <CategoryButton 
                      active={category === 'bug'} 
                      onClick={() => setCategory('bug')}
                      icon={<AlertTriangle className="w-4 h-4" />}
                      label={t('category_bug')}
                      color="text-red-400"
                      activeBg="bg-red-500/10 border-red-500/30"
                    />
                    <CategoryButton 
                      active={category === 'feature'} 
                      onClick={() => setCategory('feature')}
                      icon={<Lightbulb className="w-4 h-4" />}
                      label={t('category_feature')}
                      color="text-amber-400"
                      activeBg="bg-amber-500/10 border-amber-500/30"
                    />
                    <CategoryButton 
                      active={category === 'other'} 
                      onClick={() => setCategory('other')}
                      icon={<MessageSquare className="w-4 h-4" />}
                      label={t('category_other')}
                      color="text-blue-400"
                      activeBg="bg-blue-500/10 border-blue-500/30"
                    />
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    {t('feedback_description')}
                  </label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={8}
                    placeholder={t('feedback_placeholder')}
                    className="w-full bg-[#0a0e1a]/80 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none group-focus-within:border-primary/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="w-full group relative overflow-hidden bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(25,93,230,0.3)] hover:shadow-[0_0_50px_rgba(25,93,230,0.5)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('send_feedback')}
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="glass-panel p-8 bg-slate-900/40 border-slate-800 flex flex-col h-full">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono mb-8">
                {t('contact_info')}
              </h3>

              <div className="space-y-6 flex-1">
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

              <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
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

function CategoryButton({ active, onClick, icon, label, color, activeBg }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 group ${
        active 
          ? `${activeBg} border-opacity-100` 
          : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
      }`}
    >
      <div className={`${active ? color : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest text-center ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>
        {label}
      </span>
    </button>
  );
}

function ContactItem({ href, icon, title, desc, color, hoverColor }: ContactItemProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-start gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-2xl transition-all ${hoverColor} group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5`}
    >
      <div className={`${color} p-3 bg-white/5 rounded-xl transition-all group-hover:scale-110`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">{desc}</p>
      </div>
    </a>
  );
}

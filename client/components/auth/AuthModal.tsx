"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth, useToast } from '@/context/AuthContext';
import { X, Shield, Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { show: showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { identifier: formData.identifier, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          isLogin ? t('welcome_back', { name: `||${data.user.username}||` }) : t('account_created'),
          'success'
        );
        login(data.token, data.user);
        onClose();
        
        // Reset states after modal closes
        setTimeout(() => {
          setFormData({
            identifier: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }, 300);
      } else {
        setError(data.message || t('auth_failed'));
      }
    } catch (err) {
      setError('Connection refused. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      identifier: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0e1a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Shield className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Uplink Security</span>
                  </div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {isLogin ? t('login') : t('register')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('username')} / {t('email')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="commander_one or admiral@hq.com"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('username')}</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="Your callsign"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('email')}</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="admiral@battleship.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('password')}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('confirm_password')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('authenticating')}
                    </>
                  ) : (
                    <>
                      {isLogin ? t('login') : t('register')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                   {isLogin ? t('no_account') : t('has_account')}
                 </p>
                 <button
                   onClick={handleToggleMode}
                   className="text-primary hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                 >
                   {isLogin ? t('register') : t('login')}
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Shield, LogOut } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'banned' | 'unverified';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

interface ToastContextType {
  show: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ToastContext = createContext<ToastContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData._id,
          username: userData.username,
          email: userData.email,
          status: userData.status
        });
      } else {
        localStorage.removeItem('auth-token');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, [verifyToken]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth-token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      <ToastContext.Provider value={{ show: showToast }}>
        {children}
        
        {/* Global Toast UI */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="fixed top-6 right-6 z-[999] flex items-center gap-4 px-6 py-4 bg-[#0a0e1a]/95 backdrop-blur-xl border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[320px]"
              style={{ 
                borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.3)' : toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)',
                boxShadow: toast.type === 'success' ? '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.1)' : '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center border border-opacity-20 relative overflow-hidden"
                style={{ 
                  backgroundColor: toast.type === 'success' ? 'rgba(16,185,129,0.1)' : toast.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                  borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.2)' : toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'
                }}
              >
                {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-emerald-500 relative z-10" />}
                {toast.type === 'error' && <LogOut className="w-6 h-6 text-error relative z-10" />}
                {toast.type === 'info' && <Shield className="w-6 h-6 text-primary relative z-10" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white uppercase tracking-widest">
                  {toast.message.split('||').map((part, i) => (
                    <span key={i} className={i % 2 === 1 ? 'text-emerald-500' : ''}>
                      {part}
                    </span>
                  ))}
                </span>
              </div>
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1"
                style={{ backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ff4d4d' : '#3b82f6' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within an AuthProvider');
  }
  return context;
}

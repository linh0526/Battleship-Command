import React from 'react';
import { X, Layout, Monitor, Volume2, Shield, Zap, Info, Palette, Grid, Radio, Map, Waves, Hexagon, Crosshair, Signal, Languages, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings, BattleLayout, BackgroundMode } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    backgroundMode, setBackgroundMode,
    enableSound, setEnableSound,
    enableVibration, setEnableVibration
  } = useSettings();
  const { t, language, setLanguage } = useLanguage();



  const backgroundOptions: { id: BackgroundMode; label: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'tactical-grid',
      label: t('bg_tactical_grid') || 'Tactical Grid',
      desc: t('bg_tactical_grid_desc') || 'Standard milspec grid.',
      icon: Grid,
      color: 'bg-[#0b1015]'
    },
    {
      id: 'radar-sweep',
      label: t('bg_radar_sweep') || 'Radar Sweep',
      desc: t('bg_radar_sweep_desc') || 'Active sonar tracking.',
      icon: Radio,
      color: 'bg-[#05080c]'
    },
    {
      id: 'dark-ocean-waves',
      label: t('bg_dark_ocean') || 'Dark Ocean',
      desc: t('bg_dark_ocean_desc') || 'Deep sea gradient.',
      icon: Waves,
      color: 'bg-[#020408]'
    },
    {
      id: 'tactical-lines',
      label: t('bg_tactical_lines') || 'HUD Lines',
      desc: t('bg_tactical_lines_desc') || 'Heads-up tactical display.',
      icon: Crosshair,
      color: 'bg-[#050505]'
    }
  ];

  const suggestions = [
    { title: 'Custom Themes', desc: 'Ability to change UI accents and board colors.', icon: Zap },
    { title: 'Weather Systems', desc: 'Dynamic fog, rain, and storms affecting visibility.', icon: Waves },
    { title: 'Advanced Radar', desc: 'Thermal imaging and sonobuoy deployment visualizations.', icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight py-1">{t('settings') || 'Command Settings'}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('settings_subtitle') || 'Configure Battle Interface'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Language Selection */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('settings_language') || 'Language'}</h3>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        language === 'en' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${language === 'en' ? 'text-white' : 'text-slate-500'}`}>EN</span>
                        <span className={`font-black uppercase tracking-tight ${language === 'en' ? 'text-white' : 'text-slate-300'}`}>English</span>
                    </div>
                    {language === 'en' && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    )}
                  </button>

                  <button 
                    onClick={() => setLanguage('vi')}
                    className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        language === 'vi' 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${language === 'vi' ? 'text-white' : 'text-slate-500'}`}>VI</span>
                        <span className={`font-black uppercase tracking-tight ${language === 'vi' ? 'text-white' : 'text-slate-300'}`}>Tiếng Việt</span>
                    </div>
                    {language === 'vi' && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    )}
                  </button>
                </div>
              </section>





              {/* Background Selection */}
              <section className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('settings_background') || 'Background'}</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {backgroundOptions.map((option) => {
                    const isActive = backgroundMode === option.id;
                    const Icon = option.icon;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => setBackgroundMode(option.id)}
                        className={`relative group overflow-hidden flex flex-col items-start p-3 rounded-xl border transition-all ${
                          isActive 
                            ? 'border-primary ring-1 ring-primary/30 bg-primary/5' 
                            : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60'
                        }`}
                      >
                         {/* Option Preview Strip */}
                         <div className={`absolute top-0 right-0 w-12 h-12 opacity-10 rounded-bl-2xl ${option.color} group-hover:opacity-20 transition-opacity`} />
                         
                         <div className="flex items-center gap-2 mb-2 w-full">
                            <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                               <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wide truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                              {option.label}
                            </span>
                         </div>
                         
                         <span className="text-[10px] text-slate-500 font-medium leading-tight text-left pl-8">
                           {option.desc}
                         </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Audio & Feedback Settings */}
              <section className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('settings_audio_feedback') || 'Audio & Feedback'}</h3>
                </div>

                <div className="space-y-3">
                   {/* Sound Toggle */}
                   <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${enableSound ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                            <Volume2 className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">{t('settings_sound')}</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">{t('settings_sound_desc')}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setEnableSound(!enableSound)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 pointer-events-auto ${enableSound ? 'bg-primary' : 'bg-slate-800'}`}
                      >
                        <motion.div 
                          animate={{ x: enableSound ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                   </div>

                   {/* Vibration Toggle */}
                   <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${enableVibration ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                            <Radio className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">{t('settings_vibration')}</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">{t('settings_vibration_desc')}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setEnableVibration(!enableVibration)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 pointer-events-auto ${enableVibration ? 'bg-primary' : 'bg-slate-800'}`}
                      >
                        <motion.div 
                          animate={{ x: enableVibration ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                   </div>
                </div>
              </section>

              {/* Development Suggestions */}
              <section className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('future_updates') || 'Future Trajectories'}</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <s.icon className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide">{s.title}</h4>
                        <p className="text-[11px] text-slate-500">{s.desc}</p>
                      </div>
                      <div className="ml-auto px-2 py-1 rounded bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        Planned
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Feedback Section */}
              <section className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4">
                   <MessageSquare className="w-4 h-4 text-blue-400" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('settings_feedback') || 'Feedback'}</h3>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                   <p className="text-[11px] text-slate-400 mb-3">{t('settings_feedback_desc') || 'Send your reports and suggestions directly to Command.'}</p>
                   <textarea 
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors min-h-[80px]"
                      placeholder={t('settings_feedback_placeholder') || 'Enter your message...'}
                   />
                   <div className="flex justify-end mt-3">
                      <button 
                         onClick={(e) => {
                             const textarea = (e.target as HTMLElement).parentElement?.querySelector('textarea');
                             if (textarea && textarea.value.trim()) {
                                 alert(`Feedback sent to SYSTEM (linh@gmail.com):\n\n${textarea.value}`);
                                 textarea.value = '';
                             }
                         }}
                         className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                         {t('send_feedback') || 'Send Report'}
                      </button>
                   </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-900/20 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('apply_changes') || 'Lock In Parameters'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

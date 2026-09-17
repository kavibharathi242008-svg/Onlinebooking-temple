import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, CalendarCheck, ShieldAlert, Video, BrainCircuit, HelpCircle, UserCog, Menu, X, Globe, Ticket, QrCode } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Landmark },
    { id: 'temples', label: t.navTemples, icon: Landmark },
    { id: 'book', label: t.navBook, icon: CalendarCheck },
    { id: 'counter', label: t.navCounter, icon: Ticket, badge: 'Staff' },
    { id: 'verify', label: t.navTickets, icon: QrCode },
    { id: 'cctv', label: t.navCCTV, icon: Video, badge: 'AI Live' },
    { id: 'aitech', label: t.navAITech, icon: BrainCircuit },
    { id: 'help', label: t.navHelp, icon: HelpCircle },
    { id: 'admin', label: t.navAdmin, icon: UserCog }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-sm">
      {/* Top Heritage Notice Bar */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-red-800 text-amber-100 text-xs py-1 px-4 text-center font-medium flex items-center justify-between">
        <span className="hidden sm:inline">🕉️ Government of Tamil Nadu • Hindu Religious & Charitable Endowments Inspired Platform</span>
        <span className="mx-auto sm:mx-0">⚡ Intelligent Crowd Management & Slot Queue System</span>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 bg-amber-900/60 hover:bg-amber-900 px-2.5 py-0.5 rounded text-amber-200 transition-colors border border-amber-600/40 text-xs font-semibold"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.langToggle}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Branding */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform border border-amber-400">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-amber-950 tracking-tight leading-none">
                  {language === 'ta' ? 'தரிசனம் AI' : 'Dharisanam AI'}
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                  Tamil Nadu
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 line-clamp-1">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-sm'
                      : 'text-slate-600 hover:text-amber-800 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                      item.badge === 'Staff' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTA & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('book')}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all shadow-amber-600/30"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t.btnBookDarshan}</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

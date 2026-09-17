import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, Phone, Mail, ShieldCheck, Clock, MapPin, HeartHandshake } from 'lucide-react';

export const Footer: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                {language === 'ta' ? 'தரிசனம் AI' : 'Dharisanam AI TN'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ta'
                ? 'தமிழ்நாட்டின் பாரம்பரியத் திருக்கோயில்களில் பக்தர்கள் நெரிசலைத் தடுத்து, தரிசனத்தை எளிமையாக்கும் நவீன AI தொழில்நுட்ப மேலாண்மை தளம்.'
                : 'A state-of-the-art AI-driven pilgrim distribution and crowd management platform designed to eliminate waiting lines and preserve sanctum sanctity.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.verifiedPass} • 100% ACID Guaranteed</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              {language === 'ta' ? 'விரைவு இணைப்புகள்' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('temples')} className="hover:text-amber-400 transition-colors">
                  {t.navTemples}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('book')} className="hover:text-amber-400 transition-colors">
                  {t.navBook}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('counter')} className="hover:text-amber-400 transition-colors">
                  {t.navCounter}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('cctv')} className="hover:text-amber-400 transition-colors">
                  {t.navCCTV}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('aitech')} className="hover:text-amber-400 transition-colors">
                  {t.navAITech}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('admin')} className="hover:text-amber-400 transition-colors">
                  {t.navAdmin}
                </button>
              </li>
            </ul>
          </div>

          {/* 24/7 Helpline */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              {t.helpTitle}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">1800-425-4555 (Toll-Free)</p>
                  <p className="text-slate-400 text-[11px]">+91 44 2833 9999 / +91 94440 12345</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">support.templedharshan@tn.gov.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">05:00 AM – 10:00 PM (All 7 Days)</span>
              </li>
            </ul>
          </div>

          {/* Offline Counter Assistance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              {language === 'ta' ? 'நேரடி கவுண்டர் சேவை' : 'Walk-in Counter Desk'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {language === 'ta'
                ? 'ஆன்லைன் முன்பதிவு வசதி இல்லாத பக்தர்கள் கோயில் நுழைவு வாயில் உதவி மையங்களில் அதே நிகழ்நேர ஒதுக்கீட்டில் உடனடி டோக்கன் பெறலாம்.'
                : 'Devotees without smartphones or internet access can book tickets instantly at entrance counters using the exact same shared real-time capacity.'}
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <HeartHandshake className="w-4 h-4" />
                <span>Zero Duplicate Bookings</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Synchronized ACID database protection prevents online/offline conflicts.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AI Temple Dharisanam & Crowd Management System. Designed for Tamil Nadu Pilgrimage Heritage.</p>
          <p className="flex items-center gap-2">
            <span>Built for Smart Devotion</span>
            <span>•</span>
            <button onClick={() => setCurrentTab('help')} className="hover:text-amber-400 transition-colors">
              Help Center & FAQs
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};

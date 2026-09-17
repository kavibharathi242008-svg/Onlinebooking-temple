import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, type Temple } from '../utils/api';
import {
  Search,
  MapPin,
  CalendarCheck,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Activity,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, templeId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveHighlights, setLiveHighlights] = useState<any[]>([]);

  useEffect(() => {
    api.getTemples().then(data => {
      setTemples(data);
    }).catch(console.error);

    // Get live highlights for key temples
    Promise.all([
      api.getLiveCrowd('temple-palani').catch(() => null),
      api.getLiveCrowd('temple-madurai').catch(() => null),
      api.getLiveCrowd('temple-srirangam').catch(() => null),
    ]).then(([palani, madurai, srirangam]) => {
      setLiveHighlights([
        { name: 'Palani Dhandayuthapani', data: palani, id: 'temple-palani' },
        { name: 'Madurai Meenakshi Amman', data: madurai, id: 'temple-madurai' },
        { name: 'Srirangam Ranganathar', data: srirangam, id: 'temple-srirangam' }
      ]);
    });
  }, []);

  const filteredTemples = temples.filter(temple => {
    const q = searchQuery.toLowerCase();
    return (
      temple.name.toLowerCase().includes(q) ||
      temple.name_tamil.toLowerCase().includes(q) ||
      temple.district.toLowerCase().includes(q) ||
      temple.deity.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'VERY HIGH': return 'text-red-700 bg-red-100 border-red-300';
      case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'MEDIUM': return 'text-amber-700 bg-amber-100 border-amber-300';
      default: return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 space-y-12 pb-16">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-amber-950 via-amber-900 to-amber-800 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-amber-200 text-xs font-semibold backdrop-blur-sm animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI-Powered Tamil Nadu Pilgrimage Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-amber-100/90 font-normal leading-relaxed">
            {t.heroSubtext}
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white text-slate-800 p-1.5 border border-amber-300/40">
              <Search className="w-5 h-5 ml-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-3 py-3 text-sm sm:text-base outline-none bg-transparent placeholder-slate-400"
              />
              <button
                onClick={() => onNavigate('temples')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Find</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-amber-300">12+</p>
              <p className="text-xs text-amber-100/80">Major Heritage Temples</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-emerald-300">70%</p>
              <p className="text-xs text-amber-100/80">Queue Time Reduced</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-blue-300">100%</p>
              <p className="text-xs text-amber-100/80">Zero Double Bookings</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <p className="text-2xl font-black text-amber-300">24/7</p>
              <p className="text-xs text-amber-100/80">AI CCTV Telemetry</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Crowd Telemetry Ticker ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-amber-200/70 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Live Shrines Telemetry
              </h2>
            </div>
            <button
              onClick={() => onNavigate('cctv')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All 12 CCTV Feeds</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {liveHighlights.map((hl, i) => (
              <div
                key={i}
                onClick={() => onNavigate('templedetail', hl.id)}
                className="cursor-pointer flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all bg-slate-50/50"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{hl.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Est. Wait: <span className="font-semibold text-slate-700">{hl.data?.estimated_waiting_time_mins || 20} mins</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCrowdColor(hl.data?.crowd_level || 'LOW')}`}>
                    {hl.data?.crowd_level || 'LOW'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{hl.data?.occupancy_percent || 35}% Occupied</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (5 Steps) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm text-slate-600">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: '1', title: t.step1Title, desc: t.step1Desc, icon: '🏛️' },
            { step: '2', title: t.step2Title, desc: t.step2Desc, icon: '⭐' },
            { step: '3', title: t.step3Title, desc: t.step3Desc, icon: '⏰' },
            { step: '4', title: t.step4Title, desc: t.step4Desc, icon: '📱' },
            { step: '5', title: t.step5Title, desc: t.step5Desc, icon: '🙏' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-[10px] font-black tracking-widest text-amber-600 uppercase mb-1">
                Step 0{item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 text-center text-xs text-amber-900 font-medium">
          ✨ {t.aiDistributionBadge}
        </div>
      </section>

      {/* ── Featured Temples ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Featured Temples
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Popular pilgrimage destinations open for advance slot reservations
            </p>
          </div>
          <button
            onClick={() => onNavigate('temples')}
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All ({temples.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map(temple => (
            <div
              key={temple.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-amber-300 transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={temple.image_url}
                  alt={temple.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {temple.district}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-base leading-tight">
                    {language === 'ta' ? temple.name_tamil : temple.name}
                  </h3>
                  <p className="text-amber-300 text-xs mt-0.5">
                    {language === 'ta' ? temple.deity_tamil : temple.deity}
                  </p>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {language === 'ta' ? temple.description_tamil : temple.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-700">Free: 0₹</span> •{' '}
                    <span className="font-semibold text-amber-800">Paid: {temple.default_paid_price}₹</span>
                  </div>
                  <button
                    onClick={() => onNavigate('book', temple.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Offline Counter & Inclusivity Promo ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/40">
              Offline Counter Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Inclusive For Non-Tech Pilgrims & Walk-Ins
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm leading-relaxed">
              Not everyone has a smartphone. Temple physical helpdesks use our Counter Portal to issue physical QR passes with the exact same shared real-time database capacity — preventing slot overbooking and guaranteeing equal queue priority.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('counter')}
                className="bg-white text-purple-900 hover:bg-purple-100 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Open Staff Counter
              </button>
              <button
                onClick={() => onNavigate('help')}
                className="border border-purple-400/50 hover:bg-purple-800/40 text-purple-100 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                Learn How It Works
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

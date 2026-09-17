import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, type Temple, type Slot } from '../utils/api';
import { MapPin, Clock, CheckCircle2, AlertCircle, Users, Calendar, ChevronRight, ArrowLeft, Loader2, Info, Star } from 'lucide-react';

interface TempleDetailPageProps {
  templeId: string;
  onBook: (templeId: string) => void;
  onBack: () => void;
}

export const TempleDetailPage: React.FC<TempleDetailPageProps> = ({ templeId, onBook, onBack }) => {
  const { t, language } = useLanguage();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [crowd, setCrowd] = useState<any>(null);
  const [crowdRefreshTimer, setCrowdRefreshTimer] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getTempleById(templeId).then(data => {
      setTemple(data);
      setCrowd(data.live_crowd);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [templeId]);

  useEffect(() => {
    if (!templeId || !selectedDate) return;
    setLoadingSlots(true);
    api.getSlots(templeId, selectedDate).then(data => {
      setSlots(data);
      setLoadingSlots(false);
    }).catch(() => setLoadingSlots(false));
  }, [templeId, selectedDate]);

  // Refresh crowd every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api.getLiveCrowd(templeId).then(data => setCrowd(data)).catch(() => {});
      setCrowdRefreshTimer(t => t + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [templeId]);

  const crowdLevelStyle = (level: string) => {
    if (level === 'VERY HIGH') return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    if (level === 'HIGH') return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' };
    if (level === 'MEDIUM') return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700">Temple not found</p>
          <button onClick={onBack} className="mt-3 text-amber-600 hover:underline text-sm">← Go back</button>
        </div>
      </div>
    );
  }

  const crowdStyle = crowd ? crowdLevelStyle(crowd.crowd_level) : null;
  const todaySlots = slots.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={temple.image_url} alt={temple.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Temples
          </button>
          <div className="flex items-start justify-between">
            <div>
              {temple.is_verified === 1 && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/50 mb-2">
                  <CheckCircle2 className="w-3 h-3" /> {t.verifiedBadge}
                </span>
              )}
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {language === 'ta' ? temple.name_tamil : temple.name}
              </h1>
              <p className="text-amber-300 font-bold text-sm mt-1">
                {language === 'ta' ? temple.deity_tamil : temple.deity}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 space-y-5">
        {/* Location & Quick Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{temple.location}</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{temple.district} District</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                {language === 'ta' ? 'கோயில் பற்றி' : 'About the Temple'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'ta' ? temple.description_tamil : temple.description}
              </p>
            </div>

              {/* Dharisanam Timings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {language === 'ta' ? 'தரிசன நேரங்கள்' : 'Dharisanam Timings'}
                </h2>
              {temple.timings && temple.timings.length > 0 ? (
                <div className="space-y-2">
                  {temple.timings.map((timing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-amber-50/70 rounded-xl border border-amber-200/60">
                      <div>
                        <p className="font-bold text-amber-900 text-sm">
                          {language === 'ta' ? timing.session_name_tamil : timing.session_name}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">Slot duration: {timing.slot_duration_minutes} minutes</p>
                      </div>
                      <span className="font-mono font-black text-amber-900 text-sm bg-white px-3 py-1 rounded-lg border border-amber-200">
                        {timing.start_time} – {timing.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Timings not available</p>
              )}
            </div>

            {/* Facilities */}
            {temple.facilities && temple.facilities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-black text-slate-800 text-base mb-3">
                  {language === 'ta' ? 'வசதிகள்' : 'Temple Facilities'}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {temple.facilities.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rules */}
            {temple.rules && temple.rules.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  {language === 'ta' ? 'முக்கிய விதிமுறைகள்' : 'Visitor Rules & Dress Code'}
                </h2>
                <ul className="space-y-2">
                  {temple.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/50 p-2 rounded-lg">
                      <span className="text-amber-600 font-bold shrink-0">{idx + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Today's Slot Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-slate-800 text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Slot Availability
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              {loadingSlots ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {todaySlots.map(slot => {
                    const avail = slot.free_available;
                    const cap = slot.free_capacity;
                    const badge = slot.status === 'FULL'
                      ? { icon: '🔴', label: 'FULL', cls: 'bg-red-100 text-red-800 border-red-300' }
                      : slot.status === 'LIMITED'
                      ? { icon: '🟡', label: `${avail}/${cap}`, cls: 'bg-amber-100 text-amber-800 border-amber-300' }
                      : { icon: '🟢', label: `${avail}/${cap}`, cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
                    return (
                      <div key={slot.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-mono font-bold text-slate-700">{slot.start_time} – {slot.end_time}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${badge.cls}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>
                    );
                  })}
                  {slots.length > 6 && (
                    <p className="text-xs text-slate-400 text-center pt-1">+{slots.length - 6} more slots when you book</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Crowd Status + Pricing + CTA */}
          <div className="space-y-4">
            {/* Live Crowd Status */}
            {crowd && crowdStyle && (
              <div className={`rounded-2xl border p-5 ${crowdStyle.bg} ${crowdStyle.border}`}>
                <h3 className={`font-bold text-sm mb-3 ${crowdStyle.text}`}>
                  📡 {t.currentCrowd}
                </h3>
                <div className={`text-3xl font-black ${crowdStyle.text} mb-1`}>
                  {crowd.crowd_level}
                </div>
                <div className="w-full bg-white/50 h-2 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      crowd.crowd_level === 'VERY HIGH' ? 'bg-red-500' :
                      crowd.crowd_level === 'HIGH' ? 'bg-orange-500' :
                      crowd.crowd_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, crowd.occupancy_percent)}%` }}
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className={crowdStyle.text}>{t.occupancy}</span>
                    <span className={`font-bold ${crowdStyle.text}`}>{crowd.occupancy_percent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={crowdStyle.text}>People</span>
                    <span className={`font-bold ${crowdStyle.text}`}>{crowd.current_count} / {crowd.max_safe_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={crowdStyle.text}>{t.estimatedWait}</span>
                    <span className={`font-bold ${crowdStyle.text}`}>~{crowd.estimated_waiting_time_mins} mins</span>
                  </div>
                </div>
                <p className="text-[10px] mt-3 opacity-70 text-right">
                  Live • Auto-refresh every 8s
                </p>
              </div>
            )}

            {/* Dharisanam Pricing Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Dharisanam Options</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">{t.freeDarshan}</p>
                    <p className="text-[11px] text-emerald-700">Regular queue • {temple.default_free_capacity}/slot</p>
                  </div>
                  <span className="font-black text-emerald-800 text-lg">₹0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div>
                    <p className="font-bold text-amber-900 text-sm">{t.paidDarshan}</p>
                    <p className="text-[11px] text-amber-700">Express queue • {temple.default_paid_capacity}/slot</p>
                  </div>
                  <span className="font-black text-amber-900 text-lg">₹{temple.default_paid_price}</span>
                </div>
              </div>
            </div>

            {/* Book Dharisanam CTA */}
            <button
              onClick={() => onBook(temple.id)}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all text-base"
            >
              <Calendar className="w-5 h-5" />
              Book Dharisanam Slot
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Booking opens {temple.advance_booking_hours}h before your chosen date
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

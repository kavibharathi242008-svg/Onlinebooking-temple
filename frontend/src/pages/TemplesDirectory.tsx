import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, type Temple } from '../utils/api';
import { TempleCard } from '../components/TempleCard';
import { Search, MapPin, Users, Clock, ChevronRight, Star, CheckCircle2, Loader2, Filter } from 'lucide-react';

interface TemplesDirectoryProps {
  onSelectTemple: (templeId: string, tab: string) => void;
}

const DISTRICTS = [
  'Chennai', 'Madurai', 'Tiruchirappalli', 'Coimbatore', 'Kanchipuram',
  'Tiruvannamalai', 'Dindigul', 'Ramanathapuram', 'Thoothukudi',
  'Cuddalore', 'Thanjavur', 'Salem'
];

const DEITIES = [
  'Lord Murugan', 'Lord Shiva', 'Goddess Meenakshi', 'Lord Ranganatha',
  'Goddess Mariamman', 'Goddess Kamakshi', 'Lord Nataraja'
];

export const TemplesDirectory: React.FC<TemplesDirectoryProps> = ({ onSelectTemple }) => {
  const { t, language } = useLanguage();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('');

  useEffect(() => {
    setLoading(true);
    // If no search input, fetch immediately without debounce delay
    const delay = search ? 300 : 0;
    const timer = setTimeout(() => {
      api.getTemples({
        search: search || undefined,
        district: selectedDistrict || undefined,
        deity: selectedDeity || undefined
      }).then(data => {
        setTemples(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, delay);
    return () => clearTimeout(timer);
  }, [search, selectedDistrict, selectedDeity]);

  const getCrowdBadge = (temple: Temple) => {
    const crowd = temple.live_crowd;
    if (!crowd) return null;
    const level = crowd.crowd_level;
    if (level === 'VERY HIGH') return { text: '🔴 Very High Crowd', cls: 'bg-red-100 text-red-800 border-red-300' };
    if (level === 'HIGH') return { text: '🟠 High Crowd', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (level === 'MEDIUM') return { text: '🟡 Medium Crowd', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: '🟢 Low Crowd', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'ta' ? '🕉️ தமிழ்நாட்டின் புகழ்பெற்ற திருக்கோயில்கள்' : '🕉️ Famous Tamil Nadu Temples'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {language === 'ta'
              ? 'கோயிலைத் தேர்வுசெய்து தரிசன நேரத்தை முன்பதிவு செய்யுங்கள்'
              : 'Select a temple to view live crowd status and book your dharisanam slot'}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
              >
                <option value="">{t.allDistricts}</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🙏</span>
              <select
                value={selectedDeity}
                onChange={e => setSelectedDeity(e.target.value)}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
              >
                <option value="">{t.allDeities}</option>
                {DEITIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {(search || selectedDistrict || selectedDeity) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{temples.length} temple(s) found</span>
              <button
                onClick={() => { setSearch(''); setSelectedDistrict(''); setSelectedDeity(''); }}
                className="text-amber-600 hover:text-amber-800 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Temple Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {temples.map(temple => (
              <TempleCard
                key={temple.id}
                temple={temple}
                onViewDetails={(id) => onSelectTemple(id, 'templedetail')}
                onBook={(id) => onSelectTemple(id, 'book')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

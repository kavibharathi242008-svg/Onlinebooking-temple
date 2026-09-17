import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Temple } from '../utils/api';
import { MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TempleCardProps {
  temple: Temple;
  onViewDetails: (id: string) => void;
  onBook: (id: string) => void;
}

export const TempleCard: React.FC<TempleCardProps> = ({ temple, onViewDetails, onBook }) => {
  const { language } = useLanguage();

  const getCrowdBadge = (temple: Temple) => {
    const crowd = temple.live_crowd;
    if (!crowd) return null;
    const level = crowd.crowd_level;
    if (level === 'VERY HIGH') return { text: '🔴 Very High Crowd', cls: 'bg-red-100 text-red-800 border-red-300' };
    if (level === 'HIGH') return { text: '🟠 High Crowd', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (level === 'MEDIUM') return { text: '🟡 Medium Crowd', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: '🟢 Low Crowd', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const crowdBadge = getCrowdBadge(temple);
  const crowd = temple.live_crowd;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between">
      {/* Temple Image */}
      <div className="relative">
        <img
          src={temple.image_url}
          alt={temple.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Verified Badge */}
        {temple.is_verified === 1 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </div>
        )}

        {/* Crowd Badge */}
        {crowdBadge && (
          <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${crowdBadge.cls}`}>
            {crowdBadge.text}
          </div>
        )}

        {/* Temple Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-black text-white text-sm leading-tight line-clamp-2">
            {language === 'ta' ? temple.name_tamil : temple.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-bold">{language === 'ta' ? temple.deity_tamil : temple.deity}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{temple.district}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <div className="font-semibold text-emerald-700">Free ₹0</div>
              <div className="text-amber-700 font-bold">Paid ₹{temple.default_paid_price}</div>
            </div>
          </div>

          {/* Live crowd info */}
          {crowd && (
            <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] grid grid-cols-3 gap-1 text-center border border-slate-100 mt-3">
              <div>
                <p className="font-black text-slate-800">{crowd.current_count}</p>
                <p className="text-slate-500">People</p>
              </div>
              <div>
                <p className="font-black text-amber-700">{crowd.occupancy_percent}%</p>
                <p className="text-slate-500">Occupancy</p>
              </div>
              <div>
                <p className="font-black text-slate-800">~{crowd.estimated_waiting_time_mins}m</p>
                <p className="text-slate-500">Est. Wait</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onViewDetails(temple.id)}
            className="text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 py-2 rounded-xl transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onBook(temple.id)}
            className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
          >
            Book <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

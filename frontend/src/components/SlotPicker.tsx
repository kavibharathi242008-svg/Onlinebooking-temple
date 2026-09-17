import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Slot } from '../utils/api';
import { Clock } from 'lucide-react';

interface SlotPickerProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  darshanType: 'FREE' | 'PAID';
  onSelectSlot: (slot: Slot) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlot,
  darshanType,
  onSelectSlot,
}) => {
  const { t } = useLanguage();

  const slotStatusStyle = (s: Slot) => {
    if (s.status === 'FULL') return 'border-red-200 bg-red-50/60 opacity-60 cursor-not-allowed';
    if (s.status === 'LIMITED') return 'border-amber-300 bg-amber-50/70 hover:border-amber-500';
    return 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-500';
  };

  const slotBadge = (s: Slot) => {
    const avail = darshanType === 'PAID' ? s.paid_available : s.free_available;
    const cap = darshanType === 'PAID' ? s.paid_capacity : s.free_capacity;
    if (s.status === 'FULL') {
      return { text: '🔴 FULL', cls: 'bg-red-100 text-red-800 border-red-300' };
    }
    if (s.status === 'LIMITED') {
      return { text: `🟡 LIMITED — ${avail}/${cap}`, cls: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    return { text: `🟢 ${avail}/${cap} ${t.slotsRemaining}`, cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  return (
    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
      {slots.map(s => {
        const badge = slotBadge(s);
        const isFull = s.status === 'FULL';
        const isSelected = selectedSlot?.id === s.id;

        return (
          <button
            key={s.id}
            type="button"
            disabled={isFull}
            onClick={() => onSelectSlot(s)}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
              isFull
                ? 'border-red-200 bg-red-50/60 opacity-60 cursor-not-allowed'
                : isSelected
                ? 'border-amber-500 bg-amber-50 shadow-sm'
                : slotStatusStyle(s)
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  {s.start_time} – {s.end_time}
                </p>
                {s.ai_recommended_capacity && (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    ✨ AI Optimized Capacity: {s.ai_recommended_capacity}
                  </span>
                )}
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}>
              {badge.text}
            </span>
          </button>
        );
      })}
    </div>
  );
};

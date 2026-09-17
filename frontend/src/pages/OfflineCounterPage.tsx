import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookingFlowPage } from './BookingFlowPage';
import { ShieldCheck, UserCheck, AlertCircle, Info, Ticket, HelpCircle } from 'lucide-react';

export const OfflineCounterPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedTempleId, setSelectedTempleId] = useState('temple-palani');

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Staff Desk Banner */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-500/30 border border-purple-400/40 px-3 py-1 rounded-full text-xs font-bold text-purple-200">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>OFFICIAL TEMPLE AUTHORIZED COUNTER TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {t.counterTitle}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {t.staffNotice}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-700/60 flex flex-wrap items-center justify-between text-xs text-purple-200 gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Operator Session Active: <strong>COUNTER-STAFF-01</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Shared Real-Time Database: <strong>ZERO DOUBLE-BOOKING</strong></span>
            </div>
          </div>
        </div>

        {/* Counter Instruction Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs">Verify Devotee Details</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Collect name, contact number, and party count directly from walk-in pilgrim.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs">Select Live Available Slot</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Slot availability dynamically factors in both Online and other physical counters.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs">Print QR Slip / Pass</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Issue the generated QR digital ticket or paper printout to be scanned at temple gate.</p>
            </div>
          </div>
        </div>

        {/* Embedded Booking Flow in Counter Mode */}
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md p-2 overflow-hidden">
          <BookingFlowPage initialTempleId={selectedTempleId} isCounter={true} />
        </div>
      </div>
    </div>
  );
};

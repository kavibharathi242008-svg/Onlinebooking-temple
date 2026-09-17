import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, type BookingResponse } from '../utils/api';
import { DigitalTicket } from '../components/DigitalTicket';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Ticket
} from 'lucide-react';

export const TicketLookupPage: React.FC<{ onNavigateToBook?: () => void }> = ({ onNavigateToBook }) => {
  const { t, language } = useLanguage();
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRef = refInput.trim().toUpperCase();
    if (!cleanRef) return;

    setLoading(true);
    setError(null);
    setVerifyMessage(null);
    setBooking(null);

    try {
      const data = await api.getBookingByRef(cleanRef);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'No booking record found for this reference code.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttended = async () => {
    if (!booking) return;
    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      const result = await api.verifyBooking(booking.booking_ref);
      setVerifyMessage({
        text: result.message,
        isSuccess: !result.already_attended
      });
      // Refresh current booking state
      const updated = await api.getBookingByRef(booking.booking_ref);
      setBooking(updated);
    } catch (err: any) {
      setVerifyMessage({
        text: err.message || 'Verification failed.',
        isSuccess: false
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const sampleRefs = ['TD202609201474'];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>Devotee Pass Verification & Gate Check-in</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Digital Pass & QR Verification
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Search your 14-digit booking reference to view, download, or verify temple entrance gate passes.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={refInput}
                onChange={e => setRefInput(e.target.value.toUpperCase())}
                placeholder="Enter Booking Reference (e.g. TD202609201474)"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !refInput.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-7 py-3.5 rounded-2xl transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Find Ticket</span>
            </button>
          </form>

          {/* Quick Pill shortcuts */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <span>Try sample pass:</span>
            {sampleRefs.map(ref => (
              <button
                key={ref}
                type="button"
                onClick={() => {
                  setRefInput(ref);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                {ref}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Ticket Details & Action Panel */}
        {booking && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Gate Verification Banner for Temple Staff */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Temple Gate Check-in Simulation</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Entrance staff can verify the QR pass and grant sanctum entry.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-600">Current Status:</span>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      booking.booking_status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : booking.booking_status === 'ATTENDED'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {booking.booking_status}
                  </span>
                </div>
              </div>

              {booking.booking_status === 'CONFIRMED' && (
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleMarkAttended}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>Grant Gate Entry (Mark ATTENDED)</span>
                </button>
              )}
            </div>

            {verifyMessage && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
                  verifyMessage.isSuccess
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-medium">{verifyMessage.text}</span>
              </div>
            )}

            {/* Render Digital Pass */}
            <DigitalTicket booking={booking} />
          </div>
        )}
      </div>
    </div>
  );
};

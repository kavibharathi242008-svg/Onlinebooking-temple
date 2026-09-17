import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';
import type { BookingResponse } from '../utils/api';
import { Printer, CheckCircle2, QrCode, ShieldCheck, Clock, Calendar, Users, MapPin, AlertCircle, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DigitalTicketProps {
  booking: BookingResponse;
  onClose?: () => void;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ booking, onClose }) => {
  const { t, language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code data URL
    QRCode.toDataURL(
      booking.qr_code_payload || booking.booking_ref,
      {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateScan = () => {
    setIsScanned(true);
    setTimeout(() => {
      alert(`[TEMPLE SECURITY SCAN SUCCESSFUL]\nBooking Ref: ${booking.booking_ref}\nLead: ${booking.primary_visitor_name}\nVisitors: ${booking.total_visitors}\nSlot: ${booking.slot_time}\nStatus: VERIFIED & ADMITTED`);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              {language === 'ta' ? 'தரிசன முன்பதிவு உறுதி செய்யப்பட்டது!' : 'Booking Confirmed Successfully!'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ta' ? 'உங்கள் டிஜிட்டல் பாஸ் தயாராக உள்ளது' : 'Your Official Digital Pass is ready'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateScan}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Simulate Staff Scan</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printTicket}</span>
          </button>
        </div>
      </div>

      {/* Ticket Pass Container */}
      <div 
        ref={ticketRef}
        className="bg-white rounded-2xl border-2 border-amber-300 shadow-xl overflow-hidden relative print:shadow-none print:border print:m-0"
      >
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-red-700 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-900/50 text-amber-200 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {booking.channel === 'OFFLINE_COUNTER' ? 'Temple Counter Pass' : 'Online E-Pass'}
                </span>
                <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{booking.booking_status}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {language === 'ta' ? booking.temple_name_tamil || booking.temple_name : booking.temple_name}
              </h2>
              <p className="text-xs text-amber-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{booking.temple_location}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-amber-200 uppercase font-semibold block">
                {t.ticketRef}
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-amber-100 bg-black/20 px-2.5 py-1 rounded border border-white/20 inline-block mt-0.5">
                {booking.booking_ref}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Body Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border-b border-dashed border-slate-200 pb-6">
            {/* Slot & Darshan Details */}
            <div className="sm:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.darshanDate}</span>
                  </span>
                  <p className="text-sm font-black text-slate-800">
                    {booking.slot_date}
                  </p>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.darshanTime}</span>
                  </span>
                  <p className="text-sm font-black text-amber-900">
                    {booking.slot_time}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">
                    Dharisanam Category
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${booking.darshan_type === 'PAID' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>{booking.darshan_type === 'PAID' ? t.paidDarshan : t.freeDarshan}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {booking.darshan_type === 'PAID' ? `Amount: ₹${booking.amount_paid}` : 'Amount: ₹0 (Free)'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.visitorsCount}</span>
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {booking.total_visitors} {booking.total_visitors === 1 ? 'Person' : 'Persons'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    Lead: {booking.primary_visitor_name}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Dharisanam Pass QR Code" 
                  className="w-36 h-36 rounded-lg shadow-sm border border-slate-200"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Loading QR...
                </div>
              )}
              <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold">
                SCAN AT ENTRANCE
              </span>
              {isScanned && (
                <span className="mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 animate-bounce">
                  ✓ VERIFIED AT GATE
                </span>
              )}
            </div>
          </div>

          {/* Visitors Roster */}
          {booking.visitors && booking.visitors.length > 0 && (
            <div className="mt-4 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registered Pilgrims
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {booking.visitors.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">
                      {idx + 1}. {v.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Age: {v.age} • {v.gender}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Pilgrim Instructions */}
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Important Instructions:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1">
              <li>Please arrive strictly 15 minutes before your scheduled slot time ({booking.slot_time}).</li>
              <li>Traditional attire is mandatory (Dhoti/Kurta for Men, Saree/Churidar for Women).</li>
              <li>Mobile phones, cameras, and luggage must be deposited at the outer cloakroom counters.</li>
              <li>Carry a valid government photo ID card (Aadhaar/Voter ID/Driving License) for verification.</li>
            </ul>
          </div>
        </div>

        {/* Tear-off Bottom Bar */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <span>Official Digital Verification Hash: {booking.booking_ref}-AUTH</span>
          <span className="font-semibold text-slate-600">Issued by AI Temple Dharisanam & Crowd Management System</span>
        </div>
      </div>
    </div>
  );
};

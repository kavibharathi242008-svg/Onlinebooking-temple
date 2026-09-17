import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HelpCenterPage: React.FC<{ onOpenChat: () => void; onLookupBooking?: (ref: string) => void }> = ({
  onOpenChat,
  onLookupBooking
}) => {
  const { t, language } = useLanguage();
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    api.getSupportInfo().then(setSupportInfo).catch(console.error);
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRefInput.trim()) return;
    setIsSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const data = await api.getBookingByRef(bookingRefInput.trim());
      setLookupResult(data);
    } catch (err: any) {
      setLookupError(err.message || 'No booking found with this reference number.');
    } finally {
      setIsSearching(false);
    }
  };

  const faqs = [
    {
      q: 'What is the difference between Free Dharisanam and Paid Dharisanam?',
      q_ta: 'இலவச தரிசனம் மற்றும் கட்டண தரிசனத்திற்கு என்ன வித்தியாசம்?',
      a: 'Free Dharisanam allows every devotee equal entry without ticket charges through our high-capacity general queue line. Paid Dharisanam provides an express queue pass for a nominal temple maintenance fee, clearing the sanctum line faster.',
      a_ta: 'இலவச தரிசனம் அனைத்து பக்தர்களுக்கும் கட்டணமின்றி சமமான வரிசையில் நுழைய அனுமதிக்கிறது. கட்டண தரிசனம் விரைவான வரிசைக்கு பெயரளவு கட்டணத்தில் அனுமதிக்கிறது.'
    },
    {
      q: 'Can I book a dharisanam slot at the physical temple counter without internet?',
      q_ta: 'இணையம் இல்லாமல் கோயிலில் உள்ள கவுண்டரில் நேரில் முன்பதிவு செய்ய முடியுமா?',
      a: 'Yes! All participating shrines operate designated Offline Physical Counters. Our database is unified in real-time, ensuring slots booked at counters share the exact same availability as online bookings with zero overbooking.',
      a_ta: 'ஆம்! அனைத்து கோயில்களிலும் நேரடி கவுண்டர்கள் உள்ளன. இணைய முன்பதிவும் கவுண்டர் முன்பதிவும் ஒரே பொதுவான நேரடி தரவுத்தளத்தில் பகிரப்படுகின்றன.'
    },
    {
      q: 'How does the AI crowd management system prevent overcrowding?',
      q_ta: 'கூட்ட நெரிசலை AI அமைப்பு எவ்வாறு தடுக்கிறது?',
      a: 'The system uses computer vision head-counting from temple cameras combined with stochastic queue modeling. It restricts slot sales dynamically before critical thresholds are reached and suggests low-crowd alternative slots to devotees.',
      a_ta: 'சிசிடிவி கேமராக்களின் பார்வை பகுப்பாய்வு மற்றும் வரிசை மாதிரிகளைப் பயன்படுத்தி, அதிக கூட்டம் கூடுவதைத் தடுத்து பாதுகாப்பான நேரங்களை பரிந்துரைக்கிறது.'
    },
    {
      q: 'Can I cancel my booked dharisanam slot if my travel plans change?',
      q_ta: 'பயணத் திட்டம் மாறினால் முன்பதிவு செய்த தரிசன நேரத்தை ரத்து செய்ய முடியுமா?',
      a: 'Yes, you can cancel your booking up to 2 hours prior to your slot time using your 14-digit booking reference number. Your slot will be automatically released back to the general pool for other waiting devotees.',
      a_ta: 'ஆம், உங்கள் 14 இலக்க முன்பதிவு எண்ணைப் பயன்படுத்தி தரிசன நேரத்திற்கு 2 மணி நேரத்திற்கு முன் ரத்து செய்யலாம்.'
    },
    {
      q: 'Is digital QR ticket mandatory to be shown on mobile or paper printout?',
      q_ta: 'டிஜிட்டல் QR டிக்கெட்டை மொபைலில் காட்ட வேண்டுமா அல்லது காகித அச்சு தேவையா?',
      a: 'Both are completely valid. You can show the QR code directly on your smartphone screen, or present a printed paper slip issued by our offline temple counters or printed at home.',
      a_ta: 'இரண்டும் செல்லுபடியாகும். உங்கள் ஸ்மார்ட்போனில் காட்டலாம் அல்லது அச்சிடப்பட்ட காகித சீட்டையும் காட்டலாம்.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Devotee Support & Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            How Can We Assist Your Pilgrimage?
          </h1>
          <p className="text-sm text-slate-600">
            Find answers to common questions, check your booking status, or speak with our AI Pilgrimage Assistant.
          </p>
        </div>

        {/* Quick Help Card Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Toll-Free Helpline</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{supportInfo?.toll_free || '1800-425-4555'}</p>
              <p className="text-[11px] text-slate-500">{supportInfo?.support_hours || '05:00 AM – 10:00 PM'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Support</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{supportInfo?.email || 'support@temple.tn.gov.in'}</p>
              <p className="text-[11px] text-slate-500">Response within 2 hours</p>
            </div>
          </div>

          <div 
            onClick={onOpenChat}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl p-5 shadow-md flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Interactive Assistant</p>
              <p className="text-sm font-black mt-0.5">Chat with Dharisanam AI</p>
              <p className="text-[11px] text-amber-100">Bilingual English / தமிழ்</p>
            </div>
          </div>
        </div>

        {/* ── Booking Reference Lookup Tool ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Check Your Booking Status</h2>
              <p className="text-xs text-slate-500">Enter your 14-digit booking reference ID (e.g. TD202609201474)</p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              value={bookingRefInput}
              onChange={e => setBookingRefInput(e.target.value)}
              placeholder="Enter Booking Reference (TD...)"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={isSearching || !bookingRefInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? 'Searching...' : 'Check Status'}
            </button>
          </form>

          {lookupError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {lookupResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <span className="font-mono font-black text-emerald-900 text-sm">{lookupResult.booking_ref}</span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lookupResult.booking_status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Temple</span>
                  <span className="font-bold text-slate-800">{lookupResult.temple_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Date & Time</span>
                  <span className="font-bold text-slate-800">{lookupResult.slot_date} ({lookupResult.slot_time})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Type</span>
                  <span className="font-bold text-slate-800">{lookupResult.darshan_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Devotees</span>
                  <span className="font-bold text-slate-800">{lookupResult.total_visitors} Person(s)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Frequently Asked Questions ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800">
                      {language === 'ta' ? faq.q_ta : faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {language === 'ta' ? faq.a_ta : faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api, type Temple, type Slot } from '../utils/api';
import { DigitalTicket } from '../components/DigitalTicket';
import { PaymentModal } from '../components/PaymentModal';
import { SlotPicker } from '../components/SlotPicker';
import { ChevronRight, Users, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Search, ArrowLeft } from 'lucide-react';

interface Visitor {
  name: string;
  age: string;
  gender: string;
}

const STEPS = ['temple', 'darshan', 'date', 'slot', 'details', 'confirm'] as const;
type Step = typeof STEPS[number];

export const BookingFlowPage: React.FC<{ initialTempleId?: string; isCounter?: boolean }> = ({
  initialTempleId,
  isCounter = false
}) => {
  const { t, language } = useLanguage();

  // Wizard state
  const [step, setStep] = useState<Step>(initialTempleId ? 'darshan' : 'temple');
  const [selectedTempleId, setSelectedTempleId] = useState<string>(initialTempleId || '');
  const [temple, setTemple] = useState<Temple | null>(null);
  const [darshanType, setDarshanType] = useState<'FREE' | 'PAID'>('FREE');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [primaryName, setPrimaryName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [visitors, setVisitors] = useState<Visitor[]>([{ name: '', age: '', gender: 'Male' }]);
  const [counterStaff, setCounterStaff] = useState<string>('STAFF-COUNTER-01');
  const [counterNumber, setCounterNumber] = useState<string>('COUNTER-1');

  // Search for temple selector
  const [templeSearch, setTempleSearch] = useState('');
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loadingTemples, setLoadingTemples] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Date constraints
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  const minDateStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Load temples for selector
  useEffect(() => {
    if (step === 'temple') {
      setLoadingTemples(true);
      api.getTemples({ search: templeSearch }).then(data => {
        setTemples(data);
        setLoadingTemples(false);
      }).catch(() => setLoadingTemples(false));
    }
  }, [step, templeSearch]);

  // Load temple details when selected
  useEffect(() => {
    if (selectedTempleId) {
      api.getTempleById(selectedTempleId).then(data => {
        setTemple(data);
      }).catch(console.error);
    }
  }, [selectedTempleId]);

  // Load slots when date selected
  useEffect(() => {
    if (selectedTempleId && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      api.getSlots(selectedTempleId, selectedDate).then(data => {
        setSlots(data);
        setLoadingSlots(false);
      }).catch(() => setLoadingSlots(false));
    }
  }, [selectedTempleId, selectedDate]);

  const addVisitor = () => {
    setVisitors(prev => [...prev, { name: '', age: '', gender: 'Male' }]);
  };

  const removeVisitor = (index: number) => {
    if (visitors.length > 1) {
      setVisitors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVisitor = (index: number, field: keyof Visitor, value: string) => {
    setVisitors(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !temple) return;
    const totalAmount = darshanType === 'PAID' ? temple.default_paid_price * visitors.length : 0;

    if (darshanType === 'PAID' && !isCounter) {
      setShowPayment(true);
      return;
    }
    await submitBooking('FREE_OR_COUNTER');
  };

  const submitBooking = async (paymentMethod: string) => {
    setIsSubmitting(true);
    setBookingError('');
    try {
      const result = await api.createBooking({
        temple_id: selectedTempleId,
        slot_id: selectedSlot!.id,
        darshan_type: darshanType,
        channel: isCounter ? 'OFFLINE_COUNTER' : 'ONLINE',
        primary_visitor_name: primaryName,
        visitor_phone: phone,
        visitor_email: email || undefined,
        visitors: visitors.map(v => ({
          name: v.name,
          age: parseInt(v.age) || 25,
          gender: v.gender
        })),
        payment_method: paymentMethod,
        counter_staff_id: isCounter ? counterStaff : undefined,
        counter_number: isCounter ? counterNumber : undefined
      });
      setBooking(result);
      setStep('confirm');
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const progressPercent = ((stepIndex) / (STEPS.length - 1)) * 100;

  const slotStatusStyle = (s: Slot) => {
    if (s.status === 'FULL') return 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed';
    if (s.status === 'LIMITED') return 'border-amber-300 bg-amber-50';
    return 'border-emerald-300 bg-emerald-50';
  };

  const slotBadge = (s: Slot) => {
    const avail = darshanType === 'PAID' ? s.paid_available : s.free_available;
    const cap = darshanType === 'PAID' ? s.paid_capacity : s.free_capacity;
    if (s.status === 'FULL') return { text: '🔴 FULL', cls: 'bg-red-100 text-red-800 border-red-300' };
    if (s.status === 'LIMITED') return { text: `🟡 LIMITED — ${avail}/${cap}`, cls: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: `🟢 ${avail}/${cap} ${t.slotsRemaining}`, cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  // Show ticket if confirmed
  if (step === 'confirm' && booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <DigitalTicket booking={booking} onClose={() => {
            setStep('temple');
            setBooking(null);
            setSelectedTempleId(initialTempleId || '');
            setSelectedSlot(null);
            setVisitors([{ name: '', age: '', gender: 'Male' }]);
            setPrimaryName('');
            setPhone('');
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className={`rounded-2xl p-5 mb-6 text-white ${isCounter ? 'bg-gradient-to-r from-purple-700 to-indigo-700' : 'bg-gradient-to-r from-amber-700 to-amber-800'}`}>
          <h1 className="text-xl sm:text-2xl font-black">
            {isCounter ? `🏛️ ${t.counterTitle}` : `🕉️ ${t.bookingWizardTitle}`}
          </h1>
          {isCounter && (
            <p className="text-sm text-purple-200 mt-1">{t.staffNotice}</p>
          )}
          {/* Progress bar */}
          <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/70 mt-1">
            <span>Step {stepIndex + 1} of {STEPS.length}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
        </div>

        {/* ── STEP 1: Select Temple ── */}
        {step === 'temple' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t.selectTempleLabel}</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={templeSearch}
                onChange={e => setTempleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            {loadingTemples ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {temples.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTempleId(t.id);
                      setTemple(t);
                      setStep('darshan');
                    }}
                    className="text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all"
                  >
                    <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 leading-tight truncate">{t.name}</p>
                      <p className="text-xs text-amber-700 font-medium">{t.deity}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.district}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Select Dharisanam Type ── */}
        {step === 'darshan' && temple && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <button onClick={() => setStep('temple')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to temple selection
            </button>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img src={temple.image_url} alt={temple.name} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h2 className="font-black text-slate-900">{language === 'ta' ? temple.name_tamil : temple.name}</h2>
                <p className="text-xs text-amber-700 font-semibold">{language === 'ta' ? temple.deity_tamil : temple.deity} • {temple.district}</p>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.selectDarshanLabel}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Dharisanam */}
              <button
                onClick={() => { setDarshanType('FREE'); setStep('date'); }}
                className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🕉️</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">₹0 FREE</span>
                </div>
                <h4 className="font-black text-emerald-900 text-base">{t.freeDarshan}</h4>
                <p className="text-xs text-emerald-800 mt-1">{t.freeDarshanDesc}</p>
                <p className="text-xs text-emerald-700 mt-2 font-semibold">Capacity: {temple.default_free_capacity} per slot</p>
              </button>

              {/* Paid Dharisanam */}
              <button
                onClick={() => { setDarshanType('PAID'); setStep('date'); }}
                className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">₹{temple.default_paid_price}/person</span>
                </div>
                <h4 className="font-black text-amber-900 text-base">{t.paidDarshan}</h4>
                <p className="text-xs text-amber-800 mt-1">{t.paidDarshanDesc}</p>
                <p className="text-xs text-amber-700 mt-2 font-semibold">Express Capacity: {temple.default_paid_capacity} per slot</p>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Select Date ── */}
        {step === 'date' && temple && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <button onClick={() => setStep('darshan')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-slate-700">{language === 'ta' ? temple.name_tamil : temple.name}</span>
              <span className="text-slate-400">•</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${darshanType === 'PAID' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {darshanType === 'PAID' ? t.paidDarshan : t.freeDarshan}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.selectDateLabel}</h3>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
              <input
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="flex-1 bg-transparent text-slate-800 font-semibold text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              📅 Slots can be booked {temple.advance_booking_hours}h in advance up to 30 days ahead.
            </p>
            {selectedDate && (
              <button
                onClick={() => setStep('slot')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" /> View Available Slots
              </button>
            )}
          </div>
        )}

        {/* ── STEP 4: Select Slot ── */}
        {step === 'slot' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <button onClick={() => setStep('date')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h3 className="text-lg font-bold text-slate-800">{t.selectSlotLabel}</h3>
            <p className="text-xs text-slate-500">{selectedDate} • {darshanType === 'PAID' ? t.paidDarshan : t.freeDarshan}</p>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                darshanType={darshanType}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
              />
            )}

            {selectedSlot && (
              <button
                onClick={() => setStep('details')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                Continue with {selectedSlot.start_time}–{selectedSlot.end_time} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 5: Visitor Details ── */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <button onClick={() => setStep('slot')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h3 className="text-lg font-bold text-slate-800">{t.visitorDetailsLabel}</h3>

            {isCounter && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-800 mb-1">Staff ID</label>
                  <input
                    type="text"
                    value={counterStaff}
                    onChange={e => setCounterStaff(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-800 mb-1">Counter Number</label>
                  <input
                    type="text"
                    value={counterNumber}
                    onChange={e => setCounterNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>
            )}

            {/* Lead Visitor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.primaryVisitorName} *</label>
                <input
                  type="text"
                  value={primaryName}
                  onChange={e => setPrimaryName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.visitorPhone} *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.visitorEmail}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="email@example.com (optional)"
              />
            </div>

            {/* Individual Visitors */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                All Pilgrims ({visitors.length})
              </h4>
              {visitors.map((v, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Pilgrim {idx + 1}</span>
                    {visitors.length > 1 && (
                      <button onClick={() => removeVisitor(idx)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                        {t.removeVisitor}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3 sm:col-span-1">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={v.name}
                        onChange={e => updateVisitor(idx, 'name', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Age"
                        min="1"
                        max="110"
                        value={v.age}
                        onChange={e => updateVisitor(idx, 'age', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <select
                        value={v.gender}
                        onChange={e => updateVisitor(idx, 'gender', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addVisitor}
                className="w-full border border-dashed border-amber-400 hover:bg-amber-50 text-amber-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                {t.addVisitor}
              </button>
            </div>

            {/* Summary & Error */}
            {selectedSlot && temple && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-1">
                <p className="font-bold text-amber-900 text-sm">Booking Summary</p>
                <p className="text-amber-800">{temple.name}</p>
                <p className="text-amber-800">
                  {selectedDate} • {selectedSlot.start_time}–{selectedSlot.end_time} • {darshanType === 'PAID' ? t.paidDarshan : t.freeDarshan}
                </p>
                <p className="text-amber-800 font-bold">
                  {visitors.length} Pilgrim(s) • Total:{' '}
                  {darshanType === 'PAID' ? `₹${temple.default_paid_price * visitors.length}` : '₹0 (Free)'}
                </p>
              </div>
            )}

            {bookingError && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting || !primaryName.trim() || !phone.trim() || visitors.some(v => !v.name.trim())}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {t.confirmBooking}</>
              )}
            </button>
          </div>
        )}

        {/* Payment Modal for Paid Darshan */}
        {showPayment && temple && selectedSlot && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={method => {
              setShowPayment(false);
              submitBooking(method);
            }}
            templeName={temple.name}
            totalAmount={temple.default_paid_price * visitors.length}
            visitorCount={visitors.length}
            darshanType={darshanType}
          />
        )}
      </div>
    </div>
  );
};

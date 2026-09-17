import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2, Lock, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
  templeName: string;
  totalAmount: number;
  visitorCount: number;
  darshanType: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  templeName,
  totalAmount,
  visitorCount,
  darshanType
}) => {
  const { t, language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('pilgrim@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(selectedMethod);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {language === 'ta' ? 'பாதுகாப்பான கட்டண முறை' : 'Secure Dharisanam Payment'}
              </h3>
              <p className="text-[11px] text-amber-200">256-bit Encrypted SSL Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <span className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Development Test / Demo Mode</span>
          </span>
          <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-mono font-bold">
            NO REAL MONEY
          </span>
        </div>

        {/* Order Summary */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Temple & Dharisanam</span>
            <span className="font-semibold text-slate-700 truncate max-w-[200px]">{templeName}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pilgrims</span>
            <span className="font-semibold text-slate-700">{visitorCount} Person(s)</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-800">Total Payable Amount</span>
            <span className="text-xl font-black text-amber-900">₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Payment Option
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('UPI')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'UPI'
                  ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-sm font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Smartphone className="w-5 h-5 text-amber-600" />
              <span className="text-xs">UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('CARD')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'CARD'
                  ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-sm font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span className="text-xs">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('NETBANKING')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'NETBANKING'
                  ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-sm font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Building2 className="w-5 h-5 text-amber-600" />
              <span className="text-xs">NetBanking</span>
            </button>
          </div>

          {/* Form per method */}
          {selectedMethod === 'UPI' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Virtual Payment Address (VPA) / UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                placeholder="username@bank"
              />
              <p className="text-[10px] text-slate-400">
                Supports Google Pay, PhonePe, Paytm, BHIM UPI
              </p>
            </div>
          )}

          {selectedMethod === 'CARD' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-semibold text-slate-600 block">
                Card Number (Demo)
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  defaultValue="12/28"
                  className="w-full text-xs px-3 py-1.5 border rounded-lg bg-white border-slate-300 font-mono"
                />
                <input
                  type="password"
                  defaultValue="•••"
                  className="w-full text-xs px-3 py-1.5 border rounded-lg bg-white border-slate-300 font-mono"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'NETBANKING' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-2">Select Primary Bank:</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                  <input type="radio" name="bank" defaultChecked /> State Bank of India
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                  <input type="radio" name="bank" /> HDFC Bank
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                  <input type="radio" name="bank" /> ICICI Bank
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                  <input type="radio" name="bank" /> Indian Bank
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay ₹{totalAmount} & Confirm Slot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

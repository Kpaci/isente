import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { parseMoMoSMS } from '../lib/momoParser';
import { 
  ExpenseCategory, 
  TransactionSource 
} from '../types/finance';
import { 
  X, 
  Smartphone, 
  Clipboard, 
  Sparkles, 
  Check, 
  ArrowRight, 
  DollarSign, 
  Tag, 
  FileText, 
  Hash, 
  Calendar,
  Layers,
  HandCoins
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { MoMoScanIcon } from './IsenteIcons';

interface MoMoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  initialText?: string;
}

export const MoMoScanModal: React.FC<MoMoScanModalProps> = ({ isOpen, onClose, onSuccessToast, initialText }) => {
  const { addTransaction, debts, recordDebtPayment, formatMoney, categories } = useFinance();

  useEscapeKey(onClose, isOpen);

  const [rawText, setRawText] = useState<string>(initialText || '');

  useEffect(() => {
    if (initialText) {
      setRawText(initialText);
    }
  }, [initialText, isOpen]);

  // Extracted fields
  const [vendor, setVendor] = useState<string>('');
  const [vendorCode, setVendorCode] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [referenceId, setReferenceId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [notes, setNotes] = useState<string>('');
  const [isIncome, setIsIncome] = useState<boolean>(false);
  const [sourceProvider, setSourceProvider] = useState<TransactionSource>('momo_sms');

  // Debt linking option
  const [linkToDebt, setLinkToDebt] = useState<boolean>(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string>('');

  // Reparse whenever rawText changes
  useEffect(() => {
    if (!rawText.trim()) return;
    const parsed = parseMoMoSMS(rawText);
    setVendor(parsed.vendor);
    setVendorCode(parsed.vendorCode || '');
    setAmount(parsed.amount);
    setFee(parsed.fee);
    setReferenceId(parsed.referenceId);
    setDate(parsed.date);
    setCategory(parsed.suggestedCategory);
    setIsIncome(parsed.isIncome);
    setSourceProvider(parsed.provider === 'airtel' ? 'airtel_sms' : 'momo_sms');
  }, [rawText]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawText(text);
        }
      }
    } catch {
      // Browser permissions error fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (linkToDebt && selectedDebtId) {
      // Record payment against debt
      await recordDebtPayment(selectedDebtId, amount, notes || `MoMo payment to ${vendor}`);
    }

    const finalNotes = notes || (vendorCode ? `Merchant Code: ${vendorCode}` : isIncome ? 'Received via Mobile Money' : 'Payment via Mobile Money');

    // Add transaction record
    await addTransaction({
      type: isIncome ? 'income' : 'expense',
      amount,
      currency: 'RWF',
      category: isIncome ? 'other' : category,
      vendor: vendor || (vendorCode ? `Merchant ${vendorCode}` : 'MoMo Merchant'),
      vendorCode: vendorCode || undefined,
      notes: finalNotes,
      date,
      source: sourceProvider,
      referenceId: referenceId || undefined,
      fee: fee || 0,
    });

    if (onSuccessToast) {
      onSuccessToast(`Imported ${formatMoney(amount)} for ${vendor || 'Merchant'}`);
    }

    // Reset and close
    setRawText('');
    setVendor('');
    setVendorCode('');
    setAmount(0);
    setFee(0);
    setReferenceId('');
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#05F292] to-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <MoMoScanIcon size={20} className="text-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-none">
                Isente SMS Cash Ingest
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste MTN MoMo, Airtel Money or Bank SMS to auto-extract cash flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          
          {/* SMS Paste Input Area (Direct input, no simulated tab) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Paste SMS copied from Messages App:
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[11px] font-bold text-[#05F292] hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste Clipboard</span>
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your MTN MoMo notification SMS here (e.g. TxId:... Your payment of 500 RWF to TWIZWYIMANA EMMANUEL 514386 was completed...)"
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Extracted Data Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Parsed MoMo Receipt
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isIncome ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {isIncome ? 'Income' : 'Expense'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Vendor / Payee Name */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Vendor / Payee</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:border-amber-500 outline-none"
                  placeholder="e.g. TWIZWYIMANA EMMANUEL"
                />
              </div>

              {/* Vendor / Payee Code */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Vendor / Payee Code</label>
                <input
                  type="text"
                  value={vendorCode}
                  onChange={(e) => setVendorCode(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold text-xs focus:border-amber-500 outline-none"
                  placeholder="e.g. 514386 or phone number"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Amount (RWF)</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono font-bold text-sm focus:border-amber-500 outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400">
                    FRw
                  </span>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Transaction ID</label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono text-[11px] focus:border-amber-500 outline-none"
                  placeholder="e.g. 31349391552"
                />
              </div>

              {/* Fee */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Fee</label>
                <div className="mt-1 px-2.5 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 font-mono">
                  {fee} RWF
                </div>
              </div>

              {/* Provider Source */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Payment Provider</label>
                <div className="mt-1 px-2.5 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="capitalize">{sourceProvider === 'airtel_sms' ? 'Airtel Money' : 'MTN Mobile Money'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Category Selector */}
          {!isIncome && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Expense Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isCatSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isCatSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comment / Note input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Add Comment / Notes (Optional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Weekly family groceries, Dinner with friends..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Optional: Link to Existing Debt / IOU */}
          {debts.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={linkToDebt}
                  onChange={(e) => setLinkToDebt(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                />
                <span className="font-medium flex items-center gap-1.5">
                  <HandCoins className="w-3.5 h-3.5 text-amber-400" />
                  Link this payment to settle a debt
                </span>
              </label>

              {linkToDebt && (
                <div className="mt-2 pl-6">
                  <select
                    value={selectedDebtId}
                    onChange={(e) => setSelectedDebtId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select debt to pay off...</option>
                    {debts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.counterpartyName} (Remaining: {formatMoney(d.remainingAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={amount <= 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#05F292] via-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save to Isente Ledger</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { ParsedMoMoSMS } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { 
  Smartphone, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';

interface NativeSMSBannerProps {
  receipt: ParsedMoMoSMS;
  onDismiss: () => void;
  onOpenInScanner: (receipt: ParsedMoMoSMS) => void;
  onSuccessToast: (msg: string) => void;
}

export const NativeSMSBanner: React.FC<NativeSMSBannerProps> = ({
  receipt,
  onDismiss,
  onOpenInScanner,
  onSuccessToast,
}) => {
  const { addTransaction, formatMoney, categories } = useFinance();

  const handleQuickSave = async () => {
    const isIncome = receipt.isIncome;
    const finalNotes = receipt.vendorCode 
      ? `Merchant Code: ${receipt.vendorCode}` 
      : isIncome 
      ? 'Received via Mobile Money' 
      : 'Payment via Mobile Money';

    await addTransaction({
      type: isIncome ? 'income' : 'expense',
      amount: receipt.amount,
      currency: 'RWF',
      category: isIncome ? 'other' : receipt.suggestedCategory,
      vendor: receipt.vendor || (receipt.vendorCode ? `Merchant ${receipt.vendorCode}` : 'MoMo Merchant'),
      vendorCode: receipt.vendorCode,
      notes: finalNotes,
      date: receipt.date || new Date().toISOString(),
      source: receipt.provider === 'airtel' ? 'airtel_sms' : 'momo_sms',
      referenceId: receipt.referenceId || undefined,
      fee: receipt.fee || 0,
    });

    onSuccessToast(`Auto-recorded ${formatMoney(receipt.amount)} for ${receipt.vendor}!`);
    onDismiss();
  };

  const cat = categories.find(c => c.id === receipt.suggestedCategory);

  return (
    <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#0c121e]/95 backdrop-blur-xl border border-[#05F292]/60 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[#05F292] font-bold text-xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span>Isente Detected SMS!</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 bg-[#080c14]/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white truncate max-w-[180px]">
            {receipt.vendor}
          </span>
          <span className="font-mono font-bold text-[#05F292]">
            {formatMoney(receipt.amount)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {receipt.vendorCode && (
            <>
              <span className="font-mono text-emerald-400/90 font-medium">Code: {receipt.vendorCode}</span>
              <span>·</span>
            </>
          )}
          <span>{cat ? `${cat.icon} ${cat.label}` : receipt.suggestedCategory}</span>
          {receipt.referenceId && (
            <>
              <span>·</span>
              <span className="font-mono text-slate-500 truncate max-w-[80px]">#{receipt.referenceId}</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleQuickSave}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#05F292] to-emerald-400 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Quick Confirm</span>
        </button>

        <button
          onClick={() => {
            onOpenInScanner(receipt);
            onDismiss();
          }}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Edit</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

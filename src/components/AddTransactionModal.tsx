import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Check, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { ExpenseCategory, TransactionSource, TransactionType } from '../types/finance';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { addTransaction, currency, formatMoney, categories } = useFinance();
  useEscapeKey(onClose, isOpen);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [vendor, setVendor] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [source, setSource] = useState<TransactionSource>('momo_sms');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || amount <= 0) return;

    await addTransaction({
      type,
      amount,
      currency: 'RWF',
      category: type === 'income' ? 'other' : category,
      vendor: vendor.trim(),
      notes: notes.trim(),
      date: new Date(date).toISOString(),
      source,
      fee: 0,
    });

    if (onSuccessToast) {
      onSuccessToast(`Saved transaction: ${formatMoney(amount)} for ${vendor}`);
    }

    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">
            Add Manual Transaction
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Expense / Income Toggle */}
          <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex gap-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense / Spending
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income / Inflow
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              required
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-lg focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Vendor / Description *
            </label>
            <input
              type="text"
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Simba Supermarket, Petrol Station, Salary"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>

          {type === 'expense' && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label} {c.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Source Method
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TransactionSource)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
              >
                <option value="momo_sms">MTN MoMo</option>
                <option value="airtel_sms">Airtel Money</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="manual">Manual Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Comment / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lunch with client..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!vendor.trim() || amount <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

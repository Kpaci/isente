import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  HandCoins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Calendar, 
  Trash2, 
  FileText,
  X,
  CreditCard
} from 'lucide-react';
import { Debt, DebtType } from '../types/finance';
import { useEscapeKey } from '../hooks/useEscapeKey';

export const DebtsView: React.FC = () => {
  const { 
    debts, 
    addDebt, 
    recordDebtPayment, 
    deleteDebt, 
    totalDebtsGiven, 
    totalDebtsReceived, 
    netDebtPosition,
    formatMoney 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<DebtType>('given');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'settled'>('active');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settlementDebt, setSettlementDebt] = useState<Debt | null>(null);

  useEscapeKey(() => {
    if (settlementDebt) setSettlementDebt(null);
    else if (isAddModalOpen) setIsAddModalOpen(false);
  }, Boolean(settlementDebt || isAddModalOpen));

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState<string>('');

  // New debt form state
  const [newType, setNewType] = useState<DebtType>('given');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredDebts = debts.filter(d => {
    if (d.type !== activeTab) return false;
    if (filterStatus === 'active') return d.status !== 'settled';
    if (filterStatus === 'settled') return d.status === 'settled';
    return true;
  });

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) return;

    await addDebt({
      type: newType,
      counterpartyName: newName.trim(),
      counterpartyPhone: newPhone.trim() || undefined,
      initialAmount: newAmount,
      dueDate: newDueDate || undefined,
      notes: newNotes.trim() || undefined
    });

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewAmount(0);
    setNewDueDate('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementDebt || paymentAmount <= 0) return;

    await recordDebtPayment(settlementDebt.id, paymentAmount, paymentNote);
    setSettlementDebt(null);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Debts & IOUs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep track of money you have lent to others and money you owe
          </p>
        </div>

        <button
          onClick={() => {
            setNewType(activeTab);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 transition-all self-start sm:self-auto shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
          <span>Record New Debt / IOU</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Money Given (Owed to Me) */}
        <div 
          onClick={() => setActiveTab('given')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'given'
              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Owed to Me (Given)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {formatMoney(totalDebtsGiven)}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              {debts.filter(d => d.type === 'given' && d.status !== 'settled').length} active borrower(s)
            </span>
          </div>
        </div>

        {/* Money Received (I Owe) */}
        <div 
          onClick={() => setActiveTab('received')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'received'
              ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/30'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">I Owe (Received)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {formatMoney(totalDebtsReceived)}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              {debts.filter(d => d.type === 'received' && d.status !== 'settled').length} creditor(s) to pay
            </span>
          </div>
        </div>

        {/* Net Position */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Debt Position</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
              netDebtPosition >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {netDebtPosition >= 0 ? 'Positive' : 'Net Borrower'}
            </span>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${
              netDebtPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {netDebtPosition >= 0 ? '+' : ''}{formatMoney(netDebtPosition)}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              {netDebtPosition >= 0 ? 'You are owed more than you owe' : 'Payables exceed receivables'}
            </span>
          </div>
        </div>

      </div>

      {/* Primary Tab Navigation & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('given')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'given'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owed to Me (Lent Out)
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'received'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I Owe (Borrowed)
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {(['active', 'settled', 'all'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors font-medium ${
                filterStatus === st
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'active' ? 'Outstanding' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Debt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebts.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-base font-semibold text-white">No {filterStatus} debts</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeTab === 'given' 
                ? 'You do not have any pending amounts owed to you.' 
                : 'You have no outstanding debts to pay.'}
            </p>
          </div>
        ) : (
          filteredDebts.map(debt => {
            const isSettled = debt.status === 'settled';
            const progress = Math.round(((debt.initialAmount - debt.remainingAmount) / debt.initialAmount) * 100);

            return (
              <div 
                key={debt.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {debt.counterpartyName}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSettled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : debt.status === 'partially_paid'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isSettled ? 'Settled' : debt.status === 'partially_paid' ? 'Partially Paid' : 'Pending'}
                        </span>
                      </div>

                      {debt.counterpartyPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{debt.counterpartyPhone}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Balances */}
                  <div className="mt-4 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Remaining Due</span>
                      <span className="block text-xl font-bold font-mono text-white tabular-nums">
                        {formatMoney(debt.remainingAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Original Total</span>
                      <span className="block text-sm font-semibold font-mono text-slate-400 tabular-nums">
                        {formatMoney(debt.initialAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Repaid: {formatMoney(debt.initialAmount - debt.remainingAmount)}</span>
                      <span className="font-mono font-semibold text-slate-300">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          activeTab === 'given' ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Due Date & Notes */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    {debt.dueDate && (
                      <div className="flex items-center gap-1 text-amber-400/90 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {debt.dueDate}</span>
                      </div>
                    )}
                    {debt.notes && (
                      <div className="flex items-center gap-1 text-slate-400 truncate max-w-xs">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="italic">{debt.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment History Log (if any) */}
                  {debt.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Recent Payments ({debt.history.length})
                      </span>
                      <div className="mt-1.5 space-y-1">
                        {debt.history.slice(-2).map((h, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span className="truncate">{h.note || 'Payment'}</span>
                            <span className="font-mono text-emerald-400">+{formatMoney(h.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settle Action Button */}
                {!isSettled && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setSettlementDebt(debt);
                        setPaymentAmount(debt.remainingAmount);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment / Settle</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record Settlement Modal */}
      {settlementDebt && (
        <div 
          onClick={() => setSettlementDebt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Record Payment for {settlementDebt.counterpartyName}
              </h3>
              <button
                onClick={() => setSettlementDebt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Payment Amount (RWF)
                </label>
                <input
                  type="number"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  max={settlementDebt.remainingAmount}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-lg focus:border-amber-500 outline-none"
                  placeholder="0"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Max remaining due: {formatMoney(settlementDebt.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Payment Note / Reference
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Received via MTN MoMo transfer..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlementDebt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentAmount <= 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Debt Modal */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Record New Debt / IOU
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              
              {/* Type toggle */}
              <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex gap-1">
                <button
                  type="button"
                  onClick={() => setNewType('given')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    newType === 'given' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Owed to Me (I Lent)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('received')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    newType === 'received' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  I Owe (I Borrowed)
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Counterparty Person / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jean Claude Mugisha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+250 788 123 456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Total Amount (RWF) *
                </label>
                <input
                  type="number"
                  required
                  value={newAmount || ''}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Expected Repayment Date (Optional)
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Loan for inventory or car repair..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || newAmount <= 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
                >
                  Create Debt Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

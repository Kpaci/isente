import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  PiggyBank, 
  Plus, 
  Target, 
  Calendar, 
  Landmark, 
  Smartphone, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  X,
  Wallet
} from 'lucide-react';
import { SavingsGoal, SavingsVehicleType } from '../types/finance';
import { useEscapeKey } from '../hooks/useEscapeKey';

const VEHICLE_TYPES: { id: SavingsVehicleType; label: string; icon: string }[] = [
  { id: 'mobile_money', label: 'Mobile Money (MoKash / MoMo)', icon: '📱' },
  { id: 'bank', label: 'Commercial Bank (BK, Equity, I&M)', icon: '🏛️' },
  { id: 'investment_fund', label: 'Investment Fund (RNIT Iterambere)', icon: '📈' },
  { id: 'pension', label: 'Pension Scheme (EjoHeza)', icon: '🛡️' },
  { id: 'cash', label: 'Physical Cash Vault / Safe', icon: '💵' },
];

export const SavingsGoalsView: React.FC = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    adjustSavingsGoalFunds, 
    deleteSavingsGoal, 
    totalSaved, 
    totalSavingsTarget, 
    savingsRate,
    formatMoney 
  } = useFinance();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustGoal, setAdjustGoal] = useState<SavingsGoal | null>(null);

  useEscapeKey(() => {
    if (adjustGoal) setAdjustGoal(null);
    else if (isAddModalOpen) setIsAddModalOpen(false);
  }, Boolean(adjustGoal || isAddModalOpen));

  const [adjustType, setAdjustType] = useState<'deposit' | 'withdraw'>('deposit');
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState<number>(0);
  const [newVehicleName, setNewVehicleName] = useState('MTN MoKash Interest Account');
  const [newVehicleType, setNewVehicleType] = useState<SavingsVehicleType>('mobile_money');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newTarget <= 0 || !newVehicleName.trim()) return;

    await addSavingsGoal({
      title: newTitle.trim(),
      targetAmount: newTarget,
      vehicleName: newVehicleName.trim(),
      vehicleType: newVehicleType,
      targetDate: newTargetDate || undefined,
      notes: newNotes.trim() || undefined,
    });

    // Reset
    setNewTitle('');
    setNewTarget(0);
    setNewVehicleName('MTN MoKash Interest Account');
    setNewVehicleType('mobile_money');
    setNewTargetDate('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleAdjustFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustGoal || adjustAmount <= 0) return;

    const delta = adjustType === 'deposit' ? adjustAmount : -adjustAmount;
    await adjustSavingsGoalFunds(adjustGoal.id, delta);

    setAdjustGoal(null);
    setAdjustAmount(0);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Savings Goals & Vehicles
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Name your targets, track where the money is saved, and grow your accounts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 transition-all self-start sm:self-auto shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Saved So Far
            </span>
            <div className="mt-1">
              <span className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {formatMoney(totalSaved)}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              Across {savingsGoals.length} accounts & vehicles
            </span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Target Goal
            </span>
            <div className="mt-1">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                {formatMoney(totalSavingsTarget)}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              Remaining: {formatMoney(Math.max(0, totalSavingsTarget - totalSaved))}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Overall Progress</span>
              <span className="font-mono font-bold text-amber-400">{savingsRate}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${savingsRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingsGoals.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white">No savings goals yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Create your first target and specify the bank or mobile money vehicle where funds reside.
            </p>
          </div>
        ) : (
          savingsGoals.map(goal => {
            const percentage = goal.targetAmount > 0 
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
              : 0;
            const isCompleted = percentage >= 100;

            return (
              <div
                key={goal.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  
                  {/* Title & Delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">
                        {goal.title}
                      </h4>
                      
                      {/* Where money is saved: Account / Vehicle Badge */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-medium text-amber-400 flex items-center gap-1.5">
                          <span>
                            {goal.vehicleType === 'mobile_money' ? '📱' :
                             goal.vehicleType === 'bank' ? '🏛️' :
                             goal.vehicleType === 'investment_fund' ? '📈' :
                             goal.vehicleType === 'pension' ? '🛡️' : '💵'}
                          </span>
                          <span className="truncate max-w-[180px]">{goal.vehicleName}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Saved</span>
                      <span className="block text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                        {formatMoney(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Target</span>
                      <span className="block text-sm font-semibold font-mono text-slate-400 tabular-nums">
                        {formatMoney(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{percentage}% achieved</span>
                      {isCompleted && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          🎉 Goal Reached!
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Date and Notes */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    {goal.targetDate && (
                      <div className="flex items-center gap-1 text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    )}
                    {goal.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                        {goal.notes}
                      </p>
                    )}
                  </div>

                </div>

                {/* Adjust Funds Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdjustGoal(goal);
                      setAdjustType('deposit');
                      setAdjustAmount(10000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdjustGoal(goal);
                      setAdjustType('withdraw');
                      setAdjustAmount(10000);
                    }}
                    disabled={goal.currentAmount <= 0}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Deposit / Withdraw Modal */}
      {adjustGoal && (
        <div 
          onClick={() => setAdjustGoal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white capitalize">
                  {adjustType} Funds: {adjustGoal.title}
                </h3>
                <span className="text-xs text-amber-400">
                  Account: {adjustGoal.vehicleName}
                </span>
              </div>
              <button
                onClick={() => setAdjustGoal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustFunds} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Amount to {adjustType} (RWF)
                </label>
                <input
                  type="number"
                  value={adjustAmount || ''}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-lg focus:border-amber-500 outline-none"
                  placeholder="0"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                {[5000, 10000, 25000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdjustAmount(val)}
                    className="flex-1 py-1 px-2 rounded-lg text-[11px] font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustAmount <= 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                    adjustType === 'deposit'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Confirm {adjustType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
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
                Create Savings Goal & Vehicle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Emergency Fund, New Phone, Land Deposit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Amount (RWF) *
                </label>
                <input
                  type="number"
                  required
                  value={newTarget || ''}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  placeholder="e.g., 500000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-amber-500 outline-none"
                />
              </div>

              {/* Where the money is saved */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Where is the money saved? (Account / Vehicle Name) *
                </label>
                <input
                  type="text"
                  required
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder="e.g. MTN MoKash, Bank of Kigali (BK), RNIT Fund, EjoHeza"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value as SavingsVehicleType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {VEHICLE_TYPES.map(vt => (
                    <option key={vt.id} value={vt.id}>
                      {vt.icon} {vt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Completion Date (Optional)
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. 7% annual interest compound account..."
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
                  disabled={!newTitle.trim() || newTarget <= 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
                >
                  Save Goal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

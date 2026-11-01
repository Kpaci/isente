import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Sliders, 
  Plus, 
  Tag, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Settings, 
  Coins, 
  ShieldCheck, 
  Layers, 
  Edit2, 
  Sparkles,
  ArrowRight,
  Repeat,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Info
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { RecurringExpense, RecurringFrequency } from '../types/finance';

interface BudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'budget' | 'recurring' | 'categories' | 'preferences';
  onSuccessToast?: (msg: string) => void;
}

const PRESET_EMOJIS = ['🏋️‍♂️', '📚', '🎓', '🎁', '🐶', '✈️', '👔', '☕', '🎮', '🔨', '🏥', '🌾', '💅', '🚗', '🍕', '💻', '📡', '💧', '⚡', '🛡️'];

const PRESET_COLORS = [
  '#6366F1', // Indigo (Rent)
  '#F59E0B', // Amber (Food)
  '#06B6D4', // Cyan (Communication)
  '#3B82F6', // Blue (Transport)
  '#10B981', // Emerald (Groceries)
  '#EAB308', // Yellow (Utilities)
  '#EC4899', // Pink (Healthcare)
  '#8B5CF6', // Purple (Entertainment)
  '#14B8A6', // Teal (Shopping)
  '#E11D48', // Rose
  '#84CC16', // Lime
  '#94A3B8', // Slate
];

const RECURRING_PRESETS = [
  { title: 'Apartment Rent', category: 'rent', defaultAmount: 95000, dueDay: 1, icon: '🏠' },
  { title: 'Fiber Internet & WiFi', category: 'communication', defaultAmount: 25000, dueDay: 5, icon: '📡' },
  { title: 'EUCL CashPower Electricity', category: 'utilities', defaultAmount: 15000, dueDay: 10, icon: '⚡' },
  { title: 'WASAC Water Utility', category: 'utilities', defaultAmount: 8000, dueDay: 12, icon: '💧' },
  { title: 'MTN Airtime & 4G Bundle', category: 'communication', defaultAmount: 10000, dueDay: 15, icon: '📱' },
  { title: 'Gym & Fitness Pass', category: 'healthcare', defaultAmount: 20000, dueDay: 28, icon: '🏋️‍♂️' },
  { title: 'Canal+ / Netflix / DSTV', category: 'entertainment', defaultAmount: 12000, dueDay: 25, icon: '📺' },
  { title: 'School / Tuition Installment', category: 'other', defaultAmount: 50000, dueDay: 1, icon: '🎓' },
];

export const BudgetConfigModal: React.FC<BudgetConfigModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'budget',
  onSuccessToast
}) => {
  const { 
    budget, 
    updateBudget, 
    currency, 
    setCurrency,
    formatMoney, 
    currentMonthSpend, 
    budgetPercentage, 
    remainingBudget,
    isBudgetWarning, 
    isBudgetExceeded,
    categories,
    categoryBudgetProgress,
    addCategory,
    deleteCategory,
    updateCategoryLimit,
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    logRecurringPayment,
    totalMonthlyRecurring,
    user,
    isOnline
  } = useFinance();

  useEscapeKey(onClose, isOpen);

  const [activeTab, setActiveTab] = useState<'budget' | 'recurring' | 'categories' | 'preferences'>(initialTab);

  // Overall budget form state
  const [overallLimit, setOverallLimit] = useState<number>(budget.overallLimit);
  const [alertThreshold, setAlertThreshold] = useState<number>(budget.alertThresholdPercent || 80);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Comprehensive Category limits editable copy
  const [editableCategoryLimits, setEditableCategoryLimits] = useState<Record<string, number>>({});

  // New Category form state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#F59E0B');
  const [newCatLimit, setNewCatLimit] = useState<number>(0);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // New Recurring Expense form state
  const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecCategory, setNewRecCategory] = useState<string>('rent');
  const [newRecAmount, setNewRecAmount] = useState<number>(0);
  const [newRecFrequency, setNewRecFrequency] = useState<RecurringFrequency>('monthly');
  const [newRecDueDay, setNewRecDueDay] = useState<number>(1);
  const [newRecNotes, setNewRecNotes] = useState('');
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'active' | 'due_soon' | 'paid'>('all');

  // Sync state if budget changes externally
  useEffect(() => {
    setOverallLimit(budget.overallLimit);
    setAlertThreshold(budget.alertThresholdPercent || 80);
    setEditableCategoryLimits(budget.categoryLimits || {});
  }, [budget.overallLimit, budget.alertThresholdPercent, budget.categoryLimits]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  // Calculate days left in month for burn rate
  const now = new Date();
  const currentMonthDay = now.getDate();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const dailyAllowance = Math.round(remainingBudget / daysRemaining);

  // Sum of all category limits currently in edit state
  const sumOfCategoryLimits = Object.values(editableCategoryLimits).reduce((acc, val) => acc + (val || 0), 0);

  const handleCategoryLimitChange = (catId: string, value: number) => {
    setEditableCategoryLimits(prev => ({
      ...prev,
      [catId]: Math.max(0, value)
    }));
  };

  const handleSaveAllBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallLimit <= 0) return;

    setIsSavingBudget(true);
    await updateBudget({
      overallLimit,
      alertThresholdPercent: alertThreshold,
      categoryLimits: editableCategoryLimits,
    });
    setIsSavingBudget(false);

    if (onSuccessToast) {
      onSuccessToast(`Comprehensive budget allocations saved!`);
    }
  };

  const handleSyncOverallWithCategories = () => {
    if (sumOfCategoryLimits > 0) {
      setOverallLimit(sumOfCategoryLimits);
      if (onSuccessToast) {
        onSuccessToast(`Overall budget synced to category sum: ${formatMoney(sumOfCategoryLimits)}`);
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    setIsSubmittingCat(true);
    const created = await addCategory({
      label: newCatLabel.trim(),
      icon: newCatIcon || '🏷️',
      color: newCatColor || '#F59E0B',
      limit: newCatLimit > 0 ? newCatLimit : undefined
    });
    setIsSubmittingCat(false);

    // Update local limits state as well
    if (newCatLimit > 0) {
      setEditableCategoryLimits(prev => ({
        ...prev,
        [created.id]: newCatLimit
      }));
    }

    // Reset form
    setNewCatLabel('');
    setNewCatIcon('🏷️');
    setNewCatColor('#F59E0B');
    setNewCatLimit(0);
    setIsCreatingCategory(false);

    if (onSuccessToast) {
      onSuccessToast(`Category "${created.label}" created successfully!`);
    }
  };

  const handleCreateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle.trim() || newRecAmount <= 0) return;

    setIsSubmittingRec(true);
    await addRecurringExpense({
      title: newRecTitle.trim(),
      category: newRecCategory,
      amount: newRecAmount,
      frequency: newRecFrequency,
      dueDay: newRecDueDay,
      status: 'active',
      notes: newRecNotes.trim() || undefined,
    });
    setIsSubmittingRec(false);

    // Reset form
    setNewRecTitle('');
    setNewRecAmount(0);
    setNewRecNotes('');
    setNewRecDueDay(1);
    setIsCreatingRecurring(false);

    if (onSuccessToast) {
      onSuccessToast(`Recurring bill "${newRecTitle}" scheduled!`);
    }
  };

  const applyRecurringPreset = (preset: typeof RECURRING_PRESETS[0]) => {
    setNewRecTitle(preset.title);
    setNewRecCategory(preset.category);
    setNewRecAmount(preset.defaultAmount);
    setNewRecDueDay(preset.dueDay);
    setIsCreatingRecurring(true);
  };

  // Filter recurring expenses
  const filteredRecurring = recurringExpenses.filter(rec => {
    if (recurringFilter === 'active') return rec.status === 'active';
    if (recurringFilter === 'paid') {
      return Boolean(rec.lastPaidDate && rec.lastPaidDate.startsWith(currentMonthKey));
    }
    if (recurringFilter === 'due_soon') {
      const isPaid = Boolean(rec.lastPaidDate && rec.lastPaidDate.startsWith(currentMonthKey));
      return rec.status === 'active' && !isPaid;
    }
    return true;
  });

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#05F292] to-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-none">
                Isente Budget &amp; Allocations
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure monthly budget, category ceilings, recurring bills, and custom tags
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

        {/* Tab Selection */}
        <div className="flex items-center gap-1 p-1.5 bg-[#080c14] border-b border-slate-800/80 px-3 sm:px-4 text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Monthly Budget</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'recurring'
                ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Recurring Expenses ({recurringExpenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* TAB 1: COMPREHENSIVE MONTHLY BUDGET & ALLOCATIONS */}
          {activeTab === 'budget' && (
            <form onSubmit={handleSaveAllBudget} className="space-y-5">
              
              {/* Cockpit Card: Live Progress Bar & Stats */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Current Month Spending Pace
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                        {formatMoney(currentMonthSpend)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / {formatMoney(overallLimit)}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${
                    isBudgetExceeded 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : isBudgetWarning 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isBudgetExceeded ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Over Budget</span>
                      </>
                    ) : isBudgetWarning ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Caution (80%+)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>On Track</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Animated Spending Progress Bar with Threshold Mark */}
                <div className="space-y-1.5 mt-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">
                      {budgetPercentage}% of budget spent
                    </span>
                    <span className="text-slate-400">
                      {isBudgetExceeded ? (
                        <span className="text-rose-400 font-bold">
                          Exceeded by {formatMoney(currentMonthSpend - overallLimit)}
                        </span>
                      ) : (
                        <span>
                          Remaining: <strong className="text-emerald-400 font-bold">{formatMoney(remainingBudget)}</strong>
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="relative h-3.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isBudgetExceeded
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                          : isBudgetWarning
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, budgetPercentage)}%` }}
                    />
                    {/* Alert Threshold Marker Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-300 shadow-sm"
                      style={{ left: `${alertThreshold}%` }}
                      title={`Alert trigger line: ${alertThreshold}%`}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>0%</span>
                    <span className="text-amber-400/80 font-semibold">{alertThreshold}% Alert Target</span>
                    <span>100% ({formatMoney(overallLimit)})</span>
                  </div>
                </div>

                {/* Pace & Days Remaining Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining this month</span>
                  </div>
                  {!isBudgetExceeded && remainingBudget > 0 && (
                    <span className="font-mono text-emerald-400 font-medium">
                      ~{formatMoney(dailyAllowance)} / day safe pace
                    </span>
                  )}
                </div>

              </div>

              {/* Set Overall Monthly Budget Ceiling & Alert Threshold */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Overall Monthly Budget Ceiling</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {formatMoney(overallLimit)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Total Monthly Spending Ceiling ({currency}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={1000}
                        step={5000}
                        value={overallLimit || ''}
                        onChange={(e) => setOverallLimit(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-base focus:border-amber-500 outline-none pr-12"
                        placeholder="e.g. 260000"
                      />
                      <span className="absolute right-3 top-3 font-mono text-xs font-bold text-amber-400">
                        {currency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Caution Warning Trigger ({alertThreshold}%)
                    </label>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                        {alertThreshold}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {[150000, 220000, 260000, 350000, 500000, 1000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOverallLimit(val)}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-mono border transition-colors ${
                        overallLimit === val
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700/80'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comprehensive Category Allocations List */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Category-by-Category Budget Limits</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Set specific limits for Rent, Food, Communication, Transport, and more
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Sum of Category Limits:</span>
                    <span className={`text-sm font-mono font-bold ${
                      sumOfCategoryLimits > overallLimit ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {formatMoney(sumOfCategoryLimits)}
                    </span>
                  </div>
                </div>

                {/* Auto-reconciliation helper */}
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 min-w-0">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {sumOfCategoryLimits === overallLimit ? (
                        <span className="text-emerald-400 font-medium">Category budgets perfectly match your monthly ceiling!</span>
                      ) : sumOfCategoryLimits > overallLimit ? (
                        <span className="text-rose-400 font-medium">Categories exceed ceiling by {formatMoney(sumOfCategoryLimits - overallLimit)}</span>
                      ) : (
                        <span className="text-slate-300">Unallocated budget buffer: <strong className="text-white font-mono">{formatMoney(overallLimit - sumOfCategoryLimits)}</strong></span>
                      )}
                    </span>
                  </div>

                  {sumOfCategoryLimits !== overallLimit && (
                    <button
                      type="button"
                      onClick={handleSyncOverallWithCategories}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 shrink-0 transition-colors"
                    >
                      Sync Overall
                    </button>
                  )}
                </div>

                {/* All Categories Allocations Grid */}
                <div className="space-y-2.5 pt-1">
                  {categories.map((cat) => {
                    const currentVal = editableCategoryLimits[cat.id] || 0;
                    const progressItem = categoryBudgetProgress.find(p => p.category.id === cat.id);
                    const spent = progressItem?.spent || 0;
                    const percent = currentVal > 0 ? Math.round((spent / currentVal) * 100) : 0;
                    const isExceeded = currentVal > 0 && spent > currentVal;

                    return (
                      <div 
                        key={cat.id}
                        className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span 
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border border-white/5"
                              style={{ backgroundColor: `${cat.color}25` }}
                            >
                              {cat.icon}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {cat.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Spent this month: {formatMoney(spent)}
                              </span>
                            </div>
                          </div>

                          {/* Editable Limit Input Box */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                step={5000}
                                value={currentVal || ''}
                                onChange={(e) => handleCategoryLimitChange(cat.id, Number(e.target.value))}
                                placeholder="No limit"
                                className="w-28 sm:w-36 bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-xs font-mono font-bold text-white text-right focus:border-amber-500 outline-none"
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                              {currency}
                            </span>
                          </div>
                        </div>

                        {/* Mini progress bar if limit is set */}
                        {currentVal > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  isExceeded ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                              <span>{percent}% allocated spend</span>
                              <span>
                                {isExceeded ? (
                                  <span className="text-rose-400 font-semibold">Exceeded by {formatMoney(spent - currentVal)}</span>
                                ) : (
                                  <span>{formatMoney(currentVal - spent)} remaining</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Real-time budget tracking active</span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingBudget || overallLimit <= 0}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSavingBudget ? 'Saving...' : 'Save Comprehensive Budget'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: RECURRING EXPENSES */}
          {activeTab === 'recurring' && (
            <div className="space-y-5">
              
              {/* Recurring Expenses Header & Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Committed Recurring Bills & Subscriptions
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                        {formatMoney(totalMonthlyRecurring)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / month committed
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingRecurring(!isCreatingRecurring)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto ${
                      isCreatingRecurring 
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                    }`}
                  >
                    {isCreatingRecurring ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{isCreatingRecurring ? 'Cancel' : 'Set Recurring Expense'}</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Fixed recurring costs represent{' '}
                    <strong className="text-amber-400 font-mono">
                      {overallLimit > 0 ? Math.round((totalMonthlyRecurring / overallLimit) * 100) : 0}%
                    </strong>{' '}
                    of your monthly budget.
                  </span>
                  <span className="font-mono text-slate-500">
                    {recurringExpenses.filter(r => r.status === 'active').length} active
                  </span>
                </div>
              </div>

              {/* Add New Recurring Form */}
              {isCreatingRecurring && (
                <form 
                  onSubmit={handleCreateRecurring}
                  className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Configure New Recurring Expense</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Monthly, weekly, or rent schedule</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                      Fast Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {RECURRING_PRESETS.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => applyRecurringPreset(preset)}
                          className="py-1 px-2.5 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Title */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Expense Name / Merchant *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRecTitle}
                        onChange={(e) => setNewRecTitle(e.target.value)}
                        placeholder="e.g. Canalbox Fiber Internet, Rent, Electricity"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Category *
                      </label>
                      <select
                        value={newRecCategory}
                        onChange={(e) => setNewRecCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Amount ({currency}) *
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        step={500}
                        value={newRecAmount || ''}
                        onChange={(e) => setNewRecAmount(Number(e.target.value))}
                        placeholder="e.g. 25000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    {/* Due Day of Month */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Due Day of Month (1 - 31)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={newRecDueDay}
                          onChange={(e) => setNewRecDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                        />
                        <span className="absolute right-3 top-2 text-[11px] text-slate-400">
                          {newRecDueDay === 1 ? '1st of month' : newRecDueDay === 2 ? '2nd' : newRecDueDay === 3 ? '3rd' : `${newRecDueDay}th of month`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Notes / Account Ref (Optional)
                    </label>
                    <input
                      type="text"
                      value={newRecNotes}
                      onChange={(e) => setNewRecNotes(e.target.value)}
                      placeholder="e.g. Account meter #827104, shared 2-bed split"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingRecurring(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRec || !newRecTitle.trim() || newRecAmount <= 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Recurring Expense</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Recurring Expenses Filter Pills */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {(['all', 'active', 'due_soon', 'paid'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setRecurringFilter(tab)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors font-medium ${
                        recurringFilter === tab
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tab === 'due_soon' ? 'Due Soon' : tab === 'paid' ? 'Paid this Month' : tab}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {filteredRecurring.length} item{filteredRecurring.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Recurring Expenses List */}
              <div className="space-y-2.5">
                {filteredRecurring.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl text-slate-400 text-xs">
                    <Repeat className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p>No recurring expenses matching this filter.</p>
                  </div>
                ) : (
                  filteredRecurring.map((rec) => {
                    const catObj = categories.find(c => c.id === rec.category);
                    const isPaidThisMonth = Boolean(rec.lastPaidDate && rec.lastPaidDate.startsWith(currentMonthKey));
                    const isDueSoon = !isPaidThisMonth && rec.status === 'active' && Math.abs(rec.dueDay - currentMonthDay) <= 3;
                    const isPastDue = !isPaidThisMonth && rec.status === 'active' && currentMonthDay > rec.dueDay;

                    return (
                      <div 
                        key={rec.id}
                        className={`bg-slate-950/60 border rounded-2xl p-3.5 space-y-3 transition-colors ${
                          rec.status === 'paused' 
                            ? 'border-slate-850 opacity-60'
                            : isPaidThisMonth
                            ? 'border-emerald-500/30'
                            : isPastDue
                            ? 'border-amber-500/40'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/5"
                              style={{ backgroundColor: `${catObj?.color || '#F59E0B'}25` }}
                            >
                              {catObj?.icon || '💳'}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-white text-sm truncate">
                                  {rec.title}
                                </h5>
                                {rec.status === 'paused' && (
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                    Paused
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>{catObj?.label || rec.category}</span>
                                <span>·</span>
                                <span className="font-mono">
                                  Due day {rec.dueDay} ({rec.frequency})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amount and Status Badge */}
                          <div className="text-right shrink-0">
                            <span className="block font-mono font-bold text-base text-white">
                              {formatMoney(rec.amount)}
                            </span>
                            <div className="mt-0.5">
                              {isPaidThisMonth ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Paid this month</span>
                                </span>
                              ) : isPastDue ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  <Clock className="w-3 h-3" />
                                  <span>Due (day {rec.dueDay})</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">
                                  Due on {rec.dueDay}th
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {rec.notes && (
                          <p className="text-[11px] text-slate-400 bg-slate-900/60 rounded-lg px-2.5 py-1.5">
                            {rec.notes}
                          </p>
                        )}

                        {/* Actions Strip */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          {/* Toggle Active / Pause */}
                          <button
                            type="button"
                            onClick={() => updateRecurringExpense({
                              ...rec,
                              status: rec.status === 'active' ? 'paused' : 'active'
                            })}
                            className="text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            {rec.status === 'active' ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Resume</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {/* 1-click Log Payment Now Button */}
                            {!isPaidThisMonth && rec.status === 'active' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await logRecurringPayment(rec.id);
                                  if (onSuccessToast) {
                                    onSuccessToast(`Logged payment for "${rec.title}"!`);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Log Payment Now</span>
                              </button>
                            )}

                            {/* Delete recurring expense */}
                            <button
                              type="button"
                              onClick={() => deleteRecurringExpense(rec.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete recurring commitment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              
              {/* Header with New Category Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Expense Categories & Custom Tags
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Create custom categories with personalized emojis, colors, and budget limits
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCreatingCategory 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                  }`}
                >
                  {isCreatingCategory ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{isCreatingCategory ? 'Cancel' : 'New Category'}</span>
                </button>
              </div>

              {/* Create Category Form */}
              {isCreatingCategory && (
                <form 
                  onSubmit={handleCreateCategory}
                  className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Create New Category</span>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="e.g. Gym & Fitness, Church, School Fees, Pet Care"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* Icon / Emoji Picker */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Select Icon / Emoji
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESET_EMOJIS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewCatIcon(em)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform ${
                            newCatIcon === em 
                              ? 'bg-amber-500/20 border-2 border-amber-400 scale-110' 
                              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Or custom emoji:</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-700 rounded-lg py-1 text-center text-sm focus:border-amber-500 outline-none text-white"
                      />
                    </div>
                  </div>

                  {/* Color Swatch */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Theme Color
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCatColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            newCatColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Optional Monthly Budget Limit */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Monthly Category Budget Limit ({currency}) - Optional
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={newCatLimit || ''}
                      onChange={(e) => setNewCatLimit(Number(e.target.value))}
                      placeholder="e.g. 30000 (leave blank or 0 for no specific cap)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCat || !newCatLabel.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              )}

              {/* Categories Grid */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Categories ({categories.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const isCustom = cat.isCustom;
                    const catLimit = editableCategoryLimits[cat.id] || 0;

                    return (
                      <div 
                        key={cat.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span 
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border border-white/5"
                            style={{ backgroundColor: `${cat.color}25` }}
                          >
                            {cat.icon}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {catLimit > 0 ? `Limit: ${formatMoney(catLimit)}` : 'No ceiling set'}
                            </span>
                          </div>
                        </div>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors"
                            title="Delete custom category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              
              {/* Currency Selector */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Currency Selection</span>
                </div>
                <p className="text-xs text-slate-400">
                  Select your primary transactional currency for conversions and balances:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { code: 'RWF', label: 'Rwandan Franc', symbol: 'FRw' },
                    { code: 'USD', label: 'US Dollar', symbol: '$' },
                    { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
                    { code: 'UGX', label: 'Ugandan Shilling', symbol: 'USh' },
                    { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
                    { code: 'EUR', label: 'Euro', symbol: '€' },
                  ].map((cur) => (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => {
                        setCurrency(cur.code);
                        if (onSuccessToast) {
                          onSuccessToast(`Currency switched to ${cur.code}`);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        currency === cur.code
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="block font-bold text-xs">{cur.code}</span>
                      <span className="block text-[11px] text-slate-400 truncate">{cur.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloud Sync Status */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cloud Persistence & Sync Status</span>
                </div>

                <div className="text-xs text-slate-300 space-y-2">
                  <p>
                    {user ? (
                      <span className="text-emerald-400 font-semibold">
                        ✓ Connected to Firebase as {user.displayName || user.email}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
                        Offline / Guest Local Storage Mode (Click Sign In in the top bar to enable cross-device cloud sync)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Network Status: {isOnline ? 'Online (Real-time sync)' : 'Offline (Local cache)'}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

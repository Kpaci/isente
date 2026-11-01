import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  PlusCircle, 
  PiggyBank,
  HandCoins,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Sliders,
  Tag,
  CheckCircle2,
  Calendar,
  Plus,
  Repeat,
  Clock,
  Filter
} from 'lucide-react';

interface DashboardViewProps {
  onOpenMoMoScan: () => void;
  onOpenAddManual: () => void;
  onNavigateTab: (tab: 'dashboard' | 'transactions' | 'debts' | 'goals') => void;
  onOpenBudgetModal: (tab?: 'budget' | 'recurring' | 'categories' | 'preferences') => void;
}

type ActivityTimeFilter = 'all' | 'today' | 'this_week' | 'this_month';

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenMoMoScan,
  onOpenAddManual,
  onNavigateTab,
  onOpenBudgetModal
}) => {
  const { 
    transactions, 
    totalIncome, 
    currentMonthSpend, 
    budget, 
    budgetPercentage, 
    isBudgetWarning, 
    isBudgetExceeded,
    remainingBudget,
    totalDebtsGiven, 
    totalDebtsReceived, 
    totalSaved,
    categoryBreakdown,
    categories,
    categoryBudgetProgress,
    recurringExpenses,
    totalMonthlyRecurring,
    formatMoney 
  } = useFinance();

  const [activityFilter, setActivityFilter] = useState<ActivityTimeFilter>('all');

  // Create fast category dictionary
  const categoryMap = useMemo(() => {
    const map: Record<string, { label: string; icon: string; color: string; isCustom?: boolean }> = {};
    categories.forEach(c => {
      map[c.id] = { label: c.label, icon: c.icon, color: c.color, isCustom: c.isCustom };
    });
    return map;
  }, [categories]);

  // Current date markers
  const now = useMemo(() => new Date(), []);
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthDay = now.getDate();

  // Helper date checking functions
  const isSameDay = (dateStr: string, refDate: Date) => {
    const d = new Date(dateStr);
    return d.getFullYear() === refDate.getFullYear() &&
           d.getMonth() === refDate.getMonth() &&
           d.getDate() === refDate.getDate();
  };

  const isThisWeek = (dateStr: string, refDate: Date) => {
    const d = new Date(dateStr);
    const diffMs = refDate.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) return true;

    const day = refDate.getDay() || 7;
    const monday = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - day + 1, 0, 0, 0);
    return d >= monday && d <= refDate;
  };

  const isThisMonth = (dateStr: string, refDate: Date) => {
    const d = new Date(dateStr);
    return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
  };

  // Activity filter counts
  const todayCount = useMemo(() => {
    return transactions.filter(t => isSameDay(t.date, now)).length;
  }, [transactions, now]);

  const thisWeekCount = useMemo(() => {
    return transactions.filter(t => isThisWeek(t.date, now)).length;
  }, [transactions, now]);

  const thisMonthCount = useMemo(() => {
    return transactions.filter(t => isThisMonth(t.date, now)).length;
  }, [transactions, now]);

  // Filtered transactions for Recent Activity Feed
  const filteredRecentTransactions = useMemo(() => {
    if (activityFilter === 'today') {
      return transactions.filter(t => isSameDay(t.date, now));
    }
    if (activityFilter === 'this_week') {
      return transactions.filter(t => isThisWeek(t.date, now));
    }
    if (activityFilter === 'this_month') {
      return transactions.filter(t => isThisMonth(t.date, now));
    }
    return transactions.slice(0, 8);
  }, [transactions, activityFilter, now]);

  // Total spent in active filtered slice
  const filteredSpendTotal = useMemo(() => {
    return filteredRecentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredRecentTransactions]);

  const filteredIncomeTotal = useMemo(() => {
    return filteredRecentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredRecentTransactions]);

  // Prepare data for Category Donut Chart
  const totalCategorizedSpend = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a);

  // Compute SVG arc angles for Donut Chart
  let cumulativeAngle = 0;
  const donutSegments = sortedCategories.map(([cat, amount]) => {
    const fraction = amount / totalCategorizedSpend;
    const startAngle = cumulativeAngle;
    const angle = fraction * 360;
    cumulativeAngle += angle;
    return {
      category: cat,
      amount,
      percentage: Math.round(fraction * 100),
      startAngle,
      angle,
      color: categoryMap[cat]?.color || '#94A3B8'
    };
  });

  // Calculate days remaining in current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const dailyAllowance = Math.round(remainingBudget / daysRemaining);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Hero: Financial Health & Monthly Budget Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Budget & Spend Cockpit with Live Progress Bar */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0c121e] via-[#090d16] to-[#080c14] border border-slate-800/80 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl min-w-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#05F292]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 border-b border-slate-800/80 relative">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#05F292]" />
                Monthly Spending &amp; Budget Ceiling
              </span>
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {formatMoney(currentMonthSpend)}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  / {formatMoney(budget.overallLimit)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => onOpenBudgetModal('budget')}
                className="text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Set Budget</span>
              </button>

              <button
                onClick={() => onOpenBudgetModal('recurring')}
                className="text-xs font-semibold text-violet-300 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 px-3 py-2 rounded-xl border border-violet-500/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Recurring</span>
              </button>

              <button
                onClick={() => onOpenBudgetModal('categories')}
                className="text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-2 rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Categories</span>
              </button>
            </div>
          </div>

          {/* Real-time Spending Progress Bar with Dynamic Color & Thresholds */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>{budgetPercentage}% consumed</span>
                {isBudgetExceeded && (
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    Exceeded
                  </span>
                )}
                {isBudgetWarning && !isBudgetExceeded && (
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Caution Threshold ({budget.alertThresholdPercent || 80}%)
                  </span>
                )}
              </span>

              <span className="text-slate-400">
                {isBudgetExceeded ? (
                  <span className="text-rose-400 font-bold">
                    Over by {formatMoney(currentMonthSpend - budget.overallLimit)}
                  </span>
                ) : (
                  <span>
                    Remaining: <strong className="text-emerald-400 font-bold">{formatMoney(remainingBudget)}</strong>
                  </span>
                )}
              </span>
            </div>

            <div className="relative h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
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
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400/90 shadow-sm"
                style={{ left: `${budget.alertThresholdPercent || 80}%` }}
                title={`Alert limit: ${budget.alertThresholdPercent || 80}%`}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0%</span>
              <span className="text-amber-400/80 font-medium">
                {budget.alertThresholdPercent || 80}% Alert Marker
              </span>
              <span>100% ({formatMoney(budget.overallLimit)})</span>
            </div>
          </div>

          {/* Quick Metrics Bar Under Progress */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Income Inflow</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">+{formatMoney(totalIncome)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Safe Daily Spend</span>
              <span className="font-mono font-bold text-white text-sm">~{formatMoney(dailyAllowance)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Month Progress</span>
              <span className="font-mono font-bold text-slate-300 text-sm">{daysRemaining} days left</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fixed Recurring</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{formatMoney(totalMonthlyRecurring)}</span>
            </div>
          </div>

        </div>

        {/* Action Panel: Isente Express Ingest & Manual Logging */}
        <div className="bg-gradient-to-br from-[#0c121e] to-[#080c14] border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#05F292] animate-pulse shadow-[0_0_8px_#05F292]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#05F292]">
                Isente Express Ingest
              </span>
            </div>
            <h3 className="font-extrabold text-white text-lg">Instant Cash &amp; SMS Sync</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Paste MTN, Airtel or Bank SMS receipts for automated AI-grade parsing and debt matching.
            </p>
          </div>

          <div className="space-y-2.5 mt-5">
            <button
              onClick={onOpenMoMoScan}
              className="w-full bg-gradient-to-r from-[#05F292] via-emerald-400 to-teal-400 hover:opacity-95 active:scale-[0.98] text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 stroke-[2.8]" />
              <span className="text-sm">Scan / Ingest MoMo SMS</span>
            </button>

            <button
              onClick={onOpenAddManual}
              className="w-full bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] text-slate-200 hover:text-white font-semibold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manual Cash / Bank Entry</span>
            </button>
          </div>
        </div>

      </div>

      {/* Secondary Row: Category Breakdown Donut & Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Category Breakdown Card with SVG Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Expense Breakdown</h3>
              <p className="text-xs text-slate-400">Current month distribution across categories</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {formatMoney(currentMonthSpend)} Total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                {donutSegments.map((seg, idx) => {
                  const r = 38;
                  const c = 2 * Math.PI * r;
                  const strokeDasharray = `${(seg.angle / 360) * c} ${c}`;
                  const strokeDashoffset = -((seg.startAngle / 360) * c);
                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                <span className="font-mono text-xs font-bold text-white">{sortedCategories.length} Cats</span>
              </div>
            </div>

            {/* Category breakdown rows */}
            <div className="flex-1 w-full space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {sortedCategories.map(([cat, amount]) => {
                const fraction = amount / totalCategorizedSpend;
                const percentage = Math.round(fraction * 100);
                const catItem = categoryMap[cat];
                const color = catItem?.color || '#94A3B8';
                const label = catItem?.label || cat;
                const icon = catItem?.icon || '📦';

                return (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm shrink-0">{icon}</span>
                      <span className="text-slate-300 font-medium truncate">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-semibold text-white">{formatMoney(amount)}</span>
                      <span className="text-[11px] font-mono text-slate-400 w-8 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Category Budgets & Spending Progress Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-base">Category Budgets</h3>
                <p className="text-xs text-slate-400">Track spending against specific limits with progress bars</p>
              </div>

              <button
                onClick={() => onOpenBudgetModal('budget')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/20"
              >
                <Sliders className="w-3 h-3" />
                <span>Adjust Limits</span>
              </button>
            </div>

            {/* Category Progress Bars Deck */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {categoryBudgetProgress
                .filter(item => item.limit > 0 || item.spent > 0)
                .slice(0, 5)
                .map((item) => {
                  const hasLimit = item.limit > 0;
                  const isExceeded = hasLimit && item.spent > item.limit;

                  return (
                    <div 
                      key={item.category.id}
                      className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.category.icon}</span>
                          <span className="font-semibold text-slate-200">{item.category.label}</span>
                          {item.category.isCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-right">
                          <span className="text-white font-bold">{formatMoney(item.spent)}</span>
                          {hasLimit && (
                            <span className="text-slate-400 text-[11px]"> / {formatMoney(item.limit)}</span>
                          )}
                        </div>
                      </div>

                      {hasLimit ? (
                        <div className="space-y-0.5">
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isExceeded ? 'bg-rose-500' : item.percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>{item.percentage}% used</span>
                            <span>
                              {isExceeded ? (
                                <span className="text-rose-400 font-semibold">Exceeded by {formatMoney(item.spent - item.limit)}</span>
                              ) : (
                                <span>{formatMoney(item.remaining)} remaining</span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>No ceiling set</span>
                          <button
                            onClick={() => onOpenBudgetModal('budget')}
                            className="text-amber-400 hover:underline"
                          >
                            + Set limit
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{categories.length} total categories registered</span>
            <button
              onClick={() => onOpenBudgetModal('budget')}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Configure Allocations →
            </button>
          </div>
        </div>

      </div>

      {/* Committed Recurring Expenses Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Recurring Expenses & Subscriptions</h3>
              <p className="text-xs text-slate-400">Committed monthly bills: rent, internet, electricity, airtime</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {formatMoney(totalMonthlyRecurring)} / mo
            </span>
            <button
              onClick={() => onOpenBudgetModal('recurring')}
              className="text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Recurring</span>
            </button>
          </div>
        </div>

        {/* Recurring items preview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recurringExpenses.slice(0, 6).map((rec) => {
            const catItem = categoryMap[rec.category];
            const isPaidThisMonth = Boolean(rec.lastPaidDate && rec.lastPaidDate.startsWith(currentMonthKey));

            return (
              <div 
                key={rec.id}
                onClick={() => onOpenBudgetModal('recurring')}
                className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl cursor-pointer transition-all hover:bg-slate-950/90 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{catItem?.icon || '💳'}</span>
                    <span className="font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                      {rec.title}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white shrink-0">
                    {formatMoney(rec.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-900">
                  <span className="font-mono">Due day {rec.dueDay}</span>
                  {isPaidThisMonth ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Scheduled</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed with Today, This Week, This Month Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Recent Activity</h3>
              <span className="text-xs text-slate-500 font-mono">
                ({transactions.length} total)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter expenditures and inflows by timeframe
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-2xl border border-slate-800 self-start sm:self-auto text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activityFilter === 'all'
                  ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono opacity-80">({transactions.length})</span>
            </button>

            <button
              onClick={() => setActivityFilter('today')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activityFilter === 'today'
                  ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Today</span>
              <span className="text-[10px] font-mono opacity-80">({todayCount})</span>
            </button>

            <button
              onClick={() => setActivityFilter('this_week')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activityFilter === 'this_week'
                  ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>This Week</span>
              <span className="text-[10px] font-mono opacity-80">({thisWeekCount})</span>
            </button>

            <button
              onClick={() => setActivityFilter('this_month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activityFilter === 'this_month'
                  ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>This Month</span>
              <span className="text-[10px] font-mono opacity-80">({thisMonthCount})</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Showing{' '}
              <strong className="text-white font-mono">{filteredRecentTransactions.length}</strong>{' '}
              {activityFilter === 'today' ? "transactions for today" : activityFilter === 'this_week' ? "transactions this week" : activityFilter === 'this_month' ? "transactions this month" : "recent transactions"}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            {filteredSpendTotal > 0 && (
              <span className="text-slate-300">
                Period spend: <strong className="text-rose-400 font-bold">-{formatMoney(filteredSpendTotal)}</strong>
              </span>
            )}
            {filteredIncomeTotal > 0 && (
              <span className="text-slate-300">
                Period inflow: <strong className="text-emerald-400 font-bold">+{formatMoney(filteredIncomeTotal)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Transactions List */}
        {filteredRecentTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              No transactions found for {activityFilter === 'today' ? 'today' : activityFilter === 'this_week' ? 'this week' : 'this month'}.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan a new MoMo SMS or log an expense manually to start tracking for this timeframe.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={onOpenMoMoScan}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Scan MoMo SMS</span>
              </button>
              <button
                onClick={onOpenAddManual}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                + Add Manual
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredRecentTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const catItem = categoryMap[tx.category];
              const catColor = catItem?.color || '#94A3B8';
              const catIcon = catItem?.icon || '💳';
              const catLabel = catItem?.label || tx.category;

              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5"
                      style={{ backgroundColor: `${catColor}15` }}
                    >
                      <span className="text-sm">
                        {catIcon}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                        {tx.vendor}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{catLabel}</span>
                        <span>·</span>
                        <span className="font-mono">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                        {tx.source === 'momo_sms' && (
                          <>
                            <span>·</span>
                            <span className="text-[10px] font-bold text-amber-400">MoMo SMS</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span 
                      className={`block font-mono font-bold text-sm sm:text-base tabular-nums ${
                        isExpense ? 'text-slate-100' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatMoney(tx.amount)}
                    </span>
                    {tx.referenceId && (
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {tx.referenceId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View all in Transactions tab button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>See Full Transactions Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AlertCircle, AlertTriangle, X, ArrowRight, Settings } from 'lucide-react';

interface BudgetAlertBannerProps {
  onOpenBudgetSettings: () => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({ onOpenBudgetSettings }) => {
  const { 
    isBudgetWarning, 
    isBudgetExceeded, 
    budgetPercentage, 
    currentMonthSpend, 
    budget, 
    remainingBudget,
    formatMoney 
  } = useFinance();

  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (!isBudgetWarning && !isBudgetExceeded)) {
    return null;
  }

  const isExceeded = isBudgetExceeded;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <div 
        className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
          isExceeded 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 shadow-lg shadow-rose-950/30' 
            : 'bg-amber-950/40 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div 
              className={`p-2.5 rounded-xl shrink-0 ${
                isExceeded ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isExceeded ? (
                <AlertCircle className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h4 className="font-bold text-sm sm:text-base tracking-tight truncate">
                  {isExceeded ? 'Budget Limit Exceeded!' : 'Approaching Budget Limit!'}
                </h4>
                <span 
                  className={`text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isExceeded ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {budgetPercentage}% used
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {isExceeded ? (
                  <>
                    You have spent <span className="font-semibold text-white">{formatMoney(currentMonthSpend)}</span>, 
                    exceeding your monthly ceiling of <span className="font-semibold text-white">{formatMoney(budget.overallLimit)}</span>.
                  </>
                ) : (
                  <>
                    You have spent <span className="font-semibold text-white">{formatMoney(currentMonthSpend)}</span> of your{' '}
                    <span className="font-semibold text-white">{formatMoney(budget.overallLimit)}</span> limit. Only{' '}
                    <span className="font-semibold text-amber-300">{formatMoney(remainingBudget)}</span> remaining.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={onOpenBudgetSettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isExceeded
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Adjust Limit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss alert"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3 w-full bg-slate-900/60 rounded-full h-2 overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              isExceeded ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, budgetPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

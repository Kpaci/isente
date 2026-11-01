import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose }) => {
  useEscapeKey(onClose, isOpen);

  const { 
    transactions, 
    budget, 
    currentMonthSpend, 
    totalIncome, 
    budgetPercentage, 
    isBudgetExceeded,
    isBudgetWarning,
    categoryBreakdown,
    totalDebtsGiven,
    totalDebtsReceived,
    formatMoney,
    categories
  } = useFinance();

  const categoryMap = React.useMemo(() => {
    const map: Record<string, { label: string; icon: string }> = {};
    categories.forEach(c => {
      map[c.id] = { label: c.label, icon: c.icon };
    });
    return map;
  }, [categories]);

  if (!isOpen) return null;

  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
  const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
  
  // Biggest single expense
  const biggestExpense = expenseTransactions.length > 0 
    ? [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0] 
    : null;

  // MoMo transactions count
  const momoCount = currentMonthTransactions.filter(t => t.source === 'momo_sms' || t.source === 'airtel_sms').length;

  // Net monthly balance
  const monthlyNet = totalIncome - currentMonthSpend;

  // Financial Health Grade
  let grade = 'A';
  let gradeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let gradeSummary = 'Excellent discipline — spending is well within budget limits.';

  if (isBudgetExceeded) {
    grade = 'D';
    gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    gradeSummary = 'Action required — monthly expenditures exceeded budget threshold.';
  } else if (isBudgetWarning) {
    grade = 'B';
    gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    gradeSummary = 'Caution — spending has crossed the 80% budget limit threshold.';
  } else if (budgetPercentage <= 60) {
    grade = 'A+';
    gradeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    gradeSummary = 'Outstanding performance — substantial surplus available for savings.';
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Amount (RWF)', 'Percentage of Total'];
    const totalSpend = currentMonthSpend || 1;
    const rows = Object.entries(categoryBreakdown).map(([cat, amt]) => [
      cat,
      amt,
      `${Math.round((amt / totalSpend) * 100)}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Isente_Expenditure_Report_${currentMonthPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-2xl bg-[#0d131f] border border-slate-800 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between print:border-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#05F292] flex items-center justify-center border border-emerald-500/20 shadow-sm print:hidden">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base print:text-black">
                Isente Monthly Report
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                {monthName} Financial Overview & Insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 print:p-0">
          
          {/* Scorecard Hero */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider print:text-slate-600">
                  Financial Health Grade
                </span>
                <p className="text-sm text-slate-200 mt-1 font-medium print:text-black">
                  {gradeSummary}
                </p>
              </div>

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl font-mono border ${gradeColor}`}>
                {grade}
              </div>
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800/80 print:border-slate-300">
              <div>
                <span className="text-[11px] text-slate-400 block print:text-slate-600">Total Spent</span>
                <span className="text-lg font-bold font-mono text-white print:text-black tabular-nums">
                  {formatMoney(currentMonthSpend)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block print:text-slate-600">Budget Limit</span>
                <span className="text-lg font-bold font-mono text-slate-300 print:text-black tabular-nums">
                  {formatMoney(budget.overallLimit)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block print:text-slate-600">Net Surplus</span>
                <span className={`text-lg font-bold font-mono tabular-nums ${monthlyNet >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                  {monthlyNet >= 0 ? '+' : ''}{formatMoney(monthlyNet)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Insights Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 print:border-slate-300">
              <span className="text-xs text-slate-400 font-medium">Single Biggest Outflow</span>
              {biggestExpense ? (
                <div className="mt-1">
                  <span className="text-base font-bold text-white print:text-black block truncate">
                    {biggestExpense.vendor}
                  </span>
                  <span className="text-xs font-mono text-rose-400 print:text-rose-700 font-bold">
                    {formatMoney(biggestExpense.amount)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {new Date(biggestExpense.date).toLocaleDateString()} · {biggestExpense.category}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">No expenses recorded</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 print:border-slate-300">
              <span className="text-xs text-slate-400 font-medium">Mobile Money Activity</span>
              <div className="mt-1">
                <span className="text-base font-bold text-white print:text-black block">
                  {momoCount} MoMo Receipts Parsed
                </span>
                <span className="text-xs text-amber-400 print:text-amber-700 font-medium">
                  {Math.round((momoCount / (currentMonthTransactions.length || 1)) * 100)}% of all transactions
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Automatic SMS capture
                </span>
              </div>
            </div>

          </div>

          {/* Category Expenditure Breakdown Table */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 print:text-black">
              Expenditure by Category
            </h4>

            <div className="border border-slate-800 rounded-2xl overflow-x-auto print:border-slate-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 print:bg-slate-100 print:text-black print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amt]) => {
                      const share = Math.round((amt / (currentMonthSpend || 1)) * 100);
                      return (
                        <tr key={cat} className="hover:bg-slate-800/20 print:text-black">
                          <td className="py-2.5 px-4 font-medium text-slate-200 print:text-black flex items-center gap-2">
                            <span>{categoryMap[cat]?.icon || '🏷️'}</span>
                            <span className="capitalize">{categoryMap[cat]?.label || cat}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-white print:text-black">
                            {formatMoney(amt)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-400 print:text-slate-600">
                            {share}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debt Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between print:border-slate-300">
            <div>
              <span className="font-semibold text-slate-300 print:text-black">Current Debts Ledger</span>
              <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                Receivables: {formatMoney(totalDebtsGiven)} · Payables: {formatMoney(totalDebtsReceived)}
              </p>
            </div>
            <span className="font-mono font-bold text-amber-400">
              {totalDebtsGiven >= totalDebtsReceived ? 'Net Positive' : 'Net Payable'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-slate-500">
            Generated by MoMoPay Finance on {new Date().toLocaleDateString()}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Smartphone, 
  Tag, 
  Calendar, 
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import { ExpenseCategory, Transaction } from '../types/finance';

interface TransactionsViewProps {
  onOpenMoMoScan: () => void;
  onOpenAddManual: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenMoMoScan,
  onOpenAddManual
}) => {
  const { transactions, deleteTransaction, formatMoney, categories } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');

  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Categories' },
      ...categories.map(c => ({ id: c.id, label: `${c.icon} ${c.label}` }))
    ];
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map: Record<string, { label: string; icon: string }> = {};
    categories.forEach(c => {
      map[c.id] = { label: c.label, icon: c.icon };
    });
    return map;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesVendor = tx.vendor.toLowerCase().includes(query);
        const matchesNotes = tx.notes.toLowerCase().includes(query);
        const matchesRef = tx.referenceId ? tx.referenceId.toLowerCase().includes(query) : false;
        return matchesVendor || matchesNotes || matchesRef;
      }
      return true;
    });
  }, [transactions, selectedCategory, selectedType, searchQuery]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Type', 'Vendor', 'Category', 'Amount (RWF)', 'Source', 'Reference ID', 'Notes'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type,
      `"${t.vendor.replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.source,
      t.referenceId || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoMoPay_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* View Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Isente Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cash flow &amp; Mobile Money reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenMoMoScan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Scan MoMo SMS</span>
          </button>

          <button
            onClick={onOpenAddManual}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        
        {/* Search input & Type pills */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, note, or transaction ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            {(['all', 'expense', 'income'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-[#05F292] to-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-[#05F292] border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Transaction List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">No transactions found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search terms or category filter, or import a new Mobile Money payment message.
            </p>
            <button
              onClick={onOpenMoMoScan}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Import MoMo SMS</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              return (
                <div 
                  key={tx.id} 
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                      isExpense ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isExpense ? (
                        <ArrowUpRight className="w-5 h-5 text-rose-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {tx.vendor}
                        </p>
                        {tx.source === 'momo_sms' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            MTN MoMo
                          </span>
                        )}
                        {tx.source === 'airtel_sms' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                            Airtel
                          </span>
                        )}
                      </div>

                      {/* Clean Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-1">
                        <span className="capitalize">{categoryMap[tx.category]?.label || tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {tx.referenceId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-500">Ref: {tx.referenceId}</span>
                          </>
                        )}
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="italic text-slate-300 truncate max-w-xs">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Delete Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`block font-mono font-bold text-base tabular-nums ${
                        isExpense ? 'text-slate-100' : 'text-emerald-400'
                      }`}>
                        {isExpense ? '-' : '+'}{formatMoney(tx.amount)}
                      </span>
                      {tx.fee ? (
                        <span className="text-[10px] font-mono text-slate-500">
                          Fee: {formatMoney(tx.fee)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

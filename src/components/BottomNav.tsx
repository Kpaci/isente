import React from 'react';
import { 
  DashboardIcon, 
  TransactionsIcon, 
  MoMoScanIcon, 
  DebtsIcon, 
  GoalsIcon 
} from './IsenteIcons';

export type NavTab = 'dashboard' | 'transactions' | 'debts' | 'goals';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenMoMoScan: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenMoMoScan,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080c14]/90 backdrop-blur-xl border-t border-slate-800/80 px-2 sm:px-6">
      <div className="max-w-lg mx-auto h-16 flex items-center justify-around relative">
        
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-all ${
            activeTab === 'dashboard' 
              ? 'text-[#05F292] font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home Dashboard"
        >
          <DashboardIcon size={20} className={activeTab === 'dashboard' ? 'text-[#05F292]' : 'text-slate-400'} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Home</span>
          {activeTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-[#05F292] shadow-[0_0_6px_#05F292] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Transactions */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-all ${
            activeTab === 'transactions' 
              ? 'text-[#05F292] font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Activity Ledger"
        >
          <TransactionsIcon size={20} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Activity</span>
          {activeTab === 'transactions' && (
            <span className="w-1 h-1 rounded-full bg-[#05F292] shadow-[0_0_6px_#05F292] mt-0.5" />
          )}
        </button>

        {/* Center Primary Action: Scan Cash SMS FAB */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenMoMoScan}
            title="Scan & Ingest Mobile Money SMS"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#05F292] via-emerald-500 to-[#6366F1] text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all border-4 border-[#080c14] group"
          >
            <MoMoScanIcon size={24} className="text-slate-950 group-hover:rotate-12 transition-transform" />
          </button>
          <span className="text-[9px] font-extrabold text-[#05F292] mt-0.5 tracking-wider uppercase">
            Scan Cash
          </span>
        </div>

        {/* Tab 3: Debts / IOUs */}
        <button
          onClick={() => onChangeTab('debts')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-all ${
            activeTab === 'debts' 
              ? 'text-[#05F292] font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Debts and IOUs"
        >
          <DebtsIcon size={20} className={activeTab === 'debts' ? 'text-[#05F292]' : 'text-slate-400'} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Debts</span>
          {activeTab === 'debts' && (
            <span className="w-1 h-1 rounded-full bg-[#05F292] shadow-[0_0_6px_#05F292] mt-0.5" />
          )}
        </button>

        {/* Tab 4: Savings Goals */}
        <button
          onClick={() => onChangeTab('goals')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-all ${
            activeTab === 'goals' 
              ? 'text-[#05F292] font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Savings Goals"
        >
          <GoalsIcon size={20} />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Savings</span>
          {activeTab === 'goals' && (
            <span className="w-1 h-1 rounded-full bg-[#05F292] shadow-[0_0_6px_#05F292] mt-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};

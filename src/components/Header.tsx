import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Smartphone, 
  Cloud, 
  CloudOff, 
  LogIn, 
  LogOut, 
  Download, 
  FileText,
  AlertTriangle,
  Settings,
  User as UserIcon,
  ChevronDown,
  Check,
  ShieldCheck,
  Coins,
  Sliders,
  Tag,
  Repeat,
  RotateCcw
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

import { IsenteLogoIcon } from './IsenteIcons';

interface HeaderProps {
  onOpenReport: () => void;
  onOpenMoMoScan: () => void;
  onOpenBudgetSettings?: (tab?: 'budget' | 'recurring' | 'categories' | 'preferences') => void;
  onOpenAPKModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenReport, 
  onOpenMoMoScan, 
  onOpenBudgetSettings,
  onOpenAPKModal
}) => {
  const { 
    user, 
    signIn, 
    signOut, 
    isOnline, 
    currency, 
    setCurrency, 
    isBudgetWarning, 
    isBudgetExceeded,
    budgetPercentage,
    currentMonthSpend,
    budget,
    formatMoney,
    transactions,
    resetUserToZero
  } = useFinance();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape
  useEscapeKey(() => setIsProfileMenuOpen(false), isProfileMenuOpen);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Vendor', 'Category', 'Amount (RWF)', 'Source', 'Reference ID', 'Notes'];
    const rows = transactions.map(t => [
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
    link.setAttribute('download', `Isente_Finance_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Isente Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#05F292] via-emerald-500 to-[#6366F1] p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 hover:scale-105 transition-transform cursor-pointer">
            <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center">
              <IsenteLogoIcon size={22} />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-none">
                Isente
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                Cash
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 hidden min-[360px]:inline truncate">
              Smart Money Tracker
            </span>
          </div>
        </div>

        {/* Central / Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Budget Limit Warning Indicator if active */}
          {(isBudgetWarning || isBudgetExceeded) && (
            <div 
              title={isBudgetExceeded ? "Budget Exceeded!" : "Approaching Budget Limit!"}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
                isBudgetExceeded 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isBudgetExceeded ? 'Budget Exceeded' : '80%+ Used'}
              </span>
            </div>
          )}

          {/* Quick Settings & Budget Button */}
          {onOpenBudgetSettings && (
            <button
              onClick={() => onOpenBudgetSettings('budget')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all hover:border-slate-700 active:scale-95 shadow-sm"
              title="Budget & Category Settings"
            >
              <Settings className="w-3.5 h-3.5 text-[#05F292]" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          {/* Quick Report Icon Button */}
          <button
            onClick={onOpenReport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-800 transition-all hover:border-slate-700 active:scale-95 shadow-sm"
            title="Monthly Expenditure Report"
          >
            <FileText className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden lg:inline">Report</span>
          </button>

          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center px-1 text-slate-400" title={isOnline ? "Connected to Firebase Cloud" : "Offline (Local storage active)"}>
            {isOnline ? (
              <span className="flex items-center gap-1 text-[11px] text-[#05F292] font-semibold">
                <Cloud className="w-4 h-4" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#05F292] animate-pulse hidden md:inline shadow-[0_0_8px_#05F292]" />
              </span>
            ) : (
              <span className="text-amber-400">
                <CloudOff className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Profile Picture / Account Button with Submenus */}
          <div className="relative" ref={menuRef}>
            {user ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                aria-label="User Account Menu"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User Profile'} 
                    className="w-8 h-8 rounded-full border-2 border-[#05F292]/80 object-cover shadow-sm shadow-emerald-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#05F292] to-[#6366F1] text-slate-950 flex items-center justify-center text-xs font-extrabold border-2 border-emerald-400 shadow-sm shadow-emerald-500/20">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-2 pr-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition-colors"
                aria-label="Guest Account Menu"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 text-[#05F292] flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold hidden sm:inline">Account</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Profile & Settings Dropdown Menu */}
            {isProfileMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800/70">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-sm font-bold border border-slate-700">
                      {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                      {user?.displayName || (user ? 'Firebase User' : 'Guest User')}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || 'Local device storage'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user ? 'Cloud Synced' : 'Offline / Guest'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Spend Snapshot in Menu */}
                <div className="px-2.5 py-2 bg-slate-950/40 rounded-xl border border-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Spent this month</span>
                    <span className="font-mono font-bold text-white">{formatMoney(currentMonthSpend)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Budget limit</span>
                    <span className="font-mono text-slate-300">{formatMoney(budget.overallLimit)}</span>
                  </div>
                </div>

                {/* Submenus: Settings & Quick Actions */}
                <div className="space-y-1 text-xs">
                  
                  {/* Currency Switcher */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Currency</span>
                    </span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-slate-800 text-amber-400 font-mono text-xs font-bold border border-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-amber-500"
                    >
                      <option value="RWF">RWF (FRw)</option>
                      <option value="USD">USD ($)</option>
                      <option value="KES">KES (KSh)</option>
                      <option value="UGX">UGX (USh)</option>
                      <option value="GHS">GHS (GH₵)</option>
                    </select>
                  </div>

                  {/* Budget & Spending Settings */}
                  {onOpenBudgetSettings && (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenBudgetSettings('budget');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-amber-400" />
                          <span>Monthly Budget & Progress</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{budgetPercentage}%</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenBudgetSettings('recurring');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-amber-400" />
                          <span>Recurring Expenses & Bills</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400/80">Monthly</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenBudgetSettings('categories');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-amber-400" />
                          <span>Manage & Create Categories</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">+ New</span>
                      </button>
                    </>
                  )}

                  {/* Monthly Report */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenReport();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Monthly Expenditure Report</span>
                  </button>

                  {/* Export Data */}
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left font-medium"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Export Financial Data (CSV)</span>
                  </button>

                  {/* Isente Android APK Direct Download Option */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenAPKModal?.();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors text-left font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#05F292]" />
                      <span>Isente Android App (.apk)</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[#05F292] border border-emerald-500/30">
                      APK
                    </span>
                  </button>

                  {/* Reset all values to 0 option */}
                  {user && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Reset all transactions, debts, savings goals, and budget limits to 0?')) {
                          setIsProfileMenuOpen(false);
                          await resetUserToZero();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors text-left font-medium text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset All Values to 0</span>
                    </button>
                  )}

                </div>

                {/* Account Action: Sign in or Log out */}
                <div className="pt-2 border-t border-slate-800">
                  {user ? (
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Account</span>
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await signIn();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#05F292] to-emerald-400 hover:from-emerald-400 hover:to-[#05F292] text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

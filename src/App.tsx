import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { BudgetAlertBanner } from './components/BudgetAlertBanner';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { DebtsView } from './components/DebtsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { MoMoScanModal } from './components/MoMoScanModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { BudgetConfigModal } from './components/BudgetConfigModal';
import { AndroidAPKModal } from './components/AndroidAPKModal';
import { NativeSMSBanner } from './components/NativeSMSBanner';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav, NavTab } from './components/BottomNav';
import { Check, Smartphone, Loader2 } from 'lucide-react';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useNativeSMS } from './hooks/useNativeSMS';
import { ParsedMoMoSMS } from './types/finance';

import { IsenteLogoIcon } from './components/IsenteIcons';

const FinanceApp: React.FC = () => {
  const { user, loadingAuth } = useFinance();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMoMoScanOpen, setIsMoMoScanOpen] = useState(false);
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [momoScanInitialText, setMomoScanInitialText] = useState<string>('');
  const [budgetModalTab, setBudgetModalTab] = useState<'budget' | 'recurring' | 'categories' | 'preferences'>('budget');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Native Android incoming MoMo SMS receiver hook
  const { detectedReceipt, dismissDetected } = useNativeSMS();

  const handleOpenBudgetModal = (tab: 'budget' | 'recurring' | 'categories' | 'preferences' = 'budget') => {
    setBudgetModalTab(tab);
    setIsBudgetModalOpen(true);
  };

  // Allow ESC to dismiss any active modal
  useEscapeKey(() => {
    setIsMoMoScanOpen(false);
    setIsAddManualOpen(false);
    setIsReportOpen(false);
    setIsBudgetModalOpen(false);
    setIsAPKModalOpen(false);
  }, Boolean(isMoMoScanOpen || isAddManualOpen || isReportOpen || isBudgetModalOpen || isAPKModalOpen));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Loading authentication barrier
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#05F292]/20 to-indigo-600/20 text-[#05F292] flex items-center justify-center border border-[#05F292]/30 mb-4 shadow-xl shadow-[#05F292]/10 animate-pulse">
          <IsenteLogoIcon className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2.5 text-slate-300 text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-[#05F292]" />
          <span>Securing your Isente wallet...</span>
        </div>
      </div>
    );
  }

  // 2. Registration / Authentication barrier: No user can use the app without registering first
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated App Experience (smooth touchpad and mobile scrolling)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full max-w-full">
      
      {/* Top Navigation Bar */}
      <Header
        onOpenReport={() => setIsReportOpen(true)}
        onOpenMoMoScan={() => {
          setMomoScanInitialText('');
          setIsMoMoScanOpen(true);
        }}
        onOpenBudgetSettings={(tab) => handleOpenBudgetModal(tab || 'budget')}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
      />

      {/* Proactive Budget Threshold Alert Banner (80% / 100%) */}
      <BudgetAlertBanner
        onOpenBudgetSettings={() => handleOpenBudgetModal('budget')}
      />

      {/* Real-time Native Android SMS Detection Banner */}
      {detectedReceipt && (
        <NativeSMSBanner
          receipt={detectedReceipt}
          onDismiss={dismissDetected}
          onOpenInScanner={(receipt: ParsedMoMoSMS) => {
            setMomoScanInitialText(receipt.originalText);
            setIsMoMoScanOpen(true);
          }}
          onSuccessToast={showToast}
        />
      )}

      {/* Main Content Viewport with generous bottom padding for touchpad & mobile scrolling above bottom bar */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-4 pt-5 pb-28 sm:pb-20">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenMoMoScan={() => {
              setMomoScanInitialText('');
              setIsMoMoScanOpen(true);
            }}
            onOpenAddManual={() => setIsAddManualOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenBudgetModal={(tab) => handleOpenBudgetModal(tab || 'budget')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenMoMoScan={() => {
              setMomoScanInitialText('');
              setIsMoMoScanOpen(true);
            }}
            onOpenAddManual={() => setIsAddManualOpen(true)}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView />
        )}
      </main>

      {/* Mobile Fixed Thumb-Zone Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        onOpenMoMoScan={() => {
          setMomoScanInitialText('');
          setIsMoMoScanOpen(true);
        }}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs animate-in slide-in-from-top-2 duration-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MoMo SMS Ingestion Modal */}
      <MoMoScanModal
        isOpen={isMoMoScanOpen}
        onClose={() => {
          setIsMoMoScanOpen(false);
          setMomoScanInitialText('');
        }}
        onSuccessToast={showToast}
        initialText={momoScanInitialText}
      />

      {/* Manual Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddManualOpen}
        onClose={() => setIsAddManualOpen(false)}
        onSuccessToast={showToast}
      />

      {/* Automated Monthly Expenditure Report Modal */}
      <MonthlyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Budget & Alert Threshold Config Modal */}
      <BudgetConfigModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        initialTab={budgetModalTab}
        onSuccessToast={showToast}
      />

      {/* Native Android APK Build & Sideload Modal */}
      <AndroidAPKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <FinanceApp />
    </FinanceProvider>
  );
}

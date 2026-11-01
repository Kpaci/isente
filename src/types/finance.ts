/**
 * Finance entity definitions for MoMoPay Finance
 */

export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = 
  | 'rent'
  | 'food' 
  | 'communication'
  | 'transportation' 
  | 'groceries' 
  | 'utilities' 
  | 'healthcare' 
  | 'entertainment' 
  | 'shopping' 
  | 'other'
  | string;

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type TransactionSource = 'momo_sms' | 'airtel_sms' | 'cash' | 'bank' | 'manual';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: ExpenseCategory | string;
  vendor: string;
  notes: string;
  date: string; // ISO string
  source: TransactionSource;
  referenceId?: string;
  vendorCode?: string;
  fee?: number;
  newBalance?: number;
  createdAt: string;
}

export type DebtType = 'given' | 'received'; // given = lent to someone; received = borrowed from someone
export type DebtStatus = 'pending' | 'partially_paid' | 'settled';

export interface DebtPayment {
  amount: number;
  date: string;
  note: string;
}

export interface Debt {
  id: string;
  userId: string;
  type: DebtType;
  counterpartyName: string;
  counterpartyPhone?: string;
  initialAmount: number;
  remainingAmount: number;
  dueDate?: string;
  status: DebtStatus;
  notes?: string;
  history: DebtPayment[];
  createdAt: string;
}

export type SavingsVehicleType = 'mobile_money' | 'bank' | 'investment_fund' | 'pension' | 'cash';

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  vehicleName: string; // e.g. "MTN MoKash", "Bank of Kigali", "Iterambere Fund RNIT", "EjoHeza"
  vehicleType: SavingsVehicleType;
  targetDate?: string;
  notes?: string;
  createdAt: string;
}

export interface BudgetConfig {
  id: string;
  userId: string;
  month: string; // "YYYY-MM"
  overallLimit: number;
  categoryLimits: Record<string, number>;
  alertThresholdPercent: number; // e.g. 80
  updatedAt: string;
}

export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  frequency: RecurringFrequency;
  dueDay: number; // 1 to 31 day of month
  status: 'active' | 'paused';
  notes?: string;
  lastPaidDate?: string; // ISO date string or YYYY-MM-DD
  createdAt: string;
}

export interface ParsedMoMoSMS {
  originalText: string;
  provider: 'mtn' | 'airtel' | 'generic';
  type: 'payment' | 'transfer_sent' | 'transfer_received' | 'cashout' | 'airtime' | 'utility';
  amount: number;
  currency: string;
  vendor: string;
  vendorCode?: string;
  recipient?: string;
  fee: number;
  newBalance?: number;
  referenceId: string;
  date: string;
  suggestedCategory: ExpenseCategory;
  isIncome: boolean;
}

export interface ApkReleaseConfig {
  id?: string;
  downloadUrl: string;
  version: string;
  releaseNotes?: string;
  updatedAt?: string;
  updatedBy?: string;
}


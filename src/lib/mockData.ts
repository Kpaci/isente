import { Transaction, Debt, SavingsGoal, BudgetConfig, RecurringExpense } from '../types/finance';

// Helper to construct dynamic dates relative to current execution time
const relativeDate = (daysAgo: number, hours = 12, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-today-1',
    userId: 'guest',
    type: 'expense',
    amount: 8500,
    currency: 'RWF',
    category: 'food',
    vendor: 'Bourbon Coffee Kigali',
    notes: 'Breakfast cappuccino & pastry',
    date: relativeDate(0, 8, 30),
    source: 'momo_sms',
    referenceId: '948910231',
    fee: 0,
    createdAt: relativeDate(0, 8, 30),
  },
  {
    id: 'tx-today-2',
    userId: 'guest',
    type: 'expense',
    amount: 3000,
    currency: 'RWF',
    category: 'transportation',
    vendor: 'Yego Moto Transport',
    notes: 'Morning office commute Kigali CBD',
    date: relativeDate(0, 9, 15),
    source: 'momo_sms',
    referenceId: '948914881',
    fee: 0,
    createdAt: relativeDate(0, 9, 15),
  },
  {
    id: 'tx-thisweek-1',
    userId: 'guest',
    type: 'expense',
    amount: 5000,
    currency: 'RWF',
    category: 'communication',
    vendor: 'MTN MoMo Airtime & 4G Bundle',
    notes: 'Weekly 10GB 4G pack & voice airtime',
    date: relativeDate(2, 14, 20),
    source: 'momo_sms',
    referenceId: '947118291',
    fee: 0,
    createdAt: relativeDate(2, 14, 20),
  },
  {
    id: 'tx-thisweek-2',
    userId: 'guest',
    type: 'expense',
    amount: 14500,
    currency: 'RWF',
    category: 'groceries',
    vendor: 'Simba Supermarket',
    notes: 'Weekly household fresh vegetables & groceries',
    date: relativeDate(3, 17, 45),
    source: 'momo_sms',
    referenceId: '946918204',
    fee: 0,
    createdAt: relativeDate(3, 17, 45),
  },
  {
    id: 'tx-thisweek-3',
    userId: 'guest',
    type: 'expense',
    amount: 18000,
    currency: 'RWF',
    category: 'transportation',
    vendor: 'Total Energies Remera',
    notes: 'Fuel tank top up for vehicle',
    date: relativeDate(5, 11, 10),
    source: 'momo_sms',
    referenceId: '945882019',
    fee: 0,
    createdAt: relativeDate(5, 11, 10),
  },
  {
    id: 'tx-month-1',
    userId: 'guest',
    type: 'expense',
    amount: 12000,
    currency: 'RWF',
    category: 'utilities',
    vendor: 'EUCL CashPower Electricity',
    notes: 'Prepaid electricity token 52 kWh',
    date: relativeDate(8, 18, 40),
    source: 'momo_sms',
    referenceId: '942918201',
    fee: 0,
    createdAt: relativeDate(8, 18, 40),
  },
  {
    id: 'tx-month-2',
    userId: 'guest',
    type: 'expense',
    amount: 95000,
    currency: 'RWF',
    category: 'rent',
    vendor: 'Kigali Prime Rentals',
    notes: 'Monthly 2-bedroom shared apartment rent',
    date: relativeDate(12, 10, 15),
    source: 'bank',
    referenceId: '940029182',
    fee: 0,
    createdAt: relativeDate(12, 10, 15),
  },
  {
    id: 'tx-month-3',
    userId: 'guest',
    type: 'income',
    amount: 350000,
    currency: 'RWF',
    category: 'other',
    vendor: 'Monthly Salary / Business Inflow',
    notes: 'Direct Bank & MoMo inflow for current month',
    date: relativeDate(16, 9, 0),
    source: 'bank',
    referenceId: 'SAL261001-998',
    createdAt: relativeDate(16, 9, 0),
  },
  {
    id: 'tx-month-4',
    userId: 'guest',
    type: 'expense',
    amount: 9500,
    currency: 'RWF',
    category: 'healthcare',
    vendor: 'Pharmacie Conseil Kigali',
    notes: 'Prescription vitamins & wellness medicine',
    date: relativeDate(18, 14, 20),
    source: 'momo_sms',
    referenceId: '946001293',
    fee: 0,
    createdAt: relativeDate(18, 14, 20),
  },
  {
    id: 'tx-month-5',
    userId: 'guest',
    type: 'expense',
    amount: 16000,
    currency: 'RWF',
    category: 'entertainment',
    vendor: 'Century Cinema & Inzozi Cafe',
    notes: 'Weekend movie tickets & refreshments',
    date: relativeDate(20, 20, 0),
    source: 'airtel_sms',
    referenceId: 'MP261016.2000.A19',
    fee: 0,
    createdAt: relativeDate(20, 20, 0),
  }
];

export const INITIAL_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    userId: 'guest',
    type: 'given', // Owed to Me
    counterpartyName: 'Jean Claude Mugisha',
    counterpartyPhone: '+250 788 334 455',
    initialAmount: 40000,
    remainingAmount: 25000,
    dueDate: '2026-10-25',
    status: 'partially_paid',
    notes: 'Lent for car repair parts at Gikondo garage',
    history: [
      {
        amount: 15000,
        date: relativeDate(7, 16, 0),
        note: 'Partial cash payment at Simba Cafe'
      }
    ],
    createdAt: relativeDate(15, 10, 0)
  },
  {
    id: 'debt-2',
    userId: 'guest',
    type: 'given', // Owed to Me
    counterpartyName: 'Aline Uwase',
    counterpartyPhone: '+250 783 112 233',
    initialAmount: 18000,
    remainingAmount: 18000,
    dueDate: '2026-11-02',
    status: 'pending',
    notes: 'Shared weekend dinner bill at Fusion Restaurant',
    history: [],
    createdAt: relativeDate(3, 21, 30)
  },
  {
    id: 'debt-3',
    userId: 'guest',
    type: 'received', // I Owe Someone
    counterpartyName: 'David Nkurunziza (Colleague)',
    counterpartyPhone: '+250 788 998 877',
    initialAmount: 35000,
    remainingAmount: 15000,
    dueDate: '2026-10-30',
    status: 'partially_paid',
    notes: 'Split payment for bulk office coffee and tea supplies',
    history: [
      {
        amount: 20000,
        date: relativeDate(5, 11, 0),
        note: 'Sent via MTN MoMo'
      }
    ],
    createdAt: relativeDate(10, 14, 0)
  }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    userId: 'guest',
    title: 'Emergency Rainy Day Reserve',
    targetAmount: 500000,
    currentAmount: 320000,
    vehicleName: 'MTN MoKash Interest Account',
    vehicleType: 'mobile_money',
    targetDate: '2026-12-31',
    notes: 'High liquidity safety cushion earning 7% MoKash interest',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'goal-2',
    userId: 'guest',
    title: 'New M3 MacBook / Dev Hardware',
    targetAmount: 1200000,
    currentAmount: 480000,
    vehicleName: 'Bank of Kigali (BK) Target Savings',
    vehicleType: 'bank',
    targetDate: '2027-03-31',
    notes: 'Dedicated hardware replacement account',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'goal-3',
    userId: 'guest',
    title: 'Long-Term Wealth & Pension',
    targetAmount: 2000000,
    currentAmount: 850000,
    vehicleName: 'RNIT Iterambere Fund & EjoHeza',
    vehicleType: 'investment_fund',
    targetDate: '2028-12-31',
    notes: 'Government compound interest collective investment scheme',
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'rec-1',
    userId: 'guest',
    title: 'Apartment Rent & Service Charge',
    amount: 95000,
    category: 'rent',
    frequency: 'monthly',
    dueDay: 1,
    status: 'active',
    notes: 'Kigali Prime Rentals 2-bedroom shared apartment',
    lastPaidDate: relativeDate(12).slice(0, 10),
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rec-2',
    userId: 'guest',
    title: 'Canalbox Fiber Internet & WiFi',
    amount: 25000,
    category: 'communication',
    frequency: 'monthly',
    dueDay: 5,
    status: 'active',
    notes: 'Unlimited 50Mbps fiber home internet',
    lastPaidDate: relativeDate(15).slice(0, 10),
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rec-3',
    userId: 'guest',
    title: 'EUCL CashPower Electricity',
    amount: 15000,
    category: 'utilities',
    frequency: 'monthly',
    dueDay: 10,
    status: 'active',
    notes: 'Prepaid electricity unit monthly top-up',
    lastPaidDate: relativeDate(8).slice(0, 10),
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rec-4',
    userId: 'guest',
    title: 'MTN MoMo Airtime & Monthly Data',
    amount: 10000,
    category: 'communication',
    frequency: 'monthly',
    dueDay: 20,
    status: 'active',
    notes: 'Mobile 4G data pack & voice airtime',
    lastPaidDate: undefined,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'rec-5',
    userId: 'guest',
    title: 'Gym & Fitness Membership',
    amount: 20000,
    category: 'healthcare',
    frequency: 'monthly',
    dueDay: 28,
    status: 'active',
    notes: 'Kigali Heights Fitness Pass',
    lastPaidDate: undefined,
    createdAt: '2026-10-01T00:00:00.000Z'
  }
];

export const INITIAL_BUDGET: BudgetConfig = {
  id: 'budget-current',
  userId: 'guest',
  month: '2026-10',
  overallLimit: 260000,
  categoryLimits: {
    rent: 95000,
    food: 45000,
    communication: 25000,
    transportation: 30000,
    groceries: 35000,
    utilities: 20000,
    healthcare: 15000,
    entertainment: 20000,
    shopping: 25000,
    other: 15000
  },
  alertThresholdPercent: 80,
  updatedAt: new Date().toISOString()
};

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Transaction, 
  Debt, 
  SavingsGoal, 
  BudgetConfig, 
  ExpenseCategory,
  CategoryItem,
  RecurringExpense
} from '../types/finance';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_DEBTS, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_BUDGET,
  INITIAL_RECURRING_EXPENSES
} from '../lib/mockData';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  registerWithEmail,
  signInWithEmail,
  signOutUser, 
  onAuthStateChanged, 
  type User,
  handleFirestoreError,
  OperationType,
  testConnection
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'rent', label: 'Rent & Housing', icon: '🏠', color: '#6366F1' },
  { id: 'food', label: 'Food & Dining', icon: '🍲', color: '#F59E0B' },
  { id: 'communication', label: 'Communication & Internet', icon: '📱', color: '#06B6D4' },
  { id: 'transportation', label: 'Transport & Fuel', icon: '⛽', color: '#3B82F6' },
  { id: 'groceries', label: 'Groceries & Market', icon: '🛒', color: '#10B981' },
  { id: 'utilities', label: 'Utilities & Power', icon: '⚡', color: '#EAB308' },
  { id: 'healthcare', label: 'Healthcare & Meds', icon: '💊', color: '#EC4899' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#14B8A6' },
  { id: 'other', label: 'Other Expenses', icon: '📦', color: '#94A3B8' },
];

export const getZeroBudget = (userId: string = ''): BudgetConfig => ({
  id: 'budget-current',
  userId,
  month: new Date().toISOString().substring(0, 7),
  overallLimit: 0,
  categoryLimits: {
    rent: 0,
    food: 0,
    communication: 0,
    transportation: 0,
    groceries: 0,
    utilities: 0,
    healthcare: 0,
    entertainment: 0,
    shopping: 0,
    other: 0,
  },
  alertThresholdPercent: 80,
  updatedAt: new Date().toISOString(),
});

export interface CategoryProgress {
  category: CategoryItem;
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  isExceeded: boolean;
}

interface FinanceContextType {
  // Auth state
  user: User | null;
  loadingAuth: boolean;
  isOnline: boolean;
  signIn: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetUserToZero: () => Promise<void>;

  // Currency
  currency: string;
  setCurrency: (c: string) => void;
  formatMoney: (amount: number) => string;

  // Data
  transactions: Transaction[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  budget: BudgetConfig;
  categories: CategoryItem[];
  recurringExpenses: RecurringExpense[];

  // Category Actions
  addCategory: (cat: { label: string; icon: string; color: string; limit?: number }) => Promise<CategoryItem>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryLimit: (categoryId: string, limit: number) => Promise<void>;

  // Recurring Expenses Actions
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt'>) => Promise<RecurringExpense>;
  updateRecurringExpense: (expense: RecurringExpense) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  logRecurringPayment: (id: string) => Promise<void>;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;

  // Debt Actions
  addDebt: (debt: Omit<Debt, 'id' | 'userId' | 'status' | 'history' | 'createdAt' | 'remainingAmount'>) => Promise<Debt>;
  recordDebtPayment: (debtId: string, amount: number, note: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  // Savings Actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => Promise<SavingsGoal>;
  adjustSavingsGoalFunds: (goalId: string, amountDelta: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Budget Actions
  updateBudget: (newBudget: Partial<BudgetConfig>) => Promise<void>;

  // Calculated Metrics
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  currentMonthSpend: number;
  budgetPercentage: number;
  isBudgetWarning: boolean;
  isBudgetExceeded: boolean;
  remainingBudget: number;
  totalMonthlyRecurring: number;
  
  totalDebtsGiven: number;
  totalDebtsReceived: number;
  netDebtPosition: number;
  
  totalSaved: number;
  totalSavingsTarget: number;
  savingsRate: number;

  categoryBreakdown: Record<string, number>;
  categoryBudgetProgress: CategoryProgress[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'momopay_transactions_v1',
  DEBTS: 'momopay_debts_v1',
  SAVINGS: 'momopay_savings_v1',
  BUDGET: 'momopay_budget_v1',
  CURRENCY: 'momopay_currency_v1',
  CATEGORIES: 'momopay_categories_v1',
  RECURRING: 'momopay_recurring_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'RWF';
  });

  // State caches (all values start at 0 for new and first-time accounts)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return saved ? JSON.parse(saved) : getZeroBudget();
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : [];
  });

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
  };

  // Auth observer and initial connection check
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper to zero out a user's entire dataset across Firestore, state, and localStorage
  const zeroOutUserData = useCallback(async (uid: string) => {
    const zeroBudget = getZeroBudget(uid);
    setTransactions([]);
    setDebts([]);
    setSavingsGoals([]);
    setRecurringExpenses([]);
    setBudget(zeroBudget);

    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);

    // Delete documents in user's subcollections in Firestore
    const collectionsToClean = ['transactions', 'debts', 'savingsGoals', 'recurringExpenses'];
    for (const colName of collectionsToClean) {
      try {
        const colRef = collection(db, `users/${uid}/${colName}`);
        const snap = await getDocs(colRef);
        const deletions = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.all(deletions);
      } catch (err) {
        console.warn(`Clean ${colName} note:`, err);
      }
    }

    try {
      await setDoc(doc(db, `users/${uid}/budgets`, 'current'), zeroBudget);
    } catch (err) {
      console.warn('Set zero budget note:', err);
    }
  }, []);

  // Monitor user state: reset to 0 when logged out, and ensure pacifique.k01@gmail.com is strictly zeroed
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setDebts([]);
      setSavingsGoals([]);
      setRecurringExpenses([]);
      setBudget(getZeroBudget());
      return;
    }

    const email = user.email?.toLowerCase().trim();
    if (email === 'pacifique.k01@gmail.com') {
      const resetKey = `momopay_pacifique_zeroed_${user.uid}`;
      const alreadyReset = sessionStorage.getItem(resetKey);
      if (!alreadyReset) {
        sessionStorage.setItem(resetKey, 'true');
        zeroOutUserData(user.uid);
      }
    }
  }, [user, zeroOutUserData]);

  // Sync with Firestore when user is logged in (strict isolation, 0 values on first login)
  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    // Listen to transactions
    const txColPath = `users/${uid}/transactions`;
    const unsubTx = onSnapshot(
      collection(db, txColPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteTx: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            remoteTx.push(docSnap.data() as Transaction);
          });
          setTransactions(remoteTx);
        } else {
          // New user starts with clean 0 transactions
          setTransactions([]);
        }
      },
      (error) => {
        console.warn('Transactions sync note:', error.message);
      }
    );

    // Listen to debts
    const debtsColPath = `users/${uid}/debts`;
    const unsubDebts = onSnapshot(
      collection(db, debtsColPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteDebts: Debt[] = [];
          snapshot.forEach((docSnap) => {
            remoteDebts.push(docSnap.data() as Debt);
          });
          setDebts(remoteDebts);
        } else {
          // New user starts with 0 debts
          setDebts([]);
        }
      },
      (error) => {
        console.warn('Debts sync note:', error.message);
      }
    );

    // Listen to savingsGoals
    const savingsColPath = `users/${uid}/savingsGoals`;
    const unsubSavings = onSnapshot(
      collection(db, savingsColPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteGoals: SavingsGoal[] = [];
          snapshot.forEach((docSnap) => {
            remoteGoals.push(docSnap.data() as SavingsGoal);
          });
          setSavingsGoals(remoteGoals);
        } else {
          // New user starts with 0 savings goals
          setSavingsGoals([]);
        }
      },
      (error) => {
        console.warn('Savings sync note:', error.message);
      }
    );

    // Listen to budget
    const budgetDocPath = `users/${uid}/budgets/current`;
    const unsubBudget = onSnapshot(
      doc(db, budgetDocPath),
      (snapshot) => {
        if (snapshot.exists()) {
          setBudget(snapshot.data() as BudgetConfig);
        } else {
          const zeroBudget = getZeroBudget(uid);
          setBudget(zeroBudget);
          setDoc(doc(db, budgetDocPath), zeroBudget).catch(err => {
            console.warn('Budget init note:', err);
          });
        }
      },
      (error) => {
        console.warn('Budget sync note:', error.message);
      }
    );

    // Listen to custom categories
    const catColPath = `users/${uid}/categories`;
    const unsubCat = onSnapshot(
      collection(db, catColPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteCats: CategoryItem[] = [];
          snapshot.forEach((docSnap) => {
            remoteCats.push(docSnap.data() as CategoryItem);
          });
          const merged = [...DEFAULT_CATEGORIES];
          remoteCats.forEach(rc => {
            if (!merged.some(m => m.id === rc.id)) {
              merged.push(rc);
            }
          });
          setCategories(merged);
        }
      },
      (error) => {
        console.warn('Categories sync note:', error.message);
      }
    );

    // Listen to recurring expenses
    const recurringColPath = `users/${uid}/recurringExpenses`;
    const unsubRecurring = onSnapshot(
      collection(db, recurringColPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRec: RecurringExpense[] = [];
          snapshot.forEach((docSnap) => {
            remoteRec.push(docSnap.data() as RecurringExpense);
          });
          setRecurringExpenses(remoteRec);
        } else {
          // New user starts with 0 recurring expenses
          setRecurringExpenses([]);
        }
      },
      (error) => {
        console.warn('Recurring expenses sync note:', error.message);
      }
    );

    return () => {
      unsubTx();
      unsubDebts();
      unsubSavings();
      unsubBudget();
      unsubCat();
      unsubRecurring();
    };
  }, [user]);

  // Auth Methods
  const signIn = async () => {
    const loggedUser = await signInWithGoogle();
    if (loggedUser?.email?.toLowerCase().trim() === 'pacifique.k01@gmail.com') {
      await zeroOutUserData(loggedUser.uid);
    }
  };

  const registerWithEmailHandler = async (em: string, pass: string, name?: string) => {
    const newUser = await registerWithEmail(em, pass, name);
    setUser(newUser);
    await zeroOutUserData(newUser.uid);
  };

  const signInWithEmailHandler = async (em: string, pass: string) => {
    const loggedUser = await signInWithEmail(em, pass);
    setUser(loggedUser);
    if (loggedUser.email?.toLowerCase().trim() === 'pacifique.k01@gmail.com') {
      await zeroOutUserData(loggedUser.uid);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setTransactions([]);
    setDebts([]);
    setSavingsGoals([]);
    setRecurringExpenses([]);
    setBudget(getZeroBudget());
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DEBTS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
  };

  const resetUserToZero = async () => {
    if (user) {
      await zeroOutUserData(user.uid);
    } else {
      setTransactions([]);
      setDebts([]);
      setSavingsGoals([]);
      setRecurringExpenses([]);
      setBudget(getZeroBudget());
      localStorage.clear();
    }
  };

  // Format money helper
  const formatMoney = useCallback((amount: number): string => {
    const formatted = Math.round(amount).toLocaleString('en-US');
    return `${formatted} ${currency}`;
  }, [currency]);

  // Category Actions
  const addCategory = async (catData: { label: string; icon: string; color: string; limit?: number }): Promise<CategoryItem> => {
    const id = `cat-${catData.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newCat: CategoryItem = {
      id,
      label: catData.label.trim(),
      icon: catData.icon || '🏷️',
      color: catData.color || '#F59E0B',
      isCustom: true,
    };

    setCategories(prev => [...prev, newCat]);

    if (catData.limit && catData.limit > 0) {
      const updatedLimits = {
        ...(budget.categoryLimits || {}),
        [newCat.id]: catData.limit
      };
      await updateBudget({ categoryLimits: updatedLimits });
    }

    if (user) {
      const path = `users/${user.uid}/categories/${newCat.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/categories`, newCat.id), {
          ...newCat,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    return newCat;
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (user) {
      const path = `users/${user.uid}/categories/${id}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/categories`, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const updateCategoryLimit = async (categoryId: string, limit: number) => {
    const updatedLimits = {
      ...(budget.categoryLimits || {}),
      [categoryId]: Math.max(0, limit)
    };
    await updateBudget({ categoryLimits: updatedLimits });
  };

  // Transaction mutations
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<Transaction> => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (user) {
      const path = `users/${user.uid}/transactions/${newTx.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/transactions`, newTx.id), newTx);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    return newTx;
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (user) {
      const path = `users/${user.uid}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const updateTransaction = async (tx: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === tx.id ? tx : t)));
    if (user) {
      const path = `users/${user.uid}/transactions/${tx.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/transactions`, tx.id), tx);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  // Recurring Expenses Actions
  const addRecurringExpense = async (data: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt'>): Promise<RecurringExpense> => {
    const newRec: RecurringExpense = {
      ...data,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString()
    };
    setRecurringExpenses(prev => [...prev, newRec]);

    if (user) {
      const path = `users/${user.uid}/recurringExpenses/${newRec.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/recurringExpenses`, newRec.id), newRec);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    return newRec;
  };

  const updateRecurringExpense = async (updated: RecurringExpense) => {
    setRecurringExpenses(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    if (user) {
      const path = `users/${user.uid}/recurringExpenses/${updated.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/recurringExpenses`, updated.id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    if (user) {
      const path = `users/${user.uid}/recurringExpenses/${id}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/recurringExpenses`, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const logRecurringPayment = async (id: string) => {
    const target = recurringExpenses.find(r => r.id === id);
    if (!target) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const updated: RecurringExpense = {
      ...target,
      lastPaidDate: todayStr
    };
    await updateRecurringExpense(updated);

    // Also record an actual transaction for this payment so it appears in recent activity and category progress
    await addTransaction({
      amount: target.amount,
      category: target.category,
      vendor: target.title,
      currency,
      type: 'expense',
      source: 'momo_sms',
      notes: `Recurring expense payment logged (${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})`,
      date: new Date().toISOString()
    });
  };

  // Debt mutations
  const addDebt = async (debtData: Omit<Debt, 'id' | 'userId' | 'status' | 'history' | 'createdAt' | 'remainingAmount'>): Promise<Debt> => {
    const newDebt: Debt = {
      ...debtData,
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || 'guest',
      remainingAmount: debtData.initialAmount,
      status: 'pending',
      history: [],
      createdAt: new Date().toISOString(),
    };

    setDebts(prev => [newDebt, ...prev]);

    if (user) {
      const path = `users/${user.uid}/debts/${newDebt.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/debts`, newDebt.id), newDebt);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    return newDebt;
  };

  const recordDebtPayment = async (debtId: string, amount: number, note: string) => {
    setDebts(prev => prev.map(debt => {
      if (debt.id !== debtId) return debt;

      const newRemaining = Math.max(0, debt.remainingAmount - amount);
      const newStatus = newRemaining === 0 ? 'settled' : 'partially_paid';
      const updatedDebt: Debt = {
        ...debt,
        remainingAmount: newRemaining,
        status: newStatus,
        history: [
          ...debt.history,
          {
            amount,
            date: new Date().toISOString(),
            note: note || 'Settlement logged'
          }
        ]
      };

      if (user) {
        const path = `users/${user.uid}/debts/${debtId}`;
        setDoc(doc(db, `users/${user.uid}/debts`, debtId), updatedDebt).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, path);
        });
      }

      return updatedDebt;
    }));
  };

  const deleteDebt = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (user) {
      const path = `users/${user.uid}/debts/${id}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/debts`, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // Savings Goals mutations
  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>): Promise<SavingsGoal> => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || 'guest',
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals(prev => [newGoal, ...prev]);

    if (user) {
      const path = `users/${user.uid}/savingsGoals/${newGoal.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/savingsGoals`, newGoal.id), newGoal);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    return newGoal;
  };

  const adjustSavingsGoalFunds = async (goalId: string, amountDelta: number) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      const updatedAmount = Math.max(0, goal.currentAmount + amountDelta);
      const updatedGoal: SavingsGoal = {
        ...goal,
        currentAmount: updatedAmount
      };

      if (user) {
        const path = `users/${user.uid}/savingsGoals/${goalId}`;
        setDoc(doc(db, `users/${user.uid}/savingsGoals`, goalId), updatedGoal).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, path);
        });
      }

      return updatedGoal;
    }));
  };

  const deleteSavingsGoal = async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    if (user) {
      const path = `users/${user.uid}/savingsGoals/${id}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/savingsGoals`, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // Budget configuration
  const updateBudget = async (newBudget: Partial<BudgetConfig>) => {
    const updated: BudgetConfig = {
      ...budget,
      ...newBudget,
      updatedAt: new Date().toISOString()
    };
    setBudget(updated);

    if (user) {
      const path = `users/${user.uid}/budgets/current`;
      try {
        await setDoc(doc(db, `users/${user.uid}/budgets`, 'current'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  // Calculated Metrics
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Current Month Spend & Budget
  const currentMonthSpend = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const budgetPercentage = useMemo(() => {
    if (!budget.overallLimit || budget.overallLimit <= 0) return 0;
    return Math.round((currentMonthSpend / budget.overallLimit) * 100);
  }, [currentMonthSpend, budget.overallLimit]);

  const isBudgetWarning = useMemo(() => {
    return budgetPercentage >= (budget.alertThresholdPercent || 80) && budgetPercentage < 100;
  }, [budgetPercentage, budget.alertThresholdPercent]);

  const isBudgetExceeded = useMemo(() => {
    return budgetPercentage >= 100;
  }, [budgetPercentage]);

  const remainingBudget = useMemo(() => {
    return Math.max(0, budget.overallLimit - currentMonthSpend);
  }, [budget.overallLimit, currentMonthSpend]);

  // Debts aggregates
  const totalDebtsGiven = useMemo(() => {
    return debts
      .filter(d => d.type === 'given' && d.status !== 'settled')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const totalDebtsReceived = useMemo(() => {
    return debts
      .filter(d => d.type === 'received' && d.status !== 'settled')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const netDebtPosition = useMemo(() => {
    return totalDebtsGiven - totalDebtsReceived;
  }, [totalDebtsGiven, totalDebtsReceived]);

  // Savings aggregates
  const totalSaved = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [savingsGoals]);

  const totalSavingsTarget = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [savingsGoals]);

  const savingsRate = useMemo(() => {
    if (totalSavingsTarget <= 0) return 0;
    return Math.min(100, Math.round((totalSaved / totalSavingsTarget) * 100));
  }, [totalSaved, totalSavingsTarget]);

  // Category breakdown for current month
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
      .forEach(t => {
        const cat = t.category || 'other';
        breakdown[cat] = (breakdown[cat] || 0) + t.amount;
      });

    return breakdown;
  }, [transactions]);

  // Detailed Category Budget Progress
  const categoryBudgetProgress = useMemo<CategoryProgress[]>(() => {
    return categories.map(cat => {
      const spent = categoryBreakdown[cat.id] || 0;
      const limit = budget.categoryLimits?.[cat.id] || 0;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : (spent > 0 ? 100 : 0);
      const remaining = Math.max(0, limit - spent);
      const isExceeded = limit > 0 ? spent > limit : false;

      return {
        category: cat,
        spent,
        limit,
        percentage,
        remaining,
        isExceeded
      };
    });
  }, [categories, categoryBreakdown, budget.categoryLimits]);

  // Calculate committed monthly recurring expense total
  const totalMonthlyRecurring = useMemo(() => {
    return recurringExpenses
      .filter(r => r.status === 'active')
      .reduce((sum, r) => {
        if (r.frequency === 'weekly') return sum + (r.amount * 4.33);
        if (r.frequency === 'yearly') return sum + (r.amount / 12);
        return sum + r.amount;
      }, 0);
  }, [recurringExpenses]);

  return (
    <FinanceContext.Provider
      value={{
        user,
        loadingAuth,
        isOnline,
        signIn,
        registerWithEmail: registerWithEmailHandler,
        signInWithEmail: signInWithEmailHandler,
        signOut,
        resetUserToZero,
        currency,
        setCurrency,
        formatMoney,
        transactions,
        debts,
        savingsGoals,
        budget,
        categories,
        recurringExpenses,
        addCategory,
        deleteCategory,
        updateCategoryLimit,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        logRecurringPayment,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addDebt,
        recordDebtPayment,
        deleteDebt,
        addSavingsGoal,
        adjustSavingsGoalFunds,
        deleteSavingsGoal,
        updateBudget,
        totalIncome,
        totalExpenses,
        netBalance,
        currentMonthSpend,
        budgetPercentage,
        isBudgetWarning,
        isBudgetExceeded,
        remainingBudget,
        totalMonthlyRecurring,
        totalDebtsGiven,
        totalDebtsReceived,
        netDebtPosition,
        totalSaved,
        totalSavingsTarget,
        savingsRate,
        categoryBreakdown,
        categoryBudgetProgress,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

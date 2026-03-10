import { Account, Transaction, Category, Debt, Subscription } from './types';

// Mock data for the app
export const mockAccounts: Account[] = [
  { id: '1', name: 'Cash', balance: 1250000, icon: 'Wallet', color: '#6C63FF' },
  { id: '2', name: 'MB Bank', balance: 8750000, icon: 'Building2', color: '#4ECDC4' },
  { id: '3', name: 'Momo', balance: 320000, icon: 'Smartphone', color: '#FFB6B9' },
  { id: '4', name: 'Savings', balance: 15000000, icon: 'PiggyBank', color: '#FFC75F' },
];

export const mockCategories: Category[] = [
  // Income Categories
  { id: 'salary', name: 'Salary', icon: 'Briefcase', type: 'income', color: '#4ECDC4' },
  { id: 'freelance', name: 'Freelance', icon: 'Code', type: 'income', color: '#95E1D3' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', type: 'income', color: '#6C63FF' },
  { id: 'gift', name: 'Gift', icon: 'Gift', type: 'income', color: '#FFB6B9' },
  { id: 'debt-collection', name: 'Debt Collection', icon: 'DollarSign', type: 'income', color: '#4ECDC4' },
  
  // Expense Categories
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', type: 'expense', color: '#FF6B6B' },
  { id: 'transport', name: 'Transport', icon: 'Car', type: 'expense', color: '#FFC75F' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', type: 'expense', color: '#FFB6B9' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', type: 'expense', color: '#95E1D3' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', type: 'expense', color: '#8B92A0' },
  { id: 'health', name: 'Health', icon: 'Heart', type: 'expense', color: '#FF6B6B' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', type: 'expense', color: '#6C63FF' },
  { id: 'debt-payment', name: 'Debt Payment', icon: 'CreditCard', type: 'expense', color: '#FF6B6B' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', type: 'expense', color: '#CDD2D9' },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 15000000,
    category: 'salary',
    date: '2026-03-01',
    accountId: '2',
    description: 'Monthly salary',
  },
  {
    id: '2',
    type: 'expense',
    amount: 45000,
    category: 'food',
    date: '2026-03-10',
    accountId: '1',
    description: 'Lunch at restaurant',
  },
  {
    id: '3',
    type: 'expense',
    amount: 180000,
    category: 'transport',
    date: '2026-03-09',
    accountId: '3',
    description: 'Grab ride',
  },
  {
    id: '4',
    type: 'transfer',
    amount: 2000000,
    category: 'transfer',
    date: '2026-03-08',
    fromAccountId: '2',
    toAccountId: '4',
    description: 'Transfer to savings',
  },
  {
    id: '5',
    type: 'expense',
    amount: 199000,
    category: 'entertainment',
    date: '2026-03-07',
    accountId: '2',
    description: 'Netflix subscription',
  },
];

export const mockDebts: Debt[] = [
  {
    id: '1',
    type: 'lent',
    person: 'John Doe',
    amount: 500000,
    totalAmount: 2000000,
    dueDate: '2026-04-15',
    description: 'Personal loan',
    paymentHistory: [
      {
        id: 'p1',
        date: '2026-02-15',
        amount: 300000,
        note: 'First payment',
        progressAtTime: 15
      },
      {
        id: 'p2',
        date: '2026-03-01',
        amount: 200000,
        note: 'Second installment',
        progressAtTime: 25
      }
    ]
  },
  {
    id: '2',
    type: 'borrowed',
    person: 'Credit Card',
    amount: 3500000,
    totalAmount: 5000000,
    dueDate: '2026-06-01',
    description: 'iPhone 15 Pro - 10 months remaining',
    paymentHistory: [
      {
        id: 'p3',
        date: '2026-01-15',
        amount: 500000,
        note: 'Monthly payment',
        progressAtTime: 10
      },
      {
        id: 'p4',
        date: '2026-02-15',
        amount: 500000,
        note: 'Monthly payment',
        progressAtTime: 20
      },
      {
        id: 'p5',
        date: '2026-03-01',
        amount: 2500000,
        note: 'Bonus payment - advance 5 months',
        progressAtTime: 70
      }
    ]
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Spotify Premium',
    amount: 59000,
    nextPaymentDate: '2026-03-15',
    icon: 'Music',
    color: '#1DB954',
    category: 'Entertainment',
  },
  {
    id: '2',
    name: 'Netflix',
    amount: 199000,
    nextPaymentDate: '2026-03-20',
    icon: 'Tv',
    color: '#E50914',
    category: 'Entertainment',
  },
  {
    id: '3',
    name: 'ChatGPT Plus',
    amount: 450000,
    nextPaymentDate: '2026-03-25',
    icon: 'MessageSquare',
    color: '#10A37F',
    category: 'Productivity',
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    amount: 650000,
    nextPaymentDate: '2026-03-12',
    icon: 'Palette',
    color: '#FF0000',
    category: 'Work',
  },
];

// Calculate total balance
export const getTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};

// Calculate stats
export const calculateStats = (transactions: Transaction[]) => {
  const now = new Date('2026-03-10');
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const calculatePeriod = (startDate: Date) => {
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && t.type !== 'transfer';
    });

    const income = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  };

  return {
    daily: calculatePeriod(dayStart),
    weekly: calculatePeriod(weekStart),
    monthly: calculatePeriod(monthStart),
    yearly: calculatePeriod(yearStart),
  };
};

// Calculate income/expense by category
export const calculateByCategory = (transactions: Transaction[], categories: Category[], type: 'income' | 'expense') => {
  const categoryTotals = categories
    .filter(c => c.type === type)
    .map(category => {
      const total = transactions
        .filter(t => t.category === category.id && t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        id: category.id,
        name: category.name,
        value: total,
        color: category.color,
      };
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return categoryTotals;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Calculate days until date
export const daysUntil = (dateString: string): number => {
  const now = new Date('2026-03-10');
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
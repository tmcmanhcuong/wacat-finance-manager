export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  date: string;
  accountId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  note?: string;
  progressAtTime: number;
}

export interface Debt {
  id: string;
  type: 'lent' | 'borrowed' | 'installments';
  person: string;
  amount: number;
  totalAmount: number;
  dueDate?: string;
  description?: string;
  paymentHistory?: PaymentHistory[];
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextPaymentDate: string;
  icon: string;
  color: string;
  category: string;
}

export interface Stats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}
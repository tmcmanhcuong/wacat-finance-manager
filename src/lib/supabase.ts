import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Validate that the URL is a real HTTP/HTTPS URL (not a placeholder)
const isValidUrl = (url: string) => url.startsWith('https://') || url.startsWith('http://');

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey.length > 20 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Note: Set real values in .env.local to enable Supabase features
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Database = {
    public: {
        Tables: {
            accounts: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    balance: number;
                    icon: string;
                    color: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    balance?: number;
                    icon?: string;
                    color?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    balance?: number;
                    icon?: string;
                    color?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    icon: string;
                    type: 'income' | 'expense';
                    color: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    icon: string;
                    type: 'income' | 'expense';
                    color: string;
                };
                Update: {
                    name?: string;
                    icon?: string;
                    type?: 'income' | 'expense';
                    color?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string | null;
                    type: 'income' | 'expense' | 'transfer';
                    amount: number;
                    category: string;
                    date: string;
                    account_id: string | null;
                    from_account_id: string | null;
                    to_account_id: string | null;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    type: 'income' | 'expense' | 'transfer';
                    amount: number;
                    category: string;
                    date: string;
                    account_id?: string | null;
                    from_account_id?: string | null;
                    to_account_id?: string | null;
                    description?: string | null;
                };
                Update: {
                    type?: 'income' | 'expense' | 'transfer';
                    amount?: number;
                    category?: string;
                    date?: string;
                    account_id?: string | null;
                    from_account_id?: string | null;
                    to_account_id?: string | null;
                    description?: string | null;
                };
            };
            debts: {
                Row: {
                    id: string;
                    user_id: string | null;
                    type: 'lent' | 'borrowed' | 'installments';
                    person: string;
                    amount: number;
                    total_amount: number;
                    due_date: string | null;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    type: 'lent' | 'borrowed' | 'installments';
                    person: string;
                    amount?: number;
                    total_amount: number;
                    due_date?: string | null;
                    description?: string | null;
                };
                Update: {
                    type?: 'lent' | 'borrowed' | 'installments';
                    person?: string;
                    amount?: number;
                    total_amount?: number;
                    due_date?: string | null;
                    description?: string | null;
                };
            };
            payment_history: {
                Row: {
                    id: string;
                    debt_id: string;
                    date: string;
                    amount: number;
                    note: string | null;
                    progress_at_time: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    debt_id: string;
                    date: string;
                    amount: number;
                    note?: string | null;
                    progress_at_time: number;
                };
                Update: {
                    date?: string;
                    amount?: number;
                    note?: string | null;
                    progress_at_time?: number;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    amount: number;
                    next_payment_date: string;
                    icon: string;
                    color: string;
                    category: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    amount: number;
                    next_payment_date: string;
                    icon: string;
                    color: string;
                    category: string;
                };
                Update: {
                    name?: string;
                    amount?: number;
                    next_payment_date?: string;
                    icon?: string;
                    color?: string;
                    category?: string;
                };
            };
        };
    };
};

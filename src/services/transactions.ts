import { supabase } from '../lib/supabase';
import type { Transaction } from '../app/types';

// Map DB snake_case → JS camelCase
const mapTransaction = (row: any): Transaction => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    date: row.date,
    accountId: row.account_id ?? undefined,
    fromAccountId: row.from_account_id ?? undefined,
    toAccountId: row.to_account_id ?? undefined,
    description: row.description ?? undefined,
});

export const transactionsService = {
    async getAll(): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data ?? []).map(mapTransaction);
    },

    async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                date: transaction.date,
                account_id: transaction.accountId ?? null,
                from_account_id: transaction.fromAccountId ?? null,
                to_account_id: transaction.toAccountId ?? null,
                description: transaction.description ?? null,
            })
            .select()
            .single();

        if (error) throw error;
        return mapTransaction(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getByDateRange(from: string, to: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('date', from)
            .lte('date', to)
            .order('date', { ascending: false });

        if (error) throw error;
        return (data ?? []).map(mapTransaction);
    },
};

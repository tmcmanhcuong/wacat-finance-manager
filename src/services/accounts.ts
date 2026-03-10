import { supabase } from '../lib/supabase';
import type { Account } from '../app/types';

// Map DB snake_case → JS camelCase
const mapAccount = (row: any): Account => ({
    id: row.id,
    name: row.name,
    balance: row.balance,
    icon: row.icon,
    color: row.color,
});

export const accountsService = {
    async getAll(): Promise<Account[]> {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapAccount);
    },

    async create(account: Omit<Account, 'id'>): Promise<Account> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('accounts')
            .insert({
                user_id: user.id,
                name: account.name,
                balance: account.balance,
                icon: account.icon,
                color: account.color,
            })
            .select()
            .single();

        if (error) throw error;
        return mapAccount(data);
    },

    async update(id: string, updates: Partial<Omit<Account, 'id'>>): Promise<Account> {
        const { data, error } = await supabase
            .from('accounts')
            .update({
                name: updates.name,
                balance: updates.balance,
                icon: updates.icon,
                color: updates.color,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapAccount(data);
    },

    async updateBalance(id: string, newBalance: number): Promise<void> {
        const { error } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', id);

        if (error) throw error;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

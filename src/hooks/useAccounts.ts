import { useState, useEffect, useCallback } from 'react';
import { accountsService } from '../services/accounts';
import type { Account } from '../app/types';

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await accountsService.getAll();
            setAccounts(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load accounts';
            setError(errorMessage);
            console.error('[useAccounts] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const addAccount = async (account: Omit<Account, 'id'>) => {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempAccount = { ...account, id: tempId };
        setAccounts(prev => [...prev, tempAccount]);

        try {
            const created = await accountsService.create(account);
            setAccounts(prev => prev.map(a => a.id === tempId ? created : a));
            return created;
        } catch (err) {
            // Rollback on error
            setAccounts(prev => prev.filter(a => a.id !== tempId));
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const updateAccount = async (id: string, updates: Partial<Omit<Account, 'id'>>) => {
        // Optimistic update
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

        try {
            const updated = await accountsService.update(id, updates);
            setAccounts(prev => prev.map(a => a.id === id ? updated : a));
            return updated;
        } catch (err) {
            // Rollback by refetching
            await fetchAccounts();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const updateBalance = async (id: string, newBalance: number) => {
        // Optimistic update
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance: newBalance } : a));

        try {
            await accountsService.updateBalance(id, newBalance);
        } catch (err) {
            await fetchAccounts();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const deleteAccount = async (id: string) => {
        // Optimistic update
        const prevAccounts = accounts;
        setAccounts(prev => prev.filter(a => a.id !== id));

        try {
            await accountsService.delete(id);
        } catch (err) {
            // Rollback
            setAccounts(prevAccounts);
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    return {
        accounts,
        loading,
        error,
        refetch: fetchAccounts,
        addAccount,
        updateAccount,
        updateBalance,
        deleteAccount,
    };
}

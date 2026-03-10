import { useState, useEffect, useCallback } from 'react';
import { transactionsService } from '../services/transactions';
import { accountsService } from '../services/accounts';
import type { Transaction } from '../app/types';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await transactionsService.getAll();
            setTransactions(data);
        } catch (err: any) {
            setError(err.message ?? 'Failed to load transactions');
            console.error('[useTransactions] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Add transaction AND update account balance(s) atomically
    const addTransaction = async (
        transaction: Omit<Transaction, 'id'>,
        onBalanceUpdate?: (accountId: string, newBalance: number) => void
    ) => {
        try {
            // 1. Create transaction in DB
            const created = await transactionsService.create(transaction);

            // Optimistic UI update
            setTransactions(prev => [created, ...prev]);

            // 2. Update account balance(s)
            if (transaction.type === 'income' && transaction.accountId) {
                const accounts = await accountsService.getAll();
                const account = accounts.find(a => a.id === transaction.accountId);
                if (account) {
                    const newBalance = account.balance + transaction.amount;
                    await accountsService.updateBalance(transaction.accountId, newBalance);
                    onBalanceUpdate?.(transaction.accountId, newBalance);
                }
            } else if (transaction.type === 'expense' && transaction.accountId) {
                const accounts = await accountsService.getAll();
                const account = accounts.find(a => a.id === transaction.accountId);
                if (account) {
                    const newBalance = account.balance - transaction.amount;
                    await accountsService.updateBalance(transaction.accountId, newBalance);
                    onBalanceUpdate?.(transaction.accountId, newBalance);
                }
            } else if (transaction.type === 'transfer' && transaction.fromAccountId && transaction.toAccountId) {
                const accounts = await accountsService.getAll();
                const fromAccount = accounts.find(a => a.id === transaction.fromAccountId);
                const toAccount = accounts.find(a => a.id === transaction.toAccountId);
                if (fromAccount) {
                    const newBalance = fromAccount.balance - transaction.amount;
                    await accountsService.updateBalance(transaction.fromAccountId, newBalance);
                    onBalanceUpdate?.(transaction.fromAccountId, newBalance);
                }
                if (toAccount) {
                    const newBalance = toAccount.balance + transaction.amount;
                    await accountsService.updateBalance(transaction.toAccountId, newBalance);
                    onBalanceUpdate?.(transaction.toAccountId, newBalance);
                }
            }

            console.log('✅ Transaction created:', created);
            return created;
        } catch (err: any) {
            // Rollback: remove the optimistic entry
            await fetchTransactions();
            setError(err.message);
            throw err;
        }
    };

    const deleteTransaction = async (id: string) => {
        const prevTransactions = transactions;
        setTransactions(prev => prev.filter(t => t.id !== id));

        try {
            await transactionsService.delete(id);
        } catch (err: any) {
            setTransactions(prevTransactions);
            setError(err.message);
            throw err;
        }
    };

    return {
        transactions,
        loading,
        error,
        refetch: fetchTransactions,
        addTransaction,
        deleteTransaction,
    };
}

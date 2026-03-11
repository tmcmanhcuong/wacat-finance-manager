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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
            setError(errorMessage);
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

            return created;
        } catch (err) {
            // Rollback: remove the optimistic entry
            await fetchTransactions();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const deleteTransaction = async (id: string) => {
        const prevTransactions = transactions;

        // Tìm transaction cần xoá trước khi xoá
        const target = transactions.find(t => t.id === id);
        if (!target) return;

        // Optimistic remove khỏi UI
        setTransactions(prev => prev.filter(t => t.id !== id));

        try {
            // 1. Xoá transaction khỏi DB
            await transactionsService.delete(id);

            // 2. Reverse account balance(s)
            const allAccounts = await accountsService.getAll();

            if (target.type === 'income' && target.accountId) {
                const acc = allAccounts.find(a => a.id === target.accountId);
                if (acc) {
                    // Đã thu nhập → hoàn trả bằng cách trừ lại
                    await accountsService.updateBalance(target.accountId, acc.balance - target.amount);
                }
            } else if (target.type === 'expense' && target.accountId) {
                const acc = allAccounts.find(a => a.id === target.accountId);
                if (acc) {
                    // Đã chi tiêu → cộng lại
                    await accountsService.updateBalance(target.accountId, acc.balance + target.amount);
                }
            } else if (target.type === 'transfer' && target.fromAccountId && target.toAccountId) {
                const fromAcc = allAccounts.find(a => a.id === target.fromAccountId);
                const toAcc = allAccounts.find(a => a.id === target.toAccountId);
                if (fromAcc) {
                    // Ví nguồn đã bị trừ → cộng lại
                    await accountsService.updateBalance(target.fromAccountId, fromAcc.balance + target.amount);
                }
                if (toAcc) {
                    // Ví đích đã được cộng → trừ lại
                    await accountsService.updateBalance(target.toAccountId, toAcc.balance - target.amount);
                }
            }

        } catch (err) {
            // Rollback nếu lỗi
            setTransactions(prevTransactions);
            setError(err instanceof Error ? err.message : 'Unknown error');
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

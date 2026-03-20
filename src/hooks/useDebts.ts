import { useState, useEffect, useCallback } from 'react';
import { debtsService } from '../services/debts';
import { transactionsService } from '../services/transactions';
import { accountsService } from '../services/accounts';
import type { Debt, PaymentHistory } from '../app/types';

export function useDebts() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDebts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await debtsService.getAll();
            setDebts(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load debts';
            setError(errorMessage);
            console.error('[useDebts] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDebts();
    }, [fetchDebts]);

    const addDebt = async (debt: Omit<Debt, 'id' | 'paymentHistory'>) => {
        try {
            const created = await debtsService.create(debt);
            setDebts(prev => [...prev, created]);
            return created;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const deleteDebt = async (id: string) => {
        const prevDebts = debts;
        setDebts(prev => prev.filter(d => d.id !== id));

        try {
            await debtsService.delete(id);
        } catch (err) {
            setDebts(prevDebts);
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    // Mark as Received (for lent debts)
    const markAsReceived = async (
        debtId: string,
        receiveAmount: number,
        receiveDate: string,
        receiveAccount: string,
        receiveNote: string,
        onBalanceUpdate?: (accountId: string, newBalance: number) => void
    ) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) throw new Error('Debt not found');

        try {
            // 1. Create Income transaction
            await transactionsService.create({
                type: 'income',
                amount: receiveAmount,
                category: 'debt-collection',
                date: receiveDate,
                accountId: receiveAccount,
                description: `${debt.person} - ${debt.description}${receiveNote ? ` (${receiveNote})` : ''}`,
            });

            // 2. Update account balance
            const accounts = await accountsService.getAll();
            const account = accounts.find(a => a.id === receiveAccount);
            if (account) {
                const newBalance = account.balance + receiveAmount;
                await accountsService.updateBalance(receiveAccount, newBalance);
                onBalanceUpdate?.(receiveAccount, newBalance);
            }

            // 3. Add payment history
            const newProgress = ((debt.amount + receiveAmount) / debt.totalAmount) * 100;
            const payment: Omit<PaymentHistory, 'id'> = {
                date: receiveDate,
                amount: receiveAmount,
                note: receiveNote || 'Payment received',
                progressAtTime: Math.round(newProgress),
            };
            const createdPayment = await debtsService.addPayment(debtId, payment);

            // 4. Update debt amount
            const newDebtAmount = debt.amount + receiveAmount;
            await debtsService.updateAmount(debtId, newDebtAmount);

            // 5. Update local state optimistically
            setDebts(prev => prev.map(d => {
                if (d.id !== debtId) return d;
                return {
                    ...d,
                    amount: newDebtAmount,
                    paymentHistory: [...(d.paymentHistory ?? []), createdPayment],
                };
            }));

        } catch (err) {
            await fetchDebts();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    // Pay Installment (for borrowed/installment debts)
    const payInstallment = async (
        debtId: string,
        payAmount: number,
        payDate: string,
        payAccount: string,
        payNote: string,
        onBalanceUpdate?: (accountId: string, newBalance: number) => void
    ) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) throw new Error('Debt not found');

        try {
            // 1. Create Expense transaction
            await transactionsService.create({
                type: 'expense',
                amount: payAmount,
                category: 'debt-payment',
                date: payDate,
                accountId: payAccount,
                description: `${debt.person} - ${debt.description}${payNote ? ` (${payNote})` : ''}`,
            });

            // 2. Update account balance (subtract)
            const accounts = await accountsService.getAll();
            const account = accounts.find(a => a.id === payAccount);
            if (account) {
                const newBalance = account.balance - payAmount;
                await accountsService.updateBalance(payAccount, newBalance);
                onBalanceUpdate?.(payAccount, newBalance);
            }

            // 3. Add payment history
            const newProgress = ((debt.amount + payAmount) / debt.totalAmount) * 100;
            const payment: Omit<PaymentHistory, 'id'> = {
                date: payDate,
                amount: payAmount,
                note: payNote || 'Installment paid',
                progressAtTime: Math.round(newProgress),
            };
            const createdPayment = await debtsService.addPayment(debtId, payment);

            // 4. Update debt amount
            const newDebtAmount = debt.amount + payAmount;
            await debtsService.updateAmount(debtId, newDebtAmount);

            // 5. Update local state
            setDebts(prev => prev.map(d => {
                if (d.id !== debtId) return d;
                return {
                    ...d,
                    amount: newDebtAmount,
                    paymentHistory: [...(d.paymentHistory ?? []), createdPayment],
                };
            }));

        } catch (err) {
            await fetchDebts();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    return {
        debts,
        loading,
        error,
        refetch: fetchDebts,
        addDebt,
        deleteDebt,
        markAsReceived,
        payInstallment,
    };
}

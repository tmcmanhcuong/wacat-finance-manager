import { supabase } from '../lib/supabase';
import type { Debt, PaymentHistory } from '../app/types';

const mapPaymentHistory = (row: any): PaymentHistory => ({
    id: row.id,
    date: row.date,
    amount: row.amount,
    note: row.note ?? undefined,
    progressAtTime: row.progress_at_time,
});

const mapDebt = (row: any): Debt => ({
    id: row.id,
    type: row.type,
    person: row.person,
    amount: row.amount,
    totalAmount: row.total_amount,
    dueDate: row.due_date ?? undefined,
    description: row.description ?? undefined,
    paymentHistory: (row.payment_history ?? []).map(mapPaymentHistory),
});

export const debtsService = {
    // Fetch all debts with their payment history via JOIN
    async getAll(): Promise<Debt[]> {
        const { data, error } = await supabase
            .from('debts')
            .select(`
        *,
        payment_history (*)
      `)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapDebt);
    },

    async create(debt: Omit<Debt, 'id' | 'paymentHistory'>): Promise<Debt> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('debts')
            .insert({
                user_id: user.id,
                type: debt.type,
                person: debt.person,
                amount: debt.amount,
                total_amount: debt.totalAmount,
                due_date: debt.dueDate ?? null,
                description: debt.description ?? null,
            })
            .select()
            .single();

        if (error) throw error;
        return { ...mapDebt(data), paymentHistory: [] };
    },

    async updateAmount(id: string, newAmount: number): Promise<void> {
        const { error } = await supabase
            .from('debts')
            .update({ amount: newAmount })
            .eq('id', id);

        if (error) throw error;
    },

    // Edit the editable details of a debt (person, description, dueDate, totalAmount).
    // Used when the total owed changes (interest, fees, extra borrowing) or to fix a wrong entry.
    async updateDetails(
        id: string,
        updates: Partial<Pick<Debt, 'person' | 'description' | 'dueDate' | 'totalAmount'>>
    ): Promise<void> {
        const payload: Record<string, unknown> = {};
        if (updates.person !== undefined) payload.person = updates.person;
        if (updates.description !== undefined) payload.description = updates.description ?? null;
        if (updates.dueDate !== undefined) payload.due_date = updates.dueDate ?? null;
        if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;

        if (Object.keys(payload).length === 0) return;

        const { error } = await supabase
            .from('debts')
            .update(payload)
            .eq('id', id);

        if (error) throw error;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async addPayment(
        debtId: string,
        payment: Omit<PaymentHistory, 'id'>
    ): Promise<PaymentHistory> {
        const { data, error } = await supabase
            .from('payment_history')
            .insert({
                debt_id: debtId,
                date: payment.date,
                amount: payment.amount,
                note: payment.note ?? null,
                progress_at_time: payment.progressAtTime,
            })
            .select()
            .single();

        if (error) throw error;
        return mapPaymentHistory(data);
    },
};

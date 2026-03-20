import { supabase } from '../lib/supabase';
import type { Subscription } from '../app/types';

const mapSubscription = (row: any): Subscription => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    nextPaymentDate: row.next_payment_date,
    icon: row.icon,
    color: row.color,
    category: row.category,
    billingCycle: row.billing_cycle || 'monthly',
});

export const subscriptionsService = {
    async getAll(): Promise<Subscription[]> {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('next_payment_date', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapSubscription);
    },

    async create(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                name: subscription.name,
                amount: subscription.amount,
                next_payment_date: subscription.nextPaymentDate,
                icon: subscription.icon,
                color: subscription.color,
                category: subscription.category,
                billing_cycle: subscription.billingCycle,
            })
            .select()
            .single();

        if (error) throw error;
        return mapSubscription(data);
    },

    async update(id: string, updates: Partial<Omit<Subscription, 'id'>>): Promise<Subscription> {
        const { data, error } = await supabase
            .from('subscriptions')
            .update({
                name: updates.name,
                amount: updates.amount,
                next_payment_date: updates.nextPaymentDate,
                icon: updates.icon,
                color: updates.color,
                category: updates.category,
                billing_cycle: updates.billingCycle,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapSubscription(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

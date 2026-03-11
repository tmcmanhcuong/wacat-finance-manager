import { useState, useEffect, useCallback } from 'react';
import { subscriptionsService } from '../services/subscriptions';
import type { Subscription } from '../app/types';

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await subscriptionsService.getAll();
            setSubscriptions(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load subscriptions';
            setError(errorMessage);
            console.error('[useSubscriptions] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
        const tempId = `temp-${Date.now()}`;
        const tempSub = { ...subscription, id: tempId };
        setSubscriptions(prev => [...prev, tempSub]);

        try {
            const created = await subscriptionsService.create(subscription);
            setSubscriptions(prev => prev.map(s => s.id === tempId ? created : s));
            return created;
        } catch (err) {
            setSubscriptions(prev => prev.filter(s => s.id !== tempId));
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, 'id'>>) => {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

        try {
            const updated = await subscriptionsService.update(id, updates);
            setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));
            return updated;
        } catch (err) {
            await fetchSubscriptions();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const deleteSubscription = async (id: string) => {
        const prevSubs = subscriptions;
        setSubscriptions(prev => prev.filter(s => s.id !== id));

        try {
            await subscriptionsService.delete(id);
        } catch (err) {
            setSubscriptions(prevSubs);
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    return {
        subscriptions,
        loading,
        error,
        refetch: fetchSubscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
    };
}

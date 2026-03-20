import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoriesService } from '../services/categories';
import type { Category } from '../app/types';

// System categories that cannot be deleted or edited
export const SYSTEM_CATEGORIES: Category[] = [
    { id: 'Subscription', name: 'Subscription', icon: 'Repeat', type: 'expense', color: '#6C63FF', isSystem: true },
    { id: 'debt-collection', name: 'Debt Collection', icon: 'DollarSign', type: 'income', color: '#4ECDC4', isSystem: true },
    { id: 'debt-payment', name: 'Debt Payment', icon: 'CreditCard', type: 'expense', color: '#FF6B6B', isSystem: true },
    { id: 'Installment', name: 'Installment', icon: 'Calendar', type: 'expense', color: '#FFC75F', isSystem: true },
];

export const SYSTEM_CATEGORY_IDS = SYSTEM_CATEGORIES.map(c => c.id);

export function useCategories() {
    const [dbCategories, setDbCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Merge system categories with database categories
    const categories = useMemo(() => {
        // Avoid duplicates if they already exist in DB (though they shouldn't with these IDs)
        const dbIds = dbCategories.map(c => c.id);
        const filteredSystem = SYSTEM_CATEGORIES.filter(sc => !dbIds.includes(sc.id));
        return [...filteredSystem, ...dbCategories];
    }, [dbCategories]);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await categoriesService.getAll();
            setDbCategories(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
            setError(errorMessage);
            console.error('[useCategories] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id' | 'isSystem'>) => {
        const tempId = `temp-${Date.now()}`;
        const tempCategory = { ...category, id: tempId };
        setDbCategories(prev => [...prev, tempCategory]);

        try {
            const created = await categoriesService.create(category);
            setDbCategories(prev => prev.map(c => c.id === tempId ? created : c));
            return created;
        } catch (err) {
            setDbCategories(prev => prev.filter(c => c.id !== tempId));
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'isSystem'>>) => {
        if (SYSTEM_CATEGORY_IDS.includes(id)) {
            throw new Error('Cannot edit system categories');
        }

        setDbCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        try {
            const updated = await categoriesService.update(id, updates);
            setDbCategories(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            await fetchCategories();
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const deleteCategory = async (id: string) => {
        if (SYSTEM_CATEGORY_IDS.includes(id)) {
            throw new Error('Cannot delete system categories');
        }

        const prevCategories = dbCategories;
        setDbCategories(prev => prev.filter(c => c.id !== id));

        try {
            await categoriesService.delete(id);
        } catch (err) {
            setDbCategories(prevCategories);
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}

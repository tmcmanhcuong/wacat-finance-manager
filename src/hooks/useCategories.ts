import { useState, useEffect, useCallback } from 'react';
import { categoriesService } from '../services/categories';
import type { Category } from '../app/types';

// System categories that cannot be deleted (auto-generated for debt flow)
export const SYSTEM_CATEGORY_IDS = ['debt-collection', 'debt-payment', 'transfer'];

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await categoriesService.getAll();
            setCategories(data);
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

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const tempId = `temp-${Date.now()}`;
        const tempCategory = { ...category, id: tempId };
        setCategories(prev => [...prev, tempCategory]);

        try {
            const created = await categoriesService.create(category);
            setCategories(prev => prev.map(c => c.id === tempId ? created : c));
            return created;
        } catch (err) {
            setCategories(prev => prev.filter(c => c.id !== tempId));
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    };

    const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        try {
            const updated = await categoriesService.update(id, updates);
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
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

        const prevCategories = categories;
        setCategories(prev => prev.filter(c => c.id !== id));

        try {
            await categoriesService.delete(id);
        } catch (err) {
            setCategories(prevCategories);
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

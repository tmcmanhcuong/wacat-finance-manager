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
        } catch (err: any) {
            setError(err.message ?? 'Failed to load categories');
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
        } catch (err: any) {
            setCategories(prev => prev.filter(c => c.id !== tempId));
            setError(err.message);
            throw err;
        }
    };

    const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        try {
            const updated = await categoriesService.update(id, updates);
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err: any) {
            await fetchCategories();
            setError(err.message);
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
        } catch (err: any) {
            setCategories(prevCategories);
            setError(err.message);
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

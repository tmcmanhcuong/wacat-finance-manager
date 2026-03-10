import { supabase } from '../lib/supabase';
import type { Category } from '../app/types';

const mapCategory = (row: any): Category => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    color: row.color,
});

export const categoriesService = {
    async getAll(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('type', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapCategory);
    },

    async create(category: Omit<Category, 'id'>): Promise<Category> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('categories')
            .insert({
                user_id: user.id,
                name: category.name,
                icon: category.icon,
                type: category.type,
                color: category.color,
            })
            .select()
            .single();

        if (error) throw error;
        return mapCategory(data);
    },

    async update(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .update({
                name: updates.name,
                icon: updates.icon,
                type: updates.type,
                color: updates.color,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapCategory(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

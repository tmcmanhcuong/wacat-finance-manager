import { useState, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, ShoppingCart, Home as HomeIcon, Car, Coffee, Heart, Briefcase, Gift, Smartphone, Zap, Music, Book, Dumbbell, Plane, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useCategories } from '../../hooks/useCategories';
import { motion } from 'motion/react';
import type { Category } from '../types';

const availableIcons = [
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Home', component: HomeIcon },
  { name: 'Car', component: Car },
  { name: 'Coffee', component: Coffee },
  { name: 'Heart', component: Heart },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Gift', component: Gift },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Zap', component: Zap },
  { name: 'Music', component: Music },
  { name: 'Book', component: Book },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Plane', component: Plane },
];

const availableColors = [
  '#FF6B6B', '#4ECDC4', '#6C63FF', '#FFC75F', '#FFB6B9',
  '#10A37F', '#E50914', '#1DB954', '#FF9500', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#34C759',
];

export function Categories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ShoppingCart');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleToggleForm = () => {
    setShowForm(prev => {
      if (!prev) setSubmitError('');
      return !prev;
    });
    setEditingId(null);
    setCategoryName('');
    setSelectedIcon('ShoppingCart');
    setSelectedColor('#FF6B6B');
  };

  const handleSubmit = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setSubmitError('Category name is required');
      return;
    }

    // Check for duplicates (case-insensitive, exclude current category if editing)
    const isDuplicate = categories.some(c => 
      c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingId
    );

    if (isDuplicate) {
      setSubmitError(`A category named "${trimmedName}" already exists`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (editingId) {
        await updateCategory(editingId, { name: trimmedName, icon: selectedIcon, color: selectedColor, type: categoryType });
      } else {
        await addCategory({ name: trimmedName, icon: selectedIcon, color: selectedColor, type: categoryType });
      }
      resetForm();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCategoryName('');
    setSelectedIcon('ShoppingCart');
    setSelectedColor('#FF6B6B');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setCategoryType(category.type);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(categoryId);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.component || ShoppingCart;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-3xl mb-2">Categories Management</h1>
          <p className="text-muted-foreground">Create and manage your transaction categories</p>
        </div>
        <Button onClick={handleToggleForm}>
          <Plus size={20} className="inline mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Category Form */}
        <div className="col-span-1">
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
              <Card className="p-0 sticky top-8 flex flex-col max-h-[calc(100vh-4rem)] overflow-hidden">
                {/* Header (Pinned) */}
                <div className="p-6 pb-2 shrink-0 z-10 bg-card rounded-t-[1.5rem]">
                  <h3 className="text-foreground text-xl">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </h3>
                </div>

                {/* Scrollable Form Content */}
                <div className="p-6 pt-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {/* Type Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setCategoryType('income')}
                    className={`py-4 rounded-lg transition-all min-h-[56px] ${categoryType === 'income' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />Income
                  </button>
                  <button
                    onClick={() => setCategoryType('expense')}
                    className={`py-4 rounded-lg transition-all min-h-[56px] ${categoryType === 'expense' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-foreground'}`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />Expense
                  </button>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <label className="block text-foreground mb-2">Category Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., Groceries, Salary..."
                    value={categoryName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                  />
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <label className="block text-foreground mb-3">Select Icon</label>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-5 gap-3">
                      {availableIcons.map(icon => {
                        const IconComp = icon.component;
                        return (
                          <button
                            key={icon.name}
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${selectedIcon === icon.name ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <IconComp size={20} className={selectedIcon === icon.name ? 'text-primary-foreground' : 'text-muted-foreground'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div className="mb-6">
                  <label className="block text-foreground mb-3">Select Color</label>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-5 gap-3">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-full aspect-square rounded-xl transition-all ${selectedColor === color ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color, boxShadow: '3px 3px 6px rgba(0,0,0,0.2)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mb-6">
                  <label className="block text-foreground mb-3">Preview</label>
                  <div className="bg-muted p-6 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedColor }}>
                        <SelectedIconComponent size={32} className="text-white" />
                      </div>
                      <div>
                        <p className="text-foreground text-lg">{categoryName || 'Category Name'}</p>
                        <p className="text-muted-foreground text-sm capitalize">{categoryType}</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>{/* End Scrollable Form Content */}

                {/* Footer (Pinned) */}
                <div className="p-6 pt-4 shrink-0 z-10 bg-card border-t border-border rounded-b-[1.5rem]">
                  {submitError && (
                    <div className="mb-4 flex items-center gap-3 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                      <AlertTriangle size={18} className="text-destructive shrink-0" />
                      <p className="text-destructive text-sm font-medium">{submitError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 size={16} className="inline animate-spin mr-1" /> : null}
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Category Lists */}
        <div className={showForm ? 'col-span-2' : 'col-span-3'}>
          <div className="space-y-6">
            {/* Income */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={24} className="text-primary" />
                  <h3 className="text-foreground text-xl">Income Categories</h3>
                  <span className="ml-auto bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
                    {incomeCategories.length} categories
                  </span>
                </div>
                {incomeCategories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No income categories yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {incomeCategories.map((category, index) => {
                      const IconComp = availableIcons.find(i => i.name === category.icon)?.component || ShoppingCart;
                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-muted p-5 rounded-lg transition-all"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
                              <IconComp size={28} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground text-lg">{category.name}</p>
                              {category.isSystem && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">System</span>
                              )}
                            </div>
                          </div>
                          {!category.isSystem && (
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(category)} className="flex-1 py-3 bg-muted rounded-md border transition-all flex items-center justify-center gap-2 text-primary">
                                <Edit2 size={16} /><span className="text-sm">Edit</span>
                              </button>
                              <button onClick={() => handleDelete(category.id)} className="flex-1 py-3 bg-muted rounded-md border transition-all flex items-center justify-center gap-2 text-destructive">
                                <Trash2 size={16} /><span className="text-sm">Delete</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Expense */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown size={24} className="text-destructive" />
                  <h3 className="text-foreground text-xl">Expense Categories</h3>
                  <span className="ml-auto bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
                    {expenseCategories.length} categories
                  </span>
                </div>
                {expenseCategories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expense categories yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {expenseCategories.map((category, index) => {
                      const IconComp = availableIcons.find(i => i.name === category.icon)?.component || ShoppingCart;
                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-muted p-5 rounded-lg transition-all"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color }}>
                              <IconComp size={28} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground text-lg">{category.name}</p>
                              {category.isSystem && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">System</span>
                              )}
                            </div>
                          </div>
                          {!category.isSystem && (
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(category)} className="flex-1 py-3 bg-muted rounded-md border transition-all flex items-center justify-center gap-2 text-primary">
                                <Edit2 size={16} /><span className="text-sm">Edit</span>
                              </button>
                              <button onClick={() => handleDelete(category.id)} className="flex-1 py-3 bg-muted rounded-md border transition-all flex items-center justify-center gap-2 text-destructive">
                                <Trash2 size={16} /><span className="text-sm">Delete</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

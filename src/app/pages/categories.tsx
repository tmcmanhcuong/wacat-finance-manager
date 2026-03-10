import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, ShoppingCart, Home as HomeIcon, Car, Coffee, Heart, Briefcase, Gift, Smartphone, Zap, Music, Book, Dumbbell, Plane } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput } from '../components/neumorphic-card';
import { mockCategories } from '../store';
import { motion } from 'motion/react';

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ShoppingCart');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const incomeCategories = mockCategories.filter(c => c.type === 'income');
  const expenseCategories = mockCategories.filter(c => c.type === 'expense');

  const handleSubmit = () => {
    console.log('Category saved:', { 
      id: editingId,
      type: categoryType,
      name: categoryName,
      icon: selectedIcon,
      color: selectedColor
    });
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCategoryName('');
    setSelectedIcon('ShoppingCart');
    setSelectedColor('#FF6B6B');
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setCategoryType(category.type);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setShowForm(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      console.log('Delete category:', categoryId);
    }
  };

  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.component || ShoppingCart;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] text-3xl mb-2">Categories Management</h1>
          <p className="text-[#8B92A0]">Create and manage your transaction categories</p>
        </div>
        <NeumorphicButton
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          <Plus size={20} className="inline mr-2" />
          New Category
        </NeumorphicButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Category Form - Left Column */}
        <div className="col-span-1">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <NeumorphicCard className="p-6 sticky top-8">
                <h3 className="text-[#3D4852] text-xl mb-6">
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>
                
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setCategoryType('income')}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${
                      categoryType === 'income'
                        ? 'bg-[#4ECDC4] text-white shadow-[4px_4px_8px_rgba(78,205,196,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                    }`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />
                    Income
                  </button>
                  <button
                    onClick={() => setCategoryType('expense')}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${
                      categoryType === 'expense'
                        ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_8px_rgba(255,107,107,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                    }`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />
                    Expense
                  </button>
                </div>

                {/* Category Name */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-2">Category Name</label>
                  <NeumorphicInput
                    type="text"
                    placeholder="e.g., Groceries, Salary..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                {/* Icon Selection */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-3">Select Icon</label>
                  <div className="bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)]">
                    <div className="grid grid-cols-5 gap-3">
                      {availableIcons.map((icon) => {
                        const IconComp = icon.component;
                        return (
                          <button
                            key={icon.name}
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                              selectedIcon === icon.name
                                ? 'bg-[#6C63FF] shadow-[4px_4px_8px_rgba(108,99,255,0.4)]'
                                : 'bg-[#E0E5EC] shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:shadow-[1px_1px_2px_rgba(163,177,198,0.3),-1px_-1px_2px_rgba(255,255,255,0.3)]'
                            }`}
                          >
                            <IconComp 
                              size={20} 
                              className={selectedIcon === icon.name ? 'text-white' : 'text-[#8B92A0]'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-3">Select Color</label>
                  <div className="bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)]">
                    <div className="grid grid-cols-5 gap-3">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-full aspect-square rounded-xl transition-all ${
                            selectedColor === color
                              ? 'ring-4 ring-[#6C63FF] ring-offset-4 ring-offset-[#E0E5EC]'
                              : 'hover:scale-110'
                          }`}
                          style={{ 
                            backgroundColor: color,
                            boxShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-3">Preview</label>
                  <div className="bg-[#E0E5EC] p-6 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)]">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]"
                        style={{ backgroundColor: selectedColor }}
                      >
                        <SelectedIconComponent size={32} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[#3D4852] text-lg">
                          {categoryName || 'Category Name'}
                        </p>
                        <p className="text-[#8B92A0] text-sm capitalize">{categoryType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <NeumorphicButton onClick={resetForm}>
                    Cancel
                  </NeumorphicButton>
                  <NeumorphicButton variant="primary" onClick={handleSubmit}>
                    {editingId ? 'Update' : 'Create'}
                  </NeumorphicButton>
                </div>
              </NeumorphicCard>
            </motion.div>
          )}
        </div>

        {/* Category Lists - Right Columns */}
        <div className={showForm ? 'col-span-2' : 'col-span-3'}>
          <div className="space-y-6">
            {/* Income Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NeumorphicCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={24} className="text-[#4ECDC4]" />
                  <h3 className="text-[#3D4852] text-xl">Income Categories</h3>
                  <span className="ml-auto bg-[#E0E5EC] px-4 py-2 rounded-full text-sm text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                    {incomeCategories.length} categories
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {incomeCategories.map((category, index) => {
                    const IconComp = availableIcons.find(i => i.name === category.icon)?.component || ShoppingCart;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#E0E5EC] p-5 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)]"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComp size={28} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#3D4852] text-lg">{category.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="flex-1 py-3 bg-[#E0E5EC] rounded-xl shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 text-[#6C63FF]"
                          >
                            <Edit2 size={16} />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="flex-1 py-3 bg-[#E0E5EC] rounded-xl shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 text-[#FF6B6B]"
                          >
                            <Trash2 size={16} />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </NeumorphicCard>
            </motion.div>

            {/* Expense Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NeumorphicCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown size={24} className="text-[#FF6B6B]" />
                  <h3 className="text-[#3D4852] text-xl">Expense Categories</h3>
                  <span className="ml-auto bg-[#E0E5EC] px-4 py-2 rounded-full text-sm text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                    {expenseCategories.length} categories
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {expenseCategories.map((category, index) => {
                    const IconComp = availableIcons.find(i => i.name === category.icon)?.component || ShoppingCart;
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#E0E5EC] p-5 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)]"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComp size={28} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#3D4852] text-lg">{category.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="flex-1 py-3 bg-[#E0E5EC] rounded-xl shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 text-[#6C63FF]"
                          >
                            <Edit2 size={16} />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="flex-1 py-3 bg-[#E0E5EC] rounded-xl shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 text-[#FF6B6B]"
                          >
                            <Trash2 size={16} />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </NeumorphicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

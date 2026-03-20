import { useState, useMemo } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Loader2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
import { formatCurrency } from '../store';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';

export function Transactions() {
  const { accounts, loading: accLoading } = useAccounts();
  const { transactions, loading: txLoading, addTransaction, deleteTransaction } = useTransactions();
  const { categories, loading: catLoading } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<typeof transactions[0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredCategories = categories.filter(c =>
    isInternalTransfer ? false : c.type === transactionType
  );

  const handleToggleForm = () => {
    setShowForm(prev => {
      if (!prev) setSubmitError('');
      return !prev;
    });
  };

  const handleSubmit = async () => {
    const amountVal = Number(amount);
    const finalType = isInternalTransfer ? 'transfer' : transactionType;
    const finalDescription = description.trim() || (isInternalTransfer ? 'Transfer' : transactionType.charAt(0).toUpperCase() + transactionType.slice(1));

    if (!amount || amountVal <= 0) {
      setSubmitError('Amount must be greater than 0');
      return;
    }

    if (!date) {
      setSubmitError('Date is required');
      return;
    }

    if (isInternalTransfer) {
      if (!fromAccount) {
        setSubmitError('From Account is required for transfers');
        return;
      }
      if (!toAccount) {
        setSubmitError('To Account is required for transfers');
        return;
      }
      if (fromAccount === toAccount) {
        setSubmitError('From and To accounts must be different');
        return;
      }
    } else {
      if (!fromAccount) {
        setSubmitError('Account is required');
        return;
      }
      if (!categoryId) {
        setSubmitError('Category is required');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addTransaction({
        type: finalType,
        amount: amountVal,
        category: isInternalTransfer ? 'Other' : categoryId,
        date,
        accountId: !isInternalTransfer ? fromAccount : undefined,
        fromAccountId: isInternalTransfer ? fromAccount : undefined,
        toAccountId: isInternalTransfer ? toAccount : undefined,
        description: finalDescription,
      });
      // Reset form
      setShowForm(false);
      setDescription('');
      setAmount('');
      setCategoryId('');
      setFromAccount('');
      setToAccount('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      // 1. Basic filters
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAccount !== 'all') {
        const match = t.accountId === filterAccount || t.fromAccountId === filterAccount || t.toAccountId === filterAccount;
        if (!match) return false;
      }

      // 2. Search filter (Description or Category name)
      if (filterSearch) {
        const searchLower = filterSearch.toLowerCase();
        const descMatch = (t.description || '').toLowerCase().includes(searchLower);
        
        // Find category name to match
        const catName = categories.find(c => c.id === t.category)?.name || t.category || '';
        const catMatch = catName.toLowerCase().includes(searchLower);
        
        if (!descMatch && !catMatch) return false;
      }

      // 3. Period filter
      if (filterPeriod !== 'all') {
        const d = new Date(t.date);
        if (filterPeriod === 'daily') {
          if (d.toDateString() !== now.toDateString()) return false;
        } else if (filterPeriod === 'weekly') {
          if (d < new Date(now.getTime() - 7 * 86400000)) return false;
        } else if (filterPeriod === 'monthly') {
          if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return false;
        } else if (filterPeriod === 'yearly') {
          if (d < new Date(now.getFullYear(), 0, 1)) return false;
        } else if (filterPeriod === 'custom' && customStartDate && customEndDate) {
          if (d < new Date(customStartDate) || d > new Date(customEndDate)) return false;
        }
      }
      return true;
    });
  }, [transactions, categories, filterType, filterCategory, filterAccount, filterPeriod, filterSearch, customStartDate, customEndDate]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const loading = accLoading || txLoading || catLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#6C63FF] animate-spin" />
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-3xl mb-2">Transactions</h1>
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Manage your income, expenses and transfers</p>
        </div>
        <NeumorphicButton variant="primary" onClick={handleToggleForm}>
          <Plus size={20} className="inline mr-2" />
          New Transaction
        </NeumorphicButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="col-span-1">
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <NeumorphicCard variant="extruded" className="p-6 sticky top-8">
                <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Add Transaction</h3>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => { setTransactionType('income'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${transactionType === 'income' && !isInternalTransfer
                        ? 'bg-[#4ECDC4] text-white shadow-[4px_4px_8px_rgba(78,205,196,0.3)]'
                        : 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#3D4852] dark:text-[#E2E8F0] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)]'
                      }`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />Income
                  </button>
                  <button
                    onClick={() => { setTransactionType('expense'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${transactionType === 'expense' && !isInternalTransfer
                        ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_8px_rgba(255,107,107,0.3)]'
                        : 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#3D4852] dark:text-[#E2E8F0] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)]'
                      }`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />Expense
                  </button>
                </div>

                {/* Internal Transfer Toggle */}
                <div className="mb-6 flex items-center justify-between bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                  <label className="text-[#3D4852] dark:text-[#E2E8F0]">Internal Transfer</label>
                  <button
                    onClick={() => setIsInternalTransfer(!isInternalTransfer)}
                    className={`w-16 h-8 rounded-full transition-all ${isInternalTransfer ? 'bg-[#6C63FF]' : 'bg-[#CDD2D9]'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.2)] transition-transform ${isInternalTransfer ? 'translate-x-9' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Description</label>
                  <NeumorphicInput
                    type="text"
                    placeholder={isInternalTransfer ? 'Transfer note...' : transactionType === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Amount (VND)</label>
                  <NeumorphicInput type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                {/* Conditional Fields */}
                {isInternalTransfer ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">From Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">To Account</label>
                      <NeumorphicSelect value={toAccount} onChange={e => setToAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.filter(a => a.id !== fromAccount).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Category</label>
                      <NeumorphicSelect value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        <option value="">Select category</option>
                        {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance)}</option>)}
                      </NeumorphicSelect>
                    </div>
                  </>
                )}

                {/* Date */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Date</label>
                  <NeumorphicInput type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                {submitError && (
                  <p className="text-[#FF6B6B] text-sm mb-4 p-3 bg-[#FF6B6B]/10 rounded-xl">{submitError}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <NeumorphicButton onClick={() => setShowForm(false)}>Cancel</NeumorphicButton>
                  <NeumorphicButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                    Save
                  </NeumorphicButton>
                </div>
              </NeumorphicCard>
            </motion.div>
          )}
        </div>

        {/* Transaction List */}
        <div className={showForm ? 'col-span-2' : 'col-span-3'}>
          {/* Filters */}
          <NeumorphicCard variant="extruded" className="p-6 mb-6">
            <div className="grid grid-cols-5 gap-4">
              <NeumorphicInput 
                placeholder="Search..." 
                value={filterSearch} 
                onChange={e => { setFilterSearch(e.target.value); setCurrentPage(1); }} 
              />

              <NeumorphicSelect value={filterType} onChange={e => { setFilterType(e.target.value as 'all' | 'income' | 'expense' | 'transfer'); setCurrentPage(1); }}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </NeumorphicSelect>

              <NeumorphicSelect value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NeumorphicSelect>

              <NeumorphicSelect value={filterAccount} onChange={e => { setFilterAccount(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Accounts</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </NeumorphicSelect>

              <NeumorphicSelect value={filterPeriod} onChange={e => { setFilterPeriod(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
                <option value="custom">Custom</option>
              </NeumorphicSelect>
            </div>
            {filterPeriod === 'custom' && (
              <div className="mt-4 flex items-center gap-4">
                <NeumorphicInput type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                <span className="text-[#8B92A0] dark:text-[#8892A0]">→</span>
                <NeumorphicInput type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
              </div>
            )}
          </NeumorphicCard>

          {/* Transaction List */}
          <NeumorphicCard variant="extruded" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Transaction History</h3>
              <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{filteredTransactions.length} transactions</span>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-16 text-[#8B92A0] dark:text-[#8892A0]">
                <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentItems.map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const cat = categories.find(c => c.id === transaction.category || c.name === transaction.category);
                  const fromAcc = accounts.find(a => a.id === transaction.fromAccountId);
                  const toAcc = accounts.find(a => a.id === transaction.toAccountId);

                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30 last:border-0 hover:bg-[#E0E5EC]/50 hover:dark:bg-[#252C3E]/50 dark:bg-[#252C3E]/50 -mx-2 px-2 rounded-xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center bg-[#E0E5EC] dark:bg-[#252C3E]">
                          {transaction.type === 'income' ? (
                            <TrendingUp size={24} className="text-[#4ECDC4]" />
                          ) : transaction.type === 'transfer' ? (
                            <ArrowLeftRight size={24} className="text-[#6C63FF]" />
                          ) : (
                            <TrendingDown size={24} className="text-[#FF6B6B]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#3D4852] dark:text-[#E2E8F0] mb-1">{transaction.description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-[#8B92A0] dark:text-[#8892A0] text-sm flex-wrap">
                            <span>{cat?.name || transaction.category || '—'}</span>
                            <span>•</span>
                            <span>
                              {transaction.type === 'transfer'
                                ? `${fromAcc?.name || '?'} → ${toAcc?.name || '?'}`
                                : account?.name || '—'}
                            </span>
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-xl ${transaction.type === 'income' ? 'text-[#4ECDC4]' : transaction.type === 'transfer' ? 'text-[#6C63FF]' : 'text-[#FF6B6B]'}`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                          <button
                            onClick={() => setDeleteConfirmTarget(transaction)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-[#E0E5EC] dark:bg-[#252C3E] shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center hover:bg-[#FF6B6B]/10"
                          >
                            <Trash2 size={14} className="text-[#FF6B6B]" />
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#CDD2D9]/30 dark:border-[#2A3144]/30">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#CDD2D9] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] cursor-not-allowed'
                      : 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#3D4852] dark:text-[#E2E8F0] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] active:dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]'
                  }`}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                {/* Smart Page Numbers */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const pages: (number | '...')[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push('...');
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }
                    return pages.map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-[#8B92A0] dark:text-[#8892A0]">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            currentPage === p
                              ? 'bg-[#6C63FF] text-white shadow-[4px_4px_8px_rgba(108,99,255,0.3),-2px_-2px_4px_rgba(255,255,255,0.2)] dark:shadow-[4px_4px_8px_rgba(108,99,255,0.3),-2px_-2px_4px_rgba(42,49,68,0.5)]'
                              : 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#3D4852] dark:text-[#E2E8F0] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#CDD2D9] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] cursor-not-allowed'
                      : 'bg-[#E0E5EC] dark:bg-[#252C3E] text-[#3D4852] dark:text-[#E2E8F0] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] active:dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]'
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </NeumorphicCard>
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setDeleteConfirmTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="max-w-sm w-full"
            >
              <NeumorphicCard variant="extruded" className="p-6">
                {/* Icon cảnh báo */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#FF6B6B]/10 rounded-2xl flex items-center justify-center shadow-[inset_3px_3px_6px_rgba(255,107,107,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[inset_3px_3px_6px_rgba(255,107,107,0.2),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                    <AlertTriangle size={28} className="text-[#FF6B6B]" />
                  </div>
                </div>

                <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl text-center mb-2">Delete Transaction?</h3>
                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm text-center mb-5">
                  This action <span className="text-[#FF6B6B] font-medium">cannot be undone</span>. The account balance will be reversed automatically.
                </p>

                {/* Transaction preview */}
                <div className="bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl p-4 mb-6 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E0E5EC] dark:bg-[#252C3E] shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] dark:shadow-[3px_3px_6px_rgba(14,18,28,0.9),-3px_-3px_6px_rgba(42,49,68,0.5)] flex items-center justify-center flex-shrink-0">
                      {deleteConfirmTarget.type === 'income' ? (
                        <TrendingUp size={18} className="text-[#4ECDC4]" />
                      ) : deleteConfirmTarget.type === 'transfer' ? (
                        <ArrowLeftRight size={18} className="text-[#6C63FF]" />
                      ) : (
                        <TrendingDown size={18} className="text-[#FF6B6B]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium truncate">{deleteConfirmTarget.description || 'No description'}</p>
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs">{new Date(deleteConfirmTarget.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <p className={`font-semibold flex-shrink-0 ${
                      deleteConfirmTarget.type === 'income' ? 'text-[#4ECDC4]'
                      : deleteConfirmTarget.type === 'transfer' ? 'text-[#6C63FF]'
                      : 'text-[#FF6B6B]'
                    }`}>
                      {deleteConfirmTarget.type === 'income' ? '+' : deleteConfirmTarget.type === 'expense' ? '-' : ''}
                      {formatCurrency(deleteConfirmTarget.amount)}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <NeumorphicButton
                    onClick={() => setDeleteConfirmTarget(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </NeumorphicButton>
                  <button
                    disabled={isDeleting}
                    onClick={async () => {
                      if (!deleteConfirmTarget) return;
                      setIsDeleting(true);
                      try {
                        await deleteTransaction(deleteConfirmTarget.id);
                        setDeleteConfirmTarget(null);
                      } catch (err) {
                        console.error('Delete failed:', err);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FF6B6B] text-white font-medium shadow-[4px_4px_8px_rgba(255,107,107,0.3)] hover:shadow-[2px_2px_4px_rgba(255,107,107,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </NeumorphicCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
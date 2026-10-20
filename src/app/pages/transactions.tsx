import { useState, useMemo } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Loader2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { formatCurrency, getLocalISODate } from '../store';
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
  const [date, setDate] = useState(getLocalISODate());
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
      setDate(getLocalISODate());
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
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-3xl mb-2">Transactions</h1>
          <p className="text-muted-foreground">Manage your income, expenses and transfers</p>
        </div>
        <Button onClick={handleToggleForm}>
          <Plus size={20} className="inline mr-2" />
          New Transaction
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="col-span-1">
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="p-6 sticky top-8">
                <h3 className="text-foreground text-xl mb-6">Add Transaction</h3>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => { setTransactionType('income'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-lg transition-all min-h-[56px] ${transactionType === 'income' && !isInternalTransfer
                        ? 'bg-[#4ECDC4] text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />Income
                  </button>
                  <button
                    onClick={() => { setTransactionType('expense'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-lg transition-all min-h-[56px] ${transactionType === 'expense' && !isInternalTransfer
                        ? 'bg-destructive text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />Expense
                  </button>
                </div>

                {/* Internal Transfer Toggle */}
                <div className="mb-6 flex items-center justify-between bg-muted p-4 rounded-lg">
                  <label className="text-foreground">Internal Transfer</label>
                  <button
                    onClick={() => setIsInternalTransfer(!isInternalTransfer)}
                    className={`w-16 h-8 rounded-full transition-all ${isInternalTransfer ? 'bg-primary' : 'bg-input'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isInternalTransfer ? 'translate-x-9' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-foreground mb-2">Description</label>
                  <Input
                    type="text"
                    placeholder={isInternalTransfer ? 'Transfer note...' : transactionType === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-foreground mb-2">Amount (VND)</label>
                  <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                {/* Conditional Fields */}
                {isInternalTransfer ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-foreground mb-2">From Account</label>
                      <Select value={fromAccount} onValueChange={val => setFromAccount(val)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-foreground mb-2">To Account</label>
                      <Select value={toAccount} onValueChange={val => setToAccount(val)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.id !== fromAccount).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-foreground mb-2">Category</label>
                      <Select value={categoryId} onValueChange={val => setCategoryId(val)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-foreground mb-2">Account</label>
                      <Select value={fromAccount} onValueChange={val => setFromAccount(val)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Date */}
                <div className="mb-6">
                  <label className="block text-foreground mb-2">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                {submitError && (
                  <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-xl">{submitError}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                    Save
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Transaction List */}
        <div className={showForm ? 'col-span-2' : 'col-span-3'}>
          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-5 gap-4">
              <Input 
                placeholder="Search..." 
                value={filterSearch} 
                onChange={e => { setFilterSearch(e.target.value); setCurrentPage(1); }} 
              />

              <Select value={filterType} onValueChange={val => { setFilterType(val as 'all' | 'income' | 'expense' | 'transfer'); setCurrentPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={val => { setFilterCategory(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterAccount} onValueChange={val => { setFilterAccount(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Accounts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={val => { setFilterPeriod(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterPeriod === 'custom' && (
              <div className="mt-4 flex items-center gap-4">
                <Input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                <span className="text-muted-foreground">→</span>
                <Input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
              </div>
            )}
          </Card>

          {/* Transaction List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-xl">Transaction History</h3>
              <span className="text-muted-foreground text-sm">{filteredTransactions.length} transactions</span>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
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
                    <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-muted">
                          {transaction.type === 'income' ? (
                            <TrendingUp size={24} className="text-[#4ECDC4]" />
                          ) : transaction.type === 'transfer' ? (
                            <ArrowLeftRight size={24} className="text-primary" />
                          ) : (
                            <TrendingDown size={24} className="text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground mb-1">{transaction.description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm flex-wrap">
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
                        <p className={`text-xl ${transaction.type === 'income' ? 'text-[#4ECDC4]' : transaction.type === 'transfer' ? 'text-primary' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                          <button
                            onClick={() => setDeleteConfirmTarget(transaction)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                {/* Prev Button */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Prev
                </Button>

                {/* Smart Page Numbers */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const pages: number[] = [];
                    // Only display 3 pages centered around current page
                    let startPage = Math.max(1, currentPage - 1);
                    let endPage = startPage + 2;

                    // If endPage exceeds totalPages, shift the window back
                    if (endPage > totalPages) {
                      endPage = totalPages;
                      startPage = Math.max(1, endPage - 2);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      if (i > 0 && i <= totalPages) {
                        pages.push(i);
                      }
                    }

                    return pages.map(p => (
                      <Button
                        key={p}
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(p as number)}
                      >
                        {p}
                      </Button>
                    ));
                  })()}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </Card>
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
              <Card className="p-6">
                {/* Icon cảnh báo */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={28} className="text-destructive" />
                  </div>
                </div>

                <h3 className="text-foreground text-xl text-center mb-2">Delete Transaction?</h3>
                <p className="text-muted-foreground text-sm text-center mb-5">
                  This action <span className="text-destructive font-medium">cannot be undone</span>. The account balance will be reversed automatically.
                </p>

                {/* Transaction preview */}
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-card border flex items-center justify-center flex-shrink-0">
                      {deleteConfirmTarget.type === 'income' ? (
                        <TrendingUp size={18} className="text-[#4ECDC4]" />
                      ) : deleteConfirmTarget.type === 'transfer' ? (
                        <ArrowLeftRight size={18} className="text-primary" />
                      ) : (
                        <TrendingDown size={18} className="text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{deleteConfirmTarget.description || 'No description'}</p>
                      <p className="text-muted-foreground text-xs">{new Date(deleteConfirmTarget.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <p className={`font-semibold flex-shrink-0 ${
                      deleteConfirmTarget.type === 'income' ? 'text-[#4ECDC4]'
                      : deleteConfirmTarget.type === 'transfer' ? 'text-primary'
                      : 'text-destructive'
                    }`}>
                      {deleteConfirmTarget.type === 'income' ? '+' : deleteConfirmTarget.type === 'expense' ? '-' : ''}
                      {formatCurrency(deleteConfirmTarget.amount)}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setDeleteConfirmTarget(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
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
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

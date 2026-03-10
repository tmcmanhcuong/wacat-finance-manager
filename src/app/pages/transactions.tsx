import { useState, useMemo } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Loader2, Trash2 } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
import { formatCurrency } from '../store';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { motion } from 'motion/react';

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

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCategories = categories.filter(c =>
    isInternalTransfer ? false : c.type === transactionType
  );

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    if (isInternalTransfer && (!fromAccount || !toAccount)) return;
    if (!isInternalTransfer && !fromAccount) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addTransaction({
        type: isInternalTransfer ? 'transfer' : transactionType,
        amount: Number(amount),
        category: isInternalTransfer ? 'Other' : categoryId,
        date,
        accountId: !isInternalTransfer ? fromAccount : undefined,
        fromAccountId: isInternalTransfer ? fromAccount : undefined,
        toAccountId: isInternalTransfer ? toAccount : undefined,
        description: description || (isInternalTransfer ? 'Transfer' : transactionType),
      });
      // Reset form
      setShowForm(false);
      setDescription('');
      setAmount('');
      setCategoryId('');
      setFromAccount('');
      setToAccount('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAccount !== 'all') {
        const match = t.accountId === filterAccount || t.fromAccountId === filterAccount || t.toAccountId === filterAccount;
        if (!match) return false;
      }
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
  }, [transactions, filterType, filterCategory, filterAccount, filterPeriod, customStartDate, customEndDate]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const loading = accLoading || txLoading || catLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#6C63FF] animate-spin" />
          <p className="text-[#8B92A0]">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] text-3xl mb-2">Transactions</h1>
          <p className="text-[#8B92A0]">Manage your income, expenses and transfers</p>
        </div>
        <NeumorphicButton variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="inline mr-2" />
          New Transaction
        </NeumorphicButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="col-span-1">
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <NeumorphicCard className="p-6 sticky top-8">
                <h3 className="text-[#3D4852] text-xl mb-6">Add Transaction</h3>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => { setTransactionType('income'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${transactionType === 'income' && !isInternalTransfer
                        ? 'bg-[#4ECDC4] text-white shadow-[4px_4px_8px_rgba(78,205,196,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                      }`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />Income
                  </button>
                  <button
                    onClick={() => { setTransactionType('expense'); setIsInternalTransfer(false); }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${transactionType === 'expense' && !isInternalTransfer
                        ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_8px_rgba(255,107,107,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                      }`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />Expense
                  </button>
                </div>

                {/* Internal Transfer Toggle */}
                <div className="mb-6 flex items-center justify-between bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                  <label className="text-[#3D4852]">Internal Transfer</label>
                  <button
                    onClick={() => setIsInternalTransfer(!isInternalTransfer)}
                    className={`w-16 h-8 rounded-full transition-all ${isInternalTransfer ? 'bg-[#6C63FF]' : 'bg-[#CDD2D9]'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.2)] transition-transform ${isInternalTransfer ? 'translate-x-9' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-[#3D4852] mb-2">Description</label>
                  <NeumorphicInput
                    type="text"
                    placeholder={isInternalTransfer ? 'Transfer note...' : transactionType === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-[#3D4852] mb-2">Amount (VND)</label>
                  <NeumorphicInput type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                {/* Conditional Fields */}
                {isInternalTransfer ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] mb-2">From Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] mb-2">To Account</label>
                      <NeumorphicSelect value={toAccount} onChange={e => setToAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.filter(a => a.id !== fromAccount).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] mb-2">Category</label>
                      <NeumorphicSelect value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        <option value="">Select category</option>
                        {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[#3D4852] mb-2">Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={e => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance)}</option>)}
                      </NeumorphicSelect>
                    </div>
                  </>
                )}

                {/* Date */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-2">Date</label>
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
          <NeumorphicCard className="p-6 mb-6">
            <div className="grid grid-cols-4 gap-4">
              <NeumorphicSelect value={filterType} onChange={e => { setFilterType(e.target.value as any); setCurrentPage(1); }}>
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
                <span className="text-[#8B92A0]">→</span>
                <NeumorphicInput type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
              </div>
            )}
          </NeumorphicCard>

          {/* Transaction List */}
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] text-xl">Transaction History</h3>
              <span className="text-[#8B92A0] text-sm">{filteredTransactions.length} transactions</span>
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-16 text-[#8B92A0]">
                <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentItems.map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const cat = categories.find(c => c.id === transaction.category);
                  const fromAcc = accounts.find(a => a.id === transaction.fromAccountId);
                  const toAcc = accounts.find(a => a.id === transaction.toAccountId);

                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-[#CDD2D9]/30 last:border-0 hover:bg-[#E0E5EC]/50 -mx-2 px-2 rounded-xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center bg-[#E0E5EC]">
                          {transaction.type === 'income' ? (
                            <TrendingUp size={24} className="text-[#4ECDC4]" />
                          ) : transaction.type === 'transfer' ? (
                            <ArrowLeftRight size={24} className="text-[#6C63FF]" />
                          ) : (
                            <TrendingDown size={24} className="text-[#FF6B6B]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#3D4852] mb-1">{transaction.description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-[#8B92A0] text-sm flex-wrap">
                            <span>{cat?.name || (transaction.type === 'transfer' ? 'Transfer' : '—')}</span>
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
                          onClick={() => deleteTransaction(transaction.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-[#E0E5EC] shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center hover:bg-[#FF6B6B]/10"
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
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#CDD2D9]/30">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-5 py-3 rounded-2xl transition-all ${currentPage === 1 ? 'bg-[#E0E5EC] text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] cursor-not-allowed' : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.6)]'}`}
                >Previous</button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`w-10 h-10 rounded-xl transition-all ${currentPage === n ? 'bg-[#6C63FF] text-white shadow-[4px_4px_8px_rgba(108,99,255,0.3)]' : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'}`}
                    >{n}</button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-5 py-3 rounded-2xl transition-all ${currentPage === totalPages ? 'bg-[#E0E5EC] text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] cursor-not-allowed' : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.6)]'}`}
                >Next</button>
              </div>
            )}
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
}
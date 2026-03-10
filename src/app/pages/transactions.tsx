import { useState } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Filter, Search } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
import { mockAccounts, mockCategories, mockTransactions, formatCurrency } from '../store';
import { motion } from 'motion/react';

export function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customMonth, setCustomMonth] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSubmit = () => {
    console.log('Transaction submitted:', { 
      type: isInternalTransfer ? 'transfer' : transactionType,
      description,
      amount, 
      category,
      fromAccount,
      toAccount
    });
    setShowForm(false);
    setDescription('');
    setAmount('');
    setCategory('');
  };

  const categories = mockCategories.filter(c => 
    isInternalTransfer ? false : c.type === transactionType
  );

  // Filter logic
  const getFilteredTransactions = () => {
    const now = new Date('2026-03-10');
    
    return mockTransactions.concat(mockTransactions).filter(transaction => {
      // Filter by type
      if (filterType !== 'all' && transaction.type !== filterType) return false;
      
      // Filter by category
      if (filterCategory !== 'all' && transaction.category !== filterCategory) return false;
      
      // Filter by account
      if (filterAccount !== 'all') {
        const matchAccount = transaction.accountId === filterAccount || 
                            transaction.fromAccountId === filterAccount || 
                            transaction.toAccountId === filterAccount;
        if (!matchAccount) return false;
      }
      
      // Filter by period
      if (filterPeriod !== 'all') {
        const transactionDate = new Date(transaction.date);
        
        if (filterPeriod === 'daily') {
          const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (transactionDate < dayStart) return false;
        } else if (filterPeriod === 'weekly') {
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (transactionDate < weekStart) return false;
        } else if (filterPeriod === 'monthly') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          if (transactionDate < monthStart) return false;
        } else if (filterPeriod === 'yearly') {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          if (transactionDate < yearStart) return false;
        } else if (filterPeriod === 'custom') {
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            if (transactionDate < startDate || transactionDate > endDate) return false;
          } else if (customMonth) {
            const month = parseInt(customMonth, 10);
            if (transactionDate.getMonth() !== month - 1) return false;
          }
        }
      }
      
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] text-3xl mb-2">Transactions</h1>
          <p className="text-[#8B92A0]">Manage your income, expenses and transfers</p>
        </div>
        <NeumorphicButton
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={20} className="inline mr-2" />
          New Transaction
        </NeumorphicButton>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Form - Left Column */}
        <div className="col-span-1">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <NeumorphicCard className="p-6 sticky top-8">
                <h3 className="text-[#3D4852] text-xl mb-6">Add Transaction</h3>
                
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => {
                      setTransactionType('income');
                      setIsInternalTransfer(false);
                    }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${
                      transactionType === 'income' && !isInternalTransfer
                        ? 'bg-[#4ECDC4] text-white shadow-[4px_4px_8px_rgba(78,205,196,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                    }`}
                  >
                    <TrendingUp size={18} className="inline mr-2" />
                    Income
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType('expense');
                      setIsInternalTransfer(false);
                    }}
                    className={`py-4 rounded-2xl transition-all min-h-[56px] ${
                      transactionType === 'expense' && !isInternalTransfer
                        ? 'bg-[#FF6B6B] text-white shadow-[4px_4px_8px_rgba(255,107,107,0.3)]'
                        : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                    }`}
                  >
                    <TrendingDown size={18} className="inline mr-2" />
                    Expense
                  </button>
                </div>

                {/* Internal Transfer Toggle */}
                <div className="mb-6 flex items-center justify-between bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                  <label className="text-[#3D4852]">Internal Transfer</label>
                  <button
                    onClick={() => setIsInternalTransfer(!isInternalTransfer)}
                    className={`w-16 h-8 rounded-full transition-all ${
                      isInternalTransfer
                        ? 'bg-[#6C63FF] shadow-[inset_2px_2px_4px_rgba(108,99,255,0.5)]'
                        : 'bg-[#CDD2D9] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6)]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.2)] transition-transform ${
                        isInternalTransfer ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Description Input */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-2">Description</label>
                  <NeumorphicInput
                    type="text"
                    placeholder={isInternalTransfer ? "Transfer money" : transactionType === 'income' ? "Salary, bonus..." : "Coffee, groceries..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-2">Amount (VND)</label>
                  <NeumorphicInput
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Conditional Fields */}
                {isInternalTransfer ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-[#3D4852] mb-2">From Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {mockAccounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-6">
                      <label className="block text-[#3D4852] mb-2">To Account</label>
                      <NeumorphicSelect value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {mockAccounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </NeumorphicSelect>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-[#3D4852] mb-2">Category</label>
                      <NeumorphicSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </NeumorphicSelect>
                    </div>
                    <div className="mb-6">
                      <label className="block text-[#3D4852] mb-2">Account</label>
                      <NeumorphicSelect value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                        <option value="">Select account</option>
                        {mockAccounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </NeumorphicSelect>
                    </div>
                  </>
                )}

                {/* Date Input */}
                <div className="mb-6">
                  <label className="block text-[#3D4852] mb-2">Date</label>
                  <NeumorphicInput
                    type="date"
                    value="2026-03-10"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <NeumorphicButton
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </NeumorphicButton>
                  <NeumorphicButton
                    variant="primary"
                    onClick={handleSubmit}
                  >
                    Save
                  </NeumorphicButton>
                </div>
              </NeumorphicCard>
            </motion.div>
          )}
        </div>

        {/* Transaction List - Right Columns */}
        <div className={showForm ? 'col-span-2' : 'col-span-3'}>
          {/* Filters */}
          <NeumorphicCard className="p-6 mb-6">
            <div className="grid grid-cols-4 gap-4">
              <NeumorphicSelect value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Internal Transfer</option>
              </NeumorphicSelect>
              
              <NeumorphicSelect value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Categories</option>
                {mockCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </NeumorphicSelect>
              
              <NeumorphicSelect value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Accounts</option>
                {mockAccounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </NeumorphicSelect>
              
              <NeumorphicSelect value={filterPeriod} onChange={(e) => { setFilterPeriod(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
                <option value="custom">Custom</option>
              </NeumorphicSelect>
            </div>
            {filterPeriod === 'custom' && (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <NeumorphicInput
                    type="date"
                    placeholder="Start Date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <NeumorphicInput
                    type="date"
                    placeholder="End Date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <NeumorphicInput
                    type="number"
                    placeholder="Month (1-12)"
                    min="1"
                    max="12"
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                  />
                </div>
              </div>
            )}
          </NeumorphicCard>

          {/* Transaction List */}
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] text-xl mb-6">Transaction History</h3>
            <div className="space-y-4">
              {currentItems.map((transaction, i) => {
                const account = mockAccounts.find(a => a.id === transaction.accountId);
                const cat = mockCategories.find(c => c.id === transaction.category);
                
                return (
                  <div key={`${transaction.id}-${i}`} className="flex items-center justify-between py-4 border-b border-[#CDD2D9]/30 last:border-0 hover:bg-[#E0E5EC]/50 -mx-2 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center"
                        style={{ backgroundColor: '#E0E5EC' }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp size={24} className="text-[#4ECDC4]" />
                        ) : transaction.type === 'transfer' ? (
                          <ArrowLeftRight size={24} className="text-[#6C63FF]" />
                        ) : (
                          <TrendingDown size={24} className="text-[#FF6B6B]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#3D4852] mb-1">{transaction.description}</p>
                        <div className="flex items-center gap-3 text-[#8B92A0] text-sm">
                          <span>{cat?.name || 'Transfer'}</span>
                          <span>•</span>
                          <span>{account?.name}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl ${transaction.type === 'income' ? 'text-[#4ECDC4]' : transaction.type === 'transfer' ? 'text-[#6C63FF]' : 'text-[#FF6B6B]'}`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#CDD2D9]/30">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-5 py-3 rounded-2xl transition-all ${
                    currentPage === 1
                      ? 'bg-[#E0E5EC] text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] cursor-not-allowed'
                      : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.6)]'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#6C63FF] text-white shadow-[4px_4px_8px_rgba(108,99,255,0.3)]'
                          : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.6)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-5 py-3 rounded-2xl transition-all ${
                    currentPage === totalPages
                      ? 'bg-[#E0E5EC] text-[#8B92A0] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] cursor-not-allowed'
                      : 'bg-[#E0E5EC] text-[#3D4852] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.6),-2px_-2px_4px_rgba(255,255,255,0.6)]'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
}
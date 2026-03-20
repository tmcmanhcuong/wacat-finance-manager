import type React from 'react';
import { useMemo } from 'react';
import { Cat, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowRightLeft, DollarSign, Loader2, Wallet, Building2, Smartphone, PiggyBank, Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';
import { NeumorphicCard } from '../components/neumorphic-card';
import { useThemeContext } from '../components/theme-provider';
import { getTotalBalance, calculateStats, calculateByCategory, formatCurrency } from '../store';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { motion } from 'motion/react';
import { useSubscriptionAutomation } from '../../hooks/useSubscriptionAutomation';
import { PaymentConfirmationModal } from '../components/payment-confirmation-modal';
import type { Subscription } from '../types';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Building2,
  Smartphone,
  PiggyBank,
};

function ThemeToggleButton() {
  const { mode, setTheme } = useThemeContext();

  const options: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={16} />, label: 'Light' },
    { value: 'system', icon: <Monitor size={16} />, label: 'System' },
    { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
  ];

  return (
    <div className="flex items-center gap-1 p-1.5 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.8),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
      {options.map(opt => (
        <button
          key={opt.value}
          title={opt.label}
          onClick={() => setTheme(opt.value)}
          className={[
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200',
            mode === opt.value
              ? 'bg-[#6C63FF] text-white shadow-[3px_3px_6px_rgba(108,99,255,0.35)]'
              : 'text-[#8B92A0] dark:text-[#8892A0] hover:text-[#3D4852] dark:hover:text-[#E2E8F0]',
          ].join(' ')}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Dashboard() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { transactions, loading: txLoading } = useTransactions();
  const { categories, loading: catLoading } = useCategories();
  const { pendingPayments, confirmPayment } = useSubscriptionAutomation();
  const [selectedPendingSub, setSelectedPendingSub] = useState<Subscription | null>(null);

  const loading = accountsLoading || txLoading || catLoading;

  const totalBalance = useMemo(() => getTotalBalance(accounts), [accounts]);
  const stats = useMemo(() => calculateStats(transactions), [transactions]);
  const incomeByCategory = useMemo(() => calculateByCategory(transactions, categories, 'income'), [transactions, categories]);
  const expenseByCategory = useMemo(() => calculateByCategory(transactions, categories, 'expense'), [transactions, categories]);

  // Build monthly chart data dynamically from real transactions
  const monthlyData = useMemo(() => {
    const months: Record<string, { name: string; income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (t.type === 'transfer') return;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short' });
      if (!months[key]) months[key] = { name: label, income: 0, expense: 0 };
      if (t.type === 'income') months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
      .slice(-6); // last 6 months
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#6C63FF] animate-spin" />
          <p className="text-[#8B92A0]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-3xl mb-2">Welcome back, Cat Lover 👋</h1>
          <p className="text-[#8B92A0]">Here's your financial overview</p>
        </div>

        {/* Theme Toggle */}
        <ThemeToggleButton />
      </motion.div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          {pendingPayments.map(sub => {
            const isDue = sub.status === 'due';
            const accentColor = isDue ? '#FF6B6B' : '#FFC75F';
            const accentBg = isDue ? 'bg-[#FF6B6B]/10' : 'bg-[#FFC75F]/10';
            const accentBorder = isDue ? 'border-[#FF6B6B]' : 'border-[#FFC75F]';
            const accentBtn = isDue ? 'bg-[#FF6B6B]' : 'bg-[#FFC75F]';
            const accentShadow = isDue ? 'shadow-[3px_3px_6px_rgba(255,107,107,0.3)]' : 'shadow-[3px_3px_6px_rgba(255,199,95,0.3)]';

            return (
              <NeumorphicCard key={sub.id} variant="extruded" className={`p-4 border-l-4 ${accentBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${accentBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Cat size={20} style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">
                      {isDue ? 'Due/Overdue Payment: ' : 'Upcoming Payment: '} {sub.name}
                    </h3>
                    <p className="text-[#8B92A0] text-sm md:text-base">
                      {isDue ? 'Due for ' : 'Coming soon: '} {formatCurrency(sub.amount)} on {new Date(sub.nextPaymentDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <button 
                  className={`px-4 py-2 ${accentBtn} text-white rounded-lg ${accentShadow} hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] transition-all font-medium whitespace-nowrap`}
                  onClick={() => setSelectedPendingSub(sub as any)}
                >
                  Confirm Payment
                </button>
              </NeumorphicCard>
            );
          })}
        </motion.div>
      )}

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <NeumorphicCard className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8B92A0] mb-2">Total Balance</p>
              <h2 className="text-5xl text-[#3D4852] dark:text-[#E2E8F0] mb-3">{formatCurrency(totalBalance)}</h2>
              <div className="flex items-center gap-2 text-[#4ECDC4]">
                <ArrowUpRight size={20} />
                <span>{accounts.length} account{accounts.length !== 1 ? 's' : ''} connected</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-3xl shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,0.6)] dark:shadow-[inset_8px_8px_16px_rgba(14,18,28,0.9),inset_-8px_-8px_16px_rgba(42,49,68,0.6)] flex items-center justify-center">
              <Cat className="text-[#6C63FF]" size={48} />
            </div>
          </div>
        </NeumorphicCard>
      </motion.div>

      {/* Income & Expense Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Income Stats */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-[#4ECDC4]" />
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Income Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Monthly', data: stats.monthly.income, period: 'this month' },
              { label: 'Yearly', data: stats.yearly.income, period: 'this year' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NeumorphicCard variant="inset" className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <p className="text-[#8B92A0] text-sm mb-3">{stat.label} Income</p>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={20} className="text-[#4ECDC4]" />
                      <p className="text-2xl text-[#4ECDC4]">{formatCurrency(stat.data)}</p>
                    </div>
                    <p className="text-[#8B92A0] text-xs mt-auto">{stat.period}</p>
                  </div>
                </NeumorphicCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Expense Stats */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={24} className="text-[#FF6B6B]" />
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Expense Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Monthly', data: stats.monthly.expense, period: 'this month' },
              { label: 'Yearly', data: stats.yearly.expense, period: 'this year' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <NeumorphicCard variant="inset" className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <p className="text-[#8B92A0] text-sm mb-3">{stat.label} Expense</p>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={20} className="text-[#FF6B6B]" />
                      <p className="text-2xl text-[#FF6B6B]">{formatCurrency(stat.data)}</p>
                    </div>
                    <p className="text-[#8B92A0] text-xs mt-auto">{stat.period}</p>
                  </div>
                </NeumorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1"
        >
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Income &amp; Expenses Trend</h3>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#4ECDC4] rounded-full"></div>
                <span className="text-[#8B92A0] text-sm">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF6B6B] rounded-full"></div>
                <span className="text-[#8B92A0] text-sm">Expense</span>
              </div>
            </div>
            <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.3)" />
                    <XAxis dataKey="name" stroke="#8B92A0" />
                    <YAxis stroke="#8B92A0" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#E0E5EC',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.6)'
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Line type="monotone" dataKey="income" stroke="#4ECDC4" strokeWidth={3} dot={{ fill: '#4ECDC4', r: 5 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={3} dot={{ fill: '#FF6B6B', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <p className="text-[#8B92A0] text-sm">No transaction data yet</p>
                </div>
              )}
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Income by Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Income by Category</h3>
            {incomeByCategory.length > 0 ? (
              <>
                <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={incomeByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {incomeByCategory.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-[#8B92A0] text-sm">{cat.name}</span>
                      </div>
                      <span className="text-[#3D4852] dark:text-[#E2E8F0] text-sm">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#8B92A0]">
                <DollarSign size={48} className="mb-4 opacity-30" />
                <p>No income data yet</p>
              </div>
            )}
          </NeumorphicCard>
        </motion.div>

        {/* Expense by Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Expense by Category</h3>
            {expenseByCategory.length > 0 ? (
              <>
                <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {expenseByCategory.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-[#8B92A0] text-sm">{cat.name}</span>
                      </div>
                      <span className="text-[#3D4852] dark:text-[#E2E8F0] text-sm">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#8B92A0]">
                <DollarSign size={48} className="mb-4 opacity-30" />
                <p>No expense data yet</p>
              </div>
            )}
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Recent Transactions</h3>
              <button className="text-[#6C63FF] hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-[#8B92A0]">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => {
                  const isTransfer = transaction.type === 'transfer';
                  const isIncome = transaction.type === 'income';

                  // Resolve account name: transfer dùng fromAccountId → toAccountId
                  const account = isTransfer
                    ? accounts.find(a => a.id === transaction.fromAccountId)
                    : accounts.find(a => a.id === transaction.accountId);
                  const toAccount = isTransfer
                    ? accounts.find(a => a.id === transaction.toAccountId)
                    : null;

                  // Label mô tả nguồn account
                  const accountLabel = isTransfer
                    ? `${account?.name ?? '?'} → ${toAccount?.name ?? '?'}`
                    : account?.name ?? '';

                  // Màu và dấu số tiền
                  const amountColor = isTransfer
                    ? 'text-[#6C63FF]'
                    : isIncome
                    ? 'text-[#4ECDC4]'
                    : 'text-[#FF6B6B]';
                  const amountPrefix = isTransfer ? '' : isIncome ? '+' : '-';

                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center">
                          {isTransfer ? (
                            <ArrowRightLeft size={20} className="text-[#6C63FF]" />
                          ) : isIncome ? (
                            <ArrowUpRight size={20} className="text-[#4ECDC4]" />
                          ) : (
                            <ArrowDownRight size={20} className="text-[#FF6B6B]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#3D4852] dark:text-[#E2E8F0]">{transaction.description}</p>
                          <p className="text-[#8B92A0] text-sm">{accountLabel} • {new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <p className={`text-lg ${amountColor}`}>
                        {amountPrefix}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Accounts Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl">Accounts Overview</h3>
              <button className="text-[#6C63FF] hover:underline">Manage</button>
            </div>
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-[#8B92A0]">
                  <Plus size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No accounts yet</p>
                </div>
              ) : (
                accounts.map((account) => {
                  const percentage = totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0;
                  return (
                    <div key={account.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)] flex items-center justify-center">
                            {(() => {
                              const Icon = iconMap[account.icon] ?? Wallet;
                              return <Icon size={20} style={{ color: account.color }} />;
                            })()}
                          </div>
                          <span className="text-[#3D4852] dark:text-[#E2E8F0]">{account.name}</span>
                        </div>
                        <span className="text-[#3D4852] dark:text-[#E2E8F0]">{formatCurrency(account.balance)}</span>
                      </div>
                      <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%`, backgroundColor: account.color, boxShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </NeumorphicCard>
        </motion.div>
      </div>

      <PaymentConfirmationModal
        isOpen={selectedPendingSub !== null}
        subscription={selectedPendingSub}
        onClose={() => setSelectedPendingSub(null)}
        onConfirm={confirmPayment}
      />
    </div>
  );
}
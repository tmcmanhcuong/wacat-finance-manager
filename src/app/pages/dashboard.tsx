import { useState } from 'react';
import { Cat, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton } from '../components/neumorphic-card';
import { mockAccounts, mockTransactions, getTotalBalance, calculateStats, calculateByCategory, formatCurrency, mockCategories } from '../store';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const totalBalance = getTotalBalance(mockAccounts);
  const stats = calculateStats(mockTransactions);

  const incomeByCategory = calculateByCategory(mockTransactions, mockCategories, 'income');
  const expenseByCategory = calculateByCategory(mockTransactions, mockCategories, 'expense');

  // Chart data
  const monthlyData = [
    { name: 'Jan', income: 15000000, expense: 8000000 },
    { name: 'Feb', income: 15000000, expense: 9500000 },
    { name: 'Mar', income: 18000000, expense: 7200000 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-[#3D4852] text-3xl mb-2">Welcome back, Cat Lover 👋</h1>
          <p className="text-[#8B92A0]">Here's your financial overview</p>
        </div>
      </motion.div>

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
              <h2 className="text-5xl text-[#3D4852] mb-3">{formatCurrency(totalBalance)}</h2>
              <div className="flex items-center gap-2 text-[#4ECDC4]">
                <ArrowUpRight size={20} />
                <span>+12.5% from last month</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-[#E0E5EC] rounded-3xl shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,0.6)] flex items-center justify-center">
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
            <h3 className="text-[#3D4852] text-xl">Income Statistics</h3>
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
                      <p className="text-2xl text-[#4ECDC4]">
                        {formatCurrency(stat.data)}
                      </p>
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
            <h3 className="text-[#3D4852] text-xl">Expense Statistics</h3>
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
                      <p className="text-2xl text-[#FF6B6B]">
                        {formatCurrency(stat.data)}
                      </p>
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
        {/* Income & Expense Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1"
        >
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] text-xl">Income & Expenses Trend</h3>
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
            <div className="bg-[#E0E5EC] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.3)" />
                  <XAxis dataKey="name" stroke="#8B92A0" />
                  <YAxis stroke="#8B92A0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#E0E5EC', 
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.6)'
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="income" 
                    stroke="#4ECDC4" 
                    strokeWidth={3}
                    dot={{ fill: '#4ECDC4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="expense" 
                    stroke="#FF6B6B" 
                    strokeWidth={3}
                    dot={{ fill: '#FF6B6B', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Income by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] text-xl mb-6">Income by Category</h3>
            {incomeByCategory.length > 0 ? (
              <>
                <div className="bg-[#E0E5EC] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
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
                      <span className="text-[#3D4852] text-sm">{formatCurrency(cat.value)}</span>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] text-xl mb-6">Expense by Category</h3>
            {expenseByCategory.length > 0 ? (
              <>
                <div className="bg-[#E0E5EC] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
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
                      <span className="text-[#3D4852] text-sm">{formatCurrency(cat.value)}</span>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] text-xl">Recent Transactions</h3>
              <button className="text-[#6C63FF] hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {mockTransactions.slice(0, 5).map((transaction) => {
                const account = mockAccounts.find(a => a.id === transaction.accountId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-[#CDD2D9]/30 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#E0E5EC] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center">
                        {transaction.type === 'income' ? (
                          <ArrowUpRight size={20} className="text-[#4ECDC4]" />
                        ) : (
                          <ArrowDownRight size={20} className="text-[#FF6B6B]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#3D4852]">{transaction.description}</p>
                        <p className="text-[#8B92A0] text-sm">{account?.name} • {new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`text-lg ${transaction.type === 'income' ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Accounts Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <NeumorphicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#3D4852] text-xl">Accounts Overview</h3>
              <button className="text-[#6C63FF] hover:underline">Manage</button>
            </div>
            <div className="space-y-4">
              {mockAccounts.map((account) => {
                const percentage = (account.balance / totalBalance) * 100;
                return (
                  <div key={account.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E0E5EC] rounded-xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] flex items-center justify-center">
                          <span className="text-lg">{account.icon === 'Wallet' ? '💰' : account.icon === 'Building2' ? '🏦' : account.icon === 'Smartphone' ? '📱' : '🐷'}</span>
                        </div>
                        <span className="text-[#3D4852]">{account.name}</span>
                      </div>
                      <span className="text-[#3D4852]">{formatCurrency(account.balance)}</span>
                    </div>
                    <div className="h-2 bg-[#E0E5EC] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: account.color,
                          boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </NeumorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
import { Wallet, Building2, Smartphone, PiggyBank, ArrowRightLeft, Plus, TrendingUp, TrendingDown, Edit2, Trash2, X, Loader2, type LucideIcon } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select';
import { formatCurrency, getTotalBalance, getLocalISODate } from '../store';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Building2,
  Smartphone,
  PiggyBank,
};

export function Accounts() {
  // ── Supabase hooks ──
  const { accounts, loading: accountsLoading, addAccount, deleteAccount, updateBalance } = useAccounts();
  const { transactions, loading: txLoading, addTransaction } = useTransactions();

  // ── UI state ──
  const [showForm, setShowForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountColor, setNewAccountColor] = useState('#FF6B6B');
  const [newAccountIcon, setNewAccountIcon] = useState('Wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Transfer form state
  const [transferFromAccount, setTransferFromAccount] = useState('');
  const [transferToAccount, setTransferToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Manage form state
  // const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalBalance = getTotalBalance(accounts);
  const chartData = accounts.map(account => ({
    name: account.name,
    value: account.balance,
    color: account.color,
  }));

  const handleOpenForm = () => {
    setSubmitError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSubmitError('');
  };

  const handleSubmit = async () => {
    const trimmedName = newAccountName.trim();
    if (!trimmedName) {
      setSubmitError('Account name is required');
      return;
    }
    
    if (newAccountBalance === '' || isNaN(Number(newAccountBalance))) {
      setSubmitError('Initial balance is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addAccount({
        name: trimmedName,
        balance: Number(newAccountBalance),
        color: newAccountColor,
        icon: newAccountIcon,
      });
      setShowForm(false);
      setNewAccountName('');
      setNewAccountBalance('');
      setNewAccountColor('#FF6B6B');
      setNewAccountIcon('Wallet');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferFromAccount || !transferToAccount || !transferAmount) return;
    try {
      const fromAcc = accounts.find(a => a.id === transferFromAccount);
      const toAcc = accounts.find(a => a.id === transferToAccount);
      const amount = Number(transferAmount);
      if (!fromAcc || !toAcc) return;

      // Create transfer transaction
      await addTransaction({
        type: 'transfer',
        amount,
        category: 'Other',
        date: getLocalISODate(),
        fromAccountId: transferFromAccount,
        toAccountId: transferToAccount,
        description: transferNote || `Transfer: ${fromAcc.name} → ${toAcc.name}`,
      });

      // Update balances
      await updateBalance(transferFromAccount, fromAcc.balance - amount);
      await updateBalance(transferToAccount, toAcc.balance + amount);

      setShowTransferForm(false);
      setTransferFromAccount('');
      setTransferToAccount('');
      setTransferAmount('');
      setTransferNote('');
    } catch (err) {
      console.error('Failed to transfer:', err);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const accountColors = [
    { name: 'Red', value: '#FF6B6B' },
    { name: 'Purple', value: '#6C63FF' },
    { name: 'Teal', value: '#4ECDC4' },
    { name: 'Orange', value: '#FFA07A' },
    { name: 'Green', value: '#90EE90' },
    { name: 'Pink', value: '#FFB6C1' },
  ];

  if (accountsLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Add Account Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleCloseForm}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full mx-4"
          >
            <Card className="p-6">
              <h3 className="text-foreground text-2xl mb-6">Add New Account</h3>

              {submitError && (
                <div className="mb-4 p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30 flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                    <X size={16} className="text-destructive" />
                  </div>
                  <p className="text-destructive text-sm font-medium">{submitError}</p>
                </div>
              )}

              {/* Account Name */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">Account Name</label>
                <Input
                  type="text"
                  placeholder="Cash, MB Bank, Momo..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>

              {/* Initial Balance */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">Initial Balance (VND)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                />
              </div>

              {/* Icon Selection */}
              <div className="mb-6">
                <label className="block text-foreground mb-3">Select Icon</label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                    <button
                      key={iconName}
                      onClick={() => setNewAccountIcon(iconName)}
                      className={`h-16 rounded-xl transition-all ${newAccountIcon === iconName
                        ? 'bg-primary'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                      <IconComponent
                        size={28}
                        className={newAccountIcon === iconName ? 'text-primary-foreground' : 'text-foreground'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-foreground mb-3">Select Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {accountColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewAccountColor(color.value)}
                      className={`w-full h-12 rounded-xl transition-all ${newAccountColor === color.value
                        ? 'ring-4 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                        }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-muted rounded-xl">
                <p className="text-muted-foreground text-sm mb-3">Preview</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted"
                  >
                    {(() => {
                      const PreviewIcon = iconMap[newAccountIcon] || Wallet;
                      return <PreviewIcon size={28} style={{ color: newAccountColor }} />;
                    })()}
                  </div>
                  <div>
                    <p className="text-foreground">{newAccountName || 'Account Name'}</p>
                    <p className="text-muted-foreground text-sm">{formatCurrency(Number(newAccountBalance) || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                  Save Account
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowTransferForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full mx-4"
          >
            <Card className="p-6">
              <h3 className="text-foreground text-2xl mb-6">Transfer Between Accounts</h3>

              {/* From Account */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">From Account</label>
                <Select
                  value={transferFromAccount}
                  onValueChange={(val) => setTransferFromAccount(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Account */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">To Account</label>
                <Select
                  value={transferToAccount}
                  onValueChange={(val) => setTransferToAccount(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(acc => acc.id !== transferFromAccount)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">Amount (VND)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-foreground mb-2">Note (Optional)</label>
                <Input
                  type="text"
                  placeholder="Transfer note..."
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </div>

              {/* Preview */}
              {transferFromAccount && transferToAccount && transferAmount && (
                <div className="mb-6 p-4 bg-muted rounded-xl">
                  <p className="text-muted-foreground text-sm mb-3">Transfer Preview</p>
                  <div className="space-y-3">
                    {(() => {
                      const fromAcc = accounts.find(a => a.id === transferFromAccount);
                      const toAcc = accounts.find(a => a.id === transferToAccount);
                      const amount = Number(transferAmount);
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{fromAcc?.name}</span>
                            <span className="text-destructive">-{formatCurrency(amount)}</span>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRightLeft size={16} className="text-primary" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{toAcc?.name}</span>
                            <span className="text-[#4ECDC4]">+{formatCurrency(amount)}</span>
                          </div>
                          <div className="border-t border-border pt-3 mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{fromAcc?.name} New Balance:</span>
                              <span className="text-foreground">{formatCurrency((fromAcc?.balance || 0) - amount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{toAcc?.name} New Balance:</span>
                              <span className="text-foreground">{formatCurrency((toAcc?.balance || 0) + amount)}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowTransferForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransferSubmit}
                >
                  Confirm Transfer
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Manage Accounts Form Modal */}
      {showManageForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowManageForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-foreground text-2xl">Manage Accounts</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowManageForm(false)}
                >
                  <X size={20} className="text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-4">
                {accounts.map((account) => {
                  const Icon = iconMap[account.icon] || Wallet;
                  return (
                    <div
                      key={account.id}
                      className="p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted"
                          >
                            <Icon size={24} style={{ color: account.color }} />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">{account.name}</p>
                            <p className="text-muted-foreground text-sm">{formatCurrency(account.balance)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { /* TODO: Implement edit */ }}
                          >
                            <Edit2 size={16} className="text-primary" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirmId(account.id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {deleteConfirmId === account.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <p className="text-destructive text-sm mb-3">
                            Are you sure you want to delete this account? This action cannot be undone.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="secondary"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowManageForm(false);
                    setShowForm(true);
                  }}
                  className="w-full"
                >
                  <Plus size={20} className="inline mr-2" />
                  Add New Account
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-3xl mb-2">My Accounts</h1>
          <p className="text-muted-foreground">Manage your wallets and bank accounts</p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus size={20} className="inline mr-2" />
          Add Account
        </Button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {accounts.map((account, index) => {
          const Icon = iconMap[account.icon] || Wallet;
          const percentage = (account.balance / totalBalance) * 100;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted"
                  >
                    <Icon size={28} style={{ color: account.color }} />
                  </div>
                  <Button variant="outline" size="icon">
                    <ArrowRightLeft size={16} className="text-primary" />
                  </Button>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{account.name}</p>
                  <p className="text-2xl text-foreground mb-3">{formatCurrency(account.balance)}</p>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Account Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">Balance Distribution</h3>
            <div className="bg-muted p-4 rounded-xl">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {chartData.map((data) => (
                <div key={data.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: data.color }}></div>
                    <span className="text-foreground">{data.name}</span>
                  </div>
                  <span className="text-muted-foreground">{formatCurrency(data.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Account Details & Recent Activity */}
        <div className="col-span-2 space-y-6">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">Total Balance Across All Accounts</p>
                  <h2 className="text-5xl text-foreground mb-3">{formatCurrency(totalBalance)}</h2>
                  <div className="flex items-center gap-2 text-[#4ECDC4]">
                    <TrendingUp size={20} />
                    <span>+8.2% this month</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setShowTransferForm(true)}>
                    Transfer
                  </Button>
                  <Button variant="secondary" onClick={() => setShowManageForm(true)}>
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Account Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-foreground text-xl mb-6">Recent Account Activity</h3>
              <div className="space-y-4">
                {transactions.slice(0, 4).map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const fromAccount = accounts.find(a => a.id === transaction.fromAccountId);
                  const toAccount = accounts.find(a => a.id === transaction.toAccountId);

                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                          {transaction.type === 'income' ? (
                            <TrendingUp size={20} className="text-[#4ECDC4]" />
                          ) : transaction.type === 'transfer' ? (
                            <ArrowRightLeft size={20} className="text-primary" />
                          ) : (
                            <TrendingDown size={20} className="text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground mb-1">{transaction.description}</p>
                          <p className="text-muted-foreground text-sm">
                            {transaction.type === 'transfer'
                              ? `${fromAccount?.name} → ${toAccount?.name}`
                              : account?.name
                            } • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg ${transaction.type === 'income' ? 'text-[#4ECDC4]' : transaction.type === 'transfer' ? 'text-primary' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

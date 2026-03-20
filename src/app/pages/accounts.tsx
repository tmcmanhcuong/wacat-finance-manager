import { Wallet, Building2, Smartphone, PiggyBank, ArrowRightLeft, Plus, TrendingUp, TrendingDown, Edit2, Trash2, X, Loader2, type LucideIcon } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
import { formatCurrency, getTotalBalance } from '../store';
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
        date: new Date().toISOString().split('T')[0],
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
          <Loader2 size={40} className="text-[#6C63FF] animate-spin" />
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Loading accounts...</p>
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
            <NeumorphicCard className="p-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl mb-6">Add New Account</h3>

              {submitError && (
                <div className="mb-4 p-4 bg-[#FF6B6B]/10 rounded-2xl border-2 border-[#FF6B6B]/30 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FF6B6B]/20 rounded-lg flex items-center justify-center">
                    <X size={16} className="text-[#FF6B6B]" />
                  </div>
                  <p className="text-[#FF6B6B] text-sm font-medium">{submitError}</p>
                </div>
              )}

              {/* Account Name */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Account Name</label>
                <NeumorphicInput
                  type="text"
                  placeholder="Cash, MB Bank, Momo..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>

              {/* Initial Balance */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Initial Balance (VND)</label>
                <NeumorphicInput
                  type="number"
                  placeholder="0"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                />
              </div>

              {/* Icon Selection */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Select Icon</label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                    <button
                      key={iconName}
                      onClick={() => setNewAccountIcon(iconName)}
                      className={`h-16 rounded-2xl transition-all ${newAccountIcon === iconName
                        ? 'bg-[#6C63FF] shadow-[4px_4px_8px_rgba(108,99,255,0.3)]'
                        : 'bg-[#E0E5EC] dark:bg-[#252C3E] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)]'
                        }`}
                    >
                      <IconComponent
                        size={28}
                        className={newAccountIcon === iconName ? 'text-white' : 'text-[#3D4852] dark:text-[#E2E8F0]'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Select Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {accountColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewAccountColor(color.value)}
                      className={`w-full h-12 rounded-xl transition-all ${newAccountColor === color.value
                        ? 'ring-4 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]'
                        : 'shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)]'
                        }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-3">Preview</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] bg-[#E0E5EC] dark:bg-[#252C3E]"
                  >
                    {(() => {
                      const PreviewIcon = iconMap[newAccountIcon] || Wallet;
                      return <PreviewIcon size={28} style={{ color: newAccountColor }} />;
                    })()}
                  </div>
                  <div>
                    <p className="text-[#3D4852] dark:text-[#E2E8F0]">{newAccountName || 'Account Name'}</p>
                    <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{formatCurrency(Number(newAccountBalance) || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <NeumorphicButton
                  onClick={handleCloseForm}
                >
                  Cancel
                </NeumorphicButton>
                <NeumorphicButton
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                  Save Account
                </NeumorphicButton>
              </div>
            </NeumorphicCard>
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
            <NeumorphicCard className="p-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl mb-6">Transfer Between Accounts</h3>

              {/* From Account */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">From Account</label>
                <NeumorphicSelect
                  value={transferFromAccount}
                  onChange={(e) => setTransferFromAccount(e.target.value)}
                >
                  <option value="">Select source account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </NeumorphicSelect>
              </div>

              {/* To Account */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">To Account</label>
                <NeumorphicSelect
                  value={transferToAccount}
                  onChange={(e) => setTransferToAccount(e.target.value)}
                >
                  <option value="">Select destination account</option>
                  {accounts
                    .filter(acc => acc.id !== transferFromAccount)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </option>
                    ))}
                </NeumorphicSelect>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Amount (VND)</label>
                <NeumorphicInput
                  type="number"
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Note (Optional)</label>
                <NeumorphicInput
                  type="text"
                  placeholder="Transfer note..."
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </div>

              {/* Preview */}
              {transferFromAccount && transferToAccount && transferAmount && (
                <div className="mb-6 p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                  <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-3">Transfer Preview</p>
                  <div className="space-y-3">
                    {(() => {
                      const fromAcc = accounts.find(a => a.id === transferFromAccount);
                      const toAcc = accounts.find(a => a.id === transferToAccount);
                      const amount = Number(transferAmount);
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[#8B92A0] dark:text-[#8892A0]">{fromAcc?.name}</span>
                            <span className="text-[#FF6B6B]">-{formatCurrency(amount)}</span>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRightLeft size={16} className="text-[#6C63FF]" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#8B92A0] dark:text-[#8892A0]">{toAcc?.name}</span>
                            <span className="text-[#4ECDC4]">+{formatCurrency(amount)}</span>
                          </div>
                          <div className="border-t border-[#CDD2D9]/30 dark:border-[#2A3144]/30 pt-3 mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#8B92A0] dark:text-[#8892A0]">{fromAcc?.name} New Balance:</span>
                              <span className="text-[#3D4852] dark:text-[#E2E8F0]">{formatCurrency((fromAcc?.balance || 0) - amount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#8B92A0] dark:text-[#8892A0]">{toAcc?.name} New Balance:</span>
                              <span className="text-[#3D4852] dark:text-[#E2E8F0]">{formatCurrency((toAcc?.balance || 0) + amount)}</span>
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
                <NeumorphicButton
                  onClick={() => setShowTransferForm(false)}
                >
                  Cancel
                </NeumorphicButton>
                <NeumorphicButton
                  variant="primary"
                  onClick={handleTransferSubmit}
                >
                  Confirm Transfer
                </NeumorphicButton>
              </div>
            </NeumorphicCard>
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
            <NeumorphicCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl">Manage Accounts</h3>
                <button
                  onClick={() => setShowManageForm(false)}
                  className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                >
                  <X size={20} className="text-[#8B92A0] dark:text-[#8892A0]" />
                </button>
              </div>

              <div className="space-y-4">
                {accounts.map((account) => {
                  const Icon = iconMap[account.icon] || Wallet;
                  return (
                    <div
                      key={account.id}
                      className="p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] bg-[#E0E5EC] dark:bg-[#252C3E]"
                          >
                            <Icon size={24} style={{ color: account.color }} />
                          </div>
                          <div>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{account.name}</p>
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{formatCurrency(account.balance)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { /* TODO: Implement edit */ }}
                            className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                          >
                            <Edit2 size={16} className="text-[#6C63FF]" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(account.id)}
                            className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                          >
                            <Trash2 size={16} className="text-[#FF6B6B]" />
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {deleteConfirmId === account.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-[#CDD2D9]/30 dark:border-[#2A3144]/30"
                        >
                          <p className="text-[#FF6B6B] text-sm mb-3">
                            Are you sure you want to delete this account? This action cannot be undone.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <NeumorphicButton
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </NeumorphicButton>
                            <NeumorphicButton
                              variant="primary"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              Delete
                            </NeumorphicButton>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <NeumorphicButton
                  variant="primary"
                  onClick={() => {
                    setShowManageForm(false);
                    setShowForm(true);
                  }}
                  className="w-full"
                >
                  <Plus size={20} className="inline mr-2" />
                  Add New Account
                </NeumorphicButton>
              </div>
            </NeumorphicCard>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-3xl mb-2">My Accounts</h1>
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Manage your wallets and bank accounts</p>
        </div>
        <NeumorphicButton variant="primary" onClick={handleOpenForm}>
          <Plus size={20} className="inline mr-2" />
          Add Account
        </NeumorphicButton>
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
              <NeumorphicCard className="p-6 hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.5)] hover:dark:shadow-[6px_6px_12px_rgba(14,18,28,0.9),-6px_-6px_12px_rgba(42,49,68,0.5)] transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] bg-[#E0E5EC] dark:bg-[#1E2330]"
                  >
                    <Icon size={28} style={{ color: account.color }} />
                  </div>
                  <button className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all">
                    <ArrowRightLeft size={16} className="text-[#6C63FF]" />
                  </button>
                </div>
                <div>
                  <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-2">{account.name}</p>
                  <p className="text-2xl text-[#3D4852] dark:text-[#E2E8F0] mb-3">{formatCurrency(account.balance)}</p>
                  <div className="flex items-center gap-2 text-[#8B92A0] dark:text-[#8892A0] text-sm">
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                </div>
              </NeumorphicCard>
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
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Balance Distribution</h3>
            <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)]">
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
                    <span className="text-[#3D4852] dark:text-[#E2E8F0]">{data.name}</span>
                  </div>
                  <span className="text-[#8B92A0] dark:text-[#8892A0]">{formatCurrency(data.value)}</span>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Account Details & Recent Activity */}
        <div className="col-span-2 space-y-6">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <NeumorphicCard className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#8B92A0] dark:text-[#8892A0] mb-2">Total Balance Across All Accounts</p>
                  <h2 className="text-5xl text-[#3D4852] dark:text-[#E2E8F0] mb-3">{formatCurrency(totalBalance)}</h2>
                  <div className="flex items-center gap-2 text-[#4ECDC4]">
                    <TrendingUp size={20} />
                    <span>+8.2% this month</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <NeumorphicButton variant="primary" onClick={() => setShowTransferForm(true)}>
                    Transfer
                  </NeumorphicButton>
                  <NeumorphicButton onClick={() => setShowManageForm(true)}>
                    Manage
                  </NeumorphicButton>
                </div>
              </div>
            </NeumorphicCard>
          </motion.div>

          {/* Recent Account Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <NeumorphicCard className="p-6">
              <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Recent Account Activity</h3>
              <div className="space-y-4">
                {transactions.slice(0, 6).map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const fromAccount = accounts.find(a => a.id === transaction.fromAccountId);
                  const toAccount = accounts.find(a => a.id === transaction.toAccountId);

                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)] flex items-center justify-center">
                          {transaction.type === 'income' ? (
                            <TrendingUp size={20} className="text-[#4ECDC4]" />
                          ) : transaction.type === 'transfer' ? (
                            <ArrowRightLeft size={20} className="text-[#6C63FF]" />
                          ) : (
                            <TrendingDown size={20} className="text-[#FF6B6B]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#3D4852] dark:text-[#E2E8F0] mb-1">{transaction.description}</p>
                          <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                            {transaction.type === 'transfer'
                              ? `${fromAccount?.name} → ${toAccount?.name}`
                              : account?.name
                            } • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg ${transaction.type === 'income' ? 'text-[#4ECDC4]' : transaction.type === 'transfer' ? 'text-[#6C63FF]' : 'text-[#FF6B6B]'}`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </NeumorphicCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
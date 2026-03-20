import { TrendingUp, TrendingDown, User, CreditCard, Plus, Calendar, X, ShoppingCart, Clock, Info, Loader2, AlertCircle } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
import { formatCurrency, daysUntil } from '../store';
import { useDebts } from '../../hooks/useDebts';
import { useAccounts } from '../../hooks/useAccounts';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Debt } from '../types';

export function Debts() {
  const [showForm, setShowForm] = useState(false);
  const [debtType, setDebtType] = useState<'lent' | 'borrowed' | 'installments'>('lent');
  const [person, setPerson] = useState('');
  const [description, setDescription] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mark as Received form state
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [receiveAmount, setReceiveAmount] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveNote, setReceiveNote] = useState('');
  const [receiveAccount, setReceiveAccount] = useState('');

  // Pay Installment form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedBorrowedDebt, setSelectedBorrowedDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');
  const [payAccount, setPayAccount] = useState('');

  const { debts, addDebt, markAsReceived, payInstallment } = useDebts();
  const { accounts } = useAccounts();

  const handleOpenForm = () => {
    setSubmitError(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const trimmedPerson = person.trim();
    const amountVal = Number(totalAmount);
    const dateVal = dueDate || new Date().toISOString().split('T')[0];

    if (!trimmedPerson) {
      setSubmitError('Person/Store name is required');
      return;
    }

    if (!totalAmount || amountVal <= 0) {
      setSubmitError('Total amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addDebt({
        type: debtType,
        person: trimmedPerson,
        description,
        amount: Number(paidAmount) || 0,
        totalAmount: amountVal,
        dueDate: dateVal,
      });
      setShowForm(false);
      setPerson('');
      setDescription('');
      setPaidAmount('');
      setTotalAmount('');
      setDueDate('');
      setDebtType('lent');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add debt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const debtTypeConfig = {
    lent: {
      label: 'Lent Out',
      icon: User,
      color: '#4ECDC4',
      amountLabel: 'Received Back',
      description: 'Money you lent to others'
    },
    borrowed: {
      label: 'Borrowed',
      icon: TrendingDown,
      color: '#FF6B6B',
      amountLabel: 'Paid Back',
      description: 'Money you borrowed from others'
    },
    installments: {
      label: 'Installments',
      icon: ShoppingCart,
      color: '#6C63FF',
      amountLabel: 'Paid',
      description: 'Purchase installments (FE Credit, etc.)'
    }
  };

  const lentDebts = debts.filter(d => d.type === 'lent');
  const borrowedDebts = debts.filter(d => d.type === 'borrowed' || d.type === 'installments');

  const totalLent = lentDebts.reduce((sum, d) => sum + d.amount, 0);
  const totalBorrowed = borrowedDebts.reduce((sum, d) => sum + d.amount, 0);
  const netPosition = totalLent - totalBorrowed;


  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-3xl mb-2">Debts</h1>
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Track money lent, borrowed, and installment payments</p>
        </div>
        <NeumorphicButton variant="primary" onClick={handleOpenForm}>
          <Plus size={20} className="inline mr-2" />
          Add Debt/Installment
        </NeumorphicButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={24} className="text-[#4ECDC4]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Lent Out</p>
            </div>
            <p className="text-3xl text-[#4ECDC4] mb-2">{formatCurrency(totalLent)}</p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{lentDebts.length} active loans</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown size={24} className="text-[#FF6B6B]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Borrowed</p>
            </div>
            <p className="text-3xl text-[#FF6B6B] mb-2">{formatCurrency(totalBorrowed)}</p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{borrowedDebts.length} installments</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={24} className="text-[#6C63FF]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Net Position</p>
            </div>
            <p className={`text-3xl mb-2 ${netPosition >= 0 ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
              {formatCurrency(Math.abs(netPosition))}
            </p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{netPosition >= 0 ? 'Net lender' : 'Net borrower'}</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard size={24} className="text-[#FFC75F]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Due Soon</p>
            </div>
            <p className="text-3xl text-[#FFC75F] mb-2">2</p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">Next 30 days</p>
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Lent Out Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeumorphicCard variant="extruded" className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Money Lent to Others</h3>
            <div className="space-y-4">
              {lentDebts.map((debt) => (
                <div key={debt.id} className="border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center">
                        <User size={24} className="text-[#4ECDC4]" />
                      </div>
                      <div>
                        <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg mb-1">{debt.person}</p>
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{debt.description}</p>
                      </div>
                    </div>
                    {debt.dueDate && (
                      <span className="px-4 py-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full text-sm text-[#6C63FF] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                        {daysUntil(debt.dueDate)} days left
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Received</p>
                      <p className="text-[#4ECDC4] text-xl">{formatCurrency(debt.amount)}</p>
                    </div>
                    <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Outstanding</p>
                      <p className="text-[#FF6B6B] text-xl">{formatCurrency(debt.totalAmount - debt.amount)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">Progress</span>
                      <span className="text-[#3D4852] dark:text-[#E2E8F0] text-sm">
                        {((debt.amount / debt.totalAmount) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                      <div
                        className="h-full bg-[#4ECDC4] rounded-full transition-all"
                        style={{
                          width: `${(debt.amount / debt.totalAmount) * 100}%`,
                          boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>
                  </div>

                  <NeumorphicButton size="sm" className="w-full" onClick={() => {
                    setSelectedDebt(debt);
                    setShowReceiveForm(true);
                  }}>
                    Mark as Received
                  </NeumorphicButton>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Borrowed Section (Installments) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NeumorphicCard variant="extruded" className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Installments & Borrowed Money</h3>
            <div className="space-y-4">
              {borrowedDebts.map((debt) => {
                const progress = (debt.amount / debt.totalAmount) * 100;
                const remaining = debt.totalAmount - debt.amount;

                return (
                  <div key={debt.id} className="border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center">
                          {(() => {
                            const typeConfig = debtTypeConfig[debt.type as 'borrowed' | 'installments'];
                            const Icon = typeConfig?.icon || CreditCard;
                            return <Icon size={24} style={{ color: typeConfig?.color || '#FF6B6B' }} />;
                          })()}
                        </div>
                        <div>
                          <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg mb-1">{debt.person}</p>
                          <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{debt.description}</p>
                        </div>
                      </div>
                      {debt.dueDate && (
                        <span className="px-4 py-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full text-sm text-[#FF6B6B] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                          {daysUntil(debt.dueDate)} days left
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Total</p>
                        <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg">{formatCurrency(debt.totalAmount)}</p>
                      </div>
                      <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Paid</p>
                        <p className="text-[#4ECDC4] text-lg">{formatCurrency(debt.amount)}</p>
                      </div>
                      <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)]">
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Remaining</p>
                        <p className="text-[#FF6B6B] text-lg">{formatCurrency(remaining)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">Payment Progress</span>
                        <span className="text-[#3D4852] dark:text-[#E2E8F0] text-sm">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#6C63FF] rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </div>
                    </div>

                    <NeumorphicButton size="sm" className="w-full" onClick={() => {
                      setSelectedBorrowedDebt(debt);
                      setShowPayForm(true);
                    }}>
                      Pay Installment
                    </NeumorphicButton>
                  </div>
                );
              })}
            </div>
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Add Debt/Installment Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center pt-8 pb-8 custom-scrollbar"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full mx-4 my-auto relative"
          >
            <NeumorphicCard variant="extruded" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl">Add Debt/Installment</h3>
                <button
                  onClick={handleCloseForm}
                  className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                >
                  <X size={20} className="text-[#8B92A0] dark:text-[#8892A0]" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-4 bg-[#FF6B6B]/10 rounded-2xl border-2 border-[#FF6B6B]/30 flex items-center gap-3">
                  <AlertCircle size={20} className="text-[#FF6B6B] shrink-0" />
                  <p className="text-[#FF6B6B] text-sm font-medium">{submitError}</p>
                </div>
              )}

              {/* Type Selection */}
              <div className="mb-4">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(debtTypeConfig) as Array<'lent' | 'borrowed' | 'installments'>).map((type) => {
                    const config = debtTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setDebtType(type)}
                        className={`p-3 rounded-2xl transition-all ${debtType === type
                          ? 'bg-[#6C63FF] shadow-[4px_4px_8px_rgba(108,99,255,0.3)]'
                          : 'bg-[#E0E5EC] dark:bg-[#252C3E] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.4),-2px_-2px_4px_rgba(255,255,255,0.4)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)]'
                          }`}
                      >
                        <Icon
                          size={20}
                          className={`mx-auto mb-1 ${debtType === type ? 'text-white' : 'text-[#3D4852] dark:text-[#E2E8F0]'}`}
                          style={{ color: debtType === type ? 'white' : config.color }}
                        />
                        <p className={`text-sm ${debtType === type ? 'text-white' : 'text-[#3D4852] dark:text-[#E2E8F0]'}`}>
                          {config.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mt-1.5">{debtTypeConfig[debtType].description}</p>
              </div>

              {/* Person & Due Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">
                    {debtType === 'installments' ? 'Store' : 'Person Name'}
                  </label>
                  <NeumorphicInput
                    type="text"
                    placeholder={debtType === 'installments' ? 'FE Credit...' : 'John Doe...'}
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Due Date (Opt)</label>
                  <NeumorphicInput
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Description</label>
                <NeumorphicInput
                  type="text"
                  placeholder="iPhone 15 Pro, Personal loan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Total (VND)</label>
                  <NeumorphicInput
                    type="number"
                    placeholder="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">
                    {debtTypeConfig[debtType].amountLabel}
                  </label>
                  <NeumorphicInput
                    type="number"
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Preview */}
              {totalAmount && Number(totalAmount) > 0 && (
                <div className="mb-4 p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] bg-[#E0E5EC] dark:bg-[#1E2330]"
                    >
                      {(() => {
                        const Icon = debtTypeConfig[debtType].icon;
                        return <Icon size={20} style={{ color: debtTypeConfig[debtType].color }} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{person || 'Person Name'}</p>
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{description || 'Description'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-0.5">
                        {debtTypeConfig[debtType].amountLabel}
                      </p>
                      <p className="text-[#4ECDC4] font-medium">{formatCurrency(Number(paidAmount) || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-0.5">Remaining</p>
                      <p className="text-[#FF6B6B] font-medium">
                        {formatCurrency(Number(totalAmount) - (Number(paidAmount) || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#8B92A0] dark:text-[#8892A0] text-xs">Progress</span>
                      <span className="text-[#3D4852] dark:text-[#E2E8F0] text-xs">
                        {(((Number(paidAmount) || 0) / Number(totalAmount)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((Number(paidAmount) || 0) / Number(totalAmount)) * 100}%`,
                          backgroundColor: debtTypeConfig[debtType].color,
                          boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <NeumorphicButton onClick={handleCloseForm}>
                  Cancel
                </NeumorphicButton>
                <NeumorphicButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                  Add {debtTypeConfig[debtType].label}
                </NeumorphicButton>
              </div>
            </NeumorphicCard>
          </motion.div>
        </motion.div>
      )}

      {/* Mark as Received Form Modal */}
      {showReceiveForm && selectedDebt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReceiveForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="max-h-[90vh] flex flex-col">
              <NeumorphicCard variant="extruded" className="flex flex-col overflow-hidden flex-1">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                  <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl">Mark as Received</h3>
                  <button
                    onClick={() => setShowReceiveForm(false)}
                    className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                  >
                    <X size={20} className="text-[#8B92A0] dark:text-[#8892A0]" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {/* Info Box */}
                  <div className="mb-6 p-4 bg-[#4ECDC4]/10 rounded-2xl border-2 border-[#4ECDC4]/30">
                    <div className="flex items-start gap-3">
                      <Info size={20} className="text-[#4ECDC4] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium mb-1">How it works:</p>
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                          When you mark money as received, an <span className="text-[#4ECDC4] font-medium">Income transaction</span> will be automatically created in your selected account, and the account balance will be updated accordingly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2 Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Debt Details & Inputs */}
                    <div>
                      {/* Debt Details */}
                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Debt Details</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Person</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{selectedDebt.person}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Total Amount</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{formatCurrency(selectedDebt.totalAmount)}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] col-span-2">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Description</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0]">{selectedDebt.description}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Received</p>
                            <p className="text-[#4ECDC4] font-medium">{formatCurrency(selectedDebt.amount)}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Outstanding</p>
                            <p className="text-[#FF6B6B] font-medium">{formatCurrency(selectedDebt.totalAmount - selectedDebt.amount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Receive Amount (VND)</label>
                        <NeumorphicInput
                          type="number"
                          placeholder="0"
                          value={receiveAmount}
                          onChange={(e) => setReceiveAmount(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Receive Date</label>
                        <NeumorphicInput
                          type="date"
                          value={receiveDate}
                          onChange={(e) => setReceiveDate(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Note (Optional)</label>
                        <NeumorphicInput
                          type="text"
                          placeholder="First payment, Second installment..."
                          value={receiveNote}
                          onChange={(e) => setReceiveNote(e.target.value)}
                        />
                        {receiveAmount && Number(receiveAmount) > (selectedDebt.totalAmount - selectedDebt.amount) && (
                          <p className="text-[#FF6B6B] text-sm mt-2">⚠️ Amount exceeds outstanding balance</p>
                        )}
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">
                          Account to Receive Money <span className="text-[#FF6B6B]">*</span>
                        </label>
                        <NeumorphicSelect
                          value={receiveAccount}
                          onChange={(e) => setReceiveAccount(e.target.value)}
                        >
                          <option value="">Select Account</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.name} - {formatCurrency(account.balance)}
                            </option>
                          ))}
                        </NeumorphicSelect>
                        {!receiveAccount && receiveAmount && Number(receiveAmount) > 0 && (
                          <p className="text-[#FF6B6B] text-sm mt-2">⚠️ Please select an account to record this transaction</p>
                        )}
                        {receiveAccount && (
                          <p className="text-[#4ECDC4] text-sm mt-2">✓ Income transaction will be created</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <NeumorphicButton onClick={() => setShowReceiveForm(false)}>
                          Cancel
                        </NeumorphicButton>
                        <NeumorphicButton
                          variant="primary"
                          disabled={!receiveAmount || Number(receiveAmount) <= 0 || !receiveAccount || Number(receiveAmount) > (selectedDebt.totalAmount - selectedDebt.amount)}
                          onClick={async () => {
                            if (selectedDebt && receiveAmount && Number(receiveAmount) > 0 && receiveAccount) {
                              const receiveAmountNum = Number(receiveAmount);
                              try {
                                await markAsReceived(
                                  selectedDebt.id,
                                  receiveAmountNum,
                                  receiveDate,
                                  receiveAccount,
                                  receiveNote || 'Payment received',
                                );
                                setShowReceiveForm(false);
                                setReceiveAmount('');
                                setReceiveDate(new Date().toISOString().split('T')[0]);
                                setReceiveNote('');
                                setReceiveAccount('');
                              } catch (err) {
                                console.error('Failed to mark as received:', err);
                              }
                            }
                          }}>
                          Confirm
                        </NeumorphicButton>
                      </div>
                    </div>

                    {/* Right Column - Preview & Payment History */}
                    <div>
                      {/* Preview */}
                      {receiveAmount && Number(receiveAmount) > 0 && Number(receiveAmount) <= (selectedDebt.totalAmount - selectedDebt.amount) && (
                        <div className="mb-5 p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                          <p className="text-[#8B92A0] dark:text-[#8892A0] mb-4">Preview After Update</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">New Total Received</p>
                              <p className="text-[#4ECDC4] text-xl font-medium">
                                {formatCurrency(selectedDebt.amount + Number(receiveAmount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">New Remaining</p>
                              <p className="text-[#FF6B6B] text-xl font-medium">
                                {formatCurrency(selectedDebt.totalAmount - selectedDebt.amount - Number(receiveAmount))}
                              </p>
                            </div>
                          </div>

                          {/* Progress Comparison */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">Current Progress</span>
                                <span className="text-[#3D4852] dark:text-[#E2E8F0] text-sm">
                                  {((selectedDebt.amount / selectedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                                <div
                                  className="h-full bg-[#8B92A0] rounded-full"
                                  style={{
                                    width: `${(selectedDebt.amount / selectedDebt.totalAmount) * 100}%`,
                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#4ECDC4] text-sm font-medium">New Progress</span>
                                <span className="text-[#4ECDC4] text-sm font-medium">
                                  {(((selectedDebt.amount + Number(receiveAmount)) / selectedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                                <div
                                  className="h-full bg-[#4ECDC4] rounded-full"
                                  style={{
                                    width: `${((selectedDebt.amount + Number(receiveAmount)) / selectedDebt.totalAmount) * 100}%`,
                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Transaction Preview */}
                          {receiveAccount && (
                            <div className="mt-4 p-3 bg-[#4ECDC4]/10 rounded-xl border-2 border-[#4ECDC4]/30">
                              <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium mb-2 text-sm">📝 Transaction to be created:</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-[#8B92A0] dark:text-[#8892A0]">• Type: <span className="text-[#4ECDC4] font-medium">Income</span></p>
                                <p className="text-[#8B92A0] dark:text-[#8892A0]">• Amount: <span className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{formatCurrency(Number(receiveAmount))}</span></p>
                                <p className="text-[#8B92A0] dark:text-[#8892A0]">• Account: <span className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">          {accounts.find(a => a.id === receiveAccount)?.name}</span></p>
                                <p className="text-[#8B92A0] dark:text-[#8892A0]">• Category: <span className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">Debt Collection</span></p>
                              </div>
                            </div>
                          )}

                          {/* Fully Paid Badge */}
                          {(selectedDebt.amount + Number(receiveAmount)) >= selectedDebt.totalAmount && (
                            <div className="mt-4 p-3 bg-[#4ECDC4]/10 rounded-xl border-2 border-[#4ECDC4]/30">
                              <p className="text-[#4ECDC4] text-center font-medium">✅ Debt Fully Paid!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment History */}
                      {selectedDebt.paymentHistory && selectedDebt.paymentHistory.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-[#3D4852] dark:text-[#E2E8F0]">Payment History</label>
                            <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                              {selectedDebt.paymentHistory.length} payment{selectedDebt.paymentHistory.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30">
                              <div>
                                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Total Received</p>
                                <p className="text-[#4ECDC4] text-lg font-medium">{formatCurrency(selectedDebt.amount)}</p>
                              </div>
                              <div>
                                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Number of Payments</p>
                                <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg font-medium">{selectedDebt.paymentHistory.length} times</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="max-h-[280px] overflow-y-auto space-y-3">
                              {selectedDebt.paymentHistory
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-start gap-3 p-3 bg-white/50 dark:bg-[#1E2532] rounded-xl"
                                  >
                                    <div className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center flex-shrink-0">
                                      <Clock size={16} className="text-[#4ECDC4]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-[#4ECDC4] font-medium">
                                          {formatCurrency(payment.amount)}
                                        </p>
                                        <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                                          {payment.progressAtTime}%
                                        </span>
                                      </div>
                                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">
                                        {new Date(payment.date).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </p>
                                      {payment.note && (
                                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm italic">
                                          "{payment.note}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Empty State for No History */}
                      {(!selectedDebt.paymentHistory || selectedDebt.paymentHistory.length === 0) && (
                        <div className="p-8 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] text-center">
                          <Calendar size={40} className="text-[#8B92A0] dark:text-[#8892A0] mx-auto mb-3" />
                          <p className="text-[#8B92A0] dark:text-[#8892A0]">No payment history yet</p>
                          <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">This will be the first payment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Pay Installment Form Modal */}
      {showPayForm && selectedBorrowedDebt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPayForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="max-h-[90vh] flex flex-col">
              <NeumorphicCard variant="extruded" className="flex flex-col overflow-hidden flex-1">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                  <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl">Pay Installment</h3>
                  <button
                    onClick={() => setShowPayForm(false)}
                    className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                  >
                    <X size={20} className="text-[#8B92A0] dark:text-[#8892A0]" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {/* Info Box */}
                  <div className="mb-6 p-4 bg-[#FF6B6B]/10 rounded-2xl border-2 border-[#FF6B6B]/30">
                    <div className="flex items-start gap-3">
                      <Info size={20} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium mb-1">How it works:</p>
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                          When you pay an installment, an <span className="text-[#FF6B6B] font-medium">Expense transaction</span> will be automatically created, and the selected account balance will be deducted accordingly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2 Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Debt Details & Inputs */}
                    <div>
                      {/* Debt Details */}
                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Debt Details</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Person</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{selectedBorrowedDebt.person}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Total Amount</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0] font-medium">{formatCurrency(selectedBorrowedDebt.totalAmount)}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] col-span-2">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Description</p>
                            <p className="text-[#3D4852] dark:text-[#E2E8F0]">{selectedBorrowedDebt.description}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Paid</p>
                            <p className="text-[#4ECDC4] font-medium">{formatCurrency(selectedBorrowedDebt.amount)}</p>
                          </div>
                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs mb-1">Outstanding</p>
                            <p className="text-[#FF6B6B] font-medium">{formatCurrency(selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Pay Amount (VND)</label>
                        <NeumorphicInput
                          type="number"
                          placeholder="0"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Pay Date</label>
                        <NeumorphicInput
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">Note (Optional)</label>
                        <NeumorphicInput
                          type="text"
                          placeholder="First payment, Second installment..."
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                        />
                        {payAmount && Number(payAmount) > (selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount) && (
                          <p className="text-[#FF6B6B] text-sm mt-2">⚠️ Amount exceeds outstanding balance</p>
                        )}
                      </div>

                      <div className="mb-5">
                        <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-3">
                          Account to Pay From <span className="text-[#FF6B6B]">*</span>
                        </label>
                        <NeumorphicSelect
                          value={payAccount}
                          onChange={(e) => setPayAccount(e.target.value)}
                        >
                          <option value="">Select Account</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.name} - {formatCurrency(account.balance)}
                            </option>
                          ))}
                        </NeumorphicSelect>
                        {!payAccount && payAmount && Number(payAmount) > 0 && (
                          <p className="text-[#FF6B6B] text-sm mt-2">⚠️ Please select an account to record this transaction</p>
                        )}
                        {payAccount && payAmount && Number(payAmount) > 0 && (
                          <>
                            {(() => {
                              const selectedAccount = accounts.find(a => a.id === payAccount);
                              const payAmountNum = Number(payAmount);
                              if (selectedAccount && selectedAccount.balance < payAmountNum) {
                                return (
                                  <p className="text-[#FF6B6B] text-sm mt-2">
                                    ⚠️ Insufficient balance! Account has {formatCurrency(selectedAccount.balance)}, need {formatCurrency(payAmountNum)}
                                  </p>
                                );
                              }
                              return <p className="text-[#FF6B6B] text-sm mt-2">✓ Expense transaction will be created</p>;
                            })()}
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <NeumorphicButton onClick={() => setShowPayForm(false)}>
                          Cancel
                        </NeumorphicButton>
                        <NeumorphicButton
                          variant="primary"
                          disabled={(() => {
                            if (!payAmount || Number(payAmount) <= 0 || !payAccount) return true;
                            if (Number(payAmount) > (selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount)) return true;
                            const selectedAccount = accounts.find(a => a.id === payAccount);
                            if (selectedAccount && selectedAccount.balance < Number(payAmount)) return true;
                            return false;
                          })()}
                          onClick={async () => {
                            if (selectedBorrowedDebt && payAmount && Number(payAmount) > 0 && payAccount) {
                              const payAmountNum = Number(payAmount);
                              try {
                                await payInstallment(
                                  selectedBorrowedDebt.id,
                                  payAmountNum,
                                  payDate,
                                  payAccount,
                                  payNote || 'Payment made',
                                );
                                setShowPayForm(false);
                                setPayAmount('');
                                setPayDate(new Date().toISOString().split('T')[0]);
                                setPayNote('');
                                setPayAccount('');
                              } catch (err) {
                                console.error('Failed to pay installment:', err);
                              }
                            }
                          }}>
                          Confirm
                        </NeumorphicButton>
                      </div>
                    </div>

                    {/* Right Column - Preview & Payment History */}
                    <div>
                      {/* Preview */}
                      {payAmount && Number(payAmount) > 0 && Number(payAmount) <= (selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount) && (
                        <div className="mb-5 p-4 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                          <p className="text-[#8B92A0] mb-4">Preview After Update</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-[#8B92A0] text-sm mb-1">New Total Paid</p>
                              <p className="text-[#4ECDC4] text-xl font-medium">
                                {formatCurrency(selectedBorrowedDebt.amount + Number(payAmount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#8B92A0] text-sm mb-1">New Remaining</p>
                              <p className="text-[#FF6B6B] text-xl font-medium">
                                {formatCurrency(selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount - Number(payAmount))}
                              </p>
                            </div>
                          </div>

                          {/* Progress Comparison */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#8B92A0] text-sm">Current Progress</span>
                                <span className="text-[#3D4852] text-sm">
                                  {((selectedBorrowedDebt.amount / selectedBorrowedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                                <div
                                  className="h-full bg-[#8B92A0] rounded-full"
                                  style={{
                                    width: `${(selectedBorrowedDebt.amount / selectedBorrowedDebt.totalAmount) * 100}%`,
                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#4ECDC4] text-sm font-medium">New Progress</span>
                                <span className="text-[#4ECDC4] text-sm font-medium">
                                  {(((selectedBorrowedDebt.amount + Number(payAmount)) / selectedBorrowedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                                <div
                                  className="h-full bg-[#4ECDC4] rounded-full"
                                  style={{
                                    width: `${((selectedBorrowedDebt.amount + Number(payAmount)) / selectedBorrowedDebt.totalAmount) * 100}%`,
                                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Transaction Preview */}
                          {payAccount && (
                            <div className="mt-4 p-3 bg-[#FF6B6B]/10 rounded-xl border-2 border-[#FF6B6B]/30">
                              <p className="text-[#3D4852] font-medium mb-2 text-sm">📝 Transaction to be created:</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-[#8B92A0]">• Type: <span className="text-[#FF6B6B] font-medium">Expense</span></p>
                                <p className="text-[#8B92A0]">• Amount: <span className="text-[#3D4852] font-medium">{formatCurrency(Number(payAmount))}</span></p>
                                <p className="text-[#8B92A0]">• Account: <span className="text-[#3D4852] font-medium">          {accounts.find(a => a.id === payAccount)?.name}</span></p>
                                <p className="text-[#8B92A0]">• Category: <span className="text-[#3D4852] font-medium">Debt Payment</span></p>
                              </div>
                            </div>
                          )}

                          {/* Fully Paid Badge */}
                          {(selectedBorrowedDebt.amount + Number(payAmount)) >= selectedBorrowedDebt.totalAmount && (
                            <div className="mt-4 p-3 bg-[#4ECDC4]/10 rounded-xl border-2 border-[#4ECDC4]/30">
                              <p className="text-[#4ECDC4] text-center font-medium">✅ Debt Fully Paid!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment History */}
                      {selectedBorrowedDebt.paymentHistory && selectedBorrowedDebt.paymentHistory.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-[#3D4852] dark:text-[#E2E8F0]">Payment History</label>
                            <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                              {selectedBorrowedDebt.paymentHistory.length} payment{selectedBorrowedDebt.paymentHistory.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#CDD2D9]/30 dark:border-[#2A3144]/30">
                              <div>
                                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Total Paid</p>
                                <p className="text-[#4ECDC4] text-lg font-medium">{formatCurrency(selectedBorrowedDebt.amount)}</p>
                              </div>
                              <div>
                                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">Number of Payments</p>
                                <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg font-medium">{selectedBorrowedDebt.paymentHistory.length} times</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="max-h-[280px] overflow-y-auto space-y-3">
                              {selectedBorrowedDebt.paymentHistory
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-start gap-3 p-3 bg-white/50 dark:bg-[#1E2532] rounded-xl"
                                  >
                                    <div className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center flex-shrink-0">
                                      <Clock size={16} className="text-[#4ECDC4]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-[#4ECDC4] font-medium">
                                          {formatCurrency(payment.amount)}
                                        </p>
                                        <span className="text-[#8B92A0] dark:text-[#8892A0] text-sm">
                                          {payment.progressAtTime}%
                                        </span>
                                      </div>
                                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm mb-1">
                                        {new Date(payment.date).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </p>
                                      {payment.note && (
                                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm italic">
                                          "{payment.note}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Empty State for No History */}
                      {(!selectedBorrowedDebt.paymentHistory || selectedBorrowedDebt.paymentHistory.length === 0) && (
                        <div className="p-8 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] text-center">
                          <Calendar size={40} className="text-[#8B92A0] dark:text-[#8892A0] mx-auto mb-3" />
                          <p className="text-[#8B92A0] dark:text-[#8892A0]">No payment history yet</p>
                          <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">This will be the first payment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
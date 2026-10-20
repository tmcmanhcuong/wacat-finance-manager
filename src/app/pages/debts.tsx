import { TrendingUp, TrendingDown, User, CreditCard, Plus, Calendar, X, ShoppingCart, Clock, Info, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select';
import { formatCurrency, daysUntil, getLocalISODate } from '../store';
import { useDebts } from '../../hooks/useDebts';
import { useAccounts } from '../../hooks/useAccounts';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
  const [receiveDate, setReceiveDate] = useState(getLocalISODate());
  const [receiveNote, setReceiveNote] = useState('');
  const [receiveAccount, setReceiveAccount] = useState('');

  // Pay Installment form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedBorrowedDebt, setSelectedBorrowedDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(getLocalISODate());
  const [payNote, setPayNote] = useState('');
  const [payAccount, setPayAccount] = useState('');

  // Edit Debt form state (edit person / description / totalAmount / dueDate)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editPerson, setEditPerson] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setEditPerson(debt.person);
    setEditDescription(debt.description ?? '');
    setEditTotalAmount(String(debt.totalAmount));
    setEditDueDate(debt.dueDate ?? '');
    setEditError(null);
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
    setEditingDebt(null);
    setEditError(null);
  };

  const handleSubmitEdit = async () => {
    if (!editingDebt) return;
    const trimmedPerson = editPerson.trim();
    const totalVal = Number(editTotalAmount);

    if (!trimmedPerson) {
      setEditError('Person/Store name is required');
      return;
    }
    if (!editTotalAmount || totalVal <= 0) {
      setEditError('Total amount must be greater than 0');
      return;
    }
    if (totalVal < editingDebt.amount) {
      setEditError(`Total cannot be less than already paid (${formatCurrency(editingDebt.amount)})`);
      return;
    }

    setEditSubmitting(true);
    setEditError(null);
    try {
      await editDebt(editingDebt.id, {
        person: trimmedPerson,
        description: editDescription,
        totalAmount: totalVal,
        dueDate: editDueDate || undefined,
      });
      handleCloseEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update debt');
    } finally {
      setEditSubmitting(false);
    }
  };

  const { debts, addDebt, markAsReceived, payInstallment, editDebt } = useDebts();
  const { accounts } = useAccounts();

  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const createdAt = new Date(user.created_at);
        const diffDays = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 7) {
          setIsNewUser(true);
        }
      }
    });
  }, []);

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
    const dateVal = dueDate || getLocalISODate();

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
          <h1 className="text-foreground text-3xl mb-2">Debts</h1>
          <p className="text-muted-foreground">Track money lent, borrowed, and installment payments</p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus size={20} className="inline mr-2" />
          Add Debt/Installment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={24} className="text-[#4ECDC4]" />
              <p className="text-muted-foreground">Lent Out</p>
            </div>
            <p className="text-3xl text-[#4ECDC4] mb-2">{formatCurrency(totalLent)}</p>
            <p className="text-muted-foreground text-sm">{lentDebts.length} active loans</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown size={24} className="text-destructive" />
              <p className="text-muted-foreground">Borrowed</p>
            </div>
            <p className="text-3xl text-destructive mb-2">{formatCurrency(totalBorrowed)}</p>
            <p className="text-muted-foreground text-sm">{borrowedDebts.length} installments</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={24} className="text-primary" />
              <p className="text-muted-foreground">Net Position</p>
            </div>
            <p className={`text-3xl mb-2 ${netPosition >= 0 ? 'text-[#4ECDC4]' : 'text-destructive'}`}>
              {formatCurrency(Math.abs(netPosition))}
            </p>
            <p className="text-muted-foreground text-sm">{netPosition >= 0 ? 'Net lender' : 'Net borrower'}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard size={24} className="text-[#FFC75F]" />
              <p className="text-muted-foreground">Due Soon</p>
            </div>
            <p className="text-3xl text-[#FFC75F] mb-2">2</p>
            <p className="text-muted-foreground text-sm">Next 30 days</p>
          </Card>
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
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">Money Lent to Others</h3>
            <div className="space-y-4">
              {lentDebts.map((debt) => (
                <div key={debt.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
                        <User size={24} className="text-[#4ECDC4]" />
                      </div>
                      <div>
                        <p className="text-foreground text-lg mb-1">{debt.person}</p>
                        <p className="text-muted-foreground text-sm">{debt.description}</p>
                      </div>
                    </div>
                    {debt.dueDate && (
                      <span className="px-4 py-2 bg-muted rounded-full text-sm text-primary">
                        {daysUntil(debt.dueDate)} days left
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-muted-foreground text-sm mb-1">Received</p>
                      <p className="text-[#4ECDC4] text-xl">{formatCurrency(debt.amount)}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-xl">
                      <p className="text-muted-foreground text-sm mb-1">Outstanding</p>
                      <p className="text-destructive text-xl">{formatCurrency(debt.totalAmount - debt.amount)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">Progress</span>
                      <span className="text-foreground text-sm">
                        {((debt.amount / debt.totalAmount) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ECDC4] rounded-full transition-all"
                        style={{
                          width: `${(debt.amount / debt.totalAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button size="sm" className="flex-1" onClick={() => {
                      setSelectedDebt(debt);
                      setShowReceiveForm(true);
                    }}>
                      Mark as Received
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(debt)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Borrowed Section (Installments) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">Installments & Borrowed Money</h3>
            <div className="space-y-4">
              {borrowedDebts.map((debt) => {
                const progress = (debt.amount / debt.totalAmount) * 100;
                const remaining = debt.totalAmount - debt.amount;

                return (
                  <div key={debt.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
                          {(() => {
                            const typeConfig = debtTypeConfig[debt.type as 'borrowed' | 'installments'];
                            const Icon = typeConfig?.icon || CreditCard;
                            return <Icon size={24} style={{ color: typeConfig?.color || '#FF6B6B' }} />;
                          })()}
                        </div>
                        <div>
                          <p className="text-foreground text-lg mb-1">{debt.person}</p>
                          <p className="text-muted-foreground text-sm">{debt.description}</p>
                        </div>
                      </div>
                      {debt.dueDate && (
                        <span className="px-4 py-2 bg-muted rounded-full text-sm text-destructive">
                          {daysUntil(debt.dueDate)} days left
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-muted p-4 rounded-xl">
                        <p className="text-muted-foreground text-xs mb-1">Total</p>
                        <p className="text-foreground text-lg">{formatCurrency(debt.totalAmount)}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-xl">
                        <p className="text-muted-foreground text-xs mb-1">Paid</p>
                        <p className="text-[#4ECDC4] text-lg">{formatCurrency(debt.amount)}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-xl">
                        <p className="text-muted-foreground text-xs mb-1">Remaining</p>
                        <p className="text-destructive text-lg">{formatCurrency(remaining)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Payment Progress</span>
                        <span className="text-foreground text-sm">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#6C63FF] rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" className="flex-1" onClick={() => {
                        setSelectedBorrowedDebt(debt);
                        setShowPayForm(true);
                      }}>
                        Pay Installment
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(debt)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Edit Debt Modal */}
      {showEditForm && editingDebt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center pt-8 pb-8 custom-scrollbar"
          onClick={handleCloseEdit}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full mx-4 my-auto relative"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground text-2xl">Edit Debt</h3>
                <button
                  onClick={handleCloseEdit}
                  className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30 flex items-center gap-3">
                  <AlertCircle size={20} className="text-destructive shrink-0" />
                  <p className="text-destructive text-sm font-medium">{editError}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-foreground mb-2">Person / Store</label>
                <Input value={editPerson} onChange={(e) => setEditPerson(e.target.value)} placeholder="e.g. Credit Card" />
              </div>

              <div className="mb-4">
                <label className="block text-foreground mb-2">Description</label>
                <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="e.g. iPhone 15 Pro – installments" />
              </div>

              <div className="mb-4">
                <label className="block text-foreground mb-2">Total Amount (VND)</label>
                <Input type="number" value={editTotalAmount} onChange={(e) => setEditTotalAmount(e.target.value)} placeholder="0" />
                <p className="text-muted-foreground text-xs mt-1.5">
                  Already paid: {formatCurrency(editingDebt.amount)} · Remaining will be recalculated from the new total.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-foreground mb-2">Due Date</label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleCloseEdit} disabled={editSubmitting}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmitEdit} disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground text-2xl">Add Debt/Installment</h3>
                <button
                  onClick={handleCloseForm}
                  className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30 flex items-center gap-3">
                  <AlertCircle size={20} className="text-destructive shrink-0" />
                  <p className="text-destructive text-sm font-medium">{submitError}</p>
                </div>
              )}

              {/* Type Selection */}
              <div className="mb-4">
                <label className="block text-foreground mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(debtTypeConfig) as Array<'lent' | 'borrowed' | 'installments'>).map((type) => {
                    const config = debtTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setDebtType(type)}
                        className={`p-3 rounded-xl transition-all ${debtType === type
                          ? 'bg-primary'
                          : 'bg-muted hover:bg-muted/80'
                          }`}
                      >
                        <Icon
                          size={20}
                          className={`mx-auto mb-1 ${debtType === type ? 'text-primary-foreground' : 'text-foreground'}`}
                          style={{ color: debtType === type ? undefined : config.color }}
                        />
                        <p className={`text-sm ${debtType === type ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {config.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-xs mt-1.5">{debtTypeConfig[debtType].description}</p>
              </div>

              {/* Person & Due Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-foreground mb-2">
                    {debtType === 'installments' ? 'Store' : 'Person Name'}
                  </label>
                  <Input
                    type="text"
                    placeholder={debtType === 'installments' ? 'FE Credit...' : 'John Doe...'}
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">Due Date (Opt)</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-foreground mb-2">Description</label>
                <Input
                  type="text"
                  placeholder="iPhone 15 Pro, Personal loan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-foreground mb-2">Total (VND)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-foreground mb-2">
                    {debtTypeConfig[debtType].amountLabel}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Preview */}
              {totalAmount && Number(totalAmount) > 0 && (
                <div className="mb-4 p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-card"
                    >
                      {(() => {
                        const Icon = debtTypeConfig[debtType].icon;
                        return <Icon size={20} style={{ color: debtTypeConfig[debtType].color }} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{person || 'Person Name'}</p>
                      <p className="text-muted-foreground text-sm">{description || 'Description'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">
                        {debtTypeConfig[debtType].amountLabel}
                      </p>
                      <p className="text-[#4ECDC4] font-medium">{formatCurrency(Number(paidAmount) || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Remaining</p>
                      <p className="text-destructive font-medium">
                        {formatCurrency(Number(totalAmount) - (Number(paidAmount) || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground text-xs">Progress</span>
                      <span className="text-foreground text-xs">
                        {(((Number(paidAmount) || 0) / Number(totalAmount)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${((Number(paidAmount) || 0) / Number(totalAmount)) * 100}%`,
                          backgroundColor: debtTypeConfig[debtType].color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={18} className="inline animate-spin mr-2" /> : null}
                  Add {debtTypeConfig[debtType].label}
                </Button>
              </div>
            </Card>
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
              <Card className="flex flex-col overflow-hidden flex-1">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                  <h3 className="text-foreground text-2xl">Mark as Received</h3>
                  <button
                    onClick={() => setShowReceiveForm(false)}
                    className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center transition-all"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                  {/* Info Box */}
                  {isNewUser && (
                    <div className="mb-6 p-4 bg-[#4ECDC4]/10 rounded-xl border-2 border-[#4ECDC4]/30">
                      <div className="flex items-start gap-3">
                        <Info size={20} className="text-[#4ECDC4] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground font-medium mb-1">How it works:</p>
                          <p className="text-muted-foreground text-sm">
                            When you mark money as received, an <span className="text-[#4ECDC4] font-medium">Income transaction</span> will be automatically created in your selected account, and the account balance will be updated accordingly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2 Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Debt Details & Inputs */}
                    <div>
                      {/* Debt Details */}
                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Debt Details</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Person</p>
                            <p className="text-foreground font-medium">{selectedDebt.person}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Total Amount</p>
                            <p className="text-foreground font-medium">{formatCurrency(selectedDebt.totalAmount)}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl col-span-2">
                            <p className="text-muted-foreground text-xs mb-1">Description</p>
                            <p className="text-foreground">{selectedDebt.description}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Received</p>
                            <p className="text-[#4ECDC4] font-medium">{formatCurrency(selectedDebt.amount)}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Outstanding</p>
                            <p className="text-destructive font-medium">{formatCurrency(selectedDebt.totalAmount - selectedDebt.amount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Receive Amount (VND)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={receiveAmount}
                          onChange={(e) => setReceiveAmount(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Receive Date</label>
                        <Input
                          type="date"
                          value={receiveDate}
                          onChange={(e) => setReceiveDate(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Note (Optional)</label>
                        <Input
                          type="text"
                          placeholder="First payment, Second installment..."
                          value={receiveNote}
                          onChange={(e) => setReceiveNote(e.target.value)}
                        />
                        {receiveAmount && Number(receiveAmount) > (selectedDebt.totalAmount - selectedDebt.amount) && (
                          <p className="text-destructive text-sm mt-2">⚠️ Amount exceeds outstanding balance</p>
                        )}
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">
                          Account to Receive Money <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={receiveAccount}
                          onValueChange={(val) => setReceiveAccount(val)}
                        >
                          <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} - {formatCurrency(account.balance)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!receiveAccount && receiveAmount && Number(receiveAmount) > 0 && (
                          <p className="text-destructive text-sm mt-2">⚠️ Please select an account to record this transaction</p>
                        )}
                        {receiveAccount && (
                          <p className="text-[#4ECDC4] text-sm mt-2">✓ Income transaction will be created</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => setShowReceiveForm(false)}>
                          Cancel
                        </Button>
                        <Button
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
                                setReceiveDate(getLocalISODate());
                                setReceiveNote('');
                                setReceiveAccount('');
                              } catch (err) {
                                console.error('Failed to mark as received:', err);
                              }
                            }
                          }}>
                          Confirm
                        </Button>
                      </div>
                    </div>

                    {/* Right Column - Preview & Payment History */}
                    <div>
                      {/* Preview */}
                      {receiveAmount && Number(receiveAmount) > 0 && Number(receiveAmount) <= (selectedDebt.totalAmount - selectedDebt.amount) && (
                        <div className="mb-5 p-4 bg-muted rounded-xl">
                          <p className="text-muted-foreground mb-4">Preview After Update</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">New Total Received</p>
                              <p className="text-[#4ECDC4] text-xl font-medium">
                                {formatCurrency(selectedDebt.amount + Number(receiveAmount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">New Remaining</p>
                              <p className="text-destructive text-xl font-medium">
                                {formatCurrency(selectedDebt.totalAmount - selectedDebt.amount - Number(receiveAmount))}
                              </p>
                            </div>
                          </div>

                          {/* Progress Comparison */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-muted-foreground text-sm">Current Progress</span>
                                <span className="text-foreground text-sm">
                                  {((selectedDebt.amount / selectedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-muted-foreground rounded-full"
                                  style={{
                                    width: `${(selectedDebt.amount / selectedDebt.totalAmount) * 100}%`,
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
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4ECDC4] rounded-full"
                                  style={{
                                    width: `${((selectedDebt.amount + Number(receiveAmount)) / selectedDebt.totalAmount) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Transaction Preview */}
                          {receiveAccount && (
                            <div className="mt-4 p-3 bg-[#4ECDC4]/10 rounded-xl border-2 border-[#4ECDC4]/30">
                              <p className="text-foreground font-medium mb-2 text-sm">📝 Transaction to be created:</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-muted-foreground">• Type: <span className="text-[#4ECDC4] font-medium">Income</span></p>
                                <p className="text-muted-foreground">• Amount: <span className="text-foreground font-medium">{formatCurrency(Number(receiveAmount))}</span></p>
                                <p className="text-muted-foreground">• Account: <span className="text-foreground font-medium">          {accounts.find(a => a.id === receiveAccount)?.name}</span></p>
                                <p className="text-muted-foreground">• Category: <span className="text-foreground font-medium">Debt Collection</span></p>
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
                            <label className="block text-foreground">Payment History</label>
                            <span className="text-muted-foreground text-sm">
                              {selectedDebt.paymentHistory.length} payment{selectedDebt.paymentHistory.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="bg-muted p-4 rounded-xl">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">Total Received</p>
                                <p className="text-[#4ECDC4] text-lg font-medium">{formatCurrency(selectedDebt.amount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">Number of Payments</p>
                                <p className="text-foreground text-lg font-medium">{selectedDebt.paymentHistory.length} times</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="max-h-[280px] overflow-y-auto space-y-3">
                              {selectedDebt.paymentHistory
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-start gap-3 p-3 bg-card rounded-xl"
                                  >
                                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                                      <Clock size={16} className="text-[#4ECDC4]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-[#4ECDC4] font-medium">
                                          {formatCurrency(payment.amount)}
                                        </p>
                                        <span className="text-muted-foreground text-sm">
                                          {payment.progressAtTime}%
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground text-sm mb-1">
                                        {new Date(payment.date).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </p>
                                      {payment.note && (
                                        <p className="text-muted-foreground text-sm italic">
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
                        <div className="p-8 bg-muted rounded-xl text-center">
                          <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No payment history yet</p>
                          <p className="text-muted-foreground text-sm">This will be the first payment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
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
              <Card className="flex flex-col overflow-hidden flex-1">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                  <h3 className="text-foreground text-2xl">Pay Installment</h3>
                  <button
                    onClick={() => setShowPayForm(false)}
                    className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center transition-all"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                  {/* Info Box */}
                  {isNewUser && (
                    <div className="mb-6 p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30">
                      <div className="flex items-start gap-3">
                        <Info size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground font-medium mb-1">How it works:</p>
                          <p className="text-muted-foreground text-sm">
                            When you pay an installment, an <span className="text-destructive font-medium">Expense transaction</span> will be automatically created, and the selected account balance will be deducted accordingly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2 Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Debt Details & Inputs */}
                    <div>
                      {/* Debt Details */}
                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Debt Details</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Person</p>
                            <p className="text-foreground font-medium">{selectedBorrowedDebt.person}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Total Amount</p>
                            <p className="text-foreground font-medium">{formatCurrency(selectedBorrowedDebt.totalAmount)}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl col-span-2">
                            <p className="text-muted-foreground text-xs mb-1">Description</p>
                            <p className="text-foreground">{selectedBorrowedDebt.description}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Paid</p>
                            <p className="text-[#4ECDC4] font-medium">{formatCurrency(selectedBorrowedDebt.amount)}</p>
                          </div>
                          <div className="bg-muted p-3 rounded-xl">
                            <p className="text-muted-foreground text-xs mb-1">Outstanding</p>
                            <p className="text-destructive font-medium">{formatCurrency(selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Pay Amount (VND)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Pay Date</label>
                        <Input
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                        />
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">Note (Optional)</label>
                        <Input
                          type="text"
                          placeholder="First payment, Second installment..."
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                        />
                        {payAmount && Number(payAmount) > (selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount) && (
                          <p className="text-destructive text-sm mt-2">⚠️ Amount exceeds outstanding balance</p>
                        )}
                      </div>

                      <div className="mb-5">
                        <label className="block text-foreground mb-3">
                          Account to Pay From <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={payAccount}
                          onValueChange={(val) => setPayAccount(val)}
                        >
                          <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} - {formatCurrency(account.balance)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!payAccount && payAmount && Number(payAmount) > 0 && (
                          <p className="text-destructive text-sm mt-2">⚠️ Please select an account to record this transaction</p>
                        )}
                        {payAccount && payAmount && Number(payAmount) > 0 && (
                          <>
                            {(() => {
                              const selectedAccount = accounts.find(a => a.id === payAccount);
                              const payAmountNum = Number(payAmount);
                              if (selectedAccount && selectedAccount.balance < payAmountNum) {
                                return (
                                  <p className="text-destructive text-sm mt-2">
                                    ⚠️ Insufficient balance! Account has {formatCurrency(selectedAccount.balance)}, need {formatCurrency(payAmountNum)}
                                  </p>
                                );
                              }
                              return <p className="text-destructive text-sm mt-2">✓ Expense transaction will be created</p>;
                            })()}
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => setShowPayForm(false)}>
                          Cancel
                        </Button>
                        <Button
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
                                setPayDate(getLocalISODate());
                                setPayNote('');
                                setPayAccount('');
                              } catch (err) {
                                console.error('Failed to pay installment:', err);
                              }
                            }
                          }}>
                          Confirm
                        </Button>
                      </div>
                    </div>

                    {/* Right Column - Preview & Payment History */}
                    <div>
                      {/* Preview */}
                      {payAmount && Number(payAmount) > 0 && Number(payAmount) <= (selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount) && (
                        <div className="mb-5 p-4 bg-muted rounded-xl">
                          <p className="text-muted-foreground mb-4">Preview After Update</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">New Total Paid</p>
                              <p className="text-[#4ECDC4] text-xl font-medium">
                                {formatCurrency(selectedBorrowedDebt.amount + Number(payAmount))}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">New Remaining</p>
                              <p className="text-destructive text-xl font-medium">
                                {formatCurrency(selectedBorrowedDebt.totalAmount - selectedBorrowedDebt.amount - Number(payAmount))}
                              </p>
                            </div>
                          </div>

                          {/* Progress Comparison */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-muted-foreground text-sm">Current Progress</span>
                                <span className="text-foreground text-sm">
                                  {((selectedBorrowedDebt.amount / selectedBorrowedDebt.totalAmount) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-muted-foreground rounded-full"
                                  style={{
                                    width: `${(selectedBorrowedDebt.amount / selectedBorrowedDebt.totalAmount) * 100}%`,
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
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4ECDC4] rounded-full"
                                  style={{
                                    width: `${((selectedBorrowedDebt.amount + Number(payAmount)) / selectedBorrowedDebt.totalAmount) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Transaction Preview */}
                          {payAccount && (
                            <div className="mt-4 p-3 bg-destructive/10 rounded-xl border-2 border-destructive/30">
                              <p className="text-foreground font-medium mb-2 text-sm">📝 Transaction to be created:</p>
                              <div className="space-y-1 text-sm">
                                <p className="text-muted-foreground">• Type: <span className="text-destructive font-medium">Expense</span></p>
                                <p className="text-muted-foreground">• Amount: <span className="text-foreground font-medium">{formatCurrency(Number(payAmount))}</span></p>
                                <p className="text-muted-foreground">• Account: <span className="text-foreground font-medium">          {accounts.find(a => a.id === payAccount)?.name}</span></p>
                                <p className="text-muted-foreground">• Category: <span className="text-foreground font-medium">Debt Payment</span></p>
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
                            <label className="block text-foreground">Payment History</label>
                            <span className="text-muted-foreground text-sm">
                              {selectedBorrowedDebt.paymentHistory.length} payment{selectedBorrowedDebt.paymentHistory.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="bg-muted p-4 rounded-xl">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">Total Paid</p>
                                <p className="text-[#4ECDC4] text-lg font-medium">{formatCurrency(selectedBorrowedDebt.amount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">Number of Payments</p>
                                <p className="text-foreground text-lg font-medium">{selectedBorrowedDebt.paymentHistory.length} times</p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="max-h-[280px] overflow-y-auto space-y-3">
                              {selectedBorrowedDebt.paymentHistory
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex items-start gap-3 p-3 bg-card rounded-xl"
                                  >
                                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                                      <Clock size={16} className="text-[#4ECDC4]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-[#4ECDC4] font-medium">
                                          {formatCurrency(payment.amount)}
                                        </p>
                                        <span className="text-muted-foreground text-sm">
                                          {payment.progressAtTime}%
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground text-sm mb-1">
                                        {new Date(payment.date).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </p>
                                      {payment.note && (
                                        <p className="text-muted-foreground text-sm italic">
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
                        <div className="p-8 bg-muted rounded-xl text-center">
                          <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No payment history yet</p>
                          <p className="text-muted-foreground text-sm">This will be the first payment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

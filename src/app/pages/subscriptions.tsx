import { useState, useMemo, ChangeEvent } from 'react';
import { Music, Tv, MessageSquare, Palette, Calendar, AlertCircle, Plus, DollarSign, Loader2, Trash2, Pencil, type LucideIcon } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select';
import { formatCurrency, daysUntil } from '../store';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const iconMap: Record<string, LucideIcon> = { Music, Tv, MessageSquare, Palette };

const ICON_OPTIONS = ['Music', 'Tv', 'MessageSquare', 'Palette'];
const COLOR_OPTIONS = [
  { label: 'Purple', value: '#6C63FF' },
  { label: 'Teal', value: '#4ECDC4' },
  { label: 'Red', value: '#E50914' },
  { label: 'Green', value: '#10A37F' },
  { label: 'Orange', value: '#FF9500' },
  { label: 'Pink', value: '#FFB6B9' },
];
const SUBSCRIPTION_TAGS = ['Entertainment', 'Productivity', 'Work', 'Health', 'Education', 'Other'];

export function Subscriptions() {
  const { subscriptions, loading, addSubscription, deleteSubscription, updateSubscription } = useSubscriptions();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subDate, setSubDate] = useState('');
  const [subIcon, setSubIcon] = useState('Music');
  const [subColor, setSubColor] = useState('#6C63FF');
  const [subTag, setSubTag] = useState('Entertainment');
  const [subBillingCycle, setSubBillingCycle] = useState<'monthly'|'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalMonthly = useMemo(() => subscriptions.reduce((s, sub) => s + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount), 0), [subscriptions]);
  const totalYearly = useMemo(() => subscriptions.reduce((s, sub) => s + (sub.billingCycle === 'yearly' ? sub.amount : sub.amount * 12), 0), [subscriptions]);

  const nextPayment = useMemo(() => {
    if (subscriptions.length === 0) return null;
    return [...subscriptions].sort((a, b) =>
      new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
    )[0];
  }, [subscriptions]);

  const mostExpensive = useMemo(() => {
    if (subscriptions.length === 0) return null;
    return subscriptions.reduce((max, s) => s.amount > max.amount ? s : max, subscriptions[0]);
  }, [subscriptions]);

  // By tag breakdown
  const byTag = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach(s => {
      const monthlyAmount = s.billingCycle === 'yearly' ? s.amount / 12 : s.amount;
      map[s.category] = (map[s.category] || 0) + monthlyAmount;
    });
    return Object.entries(map).map(([name, amount]) => ({ name, amount }));
  }, [subscriptions]);

  // Spending trend (replicate for 6 months)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({ month, amount: totalMonthly }));
  }, [totalMonthly]);

  const resetForm = () => {
    setSubName(''); setSubAmount(''); setSubDate(''); setSubBillingCycle('monthly');
    setSubTag('Entertainment'); setSubIcon('Music'); setSubColor('#6C63FF');
    setEditingId(null); setSubmitError(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    setEditingId(sub.id);
    setSubName(sub.name);
    setSubAmount(String(sub.amount));
    setSubDate(sub.nextPaymentDate);
    setSubIcon(sub.icon);
    setSubColor(sub.color);
    setSubTag(sub.category);
    setSubBillingCycle(sub.billingCycle);
    setSubmitError(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!subName || !subAmount || !subDate) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Basic validation
      const amountNum = Number(subAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      const payload = {
        name: subName.trim(),
        amount: amountNum,
        nextPaymentDate: subDate, // Expected YYYY-MM-DD
        icon: subIcon,
        color: subColor,
        category: subTag,
        billingCycle: subBillingCycle,
      };

      if (editingId) {
        await updateSubscription(editingId, payload);
      } else {
        await addSubscription(payload);
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      // Extract detailed error from Supabase if available
      const message = err.details || err.message || JSON.stringify(err);
      setSubmitError(message);
      console.error('Full subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-3xl mb-2">Premium Subscriptions</h1>
          <p className="text-muted-foreground">Track and manage your recurring subscriptions</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={20} className="inline mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">{editingId ? 'Edit Subscription' : 'New Subscription'}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-foreground mb-2">Name</label>
                <Input type="text" placeholder="Netflix, Spotify..." value={subName} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubName(e.target.value)} />
              </div>
              <div>
                <label className="block text-foreground mb-2">Monthly Amount (VND)</label>
                <Input type="number" placeholder="0" value={subAmount} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-foreground mb-2">Next Payment Date</label>
                <Input type="date" value={subDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-foreground mb-2">Classification Tag</label>
                <Select value={subTag} onValueChange={(val) => setSubTag(val)}>
                  <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_TAGS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-foreground mb-2">Billing Cycle</label>
                <Select value={subBillingCycle} onValueChange={(val) => setSubBillingCycle(val as 'monthly' | 'yearly')}>
                  <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-foreground mb-2">Icon</label>
                <Select value={subIcon} onValueChange={(val) => setSubIcon(val)}>
                  <SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-foreground mb-2">Color</label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSubColor(c.value)}
                      className={`w-10 h-10 rounded-xl transition-all ${subColor === c.value ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle size={20} />
                <p>{submitError}</p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button variant="secondary" onClick={handleCloseForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} className="inline animate-spin mr-1" /> : null}
                {editingId ? 'Save Changes' : 'Save Subscription'}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign size={24} className="text-primary" />
              <p className="text-muted-foreground">Monthly Total</p>
            </div>
            <p className="text-3xl text-primary mb-2">{formatCurrency(totalMonthly)}</p>
            <p className="text-muted-foreground text-sm">{subscriptions.length} active subs</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={24} className="text-[#4ECDC4]" />
              <p className="text-muted-foreground">Yearly Total</p>
            </div>
            <p className="text-3xl text-[#4ECDC4] mb-2">{formatCurrency(totalYearly)}</p>
            <p className="text-muted-foreground text-sm">Annual spending</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={24} className="text-[#FFC75F]" />
              <p className="text-muted-foreground">Next Payment</p>
            </div>
            {nextPayment ? (
              <>
                <p className="text-3xl text-[#FFC75F] mb-2">{daysUntil(nextPayment.nextPaymentDate)}d</p>
                <p className="text-muted-foreground text-sm">{nextPayment.name}</p>
              </>
            ) : (
              <p className="text-muted-foreground">No subscriptions</p>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Tv size={24} className="text-[#FFB6B9]" />
              <p className="text-muted-foreground">Most Expensive</p>
            </div>
            {mostExpensive ? (
              <>
                <p className="text-3xl text-[#FFB6B9] mb-2">{formatCurrency(mostExpensive.amount)}</p>
                <p className="text-muted-foreground text-sm">{mostExpensive.name}</p>
              </>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-2">
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">Subscription Spending Trend</h3>
            <div className="bg-muted p-4 rounded-xl">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="amount" fill="#6C63FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* By Tag */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">By Tag</h3>
            <div className="space-y-4">
              {byTag.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data</p>
              ) : byTag.map(cat => {
                const percentage = totalMonthly > 0 ? (cat.amount / totalMonthly) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-foreground text-xl mb-6">Active Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No subscriptions yet. Add your first one!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {subscriptions.map((subscription, index) => {
              const Icon = iconMap[subscription.icon] || Music;
              const days = daysUntil(subscription.nextPaymentDate);
              const isUpcoming = days <= 5;
              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-muted">
                          <Icon size={32} style={{ color: subscription.color }} />
                        </div>
                        <div>
                          <p className="text-foreground text-lg mb-1">{subscription.name}</p>
                          <p className="text-muted-foreground text-sm">{subscription.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground text-2xl mb-1">{formatCurrency(subscription.amount)}</p>
                        <p className="text-muted-foreground text-sm">/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</p>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-muted-foreground" />
                          <span className="text-muted-foreground">Next Payment</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">
                            {new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs ${isUpcoming ? 'bg-[#FFC75F] text-white' : 'bg-[#4ECDC4] text-white'}`}>
                            {days}d
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEdit(subscription.id)}
                        title="Edit subscription"
                      >
                        <Pencil size={16} className="text-primary" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteSubscription(subscription.id)}
                        title="Delete subscription"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Payment Timeline */}
      {subscriptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-8">
          <Card className="p-6">
            <h3 className="text-foreground text-xl mb-6">Upcoming Payment Timeline</h3>
            <div className="grid grid-cols-4 gap-4">
              {[...subscriptions]
                .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
                .map((sub, index) => (
                  <div key={sub.id} className="flex items-center gap-3 bg-muted p-4 rounded-lg">
                    <div className="w-10 h-10 bg-card border rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{sub.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(sub.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-primary text-sm">{formatCurrency(sub.amount)}/{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}</p>
                  </div>
                ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

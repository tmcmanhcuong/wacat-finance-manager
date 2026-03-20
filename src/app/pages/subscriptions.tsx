import { useState, useMemo, ChangeEvent } from 'react';
import { Music, Tv, MessageSquare, Palette, Calendar, AlertCircle, Plus, DollarSign, Loader2, Trash2, type LucideIcon } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton, NeumorphicInput, NeumorphicSelect } from '../components/neumorphic-card';
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
  const { subscriptions, loading, addSubscription, deleteSubscription } = useSubscriptions();

  const [showForm, setShowForm] = useState(false);
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

      await addSubscription({
        name: subName.trim(),
        amount: amountNum,
        nextPaymentDate: subDate, // Expected YYYY-MM-DD
        icon: subIcon,
        color: subColor,
        category: subTag,
        billingCycle: subBillingCycle,
      });
      setShowForm(false);
      setSubName(''); setSubAmount(''); setSubDate(''); setSubBillingCycle('monthly');
      setSubTag('Entertainment');
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
          <Loader2 size={40} className="text-[#6C63FF] animate-spin" />
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-3xl mb-2">Premium Subscriptions</h1>
          <p className="text-[#8B92A0] dark:text-[#8892A0]">Track and manage your recurring subscriptions</p>
        </div>
        <NeumorphicButton variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="inline mr-2" />
          Add Subscription
        </NeumorphicButton>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">New Subscription</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Name</label>
                <NeumorphicInput type="text" placeholder="Netflix, Spotify..." value={subName} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Monthly Amount (VND)</label>
                <NeumorphicInput type="number" placeholder="0" value={subAmount} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Next Payment Date</label>
                <NeumorphicInput type="date" value={subDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setSubDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Classification Tag</label>
                <NeumorphicSelect value={subTag} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubTag(e.target.value)}>
                  {SUBSCRIPTION_TAGS.map(c => <option key={c} value={c}>{c}</option>)}
                </NeumorphicSelect>
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Billing Cycle</label>
                <NeumorphicSelect value={subBillingCycle} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubBillingCycle(e.target.value as 'monthly' | 'yearly')}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </NeumorphicSelect>
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Icon</label>
                <NeumorphicSelect value={subIcon} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubIcon(e.target.value)}>
                  {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </NeumorphicSelect>
              </div>
              <div>
                <label className="block text-[#3D4852] dark:text-[#E2E8F0] mb-2">Color</label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSubColor(c.value)}
                      className={`w-10 h-10 rounded-xl transition-all ${subColor === c.value ? 'ring-4 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]' : ''}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mt-6 p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF6B6B] flex items-center gap-3">
                <AlertCircle size={20} />
                <p>{submitError}</p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <NeumorphicButton onClick={() => setShowForm(false)}>Cancel</NeumorphicButton>
              <NeumorphicButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} className="inline animate-spin mr-1" /> : null}
                Save Subscription
              </NeumorphicButton>
            </div>
          </NeumorphicCard>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign size={24} className="text-[#6C63FF]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Monthly Total</p>
            </div>
            <p className="text-3xl text-[#6C63FF] mb-2">{formatCurrency(totalMonthly)}</p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{subscriptions.length} active subs</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={24} className="text-[#4ECDC4]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Yearly Total</p>
            </div>
            <p className="text-3xl text-[#4ECDC4] mb-2">{formatCurrency(totalYearly)}</p>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">Annual spending</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={24} className="text-[#FFC75F]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Next Payment</p>
            </div>
            {nextPayment ? (
              <>
                <p className="text-3xl text-[#FFC75F] mb-2">{daysUntil(nextPayment.nextPaymentDate)}d</p>
                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{nextPayment.name}</p>
              </>
            ) : (
              <p className="text-[#8B92A0] dark:text-[#8892A0]">No subscriptions</p>
            )}
          </NeumorphicCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Tv size={24} className="text-[#FFB6B9]" />
              <p className="text-[#8B92A0] dark:text-[#8892A0]">Most Expensive</p>
            </div>
            {mostExpensive ? (
              <>
                <p className="text-3xl text-[#FFB6B9] mb-2">{formatCurrency(mostExpensive.amount)}</p>
                <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{mostExpensive.name}</p>
              </>
            ) : (
              <p className="text-[#8B92A0] dark:text-[#8892A0]">—</p>
            )}
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-2">
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Subscription Spending Trend</h3>
            <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.3)" />
                  <XAxis dataKey="month" stroke="#8B92A0" />
                  <YAxis stroke="#8B92A0" tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#E0E5EC', border: 'none', borderRadius: '16px', boxShadow: '4px 4px 8px rgba(163,177,198,0.6)' }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="amount" fill="#6C63FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* By Tag */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">By Tag</h3>
            <div className="space-y-4">
              {byTag.length === 0 ? (
                <p className="text-center text-[#8B92A0] dark:text-[#8892A0] py-8">No data</p>
              ) : byTag.map(cat => {
                const percentage = totalMonthly > 0 ? (cat.amount / totalMonthly) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#3D4852] dark:text-[#E2E8F0]">{cat.name}</span>
                      <span className="text-[#8B92A0] dark:text-[#8892A0]">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)] overflow-hidden">
                      <div className="h-full rounded-full bg-[#6C63FF]" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Subscription Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Active Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <NeumorphicCard className="p-12 text-center">
            <DollarSign size={48} className="mx-auto mb-4 text-[#8B92A0] dark:text-[#8892A0] opacity-30" />
            <p className="text-[#8B92A0] dark:text-[#8892A0]">No subscriptions yet. Add your first one!</p>
          </NeumorphicCard>
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
                  <NeumorphicCard className="p-6 hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.5)] hover:dark:shadow-[6px_6px_12px_rgba(14,18,28,0.9),-6px_-6px_12px_rgba(42,49,68,0.5)] transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] dark:shadow-[inset_4px_4px_8px_rgba(14,18,28,0.9),inset_-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center bg-[#E0E5EC] dark:bg-[#252C3E]">
                          <Icon size={32} style={{ color: subscription.color }} />
                        </div>
                        <div>
                          <p className="text-[#3D4852] dark:text-[#E2E8F0] text-lg mb-1">{subscription.name}</p>
                          <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">{subscription.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl mb-1">{formatCurrency(subscription.amount)}</p>
                        <p className="text-[#8B92A0] dark:text-[#8892A0] text-sm">/{subscription.billingCycle === 'yearly' ? 'year' : 'month'}</p>
                      </div>
                    </div>

                    <div className="bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[inset_3px_3px_6px_rgba(14,18,28,0.9),inset_-3px_-3px_6px_rgba(42,49,68,0.5)] mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-[#8B92A0] dark:text-[#8892A0]" />
                          <span className="text-[#8B92A0] dark:text-[#8892A0]">Next Payment</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#3D4852] dark:text-[#E2E8F0]">
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
                      <button
                        onClick={() => deleteSubscription(subscription.id)}
                        className="w-10 h-10 rounded-xl bg-[#E0E5EC] dark:bg-[#252C3E] shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.4)] dark:shadow-[3px_3px_6px_rgba(14,18,28,0.9),-3px_-3px_6px_rgba(42,49,68,0.5)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] hover:dark:shadow-[2px_2px_4px_rgba(14,18,28,0.9),-2px_-2px_4px_rgba(42,49,68,0.5)] flex items-center justify-center transition-all"
                      >
                        <Trash2 size={16} className="text-[#FF6B6B]" />
                      </button>
                    </div>
                  </NeumorphicCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Payment Timeline */}
      {subscriptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-8">
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] dark:text-[#E2E8F0] text-xl mb-6">Upcoming Payment Timeline</h3>
            <div className="grid grid-cols-4 gap-4">
              {[...subscriptions]
                .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
                .map((sub, index) => (
                  <div key={sub.id} className="flex items-center gap-3 bg-[#E0E5EC] dark:bg-[#252C3E] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_2px_2px_4px_rgba(14,18,28,0.9),inset_-2px_-2px_4px_rgba(42,49,68,0.5)]">
                    <div className="w-10 h-10 bg-[#E0E5EC] dark:bg-[#252C3E] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(14,18,28,0.9),-4px_-4px_8px_rgba(42,49,68,0.5)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#6C63FF]">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#3D4852] dark:text-[#E2E8F0] truncate">{sub.name}</p>
                      <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs">
                        {new Date(sub.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-[#6C63FF] text-sm">{formatCurrency(sub.amount)}/{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}</p>
                  </div>
                ))}
            </div>
          </NeumorphicCard>
        </motion.div>
      )}
    </div>
  );
}

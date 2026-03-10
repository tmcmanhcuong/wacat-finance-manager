import { Music, Tv, MessageSquare, Palette, Calendar, AlertCircle, Plus, DollarSign } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton } from '../components/neumorphic-card';
import { mockSubscriptions, formatCurrency, daysUntil } from '../store';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const iconMap: Record<string, any> = {
  Music,
  Tv,
  MessageSquare,
  Palette,
};

export function Subscriptions() {
  const totalMonthly = mockSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalYearly = totalMonthly * 12;
  const nextPayment = [...mockSubscriptions].sort((a, b) => 
    new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
  )[0];

  // Chart data - subscription costs over months
  const monthlyData = [
    { month: 'Jan', amount: 1358000 },
    { month: 'Feb', amount: 1358000 },
    { month: 'Mar', amount: totalMonthly },
    { month: 'Apr', amount: totalMonthly },
    { month: 'May', amount: totalMonthly },
    { month: 'Jun', amount: totalMonthly },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#3D4852] text-3xl mb-2">Premium Subscriptions</h1>
          <p className="text-[#8B92A0]">Track and manage your recurring subscriptions</p>
        </div>
        <NeumorphicButton variant="primary">
          <Plus size={20} className="inline mr-2" />
          Add Subscription
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
              <DollarSign size={24} className="text-[#6C63FF]" />
              <p className="text-[#8B92A0]">Monthly Total</p>
            </div>
            <p className="text-3xl text-[#6C63FF] mb-2">{formatCurrency(totalMonthly)}</p>
            <p className="text-[#8B92A0] text-sm">{mockSubscriptions.length} active subs</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={24} className="text-[#4ECDC4]" />
              <p className="text-[#8B92A0]">Yearly Total</p>
            </div>
            <p className="text-3xl text-[#4ECDC4] mb-2">{formatCurrency(totalYearly)}</p>
            <p className="text-[#8B92A0] text-sm">Annual spending</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={24} className="text-[#FFC75F]" />
              <p className="text-[#8B92A0]">Next Payment</p>
            </div>
            <p className="text-3xl text-[#FFC75F] mb-2">{daysUntil(nextPayment.nextPaymentDate)}d</p>
            <p className="text-[#8B92A0] text-sm">{nextPayment.name}</p>
          </NeumorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <NeumorphicCard variant="inset" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Tv size={24} className="text-[#FFB6B9]" />
              <p className="text-[#8B92A0]">Most Expensive</p>
            </div>
            <p className="text-3xl text-[#FFB6B9] mb-2">{formatCurrency(Math.max(...mockSubscriptions.map(s => s.amount)))}</p>
            <p className="text-[#8B92A0] text-sm">Adobe CC</p>
          </NeumorphicCard>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Monthly Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2"
        >
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] text-xl mb-6">Subscription Spending Trend</h3>
            <div className="bg-[#E0E5EC] p-4 rounded-3xl shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,177,198,0.3)" />
                  <XAxis dataKey="month" stroke="#8B92A0" />
                  <YAxis stroke="#8B92A0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#E0E5EC', 
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.6)'
                    }}
                  />
                  <Bar dataKey="amount" fill="#6C63FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </NeumorphicCard>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NeumorphicCard className="p-6">
            <h3 className="text-[#3D4852] text-xl mb-6">By Category</h3>
            <div className="space-y-4">
              {[
                { name: 'Entertainment', amount: 258000, color: '#E50914' },
                { name: 'Productivity', amount: 450000, color: '#10A37F' },
                { name: 'Work', amount: 650000, color: '#FF0000' },
              ].map((cat, index) => {
                const percentage = (cat.amount / totalMonthly) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-[#3D4852]">{cat.name}</span>
                      </div>
                      <span className="text-[#8B92A0]">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-[#E0E5EC] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: cat.color,
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

      {/* Subscription Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-[#3D4852] text-xl mb-6">Active Subscriptions</h3>
        <div className="grid grid-cols-2 gap-6">
          {mockSubscriptions.map((subscription, index) => {
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
                <NeumorphicCard className="p-6 hover:shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.5)] transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] flex items-center justify-center"
                        style={{ backgroundColor: '#E0E5EC' }}
                      >
                        <Icon size={32} style={{ color: subscription.color }} />
                      </div>
                      <div>
                        <p className="text-[#3D4852] text-lg mb-1">{subscription.name}</p>
                        <p className="text-[#8B92A0] text-sm">{subscription.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#3D4852] text-2xl mb-1">{formatCurrency(subscription.amount)}</p>
                      <p className="text-[#8B92A0] text-sm">/month</p>
                    </div>
                  </div>

                  {/* Next Payment Info */}
                  <div className="bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-[#8B92A0]" />
                        <span className="text-[#8B92A0]">Next Payment</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#3D4852]">
                          {new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span 
                          className={`px-3 py-1 rounded-full text-xs ${
                            isUpcoming 
                              ? 'bg-[#FFC75F] text-white shadow-[2px_2px_4px_rgba(255,199,95,0.4)]' 
                              : 'bg-[#4ECDC4] text-white shadow-[2px_2px_4px_rgba(78,205,196,0.4)]'
                          }`}
                        >
                          {days} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <NeumorphicButton size="sm">
                      Edit
                    </NeumorphicButton>
                    <NeumorphicButton size="sm">
                      Pause
                    </NeumorphicButton>
                    <NeumorphicButton size="sm" className="text-[#FF6B6B]">
                      Cancel
                    </NeumorphicButton>
                  </div>
                </NeumorphicCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Payment Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8"
      >
        <NeumorphicCard className="p-6">
          <h3 className="text-[#3D4852] text-xl mb-6">Upcoming Payment Timeline</h3>
          <div className="grid grid-cols-4 gap-4">
            {[...mockSubscriptions]
              .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
              .map((sub, index) => (
                <div key={sub.id} className="flex items-center gap-3 bg-[#E0E5EC] p-4 rounded-2xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                  <div className="w-10 h-10 bg-[#E0E5EC] rounded-xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#6C63FF]">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3D4852] truncate">{sub.name}</p>
                    <p className="text-[#8B92A0] text-xs">
                      {new Date(sub.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-[#6C63FF] text-sm">{formatCurrency(sub.amount)}</p>
                </div>
              ))}
          </div>
        </NeumorphicCard>
      </motion.div>
    </div>
  );
}

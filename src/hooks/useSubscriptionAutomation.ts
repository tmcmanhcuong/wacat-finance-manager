import { useMemo, useState } from 'react';
import { useSubscriptions } from './useSubscriptions';
import { useTransactions } from './useTransactions';
import type { Subscription } from '../app/types';
import { getLocalISODate } from '../app/store';

export function useSubscriptionAutomation() {
  const { subscriptions, updateSubscription } = useSubscriptions();
  const { addTransaction } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    return subscriptions
      .filter(sub => {
        const paymentDate = new Date(sub.nextPaymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        // Show if due today, overdue, OR due within 3 days
        return paymentDate.getTime() <= threeDaysFromNow.getTime();
      })
      .map(sub => {
        const paymentDate = new Date(sub.nextPaymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        
        const isDueOrOverdue = paymentDate.getTime() <= today.getTime();
        
        return {
          ...sub,
          status: isDueOrOverdue ? 'due' : 'upcoming' as 'due' | 'upcoming'
        };
      });
  }, [subscriptions]);

  const confirmPayment = async (subscription: Subscription, accountId: string) => {
    setIsProcessing(true);
    try {
      // 1. Create a transaction
      await addTransaction({
        type: 'expense',
        amount: subscription.amount,
        category: 'Subscription',
        date: subscription.nextPaymentDate,
        accountId: accountId,
        description: `${subscription.name} (${subscription.category})`,
      });

      // 2. Calculate next payment date
      const currentDate = new Date(subscription.nextPaymentDate);
      let nextDate = new Date(currentDate);
      
      if (subscription.billingCycle === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else { // default monthly
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      const tzOffset = nextDate.getTimezoneOffset() * 60000;
      const newPaymentDateStr = new Date(nextDate.getTime() - tzOffset).toISOString().split('T')[0];

      // 3. Update subscription
      await updateSubscription(subscription.id, {
        nextPaymentDate: newPaymentDateStr
      });
      
    } catch (error) {
      console.error('Failed to confirm subscription payment', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    pendingPayments,
    confirmPayment,
    isProcessing
  };
}
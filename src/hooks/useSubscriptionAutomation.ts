import { useMemo, useState } from 'react';
import { useSubscriptions } from './useSubscriptions';
import { useTransactions } from './useTransactions';
import type { Subscription } from '../app/types';

export function useSubscriptionAutomation() {
  const { subscriptions, updateSubscription } = useSubscriptions();
  const { addTransaction } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPaymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() <= today.getTime();
    });
  }, [subscriptions]);

  const confirmPayment = async (subscription: Subscription, accountId: string) => {
    setIsProcessing(true);
    try {
      // 1. Create a transaction
      await addTransaction({
        type: 'expense',
        amount: subscription.amount,
        category: subscription.category,
        date: subscription.nextPaymentDate,
        accountId: accountId,
        description: `Subscription: ${subscription.name}`,
      });

      // 2. Calculate next payment date
      const currentDate = new Date(subscription.nextPaymentDate);
      let nextDate = new Date(currentDate);
      
      if (subscription.billingCycle === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else { // default monthly
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      const newPaymentDateStr = nextDate.toISOString().split('T')[0];

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
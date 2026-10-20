import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency } from '../store';
import type { Subscription } from '../types';
import * as Icons from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface PaymentConfirmationModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subscription: Subscription, accountId: string) => Promise<void>;
}

export function PaymentConfirmationModal({
  subscription,
  isOpen,
  onClose,
  onConfirm
}: PaymentConfirmationModalProps) {
  const { accounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!subscription) return null;

  const IconComponent = (Icons as any)[subscription.icon] || AlertCircle;

  const handleConfirm = async () => {
    if (!selectedAccountId) return;
    setIsProcessing(true);
    try {
      await onConfirm(subscription, selectedAccountId);
      onClose();
      // Reset select for next time if we want, or do it on open
      setSelectedAccountId('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 border-t-4 border-t-primary">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subscription.color}20`, color: subscription.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Payment Due
                  </h3>
                  <p className="text-muted-foreground">{subscription.name}</p>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
                  <p className="text-2xl text-foreground">
                    {formatCurrency(subscription.amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Select Account for Payment
                  </label>
                  <Select 
                    value={selectedAccountId} 
                    onValueChange={(val) => setSelectedAccountId(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button 
                  variant="secondary" 
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={!selectedAccountId || isProcessing}
                >
                  {isProcessing ? 'Confirming...' : 'Confirm Payment'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeumorphicCard, NeumorphicButton, NeumorphicSelect } from './neumorphic-card';
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
            <NeumorphicCard variant="extruded" className="p-6 border-t-4 border-[#FFC75F]">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subscription.color}20`, color: subscription.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#3D4852] dark:text-[#E2E8F0]">
                    Payment Due
                  </h3>
                  <p className="text-[#8B92A0] dark:text-[#8892A0]">{subscription.name}</p>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div>
                  <p className="text-sm text-[#8B92A0] dark:text-[#8892A0] mb-1">Amount to pay</p>
                  <p className="text-2xl text-[#3D4852] dark:text-[#E2E8F0]">
                    {formatCurrency(subscription.amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-[#8B92A0] dark:text-[#8892A0] mb-2">
                    Select Account for Payment
                  </label>
                  <NeumorphicSelect 
                    value={selectedAccountId} 
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  >
                    <option value="" disabled>Select an account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </NeumorphicSelect>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <NeumorphicButton 
                  variant="secondary" 
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </NeumorphicButton>
                <NeumorphicButton 
                  variant="primary" 
                  onClick={handleConfirm}
                  disabled={!selectedAccountId || isProcessing}
                >
                  {isProcessing ? 'Confirming...' : 'Confirm Payment'}
                </NeumorphicButton>
              </div>
            </NeumorphicCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
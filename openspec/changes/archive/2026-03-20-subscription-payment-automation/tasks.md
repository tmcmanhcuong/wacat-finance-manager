# Tasks: Subscription Payment Automation

- [x] **Task 1: Update Data Model & Types**
  - [x] Modify `Subscription` interface in `src/app/types.ts` to add `billingCycle: 'monthly' | 'yearly'`.
  - [x] Update `mapSubscription` in `src/services/subscriptions.ts` to handle the new field.
  - [x] Run SQL migration in Supabase to add `billing_cycle` column to `subscriptions` table.

- [x] **Task 2: Update Subscription Form UI**
  - [x] Modify `src/app/pages/subscriptions.tsx` to include a `NeumorphicSelect` for Billing Cycle (Monthly / Yearly).
  - [x] Ensure the new field is saved correctly to Supabase.

- [x] **Task 3: Develop Automation Hook**
  - [x] Create `src/hooks/useSubscriptionAutomation.ts`.
  - [x] Implement logic to filter subscriptions where `next_payment_date <= current_date`.
  - [x] Implement `handleConfirmPayment` which:
    - [x] Creates a `Transaction` via `useTransactions.addTransaction`.
    - [x] Updates the subscription `next_payment_date` (adds 1 month or 1 year) via `useSubscriptions.updateSubscription`.
    - [x] Handles errors and rollbacks if needed.

- [x] **Task 4: Implement Payment Confirmation Modal**
  - [x] Create `src/app/components/payment-confirmation-modal.tsx`.
  - [x] Use `motion.div` for entry animation.
  - [x] Use `NeumorphicSelect` for Account selection (populated from `useAccounts`).
  - [x] Ensure proper `LucideIcon` types and Neumorphism styling (`extruded` variant).

- [x] **Task 5: Integrate with Dashboard**
  - [x] Modify `src/app/pages/dashboard.tsx` to import and use `useSubscriptionAutomation`.
  - [x] Display a "Pending Payments" alert card if overdue subscriptions exist.
  - [x] Trigger the `PaymentConfirmationModal` on button click.

- [x] **Task 6: Validation & Testing**
  - [x] Create a mock subscription with a date in the past.
  - [x] Verify it appears on the Dashboard.
  - [x] Confirm payment and check:
    - [x] New transaction is created in `Transactions` page.
    - [x] Account balance is updated.
    - [x] Subscription `next_payment_date` is pushed forward.
    - [x] The pending alert disappears from Dashboard.

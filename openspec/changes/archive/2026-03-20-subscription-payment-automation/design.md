# Design: Subscription Payment Automation

## Architectural Strategy
The automation logic will be handled through a new hook called `useSubscriptionAutomation`. This hook will scan for any subscription with a `next_payment_date` in the past or on the current date and provide these as "pending" actions to the UI.

### Logic Flow (Confirming a Payment)
1. User clicks "Confirm Payment" for a pending subscription.
2. Select account from a dropdown (populated by `useAccounts`).
3. Click "Finalize":
   - Call `addTransaction` from `useTransactions` with account, amount, and subscription metadata.
   - Update `Subscription`'s `next_payment_date`:
     - If `billing_cycle === 'monthly'`: Add 1 month.
     - If `billing_cycle === 'yearly'`: Add 1 year.
   - Update the local subscription state (Optimistic update).

## UI/UX Design

### Dashboard Integration
A "Pending Payments" section will be added at the top of the `Dashboard` (below the Header).
- **Shadow:** `extruded` variant of `NeumorphicCard`.
- **Accent:** `warning` (#FFC75F) border or indicator.
- **Micro-interaction:** Fade-in animation when pending payments exist.

### Payment Modal
A new modal component `PaymentConfirmationModal`:
- **Overlay:** `motion.div` with backdrop-blur.
- **Content Card:** `NeumorphicCard` (variant: extruded).
- **Elements:**
  - Header: Subscription Name & Icon.
  - Body: Amount (formatted via `formatCurrency`), Account Selection (`NeumorphicSelect`).
  - Footer: "Confirm" (`NeumorphicButton` primary) and "Skip/Cancel" (`NeumorphicButton` secondary).

## Database & Data Changes

### Schema Update
Update `Subscription` interface in `src/app/types.ts`:
```typescript
export interface Subscription {
  // ... existing fields
  billingCycle: 'monthly' | 'yearly';
}
```
Update `subscriptions` table:
```sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));
```

## Security & Performance
- **Data Integrity:** The payment process is atomic: transaction creation and subscription update are linked.
- **Performance:** Scanning subscriptions occurs on client-side (app load) as the list is typically small (< 50 items).
- **Rerenders:** Use `useMemo` to filter pending payments from the full list to avoid redundant recalculations.

## Implementation Steps Preview
1. Extend types and database schema.
2. Update subscription creation form to include billing cycle selection.
3. Develop the `useSubscriptionAutomation` hook.
4. Implement the `PaymentConfirmationModal`.
5. Integrate with the Dashboard.

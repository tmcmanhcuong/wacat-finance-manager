# Proposal: Subscription Payment Automation

## Problem Statement
Currently, the subscription feature is purely informational. Users can track their upcoming payments, but the system does not automatically record transactions or deduct balances when a payment is due. This leads to manual effort and potential inconsistency between the subscription list and actual account balances.

## Proposed Solution
Introduce a "Pending Payment" system that identifies subscriptions due for payment. When a user opens the app, they will be notified of these pending payments and can confirm them by selecting a specific account (e.g., MB Bank, Momo) for that specific month's transaction.

## Scope
- Identify subscriptions where `next_payment_date <= current_date`.
- Create a dashboard notification/section for pending payments.
- Implement a confirmation flow allowing users to choose the account at the time of payment.
- Automatically create a `Transaction` (expense) and update the account balance upon confirmation.
- Update the subscription's `next_payment_date` to the following period.

## Affected Components
- **Data Model:** Update `Subscription` interface in `src/app/types.ts` to include `billing_cycle` ('monthly' | 'yearly').
- **Hooks:** New `useSubscriptionAutomation.ts` (or update `useSubscriptions.ts`).
- **Pages:** `dashboard.tsx` (add Pending Payments section), `subscriptions.tsx` (update form to include billing cycle).
- **UI:** New `PaymentConfirmationModal`.

## Non-goals
- Fully automated "silent" payments without user consent.
- Integration with actual bank APIs or automated scrapers.
- Support for complex recurring patterns (e.g., bi-weekly, every 3 months) in this phase.

## Data Models Involved
- `Subscription`
- `Transaction`
- `Account`

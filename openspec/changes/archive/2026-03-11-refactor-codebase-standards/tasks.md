## 1. Preparation & Configuration

- [x] 1.1 Review and update `tsconfig.json` in root to ensure `strict: true` and `noImplicitAny: true` are enforced.
- [x] 1.2 Review and update `vite.config.ts` (if needed) for production readiness and confirm build script logic.

## 2. Centralizing Data Models

- [x] 2.1 Audit `src/app/types.ts` to ensure all core models (`Account`, `Transaction`, `Category`, `Debt`, `Subscription`) are exported correctly and completely.
- [x] 2.2 Update `src/app/store.ts` to use explicit return types and parameters for all mock data utility functions (`formatCurrency`, etc.), completely removing any `any` types.

## 3. Extracting Business Logic to Hooks

- [x] 3.1 Create/Audit `src/hooks/useAccounts.ts` to securely manage account state and mutations, ensuring balance updates are strictly typed.
- [x] 3.2 Create/Audit `src/hooks/useTransactions.ts` to handle transaction logic. Must explicitly handle account balance updates and exclude `type === "transfer"` from stats.
- [x] 3.3 Create/Audit `src/hooks/useDebts.ts` to handle debt-specific logic (e.g., "Mark as Received", "Pay Installment"). Ensure it validates sufficient balance and generates associated transactions correctly.

## 4. Page Refactoring & Standardization

- [x] 4.1 Refactor `src/app/pages/transactions.tsx`: Remove inline state logic, integrate `useTransactions`. Ensure import sequence follows standards. UI tasks: specify `NeumorphicCard` variants ("extruded", "inset", "flat") and `rounded-[32px]` border radius where applicable.
- [x] 4.2 Refactor `src/app/pages/debts.tsx`: Integrate `useDebts`, ensuring debt payments correctly update account balances. UI tasks: verify UI shadow variants ("extruded" for main cards, "inset" for details/progress).
- [x] 4.3 Refactor `src/app/pages/accounts.tsx`: Integrate `useAccounts`, enforce strict types for account iteration, and verify import ordering.
- [x] 4.4 Refactor `src/app/pages/categories.tsx`: Enforce explicit typing for category states, removing implicit any from event handlers.
- [x] 4.5 Refactor `src/app/pages/subscriptions.tsx`: Enforce explicit typing for subscription mappings and calculations.
- [x] 4.6 Refactor `src/app/pages/dashboard.tsx`: Ensure stats calculation explicitly leverages strictly typed hooks and correctly filters out `type === "transfer"`.

## 5. UI Components Standardization

- [x] 5.1 Audit `src/app/components/neumorphic-card.tsx` to ensure all variant typings (`"extruded" | "inset" | "flat"`) are strictly enforced and className merges correctly.
- [x] 5.2 Validate `src/app/components/sidebar.tsx` for correct min-height touch targets (`min-h-[56px]`) and strict router Link typings.

## 6. End-to-End Validation

- [x] 6.1 Clean up any remaining `console.log` statements across all refined files.
- [x] 6.2 Run `npm run build` and `npx tsc --noEmit` to ensure there are zero TypeScript compilation errors or unresolved imports. End-to-end verification.
- [x] 6.3 Manually test the "Mark as Received" flow in Debts to ensure it updates the balance and creates an income transaction.

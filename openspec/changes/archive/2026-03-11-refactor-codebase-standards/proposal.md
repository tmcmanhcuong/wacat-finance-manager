## Why
- The current codebase may contain inconsistencies in TypeScript typing, file structures, and code organization due to rapid prototyping.
- To ensure long-term maintainability, ease of deployment (CI/CD readiness), and smooth future feature development, a comprehensive refactor to meet strict standards is necessary.
- This addresses technical debt early to prevent structural issues when scaling the application further.

## What Changes
- Standardize all file structures, import sequences, and component logic across pages (`dashboard.tsx`, `transactions.tsx`, `accounts.tsx`, `debts.tsx`, `categories.tsx`, `subscriptions.tsx`).
- Eliminate implicit `any` types and enforce strict typing by centralizing interfaces in `types.ts`.
- Separate complex business logic into custom hooks or utility functions to decouple it from UI components.
- Consolidate Neumorphic UI variants (extruded/inset/flat) usage to ensure consistency.
- Prepare and audit project configuration (`tsconfig.json`, `vite.config.ts`, etc.) for strict production builds.

## Non-goals
- We will NOT be adding new user-facing features or drastically altering the existing Neumorphism UI design system.
- We will NOT change the core data models' structures or migrate to a real backend (mock data implementation remains for now).

## Capabilities

### New Capabilities
- `codebase-standardization`: Establishes architectural guidelines, strict typing rules, and project layout standards for deployment and maintenance.

### Modified Capabilities

## Impact
- **Affected Pages**: All routes inside `src/app/pages/`.
- **Affected Components**: Shared components in `src/app/components/` (e.g., `neumorphic-card.tsx`).
- **Data Models**: Strong enforcement of `types.ts` (`Account`, `Transaction`, `Category`, `Debt`, `Subscription`).
- **Build System**: Stricter TypeScript compilation and optimized Vite build pipeline.

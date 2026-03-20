## Context

The current WaCat Finance Manager codebase was built rapidly to validate the design and user flows. It currently has inconsistencies in TypeScript typing, redundant UI logic across various pages, and lacks a centralized architecture for sharing business logic. As the application moves toward deployment, CI/CD, and scaling, these structural issues will cause bugs and maintenance bottlenecks.

## Goals / Non-Goals

**Goals:**
- Unify import structures, file organization, and naming conventions (kebab-case) across the project.
- Implement strict TypeScript typing for all components, avoiding `any`.
- Decouple business logic from UI rendering by introducing domain-specific custom hooks (e.g., `useTransactions`).
- Ready the project for strict production build processes in Vite by auditing `tsconfig.json` and build scripts.

**Non-Goals:**
- Replacing the existing `store.ts` mock backend with a real database.
- Redesigning the Neumorphism UI or changing the Cool Grey color palette.
- Introducing new user-facing features.

## Decisions

**Decision 1: Extract Business Logic to Custom Hooks**
- **Rationale**: Pages like `transactions.tsx` and `debts.tsx` have too much logic mixed with UI rendering. Moving logic to custom hooks makes the UI components cleaner and easier to maintain.
- **Alternatives**: Keeping logic in components (hard to maintain) or moving everything to a global state manager like Redux (overkill for the current SPA scope).

**Decision 2: Enforce Strict Interfaces from a Central `types.ts`**
- **Rationale**: All components must import interfaces exclusively from `types.ts`. We will remove any inline loose typings. This ensures strict type safety across the entire application and makes refactoring safer.

**Decision 3: Standardization of Imports and Naming**
- **Rationale**: Strict import ordering (external libs -> Lucide -> local components -> store/types) makes the codebase predictable and easier for new developers or AI agents to parse.

## Risks / Trade-offs

- **[Risk] Refactoring large pages might cause regressions in the UI.**
  - **Mitigation**: Rely heavily on TypeScript's strict compiler to flag missing props. Perform step-by-step refactoring per file rather than a massive single-commit overhaul.
- **[Risk] Moving logic to hooks might introduce subtle re-rendering issues.**
  - **Mitigation**: Ensure custom hooks use React best practices (`useMemo`, `useCallback`) where needed and rely on manual regression testing for key flows.

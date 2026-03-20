## ADDED Requirements

### Requirement: Strict TypeScript Typing
The system SHALL have all data models strongly typed via `types.ts` and all components MUST use these types without relying on implicit `any`.

#### Scenario: Component compilation
- **WHEN** building the project with Vite and `tsc`
- **THEN** no TypeScript compilation errors related to missing types or `any` are allowed

### Requirement: Centralized Business Logic
The system SHALL separate complex state updates and business logic into domain-specific custom hooks to decouple them from the UI.

#### Scenario: Rendering data on pages
- **WHEN** the Transactions or Debts page renders
- **THEN** they receive state and action handlers from dedicated hooks (e.g., `useTransactions`) rather than declaring massive state locally in the UI component

### Requirement: Modular Configuration for Deployment
The system SHALL provide appropriate configurations in `tsconfig.json` and build scripts for strict builds and CI/CD pipelines.

#### Scenario: Running a production build
- **WHEN** the `npm run build` command is executed
- **THEN** the bundler completes successfully without type errors or unresolved imports

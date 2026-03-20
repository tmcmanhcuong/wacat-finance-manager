---
description: Project context, tech stack, and coding guidelines for Wacat Finance.
applyTo: '**/*.{ts,tsx,js,jsx,css,md}'
---

# Wacat Finance - Project Instructions

## Project Overview
Wacat Finance is a comprehensive personal finance management web application. It handles user accounts, financial transactions, debt tracking, subscriptions, and budget categorizations.

## Tech Stack
- **Frontend Framework**: React (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (located in `src/app/components/ui/`) + Neumorphism UI elements
- **Backend/Database**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel
- **Workflow**: OpenSpec for documentation and issue tracking

## ⚠️ MANDATORY SKILL USAGE (CRITICAL)
Whenever you are assigned a task related to user interfaces, design, or React development in this project, you **MUST** utilize the following skills:

1. **`frontend-design` Skill**: 
   - **When to use**: Whenever building web components, pages, templates, layouts, or styling any web UI (HTML/CSS/Tailwind).
   - **Why**: To ensure a distinctive, production-grade interface that avoids generic AI aesthetics.
   
2. **`vercel-react-best-practices` Skill**: 
   - **When to use**: Whenever writing, reviewing, or refactoring React code, structuring components, managing state, data fetching, or handling component performance.
   - **Why**: To ensure adherence to Vercel Engineering's optimal performance patterns and React best practices.

## Coding Guidelines

### 1. React & TypeScript
- Use strictly typed Functional Components. Avoid using `any`; define proper interfaces in `src/app/types.ts` or directly within the component/service.
- Keep components small, focused, and modular.
- Use explicit return types for custom hooks and complex functions.

### 2. Styling & UI Components
- **Tailwind CSS** is the primary styling solution. Avoid inline styles or standard CSS unless absolutely necessary.
- Before creating a new UI component, check `src/app/components/ui/` (Shadcn UI library). Always reuse existing components like `<Button>`, `<Card>`, `<Dialog>`, `<Form>`, etc.
- Adhere to the established UI elements and Neumorphic design themes (see `src/styles/theme.css` and `src/app/components/neumorphic-card.tsx`) where applicable.

### 3. Backend & Data Fetching (Supabase)
- All Supabase client logic should route through `src/lib/supabase.ts`.
- Encapsulate database queries and mutations inside the `src/services/` directory (e.g., `services/debts.ts`, `services/transactions.ts`).
- Ensure UI components call these services (often via custom hooks in `src/hooks/`) instead of calling Supabase directly.
- Handle Supabase errors gracefully and provide meaningful UI feedback.

### 4. File Structure & Architecture
- `src/app/pages/`: Contains the main route view components.
- `src/app/components/`: Contains shared React components, layout wrappers (`sidebar.tsx`, `auth-guard.tsx`), and the UI library.
- `src/hooks/`: Reusable custom hooks encapsulating business logic.
- `openspec/`: Used for maintaining feature proposals, design specs, and tasks. Follow the OpenSpec conventions for new implementations.
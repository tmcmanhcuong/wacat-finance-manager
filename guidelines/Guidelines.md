# 🐱 WaCat Finance Manager - Development Guidelines

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Design System](#design-system)
3. [Architecture](#architecture)
4. [File Structure](#file-structure)
5. [Data Models](#data-models)
6. [Components](#components)
7. [Pages](#pages)
8. [Business Logic](#business-logic)
9. [Coding Conventions](#coding-conventions)
10. [State Management](#state-management)
11. [UI/UX Patterns](#uiux-patterns)
12. [Best Practices](#best-practices)

---

## 1. Project Overview

**WaCat** là một Personal Finance Management System với thiết kế **Neumorphism (Soft UI)** sử dụng bảng màu Cool Grey đơn sắc.

### Tech Stack
- **Framework**: React 18.3.1
- **Routing**: React Router 7.13.0
- **Styling**: Tailwind CSS 4.1.12
- **Animation**: Motion (Framer Motion) 12.23.24
- **Icons**: Lucide React 0.487.0
- **Charts**: Recharts 2.15.2
- **Build Tool**: Vite 6.3.5

### Core Features
- ✅ Dashboard với Income/Expense statistics
- ✅ Transactions management với advanced filtering
- ✅ Multi-account tracking (Cash, Bank, E-wallet)
- ✅ Category management
- ✅ Debts & Installments với auto transaction creation
- ✅ Subscriptions tracking với countdown badges

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors
```css
--background: #E0E5EC;           /* Cool Grey - Main background */
--foreground: #3D4852;           /* Dark Grey - Text */
--primary: #6C63FF;              /* Purple - Accent/CTA */
--muted-foreground: #8B92A0;     /* Grey - Secondary text */
```

#### Functional Colors
```css
--success: #4ECDC4;              /* Teal - Income, Positive */
--destructive: #FF6B6B;          /* Red - Expense, Negative */
--warning: #FFC75F;              /* Orange - Warnings */
```

#### Chart Colors
```css
--chart-1: #6C63FF;              /* Purple */
--chart-2: #4ECDC4;              /* Teal */
--chart-3: #FFB6B9;              /* Pink */
--chart-4: #FFC75F;              /* Orange */
--chart-5: #95E1D3;              /* Mint */
```

### 2.2 Typography

#### Font Families
```css
/* Headers (h1-h6) */
font-family: 'Plus Jakarta Sans', sans-serif;

/* Body text, inputs, paragraphs */
font-family: 'DM Sans', sans-serif;
```

#### Font Sizes
- **h1**: 2xl (36px)
- **h2**: xl (24px)
- **h3**: lg (20px)
- **h4**: base (16px)
- **Body**: base (16px)

#### Font Weights
- **Medium**: 500 (Headers, Labels, Buttons)
- **Normal**: 400 (Body text, Inputs)

### 2.3 Neumorphism Design

#### Shadow System

**Extruded (Raised) Effect**
```css
shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)]
```

**Inset (Pressed) Effect**
```css
shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]
```

**Flat (Subtle) Effect**
```css
shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]
```

#### Border Radius
- **Cards**: `rounded-[32px]` (32px)
- **Buttons**: `rounded-2xl` (16px)
- **Inputs**: `rounded-2xl` (16px)
- **Icons**: `rounded-xl` (12px)

#### Component Heights
- **Minimum touch target**: 44px
- **Buttons**: min-h-[44px]
- **Inputs**: min-h-[44px]
- **Nav items**: min-h-[56px]

### 2.4 Spacing

Use Tailwind's default spacing scale:
- `gap-2` (8px) - Tight spacing
- `gap-4` (16px) - Standard spacing
- `gap-6` (24px) - Loose spacing
- `gap-8` (32px) - Section spacing

---

## 3. Architecture

### 3.1 Project Structure

```
src/
├── app/
│   ├── App.tsx                 # Root component with RouterProvider
│   ├── routes.ts               # React Router configuration
│   ├── store.ts                # Mock data & utility functions
│   ├── types.ts                # TypeScript interfaces
│   ├── components/
│   │   ├── sidebar.tsx         # Main navigation sidebar
│   │   ├── neumorphic-card.tsx # Reusable neumorphic components
│   │   └── ui/                 # Shadcn UI components (optional)
│   └── pages/
│       ├── root.tsx            # Layout wrapper with Sidebar + Outlet
│       ├── dashboard.tsx       # Dashboard page
│       ├── transactions.tsx    # Transactions page
│       ├── accounts.tsx        # Accounts page
│       ├── categories.tsx      # Categories page
│       ├── debts.tsx           # Debts & Installments page
│       └── subscriptions.tsx   # Subscriptions page
├── styles/
│   ├── theme.css               # Design tokens & base styles
│   ├── fonts.css               # Font imports (Plus Jakarta Sans, DM Sans)
│   ├── index.css               # Global styles
│   └── tailwind.css            # Tailwind CSS imports
```

### 3.2 Routing

**Router Configuration** (`routes.ts`)
```typescript
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,           // Layout with Sidebar
    children: [
      { index: true, Component: Dashboard },
      { path: 'transactions', Component: Transactions },
      { path: 'accounts', Component: Accounts },
      { path: 'categories', Component: Categories },
      { path: 'debts', Component: Debts },
      { path: 'subscriptions', Component: Subscriptions },
    ],
  },
]);
```

**App Component** (`App.tsx`)
```typescript
import { RouterProvider } from 'react-router';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

### 3.3 Layout Pattern

**Root Layout** (`pages/root.tsx`)
```typescript
import { Outlet } from 'react-router';
import { Sidebar } from '../components/sidebar';

export function Root() {
  return (
    <div className="flex min-h-screen bg-[#E0E5EC]">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <Outlet />  {/* Child pages render here */}
      </main>
    </div>
  );
}
```

---

## 4. File Structure

### 4.1 File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `neumorphic-card.tsx`)
- **Pages**: `kebab-case.tsx` (e.g., `dashboard.tsx`)
- **Types**: `types.ts` (singular)
- **Store**: `store.ts` (singular)
- **Styles**: `kebab-case.css`

### 4.2 Import Order

```typescript
// 1. External libraries
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

// 2. Lucide icons
import { Plus, Trash2, Edit } from 'lucide-react';

// 3. Local components
import { NeumorphicCard, NeumorphicButton } from '../components/neumorphic-card';
import { Sidebar } from '../components/sidebar';

// 4. Store & types
import { mockAccounts, mockTransactions, formatCurrency } from '../store';
import type { Account, Transaction } from '../types';
```

### 4.3 Export Conventions

**Named exports for pages/components:**
```typescript
export function Dashboard() { ... }
export function Transactions() { ... }
```

**Default export for App.tsx only:**
```typescript
export default App;
```

---

## 5. Data Models

### 5.1 Core Interfaces

**Account**
```typescript
interface Account {
  id: string;
  name: string;              // "Cash", "MB Bank", "Momo"
  balance: number;           // Current balance in VND
  icon: string;              // Lucide icon name
  color: string;             // Hex color
}
```

**Transaction**
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;          // Category ID
  date: string;              // ISO format: "2026-03-10"
  accountId?: string;        // For income/expense
  fromAccountId?: string;    // For transfers
  toAccountId?: string;      // For transfers
  description?: string;
}
```

**Category**
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;              // Lucide icon name
  type: 'income' | 'expense';
  color: string;
}
```

**Debt**
```typescript
interface Debt {
  id: string;
  type: 'lent' | 'borrowed' | 'installments';
  person: string;            // Person/Company name
  amount: number;            // Amount paid/received so far
  totalAmount: number;       // Total debt amount
  dueDate?: string;
  description?: string;
  paymentHistory?: PaymentHistory[];
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  note?: string;
  progressAtTime: number;    // % at time of payment
}
```

**Subscription**
```typescript
interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextPaymentDate: string;
  icon: string;
  color: string;
  category: string;
}
```

### 5.2 Special Categories

**Auto-generated categories for Debts:**
```typescript
// Debt Collection (Income)
{
  id: 'debt-collection',
  name: 'Debt Collection',
  icon: 'DollarSign',
  type: 'income',
  color: '#4ECDC4'
}

// Debt Payment (Expense)
{
  id: 'debt-payment',
  name: 'Debt Payment',
  icon: 'CreditCard',
  type: 'expense',
  color: '#FF6B6B'
}
```

**Transfer Category:**
```typescript
{
  id: 'transfer',
  name: 'Internal Transfer',
  icon: 'ArrowLeftRight',
  type: 'transfer',  // Special type
  color: '#8B92A0'
}
```

### 5.3 Currency Formatting

**Always use Vietnamese Dong (VND):**
```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Output: "1.250.000₫"
```

---

## 6. Components

### 6.1 Neumorphic Components

**Location**: `/src/app/components/neumorphic-card.tsx`

#### NeumorphicCard

**Props:**
```typescript
interface NeumorphicCardProps {
  children: ReactNode;
  variant?: 'extruded' | 'inset' | 'flat';
  className?: string;
  onClick?: () => void;
}
```

**Usage:**
```tsx
// Raised card (default)
<NeumorphicCard className="p-6">
  <h3>Card Title</h3>
</NeumorphicCard>

// Inset card (for data wells, charts)
<NeumorphicCard variant="inset" className="p-6">
  <p className="text-3xl">{formatCurrency(1250000)}</p>
</NeumorphicCard>

// Flat card (subtle elevation)
<NeumorphicCard variant="flat" className="p-4">
  <p>Content</p>
</NeumorphicCard>
```

#### NeumorphicButton

**Props:**
```typescript
interface NeumorphicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

**Usage:**
```tsx
// Primary button (purple accent)
<NeumorphicButton variant="primary" onClick={handleSubmit}>
  Submit
</NeumorphicButton>

// Secondary button (neumorphic grey)
<NeumorphicButton onClick={handleCancel}>
  Cancel
</NeumorphicButton>

// Sizes
<NeumorphicButton size="sm">Small</NeumorphicButton>
<NeumorphicButton size="md">Medium</NeumorphicButton>
<NeumorphicButton size="lg">Large</NeumorphicButton>

// Disabled state
<NeumorphicButton disabled={!isValid}>
  Submit
</NeumorphicButton>
```

#### NeumorphicInput

**Props:**
```typescript
interface NeumorphicInputProps {
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
```

**Usage:**
```tsx
<NeumorphicInput
  type="number"
  placeholder="Enter amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
/>

<NeumorphicInput
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

#### NeumorphicSelect

**Props:**
```typescript
interface NeumorphicSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
<NeumorphicSelect value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
  <option value="">Select Account</option>
  {mockAccounts.map(account => (
    <option key={account.id} value={account.id}>
      {account.name} - {formatCurrency(account.balance)}
    </option>
  ))}
</NeumorphicSelect>
```

### 6.2 Sidebar Component

**Location**: `/src/app/components/sidebar.tsx`

**Features:**
- Fixed left sidebar (w-72, 288px)
- Logo/Brand section
- Navigation menu with active states
- Neumorphic styling
- Animated with motion/react

**Navigation Items:**
```typescript
const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { path: '/accounts', icon: CreditCard, label: 'Accounts' },
  { path: '/categories', icon: FolderTree, label: 'Categories' },
  { path: '/debts', icon: Calendar, label: 'Debts & Spaylater' },
  { path: '/subscriptions', icon: Grid3x3, label: 'Subscriptions' },
];
```

**Active State:**
- Inset shadow (pressed effect)
- Purple text color for icon/label

**Inactive State:**
- Extruded shadow (raised effect)
- Hover: Subtle shadow reduction

### 6.3 Icon Usage

**Always use Lucide React icons:**

```typescript
import { Plus, Trash2, Edit, X, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

// Usage
<Plus size={20} className="text-[#6C63FF]" />
<Trash2 size={20} className="text-[#FF6B6B]" />
```

**Common icons:**
- `Plus`: Add/Create
- `Trash2`: Delete
- `Edit`, `Pencil`: Edit
- `X`: Close
- `Calendar`: Date picker
- `TrendingUp`: Income
- `TrendingDown`: Expense
- `ArrowLeftRight`: Transfer
- `Cat`: App logo

---

## 7. Pages

### 7.1 Dashboard

**Path**: `/`

**Features:**
- Total Balance card
- Income/Expense stats (Monthly)
- Category breakdown (Top 5)
- Recent transactions
- Quick actions

**Key Components:**
- Summary cards with inset variant
- Pie charts using Recharts
- Transaction list with category icons

### 7.2 Transactions

**Path**: `/transactions`

**Features:**
- Add Transaction form (3 types: Income, Expense, Transfer)
- Advanced filtering (4 dropdowns: Type, Category, Account, Date Range)
- Custom date range modal
- Pagination (10 items per page)
- Delete functionality

**Filter Logic:**
```typescript
const filteredTransactions = mockTransactions.filter(t => {
  if (filterType && t.type !== filterType) return false;
  if (filterCategory && t.category !== filterCategory) return false;
  if (filterAccount && t.accountId !== filterAccount && 
      t.fromAccountId !== filterAccount && 
      t.toAccountId !== filterAccount) return false;
  if (filterDate && !isDateInRange(t.date, filterDate)) return false;
  return true;
});
```

**Date Range Options:**
- Today
- This Week
- This Month
- This Year
- Custom (opens modal)

**Transfer Logic:**
- Type: "Internal Transfer" (special category)
- Does NOT affect Income/Expense statistics
- ONLY updates account balances
- Shows both `fromAccount` and `toAccount`

### 7.3 Accounts

**Path**: `/accounts`

**Features:**
- Account list with balance display
- Add/Edit/Delete accounts
- 3 modal forms: Add, Edit, Delete confirmation

**Account Types (icons):**
- Cash: `Wallet`
- Bank: `Building2`
- E-wallet: `Smartphone`
- Savings: `PiggyBank`

### 7.4 Categories

**Path**: `/categories`

**Features:**
- Grid layout with category cards
- Income categories (left column)
- Expense categories (right column)
- Icon picker (60+ Lucide icons)
- Color picker (10 preset colors)

**Category Icons:**
Use meaningful icons for each category:
- Salary: `Briefcase`
- Food: `UtensilsCrossed`
- Transport: `Car`
- Shopping: `ShoppingBag`
- etc.

### 7.5 Debts & Spaylater

**Path**: `/debts`

**Features:**
- Summary cards (Lent Out, Borrowed, Net Position)
- Two sections: Lent Out vs Borrowed/Installments
- Progress bars for each debt
- Payment history timeline
- Mark as Received form (Income transaction)
- Pay Installment form (Expense transaction)

**Transaction Auto-Creation:**

**Mark as Received:**
```typescript
// 1. Create Income Transaction
const newTransaction = {
  id: generateId(),
  type: 'income',
  amount: receiveAmount,
  category: 'debt-collection',  // Auto
  date: receiveDate,
  accountId: selectedAccount,
  description: `Received from ${debt.person} - ${debt.description} (${note})`
};

// 2. Update Account Balance
account.balance += receiveAmount;

// 3. Update Debt
debt.amount += receiveAmount;

// 4. Add to Payment History
debt.paymentHistory.push({
  id: generateId(),
  date: receiveDate,
  amount: receiveAmount,
  note: note,
  progressAtTime: (debt.amount / debt.totalAmount) * 100
});
```

**Pay Installment:**
```typescript
// 1. Create Expense Transaction
const newTransaction = {
  id: generateId(),
  type: 'expense',
  amount: payAmount,
  category: 'debt-payment',  // Auto
  date: payDate,
  accountId: selectedAccount,
  description: `Payment to ${debt.person} - ${debt.description} (${note})`
};

// 2. Update Account Balance
account.balance -= payAmount;  // Subtract

// 3. Update Debt
debt.amount += payAmount;

// 4. Add to Payment History
debt.paymentHistory.push({ ... });
```

**Validations:**
- Account must be selected
- Amount > 0
- Amount <= outstanding balance
- Insufficient balance check (for payments)

### 7.6 Subscriptions

**Path**: `/subscriptions`

**Features:**
- Subscription cards with countdown badges
- Next payment date tracking
- Monthly cost summary
- Add/Edit/Delete functionality

**Countdown Logic:**
```typescript
const daysUntil = (dateString: string): number => {
  const now = new Date('2026-03-10');  // Use current date in production
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
```

---

## 8. Business Logic

### 8.1 Transaction Statistics

**Calculate Income/Expense (Monthly):**
```typescript
export const calculateStats = (transactions: Transaction[]) => {
  const now = new Date('2026-03-10');
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= monthStart && t.type !== 'transfer';  // Exclude transfers
  });
  
  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expense, net: income - expense };
};
```

**Important**: Transfers do NOT count towards Income/Expense stats.

### 8.2 Account Balance Updates

**When adding a transaction:**
```typescript
// Income
if (type === 'income') {
  account.balance += amount;
}

// Expense
if (type === 'expense') {
  account.balance -= amount;
}

// Transfer
if (type === 'transfer') {
  fromAccount.balance -= amount;
  toAccount.balance += amount;
}
```

### 8.3 Category Breakdown

**Top 5 categories by amount:**
```typescript
export const calculateByCategory = (
  transactions: Transaction[], 
  categories: Category[], 
  type: 'income' | 'expense'
) => {
  const categoryTotals = categories
    .filter(c => c.type === type)
    .map(category => {
      const total = transactions
        .filter(t => t.category === category.id && t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        id: category.id,
        name: category.name,
        value: total,
        color: category.color,
      };
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  return categoryTotals;
};
```

### 8.4 Date Utilities

**Days until calculation:**
```typescript
export const daysUntil = (dateString: string): number => {
  const now = new Date('2026-03-10');  // Current date
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
```

**Date format:**
- Storage: ISO string `"2026-03-10"`
- Display: `toLocaleDateString('vi-VN')` → "10/03/2026"

---

## 9. Coding Conventions

### 9.1 Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { NeumorphicCard, NeumorphicButton } from '../components/neumorphic-card';
import { mockAccounts, formatCurrency } from '../store';
import type { Account } from '../types';

// 2. Component
export function MyComponent() {
  // 3. State
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Account | null>(null);
  
  // 4. Handlers
  const handleSubmit = () => {
    // Logic
  };
  
  const handleDelete = (id: string) => {
    // Logic
  };
  
  // 5. Render
  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#3D4852] text-3xl">Page Title</h1>
        <NeumorphicButton variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={20} className="inline mr-2" />
          Add Item
        </NeumorphicButton>
      </div>
      
      {/* Content */}
      <NeumorphicCard className="p-6">
        {/* ... */}
      </NeumorphicCard>
    </div>
  );
}
```

### 9.2 State Naming

**Boolean states:**
```typescript
const [showForm, setShowForm] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
```

**Selected items:**
```typescript
const [selectedAccount, setSelectedAccount] = useState<string>('');
const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
```

**Form fields:**
```typescript
const [amount, setAmount] = useState('');
const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
const [description, setDescription] = useState('');
```

### 9.3 TypeScript

**Use type annotations for:**
- Function parameters
- Return types (when not obvious)
- State with complex types

```typescript
// Good
const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
const formatCurrency = (amount: number): string => { ... };

// Avoid (inferred)
const [amount, setAmount] = useState('');  // string is inferred
```

**Use interfaces from types.ts:**
```typescript
import type { Account, Transaction, Category } from '../types';
```

### 9.4 Event Handlers

**Naming convention:**
```typescript
const handleSubmit = () => { ... };
const handleDelete = (id: string) => { ... };
const handleEdit = (item: Account) => { ... };
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
```

### 9.5 Conditional Rendering

**Use ternary for simple conditions:**
```tsx
{isLoading ? <Spinner /> : <Content />}
```

**Use && for single condition:**
```tsx
{showForm && <FormModal />}
```

**Use early return for complex conditions:**
```tsx
if (!account) return <EmptyState />;
if (isLoading) return <LoadingState />;

return <Content />;
```

---

## 10. State Management

### 10.1 Current Approach

**Mock data stored in** `store.ts`:
```typescript
export const mockAccounts: Account[] = [ ... ];
export const mockTransactions: Transaction[] = [ ... ];
export const mockCategories: Category[] = [ ... ];
export const mockDebts: Debt[] = [ ... ];
export const mockSubscriptions: Subscription[] = [ ... ];
```

**Direct mutation (temporary):**
```typescript
// Add
mockAccounts.push(newAccount);

// Update
const account = mockAccounts.find(a => a.id === id);
if (account) account.balance += amount;

// Delete
const index = mockAccounts.findIndex(a => a.id === id);
mockAccounts.splice(index, 1);
```

**⚠️ Note**: This is for prototyping only. In production, use:
- React Context API
- Zustand
- Redux Toolkit
- Or backend API with SWR/React Query

### 10.2 Utility Functions

**Location**: `store.ts`

**Export reusable functions:**
```typescript
export const formatCurrency = (amount: number): string => { ... };
export const daysUntil = (dateString: string): number => { ... };
export const calculateStats = (transactions: Transaction[]) => { ... };
export const calculateByCategory = (...) => { ... };
export const getTotalBalance = (accounts: Account[]): number => { ... };
```

**Import in pages:**
```typescript
import { mockAccounts, formatCurrency, daysUntil } from '../store';
```

---

## 11. UI/UX Patterns

### 11.1 Modal Forms

**Pattern:**
```tsx
{showForm && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
    onClick={() => setShowForm(false)}  // Close on backdrop click
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      onClick={(e) => e.stopPropagation()}  // Prevent close on content click
      className="max-w-lg w-full mx-4"
    >
      <NeumorphicCard className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#3D4852] text-2xl">Form Title</h3>
          <button onClick={() => setShowForm(false)}>
            <X size={20} className="text-[#8B92A0]" />
          </button>
        </div>
        
        {/* Form fields */}
        <div className="mb-6">
          <label className="block text-[#3D4852] mb-2">Label</label>
          <NeumorphicInput ... />
        </div>
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <NeumorphicButton onClick={() => setShowForm(false)}>
            Cancel
          </NeumorphicButton>
          <NeumorphicButton variant="primary" onClick={handleSubmit}>
            Submit
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </motion.div>
  </motion.div>
)}
```

### 11.2 Empty States

**Pattern:**
```tsx
{items.length === 0 ? (
  <div className="p-12 bg-[#E0E5EC] rounded-2xl shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.4)] text-center">
    <Icon size={48} className="text-[#8B92A0] mx-auto mb-4" />
    <p className="text-[#8B92A0] text-lg mb-2">No items yet</p>
    <p className="text-[#8B92A0] text-sm">Click "Add" to create your first item</p>
  </div>
) : (
  <div className="space-y-4">
    {items.map(item => <ItemCard key={item.id} item={item} />)}
  </div>
)}
```

### 11.3 Progress Bars

**Pattern:**
```tsx
<div className="mb-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-[#8B92A0] text-sm">Progress</span>
    <span className="text-[#3D4852] text-sm">
      {((amount / totalAmount) * 100).toFixed(0)}%
    </span>
  </div>
  <div className="h-3 bg-[#E0E5EC] rounded-full shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] overflow-hidden">
    <div
      className="h-full bg-[#4ECDC4] rounded-full transition-all"
      style={{ 
        width: `${(amount / totalAmount) * 100}%`,
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}
    />
  </div>
</div>
```

### 11.4 Info Boxes

**Pattern:**
```tsx
<div className="mb-6 p-4 bg-[#4ECDC4]/10 rounded-2xl border-2 border-[#4ECDC4]/30">
  <div className="flex items-start gap-3">
    <Info size={20} className="text-[#4ECDC4] flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-[#3D4852] font-medium mb-1">Title</p>
      <p className="text-[#8B92A0] text-sm">
        Description text here...
      </p>
    </div>
  </div>
</div>
```

**Color variants:**
- Success/Info: `bg-[#4ECDC4]/10`, `border-[#4ECDC4]/30`
- Warning: `bg-[#FFC75F]/10`, `border-[#FFC75F]/30`
- Error: `bg-[#FF6B6B]/10`, `border-[#FF6B6B]/30`
- Primary: `bg-[#6C63FF]/10`, `border-[#6C63FF]/30`

### 11.5 Validation Messages

**Pattern:**
```tsx
<div className="mb-6">
  <label className="block text-[#3D4852] mb-2">
    Account <span className="text-[#FF6B6B]">*</span>
  </label>
  <NeumorphicSelect value={account} onChange={...}>
    <option value="">Select Account</option>
    {/* ... */}
  </NeumorphicSelect>
  
  {/* Error message */}
  {!account && amount && (
    <p className="text-[#FF6B6B] text-sm mt-2">
      ⚠️ Please select an account
    </p>
  )}
  
  {/* Success message */}
  {account && (
    <p className="text-[#4ECDC4] text-sm mt-2">
      ✓ Account selected
    </p>
  )}
</div>
```

### 11.6 Animations

**Use Motion (Framer Motion) for:**
- Page entrance: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- Staggered lists: `transition={{ delay: index * 0.05 }}`
- Modal entrance: `initial={{ opacity: 0, scale: 0.9 }}`

**Example:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  <NeumorphicCard>
    Content
  </NeumorphicCard>
</motion.div>
```

---

## 12. Best Practices

### 12.1 General

- ✅ **Use max-width for content**: `max-w-[1600px] mx-auto`
- ✅ **Responsive spacing**: Use Tailwind's spacing scale
- ✅ **Consistent border radius**: Cards (32px), Buttons/Inputs (16px)
- ✅ **Minimum touch targets**: 44px height for all interactive elements
- ✅ **Color consistency**: Use CSS variables from theme.css
- ✅ **Icon sizes**: 20px for buttons, 24px for cards, 48px for empty states

### 12.2 Forms

- ✅ **Required fields**: Mark with red asterisk `<span className="text-[#FF6B6B]">*</span>`
- ✅ **Validation**: Show messages inline below fields
- ✅ **Disabled states**: Disable submit button until valid
- ✅ **Cancel action**: Always provide a way to close/cancel
- ✅ **Preview**: Show preview of changes when possible
- ✅ **Reset on close**: Clear form state when modal closes

### 12.3 Data Display

- ✅ **Currency**: Always use `formatCurrency()` for amounts
- ✅ **Dates**: Use `toLocaleDateString('vi-VN')` for display
- ✅ **Empty states**: Provide helpful messages and CTAs
- ✅ **Loading states**: Show skeleton or spinner
- ✅ **Error states**: Show clear error messages with recovery actions

### 12.4 Performance

- ✅ **Keys in lists**: Use unique IDs, not array indices
- ✅ **Lazy loading**: Consider pagination for large lists (10-20 items)
- ✅ **Memoization**: Use `useMemo` for expensive calculations
- ✅ **Event handlers**: Define outside render when possible
- ✅ **Console logs**: Remove or comment out in production

### 12.5 Accessibility

- ✅ **Semantic HTML**: Use `<button>`, `<label>`, `<input>` properly
- ✅ **Form labels**: Every input should have a label
- ✅ **Focus states**: Ensure keyboard navigation works
- ✅ **Color contrast**: Text should be readable (3D4852 on E0E5EC)
- ✅ **Touch targets**: Minimum 44px for mobile

### 12.6 Code Quality

- ✅ **DRY**: Extract repeated code into components/functions
- ✅ **Single responsibility**: Each component does one thing well
- ✅ **Descriptive names**: `handleSubmit`, not `submit`
- ✅ **Comments**: Explain WHY, not WHAT
- ✅ **Type safety**: Use TypeScript interfaces
- ✅ **Consistent formatting**: Follow existing code style

### 12.7 Neumorphism Specific

- ✅ **Don't overuse**: Not every element needs neumorphic style
- ✅ **Hierarchy**: Extruded for raised, inset for pressed
- ✅ **Contrast**: Ensure sufficient contrast for text
- ✅ **Spacing**: More spacing = better neumorphic effect
- ✅ **Shadows**: Use dual shadows (light + dark) for best effect
- ✅ **Background**: Always on #E0E5EC background

### 12.8 Transaction Logic

- ✅ **Transfers don't affect stats**: Exclude `type === 'transfer'` from Income/Expense calculations
- ✅ **Balance updates**: Always update account balances when creating transactions
- ✅ **Debt transactions**: Auto-create Income/Expense for debt payments
- ✅ **Category validation**: Ensure category exists and matches type
- ✅ **Amount validation**: Must be positive, non-zero

### 12.9 Future Improvements

When moving to production:
- 🔄 Replace mock data with API calls
- 🔄 Add state management (Context/Zustand/Redux)
- 🔄 Persist data to backend (Supabase/Firebase)
- 🔄 Add authentication
- 🔄 Add toast notifications (sonner)
- 🔄 Add data export (CSV/PDF)
- 🔄 Add multi-currency support
- 🔄 Add recurring transactions
- 🔄 Add budget tracking
- 🔄 Add dark mode toggle

---

## 📚 Quick Reference

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Background | #E0E5EC | Main background |
| Foreground | #3D4852 | Text |
| Primary | #6C63FF | Accent, CTAs |
| Success | #4ECDC4 | Income, Positive |
| Destructive | #FF6B6B | Expense, Negative |
| Warning | #FFC75F | Warnings |
| Muted | #8B92A0 | Secondary text |

### Component Sizes
| Element | Height | Radius |
|---------|--------|--------|
| Button | 44px | 16px |
| Input | 44px | 16px |
| Card | Auto | 32px |
| Nav Item | 56px | 16px |

### Spacing
| Token | Size | Usage |
|-------|------|-------|
| gap-2 | 8px | Tight |
| gap-4 | 16px | Standard |
| gap-6 | 24px | Loose |
| gap-8 | 32px | Sections |
| p-6 | 24px | Card padding |
| p-12 | 48px | Page padding |

### Shadows
| Variant | CSS |
|---------|-----|
| Extruded | `shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.6)]` |
| Inset | `shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]` |
| Flat | `shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]` |

---

## 🎯 Summary

**WaCat** is a modern finance manager built with React, Tailwind, and Neumorphism design. 

**Key Principles:**
1. **Soft UI first**: Use neumorphic components for all UI elements
2. **Type safety**: Leverage TypeScript interfaces
3. **Consistency**: Follow color palette and spacing system
4. **Accessibility**: 44px touch targets, proper labels
5. **Business logic**: Transfers don't count in stats, auto-create debt transactions
6. **User experience**: Clear validation, helpful empty states, smooth animations

**For AI Assistants:**
- Read `types.ts` for data models
- Use `neumorphic-card.tsx` components for UI
- Follow patterns in existing pages
- Maintain neumorphic styling consistency
- Respect transaction/account/debt logic
- Console.log important state changes

**For Developers:**
- Clone patterns from existing pages
- Use NeumorphicCard/Button/Input components
- Import utilities from `store.ts`
- Type everything with interfaces from `types.ts`
- Follow file/folder structure
- Test on different screen sizes

---

**Version**: 1.0.0  
**Last Updated**: March 10, 2026  
**Maintainer**: WaCat Team  
**License**: Private

---

✨ **Happy coding!** If you follow these guidelines, your code will fit seamlessly into the WaCat ecosystem.

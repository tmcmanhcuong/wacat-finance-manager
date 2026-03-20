-- ============================================================
-- WaCat Finance Manager - Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. ACCOUNTS
-- ============================================================
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  icon text not null default 'Wallet',
  color text not null default '#6C63FF',
  created_at timestamptz default now()
);

-- 2. CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null,
  created_at timestamptz default now()
);

-- 3. TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null check (amount > 0),
  category text not null,
  date date not null,
  account_id uuid references accounts(id) on delete set null,
  from_account_id uuid references accounts(id) on delete set null,
  to_account_id uuid references accounts(id) on delete set null,
  description text,
  created_at timestamptz default now()
);

-- 4. DEBTS
-- ============================================================
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('lent', 'borrowed', 'installments')),
  person text not null,
  amount numeric not null default 0,
  total_amount numeric not null check (total_amount > 0),
  due_date date,
  description text,
  created_at timestamptz default now()
);

-- 5. PAYMENT HISTORY
-- ============================================================
create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references debts(id) on delete cascade,
  date date not null,
  amount numeric not null check (amount > 0),
  note text,
  progress_at_time numeric not null check (progress_at_time >= 0 and progress_at_time <= 100),
  created_at timestamptz default now()
);

-- 6. SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount > 0),
  next_payment_date date not null,
  icon text not null default 'CreditCard',
  color text not null default '#6C63FF',
  category text not null default 'Other',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table debts enable row level security;
alter table payment_history enable row level security;
alter table subscriptions enable row level security;

-- Accounts policies
create policy "accounts: select own" on accounts for select using (auth.uid() = user_id);
create policy "accounts: insert own" on accounts for insert with check (auth.uid() = user_id);
create policy "accounts: update own" on accounts for update using (auth.uid() = user_id);
create policy "accounts: delete own" on accounts for delete using (auth.uid() = user_id);

-- Categories policies
create policy "categories: select own" on categories for select using (auth.uid() = user_id);
create policy "categories: insert own" on categories for insert with check (auth.uid() = user_id);
create policy "categories: update own" on categories for update using (auth.uid() = user_id);
create policy "categories: delete own" on categories for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "transactions: select own" on transactions for select using (auth.uid() = user_id);
create policy "transactions: insert own" on transactions for insert with check (auth.uid() = user_id);
create policy "transactions: delete own" on transactions for delete using (auth.uid() = user_id);

-- Debts policies
create policy "debts: select own" on debts for select using (auth.uid() = user_id);
create policy "debts: insert own" on debts for insert with check (auth.uid() = user_id);
create policy "debts: update own" on debts for update using (auth.uid() = user_id);
create policy "debts: delete own" on debts for delete using (auth.uid() = user_id);

-- Payment history policies (linked through debts)
create policy "payment_history: select own" on payment_history for select
  using (debt_id in (select id from debts where user_id = auth.uid()));
create policy "payment_history: insert own" on payment_history for insert
  with check (debt_id in (select id from debts where user_id = auth.uid()));
create policy "payment_history: delete own" on payment_history for delete
  using (debt_id in (select id from debts where user_id = auth.uid()));

-- Subscriptions policies
create policy "subscriptions: select own" on subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions: insert own" on subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions: update own" on subscriptions for update using (auth.uid() = user_id);
create policy "subscriptions: delete own" on subscriptions for delete using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (Optional - Run after creating a user via Auth)
-- Replace 'YOUR_USER_ID_HERE' with the actual user UUID from auth.users
-- ============================================================

-- Uncomment and fill in your user_id to seed sample data:
/*
do $$
declare
  v_user_id uuid := 'YOUR_USER_ID_HERE';
  v_account_cash uuid;
  v_account_bank uuid;
  v_account_momo uuid;
  v_account_savings uuid;
begin

  -- Insert accounts
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Cash',     1250000,  'Wallet',    '#6C63FF') returning id into v_account_cash;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'MB Bank',  8750000,  'Building2', '#4ECDC4') returning id into v_account_bank;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Momo',     320000,   'Smartphone','#FFB6B9') returning id into v_account_momo;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Savings',  15000000, 'PiggyBank', '#FFC75F') returning id into v_account_savings;

  -- Insert categories
  insert into categories (user_id, name, icon, type, color) values
    (v_user_id, 'Salary',          'Briefcase',      'income',  '#4ECDC4'),
    (v_user_id, 'Freelance',       'Code',           'income',  '#95E1D3'),
    (v_user_id, 'Investment',      'TrendingUp',     'income',  '#6C63FF'),
    (v_user_id, 'Gift',            'Gift',           'income',  '#FFB6B9'),
    (v_user_id, 'Debt Collection', 'DollarSign',     'income',  '#4ECDC4'),
    (v_user_id, 'Food',            'UtensilsCrossed','expense', '#FF6B6B'),
    (v_user_id, 'Transport',       'Car',            'expense', '#FFC75F'),
    (v_user_id, 'Shopping',        'ShoppingBag',    'expense', '#FFB6B9'),
    (v_user_id, 'Entertainment',   'Gamepad2',       'expense', '#95E1D3'),
    (v_user_id, 'Bills',           'Receipt',        'expense', '#8B92A0'),
    (v_user_id, 'Health',          'Heart',          'expense', '#FF6B6B'),
    (v_user_id, 'Education',       'GraduationCap',  'expense', '#6C63FF'),
    (v_user_id, 'Debt Payment',    'CreditCard',     'expense', '#FF6B6B'),
    (v_user_id, 'Other',           'MoreHorizontal', 'expense', '#CDD2D9');

  -- Insert subscriptions
  insert into subscriptions (user_id, name, amount, next_payment_date, icon, color, category) values
    (v_user_id, 'Spotify Premium',       59000,  '2026-03-15', 'Music',          '#1DB954', 'Entertainment'),
    (v_user_id, 'Netflix',               199000, '2026-03-20', 'Tv',             '#E50914', 'Entertainment'),
    (v_user_id, 'ChatGPT Plus',          450000, '2026-03-25', 'MessageSquare',  '#10A37F', 'Productivity'),
    (v_user_id, 'Adobe Creative Cloud',  650000, '2026-03-12', 'Palette',        '#FF0000', 'Work');

end $$;
*/

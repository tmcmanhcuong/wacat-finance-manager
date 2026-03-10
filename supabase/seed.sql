-- ============================================================
-- SEED DATA - Chạy sau khi tạo user từ Authentication > Users
-- Thay 'YOUR_USER_ID_HERE' bằng UUID thực của user
-- ============================================================

do $$
declare
  v_user_id uuid := 'YOUR_USER_ID_HERE';

  -- Account IDs để dùng trong transactions 
  v_account_cash     uuid;
  v_account_bank     uuid;
  v_account_momo     uuid;
  v_account_savings  uuid;

  -- Debt IDs để dùng trong payment_history
  v_debt_lent        uuid;
  v_debt_borrowed    uuid;

begin

  -- ==================== ACCOUNTS ====================
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Cash',     1250000,  'Wallet',    '#6C63FF') returning id into v_account_cash;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'MB Bank',  8750000,  'Building2', '#4ECDC4') returning id into v_account_bank;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Momo',     320000,   'Smartphone','#FFB6B9') returning id into v_account_momo;
  insert into accounts (user_id, name, balance, icon, color) values
    (v_user_id, 'Savings',  15000000, 'PiggyBank', '#FFC75F') returning id into v_account_savings;

  -- ==================== CATEGORIES ====================
  insert into categories (user_id, name, icon, type, color) values
    -- Income
    (v_user_id, 'Salary',          'Briefcase',       'income',  '#4ECDC4'),
    (v_user_id, 'Freelance',       'Code',            'income',  '#95E1D3'),
    (v_user_id, 'Investment',      'TrendingUp',      'income',  '#6C63FF'),
    (v_user_id, 'Gift',            'Gift',            'income',  '#FFB6B9'),
    (v_user_id, 'Debt Collection', 'DollarSign',      'income',  '#4ECDC4'),
    -- Expense
    (v_user_id, 'Food',            'UtensilsCrossed', 'expense', '#FF6B6B'),
    (v_user_id, 'Transport',       'Car',             'expense', '#FFC75F'),
    (v_user_id, 'Shopping',        'ShoppingBag',     'expense', '#FFB6B9'),
    (v_user_id, 'Entertainment',   'Gamepad2',        'expense', '#95E1D3'),
    (v_user_id, 'Bills',           'Receipt',         'expense', '#8B92A0'),
    (v_user_id, 'Health',          'Heart',           'expense', '#FF6B6B'),
    (v_user_id, 'Education',       'GraduationCap',   'expense', '#6C63FF'),
    (v_user_id, 'Debt Payment',    'CreditCard',      'expense', '#FF6B6B'),
    (v_user_id, 'Other',           'MoreHorizontal',  'expense', '#CDD2D9');

  -- ==================== TRANSACTIONS ====================
  insert into transactions (user_id, type, amount, category, date, account_id, description) values
    (v_user_id, 'income',  15000000, 'Salary',        '2026-03-01', v_account_bank, 'Monthly salary March'),
    (v_user_id, 'expense', 45000,    'Food',          '2026-03-10', v_account_cash, 'Lunch at restaurant'),
    (v_user_id, 'expense', 180000,   'Transport',     '2026-03-09', v_account_momo, 'Grab ride'),
    (v_user_id, 'expense', 199000,   'Entertainment', '2026-03-07', v_account_bank, 'Netflix subscription'),
    (v_user_id, 'income',  3000000,  'Freelance',     '2026-03-05', v_account_bank, 'UI design project');

  insert into transactions (user_id, type, amount, category, date, from_account_id, to_account_id, description) values
    (v_user_id, 'transfer', 2000000, 'Other', '2026-03-08', v_account_bank, v_account_savings, 'Transfer to savings');

  -- ==================== DEBTS ====================
  insert into debts (user_id, type, person, amount, total_amount, due_date, description)
    values (v_user_id, 'lent', 'John Doe', 500000, 2000000, '2026-04-15', 'Personal loan')
    returning id into v_debt_lent;

  insert into debts (user_id, type, person, amount, total_amount, due_date, description)
    values (v_user_id, 'borrowed', 'Credit Card', 3500000, 5000000, '2026-06-01', 'iPhone 15 Pro - installments')
    returning id into v_debt_borrowed;

  -- ==================== PAYMENT HISTORY ====================
  insert into payment_history (debt_id, date, amount, note, progress_at_time) values
    (v_debt_lent, '2026-02-15', 300000, 'First payment',     15),
    (v_debt_lent, '2026-03-01', 200000, 'Second installment', 25);

  insert into payment_history (debt_id, date, amount, note, progress_at_time) values
    (v_debt_borrowed, '2026-01-15', 500000,  'Monthly payment',             10),
    (v_debt_borrowed, '2026-02-15', 500000,  'Monthly payment',             20),
    (v_debt_borrowed, '2026-03-01', 2500000, 'Bonus payment - advance 5 months', 70);

  -- ==================== SUBSCRIPTIONS ====================
  insert into subscriptions (user_id, name, amount, next_payment_date, icon, color, category) values
    (v_user_id, 'Spotify Premium',      59000,  '2026-03-15', 'Music',         '#1DB954', 'Entertainment'),
    (v_user_id, 'Netflix',              199000, '2026-03-20', 'Tv',            '#E50914', 'Entertainment'),
    (v_user_id, 'ChatGPT Plus',         450000, '2026-03-25', 'MessageSquare', '#10A37F', 'Productivity'),
    (v_user_id, 'Adobe Creative Cloud', 650000, '2026-03-12', 'Palette',       '#FF0000', 'Work');

  raise notice 'Seed data inserted successfully for user: %', v_user_id;

end $$;

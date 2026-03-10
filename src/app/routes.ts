import { createBrowserRouter } from 'react-router';
import { Root } from './pages/root';
import { Dashboard } from './pages/dashboard';
import { Transactions } from './pages/transactions';
import { Accounts } from './pages/accounts';
import { Categories } from './pages/categories';
import { Debts } from './pages/debts';
import { Subscriptions } from './pages/subscriptions';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
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
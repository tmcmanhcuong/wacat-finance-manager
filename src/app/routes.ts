import { createBrowserRouter } from 'react-router';
import { Root } from './pages/root';
import { Dashboard } from './pages/dashboard';
import { Transactions } from './pages/transactions';
import { Accounts } from './pages/accounts';
import { Categories } from './pages/categories';
import { Debts } from './pages/debts';
import { Subscriptions } from './pages/subscriptions';
import { SignIn } from './pages/signin';
import { AuthGuard } from './components/auth-guard';

export const router = createBrowserRouter([
  // Public route — no auth required
  {
    path: '/signin',
    Component: SignIn,
  },

  // Protected routes — requires auth (AuthGuard redirects to /signin if not logged in)
  {
    path: '/',
    Component: AuthGuard,
    children: [
      {
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
    ],
  },
]);
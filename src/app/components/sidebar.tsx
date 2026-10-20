import { useNavigate, useLocation } from 'react-router';
import { Home, ArrowLeftRight, CreditCard, Calendar, Grid3x3, Settings, Cat, FolderTree, LogOut, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: { path: string; icon: LucideIcon; label: string }[] = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
    { path: '/debts', icon: Calendar, label: 'Debts' },
    { path: '/subscriptions', icon: Grid3x3, label: 'Subscriptions' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-colors duration-300">

      {/* Logo/Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sidebar-accent border border-sidebar-border">
            <Cat className="text-sidebar-primary" size={28} />
          </div>
          <div>
            <h1 className="text-sidebar-foreground text-2xl">WaCat</h1>
            <p className="text-muted-foreground text-xs">Finance Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className={[
                  'w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all min-h-[56px]',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                ].join(' ')}
              >
                <Icon size={22} />
                <span className={isActive ? 'font-medium' : ''}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all min-h-[56px] text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings size={22} />
          <span>Settings</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all min-h-[56px] group text-muted-foreground hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut size={22} className="group-hover:text-destructive transition-colors" />
          <span className="group-hover:text-destructive transition-colors">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

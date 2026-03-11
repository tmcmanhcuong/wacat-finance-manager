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
    <aside className={[
      'fixed left-0 top-0 h-screen w-72 z-50 flex flex-col transition-colors duration-300',
      // Light
      'bg-[#E0E5EC] shadow-[8px_0_16px_rgba(163,177,198,0.3)]',
      // Dark
      'dark:bg-[#181F2E] dark:shadow-[8px_0_16px_rgba(14,18,28,0.7)]',
    ].join(' ')}>

      {/* Logo/Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={[
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            'bg-[#E0E5EC] shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)]',
            'dark:bg-[#252C3E] dark:shadow-[6px_6px_12px_rgba(14,18,28,0.9),-6px_-6px_12px_rgba(42,49,68,0.6)]',
          ].join(' ')}>
            <Cat className="text-[#6C63FF]" size={28} />
          </div>
          <div>
            <h1 className="text-[#3D4852] dark:text-[#E2E8F0] text-2xl">WaCat</h1>
            <p className="text-[#8B92A0] dark:text-[#8892A0] text-xs">Finance Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            const activeLight = 'shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]';
            const activeDark  = 'dark:shadow-[inset_6px_6px_12px_rgba(14,18,28,0.9),inset_-6px_-6px_12px_rgba(42,49,68,0.5)] dark:bg-[#252C3E]';
            const inactiveLight = 'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)]';
            const inactiveDark  = 'dark:shadow-[4px_4px_8px_rgba(14,18,28,0.7),-4px_-4px_8px_rgba(42,49,68,0.5)] dark:hover:shadow-[2px_2px_4px_rgba(14,18,28,0.5),-2px_-2px_4px_rgba(42,49,68,0.3)]';

            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className={[
                  'w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all min-h-[56px]',
                  isActive
                    ? `${activeLight} ${activeDark}`
                    : `${inactiveLight} ${inactiveDark}`,
                ].join(' ')}
              >
                <Icon
                  size={22}
                  className={isActive
                    ? 'text-[#6C63FF]'
                    : 'text-[#3D4852] dark:text-[#8892A0]'}
                />
                <span className={isActive
                  ? 'text-[#6C63FF] font-medium'
                  : 'text-[#3D4852] dark:text-[#C8D0DC]'}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-[#CDD2D9]/30 dark:border-white/5 space-y-2">
        <button className={[
          'w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all min-h-[56px]',
          'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]',
          'hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)]',
          'dark:shadow-[4px_4px_8px_rgba(14,18,28,0.7),-4px_-4px_8px_rgba(42,49,68,0.5)]',
          'dark:hover:shadow-[2px_2px_4px_rgba(14,18,28,0.5),-2px_-2px_4px_rgba(42,49,68,0.3)]',
        ].join(' ')}>
          <Settings size={22} className="text-[#8B92A0] dark:text-[#8892A0]" />
          <span className="text-[#8B92A0] dark:text-[#8892A0]">Settings</span>
        </button>

        <button
          onClick={handleSignOut}
          className={[
            'w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all min-h-[56px] group',
            'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)]',
            'hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)]',
            'dark:shadow-[4px_4px_8px_rgba(14,18,28,0.7),-4px_-4px_8px_rgba(42,49,68,0.5)]',
            'dark:hover:shadow-[2px_2px_4px_rgba(14,18,28,0.5),-2px_-2px_4px_rgba(42,49,68,0.3)]',
          ].join(' ')}
        >
          <LogOut size={22} className="text-[#8B92A0] dark:text-[#8892A0] group-hover:text-[#FF6B6B] transition-colors" />
          <span className="text-[#8B92A0] dark:text-[#8892A0] group-hover:text-[#FF6B6B] transition-colors">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
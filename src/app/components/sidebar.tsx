import { useNavigate, useLocation } from 'react-router';
import { Home, ArrowLeftRight, CreditCard, Calendar, Grid3x3, Settings, Cat, FolderTree } from 'lucide-react';
import { motion } from 'motion/react';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
    { path: '/debts', icon: Calendar, label: 'Debts & Spaylater' },
    { path: '/subscriptions', icon: Grid3x3, label: 'Subscriptions' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#E0E5EC] shadow-[8px_0_16px_rgba(163,177,198,0.3)] z-50 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#E0E5EC] rounded-2xl shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.6)] flex items-center justify-center">
            <Cat className="text-[#6C63FF]" size={28} />
          </div>
          <div>
            <h1 className="text-[#3D4852] text-2xl">WaCat</h1>
            <p className="text-[#8B92A0] text-xs">Finance Manager</p>
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
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all min-h-[56px] ${
                  isActive
                    ? 'shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.6)]'
                    : 'shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)]'
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-[#6C63FF]' : 'text-[#3D4852]'}
                />
                <span
                  className={`${isActive ? 'text-[#6C63FF]' : 'text-[#3D4852]'}`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Settings Button */}
      <div className="p-4 border-t border-[#CDD2D9]/30">
        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(163,177,198,0.3),-2px_-2px_4px_rgba(255,255,255,0.3)] transition-all min-h-[56px]">
          <Settings size={22} className="text-[#8B92A0]" />
          <span className="text-[#8B92A0]">Settings</span>
        </button>
      </div>
    </aside>
  );
}
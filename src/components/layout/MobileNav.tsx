import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';

export const MobileNav: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/books', icon: BookOpen, label: 'Books' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className={`fixed bottom-0 w-full glass border-t border-white/10 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] ${className} z-50`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive ? 'text-purple-400' : 'text-white/50 hover:text-white/80'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

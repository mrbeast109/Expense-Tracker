import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  UserCircle,
  Layers,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
    isActive
      ? 'bg-white/75 text-gray-950 shadow-sm backdrop-blur-md border border-white/60 font-semibold'
      : 'text-gray-800 hover:bg-white/40 hover:text-gray-950 font-medium'
  }`;

const Navbar = ({ onLogout }) => {
  return (
    <div className="h-screen w-[230px] bg-white/20 backdrop-blur-2xl border-r border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] flex flex-col py-6 px-4 shrink-0 relative z-20">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 bg-black/85 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
          <Layers size={18} color="white" />
        </div>
        <span className="font-semibold text-gray-900 text-sm tracking-tight">Expense Tracker</span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;

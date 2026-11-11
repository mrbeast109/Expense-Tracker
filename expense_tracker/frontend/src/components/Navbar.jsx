import React, { useState } from 'react';
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
  Menu,
  X,
  LogOut,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-2xl border-b border-white/40 z-30 shrink-0 w-full relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black/85 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
            <Layers size={16} color="white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">Expense Tracker</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-gray-800 hover:bg-white/40 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-white/95 backdrop-blur-2xl border-r border-white/60 p-6 flex flex-col z-50 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black/85 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
                  <Layers size={18} color="white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm tracking-tight">Expense Tracker</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {onLogout && (
              <div className="pt-4 mt-auto border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <aside className="hidden lg:flex h-screen w-[230px] bg-white/20 backdrop-blur-2xl border-r border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] flex-col py-6 px-4 shrink-0 relative z-20">
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

        {onLogout && (
          <div className="pt-4 mt-auto border-t border-white/20">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-white/40 transition-colors w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;

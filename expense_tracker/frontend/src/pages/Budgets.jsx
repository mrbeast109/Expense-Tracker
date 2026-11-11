import React, { useEffect, useState } from 'react';
import { fetchExpenses } from '../api/api';
import { formatINR, parseItemDate } from '../utils/helpers';
import MonthPicker from '../components/MonthPicker';
import {
  Wallet, AlertTriangle, CheckCircle, TrendingUp, Pencil, X,
  Utensils, Bus, ShoppingBag, Zap, MoreHorizontal,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  food: Utensils,
  Transport: Bus,
  transport: Bus,
  Shopping: ShoppingBag,
  shopping: ShoppingBag,
  'Bills & Utilities': Zap,
  bills: Zap,
};

const DEFAULT_BUDGETS = {
  monthlyTotal: 25000,
  categories: {
    'Food & Dining': 8000,
    Transport: 4000,
    Shopping: 5000,
    'Bills & Utilities': 4000,
    Other: 4000,
  },
};

const Budgets = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_budgets');
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(budgets.monthlyTotal);
  const [editingCategories, setEditingCategories] = useState(budgets.categories);

  useEffect(() => {
    fetchExpenses()
      .then((res) => {
        if (res.sucess || res.success) setExpenses(res.expense || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const selMonth = selectedDate.getMonth();
  const selYear = selectedDate.getFullYear();

  const monthExpenses = expenses.filter((e) => {
    const d = parseItemDate(e.date || e.createdAt);
    return d && d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const totalSpent = monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const categorySpending = {};
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    categorySpending[cat] = (categorySpending[cat] || 0) + Number(e.amount || 0);
  });

  const remaining = budgets.monthlyTotal - totalSpent;
  const overallPercent = budgets.monthlyTotal > 0 ? Math.round((totalSpent / budgets.monthlyTotal) * 100) : 0;

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const updated = {
      monthlyTotal: Number(editingBudget),
      categories: editingCategories,
    };
    setBudgets(updated);
    localStorage.setItem('expense_tracker_budgets', JSON.stringify(updated));
    setModalOpen(false);
  };

  const getStatus = (spent, budget) => {
    if (!budget || budget <= 0) return { label: 'No Budget', color: 'text-gray-500 bg-gray-100', bar: 'bg-gray-400' };
    const pct = Math.round((spent / budget) * 100);
    if (pct >= 100) return { label: 'Exceeded', color: 'text-red-700 bg-red-100', bar: 'bg-red-500' };
    if (pct >= 80) return { label: 'Approaching', color: 'text-amber-700 bg-amber-100', bar: 'bg-amber-500' };
    return { label: 'On Track', color: 'text-emerald-700 bg-emerald-100', bar: 'bg-gray-900' };
  };

  const overallStatus = getStatus(totalSpent, budgets.monthlyTotal);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] py-12 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/70 w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-lg">Set Monthly Budgets</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Total Monthly Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingBudget}
                  onChange={(e) => setEditingBudget(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Category Limits (₹)</label>
                <div className="flex flex-col gap-2.5">
                  {Object.keys(budgets.categories).map((cat) => (
                    <div key={cat} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700 flex-1">{cat}</span>
                      <input
                        type="number"
                        min="0"
                        value={editingCategories[cat] || ''}
                        onChange={(e) =>
                          setEditingCategories({
                            ...editingCategories,
                            [cat]: Number(e.target.value),
                          })
                        }
                        className="w-28 sm:w-32 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400 text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-gray-900 text-white text-sm font-semibold rounded-xl py-3 hover:bg-gray-800 transition-colors"
              >
                Save Budget Settings
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Budgets</h1>
          <p className="text-white/80 text-sm mt-1">Set spending limits and monitor your progress</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={() => {
              setEditingBudget(budgets.monthlyTotal);
              setEditingCategories(budgets.categories);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex-1 sm:flex-initial"
          >
            <Pencil size={15} />
            Edit Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Monthly Budget</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(budgets.monthlyTotal)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Wallet size={18} className="text-gray-600" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Spent This Month</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(totalSpent)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Remaining Budget</p>
          <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {remaining < 0 ? '−' : ''}₹{formatINR(Math.abs(remaining))}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium mt-3 inline-block ${overallStatus.color}`}>
            {remaining < 0 ? 'Exceeded Budget' : `${overallPercent}% Spent`}
          </span>
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Overall Budget Status</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ₹{formatINR(totalSpent)} of ₹{formatINR(budgets.monthlyTotal)} spent
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${overallStatus.color}`}>
            {overallStatus.label}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${overallStatus.bar} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
        {overallPercent >= 100 ? (
          <div className="flex items-center gap-2 mt-3 text-red-600 text-xs">
            <AlertTriangle size={14} className="shrink-0" />
            <span>You have exceeded your monthly spending limit by ₹{formatINR(Math.abs(remaining))}.</span>
          </div>
        ) : overallPercent >= 80 ? (
          <div className="flex items-center gap-2 mt-3 text-amber-600 text-xs">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Caution: You have used {overallPercent}% of your monthly budget.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 text-emerald-600 text-xs">
            <CheckCircle size={14} className="shrink-0" />
            <span>Great job! Your spending is well within your monthly limit.</span>
          </div>
        )}
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h2 className="font-semibold text-gray-900 mb-5">Category Budgets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {Object.entries(budgets.categories).map(([category, limit]) => {
            const spent = categorySpending[category] || 0;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const status = getStatus(spent, limit);
            const Icon = CATEGORY_ICONS[category] || MoreHorizontal;
            const catRemaining = limit - spent;

            return (
              <div key={category} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Icon size={15} className="text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{category}</h3>
                      <p className="text-xs text-gray-500">
                        ₹{formatINR(spent)} / ₹{formatINR(limit)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3 mb-2">
                  <div
                    className={`h-full ${status.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{pct}% utilized</span>
                  <span className={catRemaining < 0 ? 'text-red-600 font-medium' : ''}>
                    {catRemaining < 0
                      ? `Over by ₹${formatINR(Math.abs(catRemaining))}`
                      : `₹${formatINR(catRemaining)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budgets;

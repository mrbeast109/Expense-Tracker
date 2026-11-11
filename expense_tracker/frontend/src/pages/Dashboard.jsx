import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard, fetchIncome, fetchExpenses } from '../api/api';
import MonthPicker from '../components/MonthPicker';
import { parseItemDate } from '../utils/helpers';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Utensils,
  Bus,
  ShoppingBag,
  Zap,
  MoreHorizontal,
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

const CATEGORY_COLORS = [
  '#111827',
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
  '#E5E7EB',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRelativeDate(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function DonutChart({ data, total }) {
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  const segments = data.map((item, i) => {
    const pct = total > 0 ? item.amount / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = (
      <circle
        key={item.category}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * circumference + circumference * 0.25}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    );
    offset += pct;
    return seg;
  });

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {data.length === 0 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
        ) : (
          segments
        )}
      </svg>
      <div className="absolute text-center pointer-events-none">
        <div className="text-base font-bold text-gray-900">₹{formatINR(total)}</div>
        <div className="text-xs text-gray-500">Total Spent</div>
      </div>
    </div>
  );
}

function BarChart({ monthlyData }) {
  const max = Math.max(...monthlyData.map((m) => m.amount), 1);

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-36 mt-2 w-full min-w-0">
      {monthlyData.map((m, i) => {
        const isLast = i === monthlyData.length - 1;
        const heightPct = (m.amount / max) * 100;
        return (
          <div key={m.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex items-end justify-center" style={{ height: 110 }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${isLast ? 'bg-gray-900' : 'bg-gray-200'}`}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 truncate w-full text-center">{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function calculateMonthlyTrend(allExpenses, referenceDate) {
  const base = referenceDate || new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const monthTotal = allExpenses
      .filter((e) => {
        const d = parseItemDate(e.date || e.createdAt);
        return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    months.push({
      month: MONTHS[targetMonth],
      amount: monthTotal,
    });
  }
  return months;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.allSettled([fetchDashboard(), fetchIncome(), fetchExpenses()])
      .then(([dashResult, incResult, expResult]) => {
        const rawIncomes = incResult.status === 'fulfilled' ? (incResult.value?.income || []) : [];
        const rawExpenses = expResult.status === 'fulfilled' ? (expResult.value?.expense || []) : [];
        setIncomes(rawIncomes);
        setExpenses(rawExpenses);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        setError('Could not reach server');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  const selMonth = selectedDate.getMonth();
  const selYear = selectedDate.getFullYear();

  const monthIncomes = incomes.filter((i) => {
    const d = parseItemDate(i.date || i.createdAt);
    return d && d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const monthExpenses = expenses.filter((e) => {
    const d = parseItemDate(e.date || e.createdAt);
    return d && d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const monthlyIncome = monthIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const monthlyExpense = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const savings = monthlyIncome - monthlyExpense;

  const catMap = {};
  monthExpenses.forEach((exp) => {
    const cat = exp.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + Number(exp.amount || 0);
  });
  const expenseDistribution = Object.entries(catMap).map(([category, amount]) => ({
    category,
    amount,
    percent: monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0,
  }));

  const recentTransactions = [
    ...incomes.map((i) => ({ ...i, type: 'income' })),
    ...expenses.map((e) => ({ ...e, type: 'expense' })),
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 5);

  const trendBars = calculateMonthlyTrend(expenses, selectedDate);

  let userBudgets = {};
  try {
    const saved = localStorage.getItem('expense_tracker_budgets');
    if (saved) userBudgets = JSON.parse(saved).categories || {};
  } catch {}

  const budgetList = expenseDistribution.slice(0, 3).map((item) => {
    const customLimit = userBudgets[item.category];
    const budget = customLimit ? Number(customLimit) : Math.max(Math.round(item.amount * 1.3), 5000);
    return {
      category: item.category,
      amount: item.amount,
      budget,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Dashboard</h1>
          <p className="text-white/80 text-sm mt-1">Track your income and expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex-1 sm:flex-initial"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(monthlyExpense)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(monthlyIncome)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingDown size={18} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Balance</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(savings)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Wallet size={18} className="text-gray-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="col-span-1 lg:col-span-3 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <DonutChart data={expenseDistribution} total={monthlyExpense} />
            <div className="flex flex-col gap-3 w-full sm:flex-1">
              {expenseDistribution.length === 0 ? (
                <p className="text-sm text-gray-400">No expense data</p>
              ) : (
                expenseDistribution.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">{item.percent}%</span>
                      <span className="text-sm font-medium text-gray-900">₹{formatINR(item.amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-1">Monthly Trend</h2>
          <BarChart monthlyData={trendBars} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="col-span-1 lg:col-span-3 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400">No transactions recorded</p>
            ) : (
              recentTransactions.slice(0, 5).map((tx) => {
                const Icon = CATEGORY_ICONS[tx.category] || MoreHorizontal;
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx._id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {tx.category} • {getRelativeDate(tx.date || tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${isExpense ? 'text-gray-900' : 'text-green-600'}`}>
                      {isExpense ? '-' : '+'}₹{formatINR(tx.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Budget</h2>
            <button
              onClick={() => navigate('/budgets')}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {budgetList.length === 0 ? (
              <p className="text-sm text-gray-400">No budget data</p>
            ) : (
              budgetList.map((item) => {
                const Icon = CATEGORY_ICONS[item.category] || MoreHorizontal;
                const pct = Math.min((item.amount / item.budget) * 100, 100);
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Icon size={13} className="text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ₹{formatINR(item.amount)} / ₹{formatINR(item.budget)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

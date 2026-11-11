import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExpenses } from '../api/api';
import { CATEGORY_COLORS, formatINR, getRelativeDate, calculateMonthlyTrend, parseItemDate } from '../utils/helpers';
import { DonutChart, BarChart } from '../components/Charts';
import MonthPicker from '../components/MonthPicker';
import {
  TrendingUp, Plus, Utensils, Bus, ShoppingBag, Zap, MoreHorizontal, Search,
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

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchExpenses()
      .then((res) => {
        if (res.sucess || res.success) setExpenses(res.expense || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalExpense = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const monthlyBars = calculateMonthlyTrend(expenses, selectedDate);

  const selMonth = selectedDate.getMonth();
  const selYear = selectedDate.getFullYear();

  const monthExpenses = expenses.filter((e) => {
    const d = parseItemDate(e.date || e.createdAt);
    return d && d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const thisMonthTotal = monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const categories = ['All Categories', ...Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)))];

  const categoryTotals = {};
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });
  const distribution = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percent: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
  }));

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Track and analyze your spending</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(totalExpense)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Selected Month</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(thisMonthTotal)}</p>
          <span className="text-xs text-gray-500 font-medium mt-1 inline-block">{monthExpenses.length} entries</span>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">No. of Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="col-span-3 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-1">Expenses Over Time</h2>
          <BarChart monthlyData={monthlyBars} />
        </div>
        <div className="col-span-2 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <div className="flex items-center gap-6">
            <DonutChart data={distribution} total={thisMonthTotal} centerLabel="Total Spent" />
            <div className="flex flex-col gap-2.5 flex-1">
              {distribution.slice(0, 5).map((item, i) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-xs text-gray-700">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.percent}%</span>
                    <span className="text-xs font-medium text-gray-900">₹{formatINR(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Expense Entries</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-700 outline-none placeholder-gray-400 w-36"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Date</th>
              <th className="text-left pb-3 font-medium">Description</th>
              <th className="text-left pb-3 font-medium">Category</th>
              <th className="text-right pb-3 font-medium">Amount</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-sm text-gray-400 py-8">No expenses found</td></tr>
            ) : (
              filtered.map((exp) => {
                const Icon = CATEGORY_ICONS[exp.category] || MoreHorizontal;
                return (
                  <tr key={exp._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-gray-500">{getRelativeDate(exp.date)}</td>
                    <td className="py-3 text-sm text-gray-900 font-medium">{exp.description}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                        <Icon size={12} />{exp.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-red-500 text-right">−₹{formatINR(exp.amount)}</td>
                    <td className="py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;

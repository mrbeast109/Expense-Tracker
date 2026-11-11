import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIncome } from '../api/api';
import { CATEGORY_COLORS, formatINR, getRelativeDate, calculateMonthlyTrend, parseItemDate } from '../utils/helpers';
import { DonutChart, BarChart } from '../components/Charts';
import MonthPicker from '../components/MonthPicker';
import {
  TrendingUp, Plus, Briefcase, Laptop, MoreHorizontal, Search, Layers,
} from 'lucide-react';

const SOURCE_ICONS = {
  Salary: Briefcase,
  salary: Briefcase,
  Freelance: Laptop,
  freelance: Laptop,
};

const Income = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchIncome()
      .then((res) => {
        if (res.sucess || res.success) setIncomes(res.income || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = incomes.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const monthlyBars = calculateMonthlyTrend(incomes, selectedDate);

  const selMonth = selectedDate.getMonth();
  const selYear = selectedDate.getFullYear();

  const monthIncomes = incomes.filter((e) => {
    const d = parseItemDate(e.date || e.createdAt);
    return d && d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const thisMonthTotal = monthIncomes.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const sources = ['All Sources', ...Array.from(new Set(incomes.map((e) => e.category).filter(Boolean)))];

  const sourceTotals = {};
  monthIncomes.forEach((e) => {
    const src = e.category || 'Other';
    sourceTotals[src] = (sourceTotals[src] || 0) + Number(e.amount || 0);
  });
  const distribution = Object.entries(sourceTotals).map(([category, amount]) => ({
    category,
    amount,
    percent: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
  }));

  const filtered = incomes.filter((e) => {
    const matchSearch = e.description?.toLowerCase().includes(search.toLowerCase());
    const matchSrc = sourceFilter === 'All Sources' || e.category === sourceFilter;
    return matchSearch && matchSrc;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your income sources</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />Add Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(totalIncome)}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Selected Month</p>
          <p className="text-2xl font-bold text-gray-900">₹{formatINR(thisMonthTotal)}</p>
          <span className="text-xs text-gray-500 font-medium mt-1 inline-block">{monthIncomes.length} entries</span>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">No. of Income Entries</p>
          <p className="text-2xl font-bold text-gray-900">{incomes.length}</p>
          <div className="mt-3 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Layers size={18} className="text-gray-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="col-span-3 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-1">Income Over Time</h2>
          <BarChart monthlyData={monthlyBars} />
        </div>
        <div className="col-span-2 bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900 mb-4">Income by Source</h2>
          <div className="flex items-center gap-6">
            <DonutChart data={distribution} total={thisMonthTotal} centerLabel="Total Income" />
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
          <h2 className="font-semibold text-gray-900">Income Entries</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search income..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-700 outline-none placeholder-gray-400 w-36"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
            >
              {sources.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-3 font-medium">Date</th>
              <th className="text-left pb-3 font-medium">Description</th>
              <th className="text-left pb-3 font-medium">Source</th>
              <th className="text-right pb-3 font-medium">Amount</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-sm text-gray-400 py-8">No income found</td></tr>
            ) : (
              filtered.map((inc) => {
                const Icon = SOURCE_ICONS[inc.category] || MoreHorizontal;
                return (
                  <tr key={inc._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-gray-500">{getRelativeDate(inc.date)}</td>
                    <td className="py-3 text-sm text-gray-900 font-medium">{inc.description}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                        <Icon size={12} />{inc.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-green-600 text-right">+₹{formatINR(inc.amount)}</td>
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

export default Income;

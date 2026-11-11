import React, { useEffect, useState } from 'react';
import { fetchIncome, fetchExpenses, addIncome, addExpense, updateIncome, updateExpense, deleteIncome, deleteExpense } from '../api/api';
import { formatINR, getRelativeDate } from '../utils/helpers';
import {
  Plus, Search, Pencil, Trash2, X, ChevronDown,
  Utensils, Bus, ShoppingBag, Zap, Briefcase, Laptop, MoreHorizontal,
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
  Salary: Briefcase,
  salary: Briefcase,
  Freelance: Laptop,
  freelance: Laptop,
};

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

function Modal({ open, onClose, onSubmit, initial, loading, error }) {
  const [form, setForm] = useState(initial || { description: '', amount: '', type: 'expense', category: '', date: '' });

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, amount: initial.amount ?? '' } : { description: '', amount: '', type: 'expense', category: '', date: '' });
    }
  }, [open, initial]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/70 w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 text-lg">{initial?._id ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-3">
          <div className="flex gap-2">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  form.type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
          />
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
          />
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
          >
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            required
            type="date"
            value={form.date ? form.date.slice(0, 10) : ''}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-gray-900 text-white text-sm font-semibold rounded-xl py-3 hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : initial?._id ? 'Save Changes' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const load = async () => {
    setLoading(true);
    const [incRes, expRes] = await Promise.all([fetchIncome(), fetchExpenses()]);
    const incomes = (incRes.income || []).map((i) => ({ ...i, type: 'income' }));
    const expenses = (expRes.expense || []).map((e) => ({ ...e, type: 'expense' }));
    const all = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = () => { setEditing(null); setModalError(''); setModalOpen(true); };
  const handleEdit = (tx) => { setEditing(tx); setModalError(''); setModalOpen(true); };

  const handleDelete = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    if (tx.type === 'income') await deleteIncome(tx._id);
    else await deleteExpense(tx._id);
    await load();
  };

  const handleSubmit = async (form) => {
    setSaving(true);
    setModalError('');
    const payload = { description: form.description, amount: Number(form.amount), category: form.category, date: form.date };
    let res;
    if (editing?._id) {
      if (editing.type === 'income') res = await updateIncome(editing._id, payload);
      else res = await updateExpense(editing._id, payload);
    } else {
      if (form.type === 'income') res = await addIncome(payload);
      else res = await addExpense(payload);
    }
    setSaving(false);
    if (res.success) {
      setEditing(null);
      setModalOpen(false);
      await load();
    } else {
      setModalError(res.message || 'Something went wrong');
    }
  };

  const categories = ['All Categories', ...Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)))];

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
    const matchCat = categoryFilter === 'All Categories' || t.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <Modal
        open={modalOpen}
        onClose={() => {
          setEditing(null);
          setModalOpen(false);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
        error={modalError}
      />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Transactions</h1>
          <p className="text-white/80 text-sm mt-1">View and manage all your transactions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">+₹{formatINR(totalIncome)}</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">−₹{formatINR(totalExpense)}</p>
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="font-semibold text-gray-900">All Transactions</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex flex-1 sm:flex-initial items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 min-w-[130px]">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm text-gray-700 outline-none placeholder-gray-400 w-full sm:w-32 bg-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none bg-transparent"
            >
              {['All', 'Income', 'Expense'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none bg-transparent"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">Loading...</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Description</th>
                  <th className="text-left pb-3 font-medium">Type</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-right pb-3 font-medium">Amount</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-sm text-gray-400 py-10">No transactions found</td></tr>
                ) : (
                  filtered.map((tx) => {
                    const Icon = CATEGORY_ICONS[tx.category] || MoreHorizontal;
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx._id + tx.type} className="border-b border-gray-50 last:border-0 group">
                        <td className="py-3 text-sm text-gray-500 whitespace-nowrap">{getRelativeDate(tx.date)}</td>
                        <td className="py-3 text-sm text-gray-900 font-medium">{tx.description}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isIncome ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                            <Icon size={12} />{tx.category}
                          </span>
                        </td>
                        <td className={`py-3 text-sm font-medium text-right ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                          {isIncome ? '+' : '−'}₹{formatINR(tx.amount)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(tx)} className="text-gray-400 hover:text-gray-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(tx)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;


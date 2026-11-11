import React, { useEffect, useState } from 'react';
import { fetchExpenses, fetchIncome } from '../api/api';
import { formatINR } from '../utils/helpers';
import {
  Tag, Plus, Trash2, Pencil, X, Utensils, Bus, ShoppingBag, Zap, Briefcase,
  Laptop, Heart, Home, GraduationCap, MoreHorizontal,
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Bus,
  ShoppingBag,
  Zap,
  Briefcase,
  Laptop,
  Heart,
  Home,
  GraduationCap,
  Tag,
};

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food & Dining', type: 'expense', icon: 'Utensils' },
  { id: '2', name: 'Transport', type: 'expense', icon: 'Bus' },
  { id: '3', name: 'Shopping', type: 'expense', icon: 'ShoppingBag' },
  { id: '4', name: 'Bills & Utilities', type: 'expense', icon: 'Zap' },
  { id: '5', name: 'Salary', type: 'income', icon: 'Briefcase' },
  { id: '6', name: 'Freelance', type: 'income', icon: 'Laptop' },
  { id: '7', name: 'Other', type: 'expense', icon: 'Tag' },
];

const Categories = () => {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('expense');
  const [formIcon, setFormIcon] = useState('Tag');

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchIncome()]).then(([expRes, incRes]) => {
      if (expRes.sucess || expRes.success) setExpenses(expRes.expense || []);
      if (incRes.sucess || incRes.success) setIncomes(incRes.income || []);
    });
  }, []);

  const saveCategories = (updated) => {
    setCategories(updated);
    localStorage.setItem('expense_tracker_categories', JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormType('expense');
    setFormIcon('Tag');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormIcon(cat.icon || 'Tag');
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: formName.trim(), type: formType, icon: formIcon }
          : c
      );
      saveCategories(updated);
    } else {
      const newCat = {
        id: Date.now().toString(),
        name: formName.trim(),
        type: formType,
        icon: formIcon,
      };
      saveCategories([...categories, newCat]);
    }
    setModalOpen(false);
  };

  const getCategoryStats = (name, type) => {
    if (type === 'expense') {
      const filtered = expenses.filter((e) => e.category?.toLowerCase() === name.toLowerCase());
      const total = filtered.reduce((a, b) => a + Number(b.amount || 0), 0);
      return { count: filtered.length, total };
    } else {
      const filtered = incomes.filter((i) => i.category?.toLowerCase() === name.toLowerCase());
      const total = filtered.reduce((a, b) => a + Number(b.amount || 0), 0);
      return { count: filtered.length, total };
    }
  };

  const displayedCategories = categories.filter((c) => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/70 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-lg">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                <div className="flex gap-2">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                        formType === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health & Fitness"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Select Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICON_MAP).map((iconName) => {
                    const IconComp = ICON_MAP[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`h-11 flex items-center justify-center rounded-xl border transition-colors ${
                          formIcon === iconName
                            ? 'border-gray-900 bg-gray-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <IconComp size={18} className="text-gray-700" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-gray-900 text-white text-sm font-semibold rounded-xl py-3 hover:bg-gray-800 transition-colors"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage income and expense categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all', label: 'All Categories' },
          { key: 'expense', label: 'Expenses' },
          { key: 'income', label: 'Income' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white/75 backdrop-blur-md border border-white/60 text-gray-700 hover:bg-white/90'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {displayedCategories.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || Tag;
          const stats = getCategoryStats(cat.name, cat.type);
          const isExpense = cat.type === 'expense';

          return (
            <div
              key={cat.id}
              className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <IconComp size={18} className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${
                        isExpense ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{stats.count} transactions</span>
                <span className={`font-semibold ${isExpense ? 'text-gray-900' : 'text-green-600'}`}>
                  {isExpense ? '−' : '+'}₹{formatINR(stats.total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;


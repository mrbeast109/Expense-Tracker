export const CATEGORY_ICONS_MAP = {
  'Food & Dining': 'utensils',
  food: 'utensils',
  Transport: 'bus',
  transport: 'bus',
  Shopping: 'shopping-bag',
  shopping: 'shopping-bag',
  'Bills & Utilities': 'zap',
  bills: 'zap',
  Salary: 'briefcase',
  salary: 'briefcase',
  Freelance: 'laptop',
  freelance: 'laptop',
};

export const CATEGORY_COLORS = [
  '#111827',
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
  '#E5E7EB',
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

export function getRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function parseItemDate(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    const [y, m, d] = rawDate.trim().split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(rawDate);
  return isNaN(d) ? null : d;
}

export function calculateMonthlyTrend(transactions = [], referenceDate = new Date()) {
  const base = referenceDate instanceof Date && !isNaN(referenceDate) ? referenceDate : new Date(referenceDate);
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const monthTotal = (transactions || [])
      .filter((item) => {
        const d = parseItemDate(item.date || item.createdAt);
        return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    months.push({
      month: MONTHS[targetMonth],
      year: targetYear,
      amount: monthTotal,
    });
  }
  return months;
}

export function buildMonthlyBars(transactionsOrAmount, referenceDate = new Date()) {
  if (Array.isArray(transactionsOrAmount)) {
    return calculateMonthlyTrend(transactionsOrAmount, referenceDate);
  }
  return calculateMonthlyTrend([], referenceDate);
}

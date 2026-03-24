export const fmt = (n) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));

export const fmtMoney = (n) => fmt(n) + 'đ';

export const fmtShort = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'T';
  if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'Tr';
  if (abs >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return fmt(n);
};

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const fmtMonth = (m) => {
  const [y, mo] = m.split('-');
  return `T${parseInt(mo)}/${y}`;
};

export const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthRange = (count = 6) => {
  const months = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

export const groupBy = (arr, fn) => {
  const map = {};
  arr.forEach((item) => {
    const key = typeof fn === 'string' ? item[fn] : fn(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
};

export const sumBy = (arr, key) =>
  arr.reduce((s, item) => s + (Number(item[key]) || 0), 0);

export const INCOME_CATEGORIES = [
  { id: 'tuition', name: 'Học phí', icon: '🎓' },
  { id: 'robot_sales', name: 'Bán robot', icon: '🤖' },
  { id: 'subscription', name: 'Subscription', icon: '🔄' },
  { id: 'staffing', name: 'Cung cấp nguồn lực', icon: '👥' },
  { id: 'other_income', name: 'Thu khác', icon: '💰' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'salary', name: 'Lương & nhân sự', icon: '👤' },
  { id: 'rent', name: 'Mặt bằng & văn phòng', icon: '🏢' },
  { id: 'materials', name: 'Nguyên vật liệu', icon: '⚙️' },
  { id: 'marketing', name: 'Marketing & quảng cáo', icon: '📢' },
  { id: 'software', name: 'Phần mềm & công nghệ', icon: '💻' },
  { id: 'operations', name: 'Vận hành & logistics', icon: '🚚' },
  { id: 'tax', name: 'Thuế & phí', icon: '📋' },
  { id: 'other_expense', name: 'Chi khác', icon: '📦' },
];

export const DEFAULT_ALL_CATEGORIES = [
  ...INCOME_CATEGORIES.map((c) => ({ ...c, type: 'income' })),
  ...EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'expense' })),
];

// Kept for backward compat — pages should prefer the dynamic list from App state
export const ALL_CATEGORIES = DEFAULT_ALL_CATEGORIES;

export const getCategoryById = (id, dynamicCategories) => {
  const list = dynamicCategories || ALL_CATEGORIES;
  return list.find((c) => c.id === id);
};

export const getIncomeCategories = (dynamicCategories) =>
  (dynamicCategories || ALL_CATEGORIES).filter((c) => c.type === 'income');

export const getExpenseCategories = (dynamicCategories) =>
  (dynamicCategories || ALL_CATEGORIES).filter((c) => c.type === 'expense');

export const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#a855f7', '#06b6d4', '#ec4899', '#84cc16',
];

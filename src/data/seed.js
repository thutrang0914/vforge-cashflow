import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils';

const months = [];
const now = new Date();
for (let i = 5; i >= 0; i--) {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
}

let id = 1;

const rand = (min, max) => Math.round(min + Math.random() * (max - min));

export function generateSeedData() {
  const transactions = [];

  months.forEach((month) => {
    // Income
    transactions.push({
      id: id++, date: `${month}-05`, amount: rand(80_000_000, 150_000_000),
      type: 'income', categoryId: 'tuition', description: 'Học phí tháng ' + month.split('-')[1],
    });
    transactions.push({
      id: id++, date: `${month}-10`, amount: rand(30_000_000, 80_000_000),
      type: 'income', categoryId: 'robot_sales', description: 'Bán robot kit',
    });
    transactions.push({
      id: id++, date: `${month}-01`, amount: rand(15_000_000, 30_000_000),
      type: 'income', categoryId: 'subscription', description: 'Subscription phần mềm',
    });
    transactions.push({
      id: id++, date: `${month}-15`, amount: rand(40_000_000, 100_000_000),
      type: 'income', categoryId: 'staffing', description: 'Cung cấp nhân sự IT',
    });

    // Expenses
    transactions.push({
      id: id++, date: `${month}-01`, amount: rand(60_000_000, 90_000_000),
      type: 'expense', categoryId: 'salary', description: 'Lương nhân viên',
    });
    transactions.push({
      id: id++, date: `${month}-01`, amount: rand(15_000_000, 25_000_000),
      type: 'expense', categoryId: 'rent', description: 'Tiền thuê mặt bằng',
    });
    transactions.push({
      id: id++, date: `${month}-12`, amount: rand(10_000_000, 30_000_000),
      type: 'expense', categoryId: 'materials', description: 'Mua linh kiện robot',
    });
    transactions.push({
      id: id++, date: `${month}-08`, amount: rand(5_000_000, 15_000_000),
      type: 'expense', categoryId: 'marketing', description: 'Quảng cáo Facebook/Google',
    });
    transactions.push({
      id: id++, date: `${month}-03`, amount: rand(3_000_000, 8_000_000),
      type: 'expense', categoryId: 'software', description: 'License phần mềm',
    });
    transactions.push({
      id: id++, date: `${month}-07`, amount: rand(5_000_000, 12_000_000),
      type: 'expense', categoryId: 'operations', description: 'Vận hành & logistics',
    });
  });

  const budgets = [];
  months.forEach((month) => {
    INCOME_CATEGORIES.forEach((c) => {
      budgets.push({
        id: id++, month, categoryId: c.id,
        plannedAmount: c.id === 'tuition' ? 120_000_000 :
          c.id === 'robot_sales' ? 60_000_000 :
          c.id === 'subscription' ? 25_000_000 :
          c.id === 'staffing' ? 70_000_000 : 10_000_000,
      });
    });
    EXPENSE_CATEGORIES.forEach((c) => {
      budgets.push({
        id: id++, month, categoryId: c.id,
        plannedAmount: c.id === 'salary' ? 80_000_000 :
          c.id === 'rent' ? 20_000_000 :
          c.id === 'materials' ? 20_000_000 :
          c.id === 'marketing' ? 10_000_000 :
          c.id === 'software' ? 5_000_000 :
          c.id === 'operations' ? 8_000_000 :
          c.id === 'tax' ? 5_000_000 : 5_000_000,
      });
    });
  });

  return { transactions, budgets };
}

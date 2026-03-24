import { useMemo } from 'react';
import T from '../theme';
import Stat from '../components/ui/Stat';
import TrendChart from '../components/charts/TrendChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import {
  fmtShort, fmtMonth, sumBy, groupBy, getMonthRange,
  getCategoryById, getIncomeCategories, CHART_COLORS,
} from '../utils';

export default function Dashboard({ transactions, budgets, categories }) {
  const currentMonth = getMonthRange(1)[0];

  const stats = useMemo(() => {
    const thisMonth = transactions.filter((t) => t.date?.startsWith(currentMonth));
    const income = sumBy(thisMonth.filter((t) => t.type === 'income'), 'amount');
    const expense = sumBy(thisMonth.filter((t) => t.type === 'expense'), 'amount');
    const profit = income - expense;

    const allIncome = sumBy(transactions.filter((t) => t.type === 'income'), 'amount');
    const allExpense = sumBy(transactions.filter((t) => t.type === 'expense'), 'amount');

    return { income, expense, profit, balance: allIncome - allExpense };
  }, [transactions, currentMonth]);

  const trendData = useMemo(() => {
    const months = getMonthRange(6);
    return months.map((m) => {
      const mt = transactions.filter((t) => t.date?.startsWith(m));
      const income = sumBy(mt.filter((t) => t.type === 'income'), 'amount');
      const expense = sumBy(mt.filter((t) => t.type === 'expense'), 'amount');
      return { label: fmtMonth(m), income, expense, profit: income - expense };
    });
  }, [transactions]);

  const pieData = useMemo(() => {
    const thisMonth = transactions.filter(
      (t) => t.type === 'income' && t.date?.startsWith(currentMonth)
    );
    const grouped = groupBy(thisMonth, 'categoryId');
    return getIncomeCategories(categories).map((c, i) => ({
      name: c.name,
      value: sumBy(grouped[c.id] || [], 'amount'),
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter((d) => d.value > 0);
  }, [transactions, currentMonth]);

  const budgetData = useMemo(() => {
    const months = getMonthRange(6);
    return months.map((m) => {
      const mt = transactions.filter((t) => t.date?.startsWith(m));
      const actualIncome = sumBy(mt.filter((t) => t.type === 'income'), 'amount');
      const actualExpense = sumBy(mt.filter((t) => t.type === 'expense'), 'amount');
      const mb = budgets.filter((b) => b.month === m);
      const plannedIncome = sumBy(
        mb.filter((b) => getCategoryById(b.categoryId, categories)?.type === 'income'),
        'plannedAmount'
      );
      const plannedExpense = sumBy(
        mb.filter((b) => getCategoryById(b.categoryId, categories)?.type === 'expense'),
        'plannedAmount'
      );
      return {
        label: fmtMonth(m),
        actualIncome,
        plannedIncome,
        actualExpense,
        plannedExpense,
      };
    });
  }, [transactions, budgets]);

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: T.text, fontSize: 20 }}>Tổng quan</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat label="Thu nhập tháng này" value={fmtShort(stats.income)} color={T.green} icon="📈" />
        <Stat label="Chi phí tháng này" value={fmtShort(stats.expense)} color={T.red} icon="📉" />
        <Stat
          label="Lợi nhuận ròng"
          value={fmtShort(stats.profit)}
          color={stats.profit >= 0 ? T.green : T.red}
          icon="💰"
        />
        <Stat
          label="Số dư tích lũy"
          value={fmtShort(stats.balance)}
          color={stats.balance >= 0 ? T.primary : T.red}
          icon="🏦"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <TrendChart
          title="Xu hướng dòng tiền (6 tháng)"
          data={trendData}
          lines={[
            { key: 'income', label: 'Thu nhập', color: T.green },
            { key: 'expense', label: 'Chi phí', color: T.red },
            { key: 'profit', label: 'Lợi nhuận', color: T.gold },
          ]}
        />
        <PieChart title={`Nguồn thu nhập ${fmtMonth(currentMonth)}`} data={pieData} />
      </div>

      <BarChart
        title="Budget vs Thực tế (Thu nhập)"
        data={budgetData}
        bars={[
          { key: 'plannedIncome', label: 'Kế hoạch', color: T.primary + '60' },
          { key: 'actualIncome', label: 'Thực tế', color: T.green },
        ]}
      />
    </div>
  );
}

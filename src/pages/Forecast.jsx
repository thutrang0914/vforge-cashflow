import { useMemo } from 'react';
import T from '../theme';
import TrendChart from '../components/charts/TrendChart';
import Stat from '../components/ui/Stat';
import {
  fmtShort, fmtMonth, sumBy, getMonthRange, getCategoryById,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '../utils';

export default function Forecast({ transactions, budgets }) {
  const forecast = useMemo(() => {
    const pastMonths = getMonthRange(6);
    const monthly = pastMonths.map((m) => {
      const mt = transactions.filter((t) => t.date?.startsWith(m));
      return {
        month: m,
        income: sumBy(mt.filter((t) => t.type === 'income'), 'amount'),
        expense: sumBy(mt.filter((t) => t.type === 'expense'), 'amount'),
      };
    });

    // Calculate trends (simple linear regression on last 6 months)
    const n = monthly.length;
    if (n < 2) return { past: monthly, future: [], trend: {} };

    const avgIncome = monthly.reduce((s, m) => s + m.income, 0) / n;
    const avgExpense = monthly.reduce((s, m) => s + m.expense, 0) / n;

    let slopeIncome = 0, slopeExpense = 0;
    let sx = 0, sxI = 0, sxE = 0, sx2 = 0;
    monthly.forEach((m, i) => {
      const x = i - (n - 1) / 2;
      sx2 += x * x;
      sxI += x * m.income;
      sxE += x * m.expense;
    });
    if (sx2 > 0) {
      slopeIncome = sxI / sx2;
      slopeExpense = sxE / sx2;
    }

    // Project next 6 months
    const now = new Date();
    const futureMonths = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const offset = n - 1 + i - (n - 1) / 2;
      const projIncome = Math.max(avgIncome + slopeIncome * offset, 0);
      const projExpense = Math.max(avgExpense + slopeExpense * offset, 0);
      futureMonths.push({
        month: m,
        income: Math.round(projIncome),
        expense: Math.round(projExpense),
        projected: true,
      });
    }

    const incomeGrowth = avgIncome ? ((slopeIncome / avgIncome) * 100).toFixed(1) : 0;
    const expenseGrowth = avgExpense ? ((slopeExpense / avgExpense) * 100).toFixed(1) : 0;

    return {
      past: monthly,
      future: futureMonths,
      trend: {
        avgIncome, avgExpense, slopeIncome, slopeExpense,
        incomeGrowth, expenseGrowth,
        avgProfit: avgIncome - avgExpense,
        projProfit6: futureMonths.length
          ? futureMonths[futureMonths.length - 1].income - futureMonths[futureMonths.length - 1].expense
          : 0,
      },
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const allData = [
      ...forecast.past.map((m) => ({
        label: fmtMonth(m.month),
        income: m.income,
        expense: m.expense,
        profit: m.income - m.expense,
      })),
      ...forecast.future.map((m) => ({
        label: fmtMonth(m.month) + '*',
        income: m.income,
        expense: m.expense,
        profit: m.income - m.expense,
      })),
    ];
    return allData;
  }, [forecast]);

  const categoryForecast = useMemo(() => {
    const months = getMonthRange(3);
    const result = [];
    [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].forEach((cat) => {
      const catType = INCOME_CATEGORIES.includes(cat) ? 'income' : 'expense';
      const vals = months.map((m) =>
        sumBy(transactions.filter((t) => t.categoryId === cat.id && t.date?.startsWith(m)), 'amount')
      );
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      if (avg > 0) {
        result.push({ ...cat, type: catType, avgMonthly: Math.round(avg) });
      }
    });
    return result;
  }, [transactions]);

  const { trend } = forecast;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: T.text, fontSize: 20 }}>Dự báo Cashflow</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat
          label="Thu nhập TB/tháng"
          value={fmtShort(trend.avgIncome || 0)}
          sub={`Tăng trưởng: ${trend.incomeGrowth || 0}%/tháng`}
          color={T.green}
          icon="📈"
        />
        <Stat
          label="Chi phí TB/tháng"
          value={fmtShort(trend.avgExpense || 0)}
          sub={`Tăng trưởng: ${trend.expenseGrowth || 0}%/tháng`}
          color={T.red}
          icon="📉"
        />
        <Stat
          label="Lợi nhuận TB/tháng"
          value={fmtShort(trend.avgProfit || 0)}
          color={(trend.avgProfit || 0) >= 0 ? T.green : T.red}
          icon="💰"
        />
        <Stat
          label="Dự báo LN (6 tháng tới)"
          value={fmtShort(trend.projProfit6 || 0)}
          color={(trend.projProfit6 || 0) >= 0 ? T.green : T.red}
          icon="🔮"
        />
      </div>

      <TrendChart
        title="Dòng tiền thực tế + Dự báo (* = dự báo)"
        data={chartData}
        lines={[
          { key: 'income', label: 'Thu nhập', color: T.green },
          { key: 'expense', label: 'Chi phí', color: T.red },
          { key: 'profit', label: 'Lợi nhuận', color: T.gold },
        ]}
        height={300}
      />

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, color: T.text, marginBottom: 12 }}>Dự báo theo danh mục (TB 3 tháng gần nhất)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            background: T.surface, borderRadius: T.radius,
            border: `1px solid ${T.border}`, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
              fontSize: 13, fontWeight: 600, color: T.green,
            }}>
              Thu nhập dự kiến/tháng
            </div>
            {categoryForecast.filter((c) => c.type === 'income').map((c) => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
                borderBottom: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 13, color: T.textSecondary }}>{c.icon} {c.name}</span>
                <span style={{ fontSize: 13, color: T.green, fontWeight: 500 }}>{fmtShort(c.avgMonthly)}</span>
              </div>
            ))}
          </div>
          <div style={{
            background: T.surface, borderRadius: T.radius,
            border: `1px solid ${T.border}`, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
              fontSize: 13, fontWeight: 600, color: T.red,
            }}>
              Chi phí dự kiến/tháng
            </div>
            {categoryForecast.filter((c) => c.type === 'expense').map((c) => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
                borderBottom: `1px solid ${T.border}`,
              }}>
                <span style={{ fontSize: 13, color: T.textSecondary }}>{c.icon} {c.name}</span>
                <span style={{ fontSize: 13, color: T.red, fontWeight: 500 }}>{fmtShort(c.avgMonthly)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

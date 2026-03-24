import { useState, useMemo, useCallback } from 'react';
import T from '../theme';
import Btn from '../components/ui/Btn';
import {
  fmtMoney, fmtMonth, getCurrentMonth, getMonthRange,
  sumBy, groupBy, getCategoryById, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '../utils';

function ReportRow({ label, amount, bold, indent, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
      borderBottom: `1px solid ${T.border}`, background: bold ? T.surfaceHover : 'transparent',
      paddingLeft: indent ? 40 : 16,
    }}>
      <span style={{
        fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 400,
        color: bold ? T.text : T.textSecondary,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 14 : 13, fontWeight: bold ? 700 : 500,
        color: color || T.text,
      }}>
        {fmtMoney(amount)}
      </span>
    </div>
  );
}

export default function Reports({ transactions }) {
  const [period, setPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const months = getMonthRange(12);

  const reportData = useMemo(() => {
    let filtered;
    if (period === 'month') {
      filtered = transactions.filter((t) => t.date?.startsWith(selectedMonth));
    } else if (period === 'quarter') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const q = Math.floor((m - 1) / 3);
      const qMonths = [q * 3 + 1, q * 3 + 2, q * 3 + 3].map(
        (mo) => `${y}-${String(mo).padStart(2, '0')}`
      );
      filtered = transactions.filter((t) => qMonths.some((qm) => t.date?.startsWith(qm)));
    } else {
      const y = selectedMonth.split('-')[0];
      filtered = transactions.filter((t) => t.date?.startsWith(y));
    }

    const incomeByCategory = {};
    const expenseByCategory = {};
    INCOME_CATEGORIES.forEach((c) => {
      incomeByCategory[c.id] = sumBy(filtered.filter((t) => t.categoryId === c.id && t.type === 'income'), 'amount');
    });
    EXPENSE_CATEGORIES.forEach((c) => {
      expenseByCategory[c.id] = sumBy(filtered.filter((t) => t.categoryId === c.id && t.type === 'expense'), 'amount');
    });

    const totalIncome = Object.values(incomeByCategory).reduce((s, v) => s + v, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((s, v) => s + v, 0);
    const netProfit = totalIncome - totalExpense;
    const margin = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    return { incomeByCategory, expenseByCategory, totalIncome, totalExpense, netProfit, margin };
  }, [transactions, period, selectedMonth]);

  const handleExport = useCallback(() => {
    import('xlsx').then(({ utils, writeFile }) => {
      const rows = [];
      rows.push(['BÁO CÁO P&L - VFORGE']);
      rows.push(['Kỳ', period === 'month' ? fmtMonth(selectedMonth) : period === 'quarter' ? `Quý ${Math.floor((parseInt(selectedMonth.split('-')[1]) - 1) / 3) + 1}` : selectedMonth.split('-')[0]]);
      rows.push([]);
      rows.push(['THU NHẬP', '']);
      INCOME_CATEGORIES.forEach((c) => {
        rows.push([`  ${c.name}`, reportData.incomeByCategory[c.id] || 0]);
      });
      rows.push(['Tổng thu nhập', reportData.totalIncome]);
      rows.push([]);
      rows.push(['CHI PHÍ', '']);
      EXPENSE_CATEGORIES.forEach((c) => {
        rows.push([`  ${c.name}`, reportData.expenseByCategory[c.id] || 0]);
      });
      rows.push(['Tổng chi phí', reportData.totalExpense]);
      rows.push([]);
      rows.push(['LỢI NHUẬN RÒNG', reportData.netProfit]);
      rows.push(['Biên lợi nhuận', `${reportData.margin}%`]);

      const ws = utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 30 }, { wch: 20 }];
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'P&L');
      writeFile(wb, `vforge_pnl_${selectedMonth}.xlsx`);
    });
  }, [reportData, period, selectedMonth]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.text, fontSize: 20 }}>Báo cáo P&L</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['month', 'quarter', 'year'].map((p) => (
            <Btn key={p} variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)} style={{ fontSize: 12 }}>
              {p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
            </Btn>
          ))}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: T.radiusSm,
              border: `1px solid ${T.border}`, background: T.surface,
              color: T.text, fontSize: 12,
            }}
          >
            {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
          <Btn variant="secondary" onClick={handleExport} style={{ fontSize: 12 }}>
            📥 Export Excel
          </Btn>
        </div>
      </div>

      <div style={{
        background: T.surface, borderRadius: T.radius,
        border: `1px solid ${T.border}`, overflow: 'hidden',
      }}>
        <ReportRow label="THU NHẬP" amount={reportData.totalIncome} bold color={T.green} />
        {INCOME_CATEGORIES.map((c) => (
          <ReportRow key={c.id} label={`${c.icon} ${c.name}`} amount={reportData.incomeByCategory[c.id] || 0} indent />
        ))}

        <div style={{ height: 8, background: T.bg }} />

        <ReportRow label="CHI PHÍ" amount={reportData.totalExpense} bold color={T.red} />
        {EXPENSE_CATEGORIES.map((c) => (
          <ReportRow key={c.id} label={`${c.icon} ${c.name}`} amount={reportData.expenseByCategory[c.id] || 0} indent />
        ))}

        <div style={{ height: 8, background: T.bg }} />

        <ReportRow
          label="LỢI NHUẬN RÒNG"
          amount={reportData.netProfit}
          bold
          color={reportData.netProfit >= 0 ? T.green : T.red}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '8px 16px',
          background: T.surfaceHover,
        }}>
          <span style={{ fontSize: 13, color: T.textSecondary }}>Biên lợi nhuận</span>
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: Number(reportData.margin) >= 20 ? T.green : Number(reportData.margin) >= 0 ? T.orange : T.red,
          }}>
            {reportData.margin}%
          </span>
        </div>
      </div>
    </div>
  );
}

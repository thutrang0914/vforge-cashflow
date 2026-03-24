import TrendChart from '../charts/TrendChart';
import T from '../../theme';
import { fmtMonth } from '../../utils';

export default function CashflowChart({ rows, breakEvenMonth }) {
  const data = rows.map((r) => ({
    label: fmtMonth(r.month),
    income: r.totalRevenue,
    expense: r.totalExpense,
    net: r.netCashflow,
    cumulative: r.cumulativeCashflow,
  }));

  return (
    <div style={{ position: 'relative' }}>
      <TrendChart
        title="Dự báo dòng tiền 12 tháng"
        data={data}
        lines={[
          { key: 'income', label: 'Thu nhập', color: T.green },
          { key: 'expense', label: 'Chi phí', color: T.red },
          { key: 'net', label: 'Dòng tiền ròng', color: T.gold },
          { key: 'cumulative', label: 'Lũy kế', color: T.cyan },
        ]}
        height={280}
      />
      {breakEvenMonth >= 0 && breakEvenMonth < rows.length && (
        <div style={{
          position: 'absolute', top: 50, right: 20,
          background: T.greenBg, border: `1px solid ${T.green}40`,
          borderRadius: T.radiusSm, padding: '6px 10px',
          fontSize: 11, color: T.green, fontWeight: 600,
        }}>
          🎯 Break-even: {fmtMonth(rows[breakEvenMonth].month)}
        </div>
      )}
    </div>
  );
}

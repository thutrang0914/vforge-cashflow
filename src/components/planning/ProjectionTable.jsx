import T from '../../theme';
import { fmtShort, fmtMonth } from '../../utils';

function Cell({ value, color, bold, align = 'right' }) {
  return (
    <td style={{
      padding: '7px 10px', fontSize: 12, textAlign: align,
      color: color || T.text, fontWeight: bold ? 700 : 400,
      whiteSpace: 'nowrap', borderBottom: `1px solid ${T.border}`,
    }}>
      {typeof value === 'number' ? fmtShort(value) : value}
    </td>
  );
}

function colorOf(v) {
  return v > 0 ? T.green : v < 0 ? T.red : T.textMuted;
}

export default function ProjectionTable({ rows, breakEvenMonth }) {
  if (!rows.length) return null;

  return (
    <div style={{
      background: T.surface, borderRadius: T.radius,
      border: `1px solid ${T.border}`, overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
        fontSize: 13, fontWeight: 600, color: T.text,
      }}>
        📋 Bảng dự báo 12 tháng
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {['Tháng', 'Học phí', 'Robot', 'Sub', 'Staffing', 'Tổng thu',
                'Lương', 'Mặt bằng', 'NVL', 'Marketing', 'Vận hành', 'Thuế', 'Tổng chi',
                'Dòng tiền', 'Lũy kế'].map((h, i) => (
                <th key={i} style={{
                  padding: '8px 10px', textAlign: i === 0 ? 'left' : 'right',
                  color: T.textMuted, fontWeight: 500, fontSize: 10,
                  borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                  position: i === 0 ? 'sticky' : 'static', left: i === 0 ? 0 : 'auto',
                  background: T.bg, zIndex: i === 0 ? 1 : 0,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isBreakEven = r.monthIndex === breakEvenMonth;
              const rowBg = isBreakEven ? T.greenBg : 'transparent';
              return (
                <tr key={r.month} style={{ background: rowBg }}
                  onMouseEnter={(e) => { if (!isBreakEven) e.currentTarget.style.background = T.surfaceHover; }}
                  onMouseLeave={(e) => { if (!isBreakEven) e.currentTarget.style.background = rowBg; }}
                >
                  <td style={{
                    padding: '7px 10px', fontSize: 12, color: T.text, fontWeight: 500,
                    whiteSpace: 'nowrap', borderBottom: `1px solid ${T.border}`,
                    position: 'sticky', left: 0, background: isBreakEven ? T.greenBg : T.surface,
                    zIndex: 1,
                  }}>
                    {fmtMonth(r.month)}
                    {isBreakEven && <span style={{ fontSize: 10, marginLeft: 4 }}>🎯</span>}
                  </td>
                  <Cell value={r.tuitionRevenue} color={T.green} />
                  <Cell value={r.robotRevenue} color={T.green} />
                  <Cell value={r.subscriptionRevenue} color={T.green} />
                  <Cell value={r.staffingRevenue} color={T.green} />
                  <Cell value={r.totalRevenue} color={T.green} bold />
                  <Cell value={r.salaryCost} color={T.red} />
                  <Cell value={r.rentCost} color={T.red} />
                  <Cell value={r.materialCost} color={T.red} />
                  <Cell value={r.marketingCost} color={T.red} />
                  <Cell value={r.operationsCost} color={T.red} />
                  <Cell value={r.taxCost} color={T.red} />
                  <Cell value={r.totalExpense} color={T.red} bold />
                  <Cell value={r.netCashflow} color={colorOf(r.netCashflow)} bold />
                  <Cell value={r.cumulativeCashflow} color={colorOf(r.cumulativeCashflow)} bold />
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: T.bg }}>
              <td style={{
                padding: '8px 10px', fontSize: 12, fontWeight: 700, color: T.text,
                borderTop: `2px solid ${T.border}`, position: 'sticky', left: 0,
                background: T.bg, zIndex: 1,
              }}>
                Tổng 12T
              </td>
              {[
                rows.reduce((s, r) => s + r.tuitionRevenue, 0),
                rows.reduce((s, r) => s + r.robotRevenue, 0),
                rows.reduce((s, r) => s + r.subscriptionRevenue, 0),
                rows.reduce((s, r) => s + r.staffingRevenue, 0),
                rows.reduce((s, r) => s + r.totalRevenue, 0),
                rows.reduce((s, r) => s + r.salaryCost, 0),
                rows.reduce((s, r) => s + r.rentCost, 0),
                rows.reduce((s, r) => s + r.materialCost, 0),
                rows.reduce((s, r) => s + r.marketingCost, 0),
                rows.reduce((s, r) => s + r.operationsCost, 0),
                rows.reduce((s, r) => s + r.taxCost, 0),
                rows.reduce((s, r) => s + r.totalExpense, 0),
                rows.reduce((s, r) => s + r.netCashflow, 0),
              ].map((v, i) => {
                const isRevCol = i < 5;
                const isExpCol = i >= 5 && i < 12;
                const isNet = i === 12;
                return (
                  <td key={i} style={{
                    padding: '8px 10px', fontSize: 12, fontWeight: 700, textAlign: 'right',
                    color: isNet ? colorOf(v) : isRevCol ? T.green : T.red,
                    borderTop: `2px solid ${T.border}`, whiteSpace: 'nowrap',
                  }}>
                    {fmtShort(v)}
                  </td>
                );
              })}
              <td style={{
                padding: '8px 10px', fontSize: 12, fontWeight: 700, textAlign: 'right',
                borderTop: `2px solid ${T.border}`, whiteSpace: 'nowrap',
                color: colorOf(rows[rows.length - 1]?.cumulativeCashflow || 0),
              }}>
                {fmtShort(rows[rows.length - 1]?.cumulativeCashflow || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

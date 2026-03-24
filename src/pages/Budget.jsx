import { useState, useMemo } from 'react';
import T from '../theme';
import Btn from '../components/ui/Btn';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import {
  fmtMoney, fmtShort, fmtMonth, getCurrentMonth, getMonthRange,
  getCategoryById, sumBy, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
} from '../utils';

function ProgressBar({ actual, planned, color }) {
  const pct = planned ? Math.min((actual / planned) * 100, 150) : 0;
  const over = actual > planned && planned > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{
        flex: 1, height: 8, background: T.bg, borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 4, width: `${Math.min(pct, 100)}%`,
          background: over ? T.red : color,
          transition: 'width 0.3s',
        }} />
      </div>
      <span style={{ fontSize: 11, color: over ? T.red : T.textMuted, minWidth: 40, textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function BudgetSection({ title, categories, budgets, transactions, month, color, onEdit }) {
  return (
    <div style={{
      background: T.surface, borderRadius: T.radius,
      border: `1px solid ${T.border}`, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${T.border}`,
        fontSize: 14, fontWeight: 600, color: T.text,
      }}>
        {title}
      </div>
      {categories.map((cat) => {
        const budget = budgets.find((b) => b.month === month && b.categoryId === cat.id);
        const planned = budget?.plannedAmount || 0;
        const actual = sumBy(
          transactions.filter((t) => t.date?.startsWith(month) && t.categoryId === cat.id),
          'amount'
        );
        return (
          <div
            key={cat.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={{ fontSize: 16 }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>{cat.name}</div>
              <ProgressBar actual={actual} planned={planned} color={color} />
            </div>
            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <div style={{ fontSize: 12, color: T.text }}>{fmtShort(actual)}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>/ {fmtShort(planned)}</div>
            </div>
            <Btn variant="ghost" style={{ padding: '4px 8px', fontSize: 11 }}
              onClick={() => onEdit(cat.id, planned)}>
              ✏️
            </Btn>
          </div>
        );
      })}
    </div>
  );
}

export default function Budget({ transactions, budgets, onUpdateBudget }) {
  const [month, setMonth] = useState(getCurrentMonth());
  const [editCat, setEditCat] = useState(null);
  const [editAmount, setEditAmount] = useState(0);
  const months = getMonthRange(12);

  const totals = useMemo(() => {
    const mt = transactions.filter((t) => t.date?.startsWith(month));
    const mb = budgets.filter((b) => b.month === month);
    const incomeActual = sumBy(mt.filter((t) => t.type === 'income'), 'amount');
    const expenseActual = sumBy(mt.filter((t) => t.type === 'expense'), 'amount');
    const incomePlanned = sumBy(
      mb.filter((b) => getCategoryById(b.categoryId)?.type === 'income'),
      'plannedAmount'
    );
    const expensePlanned = sumBy(
      mb.filter((b) => getCategoryById(b.categoryId)?.type === 'expense'),
      'plannedAmount'
    );
    return { incomeActual, expenseActual, incomePlanned, expensePlanned };
  }, [transactions, budgets, month]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.text, fontSize: 20 }}>Ngân sách {fmtMonth(month)}</h2>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`, background: T.surface,
            color: T.text, fontSize: 12,
          }}
        >
          {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: T.radius,
          background: T.greenBg, border: `1px solid ${T.green}30`,
        }}>
          <div style={{ fontSize: 12, color: T.green, marginBottom: 4 }}>Thu nhập</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.green }}>{fmtShort(totals.incomeActual)}</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>KH: {fmtShort(totals.incomePlanned)}</div>
        </div>
        <div style={{
          flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: T.radius,
          background: T.redBg, border: `1px solid ${T.red}30`,
        }}>
          <div style={{ fontSize: 12, color: T.red, marginBottom: 4 }}>Chi phí</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.red }}>{fmtShort(totals.expenseActual)}</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>KH: {fmtShort(totals.expensePlanned)}</div>
        </div>
        <div style={{
          flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: T.radius,
          background: T.primaryLight, border: `1px solid ${T.primary}30`,
        }}>
          <div style={{ fontSize: 12, color: T.primary, marginBottom: 4 }}>Lợi nhuận ròng</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
            {fmtShort(totals.incomeActual - totals.expenseActual)}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted }}>
            KH: {fmtShort(totals.incomePlanned - totals.expensePlanned)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <BudgetSection
          title="Thu nhập"
          categories={INCOME_CATEGORIES}
          budgets={budgets}
          transactions={transactions}
          month={month}
          color={T.green}
          onEdit={(catId, amount) => { setEditCat(catId); setEditAmount(amount); }}
        />
        <BudgetSection
          title="Chi phí"
          categories={EXPENSE_CATEGORIES}
          budgets={budgets}
          transactions={transactions}
          month={month}
          color={T.red}
          onEdit={(catId, amount) => { setEditCat(catId); setEditAmount(amount); }}
        />
      </div>

      <Modal
        open={!!editCat}
        onClose={() => setEditCat(null)}
        title={`Sửa ngân sách - ${getCategoryById(editCat)?.name || ''}`}
        width={360}
      >
        <Input label="Số tiền kế hoạch (VNĐ)" type="number" value={editAmount}
          onChange={(v) => setEditAmount(v)} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Btn variant="ghost" onClick={() => setEditCat(null)}>Hủy</Btn>
          <Btn onClick={() => {
            onUpdateBudget(month, editCat, editAmount);
            setEditCat(null);
          }}>Lưu</Btn>
        </div>
      </Modal>
    </div>
  );
}

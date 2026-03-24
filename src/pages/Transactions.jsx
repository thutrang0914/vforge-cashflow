import { useState, useMemo } from 'react';
import T from '../theme';
import Table from '../components/ui/Table';
import Btn from '../components/ui/Btn';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import {
  fmtMoney, fmtDate, getCategoryById,
  getIncomeCategories, getExpenseCategories,
} from '../utils';

function TransactionForm({ tx, onSave, onClose, categories }) {
  const [form, setForm] = useState(tx || {
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    type: 'income',
    categoryId: getIncomeCategories(categories)[0]?.id || 'tuition',
    description: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cats = form.type === 'income'
    ? getIncomeCategories(categories)
    : getExpenseCategories(categories);

  return (
    <div>
      <Select
        label="Loại"
        value={form.type}
        onChange={(v) => {
          set('type', v);
          const firstCat = v === 'income'
            ? getIncomeCategories(categories)[0]
            : getExpenseCategories(categories)[0];
          set('categoryId', firstCat?.id || '');
        }}
        options={[
          { value: 'income', label: 'Thu nhập' },
          { value: 'expense', label: 'Chi phí' },
        ]}
      />
      <Select
        label="Danh mục"
        value={form.categoryId}
        onChange={(v) => set('categoryId', v)}
        options={cats.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
      />
      <Input label="Ngày" type="date" value={form.date} onChange={(v) => set('date', v)} />
      <Input label="Số tiền (VNĐ)" type="number" value={form.amount} onChange={(v) => set('amount', v)} />
      <Input label="Mô tả" value={form.description} onChange={(v) => set('description', v)} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
        <Btn onClick={() => onSave(form)} disabled={!form.amount || !form.date}>Lưu</Btn>
      </div>
    </div>
  );
}

export default function Transactions({ transactions, categories, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (filter !== 'all') list = list.filter((t) => t.type === filter);
    if (monthFilter !== 'all') list = list.filter((t) => t.date?.startsWith(monthFilter));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((t) =>
        (t.description || '').toLowerCase().includes(s) ||
        (getCategoryById(t.categoryId, categories)?.name || '').toLowerCase().includes(s)
      );
    }
    return list;
  }, [transactions, filter, search, monthFilter, categories]);

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date?.slice(0, 7)).filter(Boolean));
    return ['all', ...Array.from(set).sort().reverse()];
  }, [transactions]);

  const columns = [
    {
      key: 'date', title: 'Ngày', width: 100,
      render: (v) => <span style={{ fontSize: 12 }}>{fmtDate(v)}</span>,
    },
    {
      key: 'type', title: 'Loại', width: 80,
      render: (v) => (
        <Badge color={v === 'income' ? T.green : T.red}>
          {v === 'income' ? 'Thu' : 'Chi'}
        </Badge>
      ),
    },
    {
      key: 'categoryId', title: 'Danh mục',
      render: (v) => {
        const cat = getCategoryById(v, categories);
        return cat ? `${cat.icon} ${cat.name}` : v;
      },
    },
    { key: 'description', title: 'Mô tả' },
    {
      key: 'amount', title: 'Số tiền', align: 'right',
      render: (v, row) => (
        <span style={{ color: row.type === 'income' ? T.green : T.red, fontWeight: 600 }}>
          {row.type === 'income' ? '+' : '-'}{fmtMoney(v)}
        </span>
      ),
    },
    {
      key: 'actions', title: '', width: 80,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Btn variant="ghost" style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); setEditTx(row); }}>
            ✏️
          </Btn>
          <Btn variant="ghost" style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(row.id); }}>
            🗑️
          </Btn>
        </div>
      ),
    },
  ];

  const handleSave = (form) => {
    if (editTx) {
      onUpdate({ ...editTx, ...form, amount: Number(form.amount) });
    } else {
      onAdd({ ...form, amount: Number(form.amount) });
    }
    setShowForm(false);
    setEditTx(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.text, fontSize: 20 }}>Giao dịch</h2>
        <Btn onClick={() => setShowForm(true)}>+ Thêm giao dịch</Btn>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'income', 'expense'].map((f) => (
          <Btn
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
            style={{ fontSize: 12 }}
          >
            {f === 'all' ? 'Tất cả' : f === 'income' ? 'Thu nhập' : 'Chi phí'}
          </Btn>
        ))}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`, background: T.surface,
            color: T.text, fontSize: 12,
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>{m === 'all' ? 'Tất cả tháng' : m}</option>
          ))}
        </select>
        <input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`, background: T.surface,
            color: T.text, fontSize: 12, marginLeft: 'auto', width: 200,
          }}
        />
      </div>

      <Table columns={columns} data={filtered} />

      <Modal
        open={showForm || !!editTx}
        onClose={() => { setShowForm(false); setEditTx(null); }}
        title={editTx ? 'Sửa giao dịch' : 'Thêm giao dịch'}
      >
        <TransactionForm
          tx={editTx}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTx(null); }}
        />
      </Modal>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Xác nhận xóa"
        width={360}
      >
        {(() => {
          const tx = transactions.find((t) => t.id === confirmDeleteId);
          const cat = tx ? getCategoryById(tx.categoryId, categories) : null;
          return (
            <div>
              <p style={{ color: T.textSecondary, fontSize: 13, marginBottom: 8 }}>
                Bạn có chắc muốn xóa giao dịch này?
              </p>
              {tx && (
                <div style={{
                  padding: '10px 14px', borderRadius: T.radiusSm,
                  background: T.bg, border: `1px solid ${T.border}`, marginBottom: 16,
                  fontSize: 13,
                }}>
                  <div style={{ color: T.text, fontWeight: 500, marginBottom: 4 }}>
                    {cat ? `${cat.icon} ${cat.name}` : tx.categoryId}
                  </div>
                  <div style={{ color: tx.type === 'income' ? T.green : T.red, fontWeight: 600 }}>
                    {tx.type === 'income' ? '+' : '-'}{fmtMoney(tx.amount)}
                  </div>
                  {tx.description && (
                    <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{tx.description}</div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={() => setConfirmDeleteId(null)}>Hủy</Btn>
                <Btn variant="danger" onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }}>
                  Xóa
                </Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

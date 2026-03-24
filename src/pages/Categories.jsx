import { useState } from 'react';
import T from '../theme';
import Btn from '../components/ui/Btn';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';

const ICON_OPTIONS = [
  '🎓', '🤖', '🔄', '👥', '💰', '👤', '🏢', '⚙️', '📢', '💻',
  '🚚', '📋', '📦', '🎯', '📊', '💳', '🏪', '🎨', '🔧', '📱',
  '🖥️', '🚗', '✈️', '🏥', '🎓', '📚', '🎵', '🍽️', '☕', '🛒',
];

function CategoryCard({ category, onEdit, onDelete, isDefault }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      background: T.surface, borderRadius: T.radiusSm,
      border: `1px solid ${T.border}`,
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.borderLight)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
    >
      <span style={{ fontSize: 20 }}>{category.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{category.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>ID: {category.id}</div>
      </div>
      <Badge color={category.type === 'income' ? T.green : T.red}>
        {category.type === 'income' ? 'Thu' : 'Chi'}
      </Badge>
      {isDefault && (
        <Badge color={T.textMuted} style={{ fontSize: 10 }}>Mặc định</Badge>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        <Btn variant="ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => onEdit(category)}>
          ✏️
        </Btn>
        {!isDefault && (
          <Btn variant="ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => onDelete(category.id)}>
            🗑️
          </Btn>
        )}
      </div>
    </div>
  );
}

function CategoryForm({ category, onSave, onClose, existingIds }) {
  const isEdit = !!category;
  const [form, setForm] = useState(category || {
    id: '',
    name: '',
    icon: '📦',
    type: 'income',
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleIdChange = (v) => {
    // Auto-generate slug from name if not editing
    const slug = v.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    set('id', slug);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError('Tên danh mục không được trống'); return; }
    if (!form.id.trim()) { setError('ID không được trống'); return; }
    if (!isEdit && existingIds.includes(form.id)) { setError('ID đã tồn tại'); return; }
    setError('');
    onSave(form);
  };

  return (
    <div>
      {error && (
        <div style={{
          padding: '8px 12px', marginBottom: 12, borderRadius: T.radiusSm,
          background: T.redBg, color: T.red, fontSize: 12, border: `1px solid ${T.red}30`,
        }}>
          {error}
        </div>
      )}
      <Input
        label="Tên danh mục"
        value={form.name}
        onChange={(v) => {
          set('name', v);
          if (!isEdit) {
            const slug = v.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D')
              .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
            set('id', slug);
          }
        }}
        placeholder="Ví dụ: Phí vận chuyển"
      />
      <Input
        label="ID (dùng để tham chiếu)"
        value={form.id}
        onChange={(v) => handleIdChange(v)}
        disabled={isEdit}
        placeholder="Ví dụ: shipping_fee"
      />
      <Select
        label="Loại"
        value={form.type}
        onChange={(v) => set('type', v)}
        options={[
          { value: 'income', label: 'Thu nhập' },
          { value: 'expense', label: 'Chi phí' },
        ]}
      />
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: T.textSecondary }}>
          Icon
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              onClick={() => set('icon', icon)}
              style={{
                width: 32, height: 32, borderRadius: T.radiusSm,
                border: form.icon === icon ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                background: form.icon === icon ? T.primaryLight : T.bg,
                cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
        <Btn onClick={handleSave}>{isEdit ? 'Cập nhật' : 'Thêm'}</Btn>
      </div>
    </div>
  );
}

export default function Categories({ categories, onAdd, onUpdate, onDelete, defaultCategoryIds }) {
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = filter === 'all'
    ? categories
    : categories.filter((c) => c.type === filter);

  const incomeCount = categories.filter((c) => c.type === 'income').length;
  const expenseCount = categories.filter((c) => c.type === 'expense').length;

  const handleSave = (form) => {
    if (editCat) {
      onUpdate(form);
    } else {
      onAdd(form);
    }
    setShowForm(false);
    setEditCat(null);
  };

  const handleDelete = (id) => {
    onDelete(id);
    setConfirmDelete(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.text, fontSize: 20 }}>Danh mục Thu/Chi</h2>
        <Btn onClick={() => setShowForm(true)}>+ Thêm danh mục</Btn>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{
          padding: '10px 16px', borderRadius: T.radiusSm,
          background: T.greenBg, border: `1px solid ${T.green}30`,
          fontSize: 13, color: T.green,
        }}>
          📈 Thu nhập: <strong>{incomeCount}</strong> danh mục
        </div>
        <div style={{
          padding: '10px 16px', borderRadius: T.radiusSm,
          background: T.redBg, border: `1px solid ${T.red}30`,
          fontSize: 13, color: T.red,
        }}>
          📉 Chi phí: <strong>{expenseCount}</strong> danh mục
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'income', 'expense'].map((f) => (
          <Btn
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
            style={{ fontSize: 12 }}
          >
            {f === 'all' ? `Tất cả (${categories.length})` : f === 'income' ? `Thu nhập (${incomeCount})` : `Chi phí (${expenseCount})`}
          </Btn>
        ))}
      </div>

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isDefault={defaultCategoryIds.includes(cat.id)}
            onEdit={(c) => setEditCat(c)}
            onDelete={(id) => setConfirmDelete(id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: 40, textAlign: 'center', color: T.textMuted,
            background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`,
          }}>
            Không có danh mục nào
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showForm || !!editCat}
        onClose={() => { setShowForm(false); setEditCat(null); }}
        title={editCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        width={420}
      >
        <CategoryForm
          category={editCat}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditCat(null); }}
          existingIds={categories.map((c) => c.id)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xác nhận xóa"
        width={360}
      >
        <p style={{ color: T.textSecondary, fontSize: 13, marginBottom: 16 }}>
          Bạn có chắc muốn xóa danh mục này? Các giao dịch đã gắn danh mục này sẽ không bị xóa nhưng sẽ hiển thị ID thay vì tên.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Hủy</Btn>
          <Btn variant="danger" onClick={() => handleDelete(confirmDelete)}>Xóa</Btn>
        </div>
      </Modal>
    </div>
  );
}

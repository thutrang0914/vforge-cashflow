import { useState, useRef } from 'react';
import T from '../../theme';
import { VARIABLE_GROUPS } from '../../data/planningDefaults';

// Format số theo chuẩn kế toán Việt Nam: dấu chấm ngăn hàng nghìn, dấu phẩy thập phân
const fmtVN = (n) => {
  if (n === '' || n === null || n === undefined) return '';
  const num = Number(n);
  if (isNaN(num)) return '';
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
};

// Parse chuỗi VN format về số
const parseVN = (str) => {
  if (!str) return 0;
  const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

function VariableInput({ field, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const inputRef = useRef(null);

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        style={{
          width: '100%', padding: '6px 8px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, background: T.bg,
          color: T.text, fontSize: 12, outline: 'none',
        }}
      >
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  // Số nhỏ (%, người, cái) → input number bình thường
  const isSmallNumber = (field.step || 1) < 1000 && !field.unit?.includes('đ') && !field.unit?.includes('VND');

  if (isSmallNumber) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={value}
          step={field.step || 1}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`, background: T.bg,
            color: T.text, fontSize: 12, outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {field.unit && (
          <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap', minWidth: 40 }}>
            {field.unit}
          </span>
        )}
      </div>
    );
  }

  // Số lớn (VNĐ) → text input với format dấu chấm hàng nghìn
  const displayValue = editing ? rawValue : fmtVN(value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onFocus={() => {
          setEditing(true);
          setRawValue(value.toString());
        }}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.,]/g, '');
          setRawValue(v);
        }}
        onBlur={() => {
          setEditing(false);
          const parsed = parseVN(rawValue);
          onChange(field.key, parsed);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.target.blur();
          }
        }}
        style={{
          width: '100%', padding: '6px 8px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, background: T.bg,
          color: T.text, fontSize: 12, outline: 'none',
          boxSizing: 'border-box', textAlign: 'right',
        }}
      />
      {field.unit && (
        <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap', minWidth: 40 }}>
          {field.unit}
        </span>
      )}
    </div>
  );
}

function Section({ group, variables, onChange, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const visibleFields = group.fields.filter((f) => !f.showWhen || f.showWhen(variables));

  return (
    <div style={{
      borderBottom: `1px solid ${T.border}`,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '10px 12px', border: 'none', cursor: 'pointer',
          background: 'transparent', display: 'flex', alignItems: 'center', gap: 8,
          color: T.text, fontSize: 13, fontWeight: 600,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span>{group.icon}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{group.title}</span>
        <span style={{ fontSize: 10, color: T.textMuted, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '0 12px 12px' }}>
          {visibleFields.map((field) => (
            <div key={field.key} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 6,
            }}>
              <label style={{
                fontSize: 11, color: T.textSecondary, width: 130,
                flexShrink: 0, lineHeight: 1.3,
              }}>
                {field.label}
              </label>
              <div style={{ flex: 1, minWidth: 0 }}>
                <VariableInput
                  field={field}
                  value={variables[field.key]}
                  onChange={onChange}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VariablePanel({ variables, onChange }) {
  return (
    <div style={{
      background: T.surface, borderRadius: T.radius,
      border: `1px solid ${T.border}`, overflow: 'hidden',
      height: 'fit-content', maxHeight: 'calc(100vh - 180px)',
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '10px 12px', borderBottom: `1px solid ${T.border}`,
        fontSize: 13, fontWeight: 700, color: T.text,
        position: 'sticky', top: 0, background: T.surface, zIndex: 1,
      }}>
        📋 Biến hoạch định
      </div>
      {VARIABLE_GROUPS.map((group, i) => (
        <Section
          key={group.key}
          group={group}
          variables={variables}
          onChange={onChange}
          defaultExpanded={i === 0}
        />
      ))}
    </div>
  );
}

import { useState } from 'react';
import T from '../../theme';
import Btn from '../ui/Btn';

const SCENARIOS = [
  { id: 'base', label: 'Cơ bản', icon: '📊' },
  { id: 'optimistic', label: 'Lạc quan', icon: '🚀' },
  { id: 'pessimistic', label: 'Bi quan', icon: '⚠️' },
];

export default function ScenarioBar({ active, onChange, onSave, onReset, hasChanges }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      padding: '12px 16px', background: T.surface, borderRadius: T.radius,
      border: `1px solid ${T.border}`, marginBottom: 16,
    }}>
      <span style={{ fontSize: 12, color: T.textMuted, marginRight: 4 }}>Kịch bản:</span>
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          style={{
            padding: '6px 14px', borderRadius: T.radiusSm, border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: active === s.id ? 600 : 400,
            background: active === s.id ? T.primary : T.surfaceHover,
            color: active === s.id ? '#fff' : T.textSecondary,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <span>{s.icon}</span> {s.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <Btn variant="ghost" onClick={onReset} style={{ fontSize: 12 }}>
        🔄 Reset mặc định
      </Btn>
      <Btn onClick={onSave} style={{ fontSize: 12 }} disabled={!hasChanges}>
        💾 Lưu kịch bản
      </Btn>
    </div>
  );
}

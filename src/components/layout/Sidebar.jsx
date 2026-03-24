import { useState } from 'react';
import T from '../../theme';

const NAV = [
  { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { id: 'transactions', label: 'Giao dịch', icon: '💳' },
  { id: 'budget', label: 'Ngân sách', icon: '🎯' },
  { id: 'reports', label: 'Báo cáo', icon: '📈' },
  { id: 'planning', label: 'Kế hoạch', icon: '📋' },
  { id: 'forecast', label: 'Dự báo', icon: '🔮' },
];

export default function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      width: collapsed ? 56 : 200, background: T.surface, height: '100vh',
      borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s', flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{
        padding: collapsed ? '16px 8px' : '16px 16px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: T.radiusSm,
          background: `linear-gradient(135deg, ${T.primary}, ${T.purple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          V
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Vforge</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Cashflow</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '8px 6px' }}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: T.radiusSm, border: 'none', cursor: 'pointer',
                background: isActive ? T.primaryLight : 'transparent',
                color: isActive ? T.primary : T.textSecondary,
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                marginBottom: 2, transition: 'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = T.surfaceHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: 12, border: 'none', background: 'transparent',
          color: T.textMuted, cursor: 'pointer', fontSize: 16,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {collapsed ? '▶' : '◀'}
      </button>
    </div>
  );
}

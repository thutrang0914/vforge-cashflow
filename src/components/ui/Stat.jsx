import T from '../../theme';

export default function Stat({ label, value, sub, color = T.primary, icon }) {
  return (
    <div style={{
      background: T.surface, borderRadius: T.radius, padding: '16px 20px',
      border: `1px solid ${T.border}`, flex: 1, minWidth: 180,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: T.radiusSm,
            background: color + '18', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

import T from '../../theme';

export default function Badge({ children, color = T.primary, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: color + '20', color,
      ...style,
    }}>
      {children}
    </span>
  );
}

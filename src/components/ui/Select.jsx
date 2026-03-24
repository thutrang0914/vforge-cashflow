import T from '../../theme';

export default function Select({ label, value, onChange, options, style, ...props }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: T.textSecondary }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, background: T.bg,
          color: T.text, fontSize: 13, outline: 'none',
          boxSizing: 'border-box', cursor: 'pointer',
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

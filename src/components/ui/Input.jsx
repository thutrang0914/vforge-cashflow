import T from '../../theme';

export default function Input({ label, type = 'text', value, onChange, placeholder, style, ...props }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: T.textSecondary }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: T.radiusSm,
          border: `1px solid ${T.border}`, background: T.bg,
          color: T.text, fontSize: 13, outline: 'none',
          boxSizing: 'border-box',
        }}
        {...props}
      />
    </div>
  );
}

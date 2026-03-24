import T from '../../theme';

export default function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, borderRadius: T.radiusLg,
          border: `1px solid ${T.border}`, width: '100%', maxWidth: width,
          maxHeight: '90vh', overflow: 'auto', boxShadow: T.shadowLg,
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
        }}>
          <h3 style={{ margin: 0, color: T.text, fontSize: 16 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: T.textMuted,
              cursor: 'pointer', fontSize: 20, padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

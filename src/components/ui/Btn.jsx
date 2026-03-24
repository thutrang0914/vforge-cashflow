import { useState } from 'react';
import T from '../../theme';

const variants = {
  primary: { bg: T.primary, bgH: T.primaryHover, color: '#fff' },
  danger: { bg: T.red, bgH: '#dc2626', color: '#fff' },
  ghost: { bg: 'transparent', bgH: T.surfaceHover, color: T.textSecondary },
  secondary: { bg: T.surfaceHover, bgH: T.borderLight, color: T.text },
};

export default function Btn({ children, variant = 'primary', onClick, style, disabled, ...props }) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 16px', borderRadius: T.radiusSm,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: hover && !disabled ? v.bgH : v.bg,
        color: v.color, fontSize: 13, fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

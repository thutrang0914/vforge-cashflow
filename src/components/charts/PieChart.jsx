import { useState } from 'react';
import T from '../../theme';
import { fmtShort, CHART_COLORS } from '../../utils';

export default function PieChart({ data, title, height = 220 }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) return null;

  const cx = 110, cy = height / 2, r = 75, ir = 45;
  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const angle = pct * Math.PI * 2;
    const midAngle = startAngle + angle / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(startAngle + angle);
    const iy2 = cy + ir * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = [
      `M${ix1},${iy1}`,
      `L${x1},${y1}`,
      `A${r},${r} 0 ${large} 1 ${x2},${y2}`,
      `L${ix2},${iy2}`,
      `A${ir},${ir} 0 ${large} 0 ${ix1},${iy1}`,
      'Z',
    ].join(' ');
    startAngle += angle;
    return { ...d, path, pct, color: d.color || CHART_COLORS[i % CHART_COLORS.length], midAngle };
  });

  return (
    <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 16 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <svg viewBox={`0 0 220 ${height}`} style={{ width: 220, height, flexShrink: 0 }}>
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.4}
              style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fill={T.textSecondary} fontSize="10">Tổng</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill={T.text} fontSize="14" fontWeight="700">
            {fmtShort(total)}
          </text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {slices.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                padding: '4px 8px', borderRadius: T.radiusSm,
                background: hoverIdx === i ? T.surfaceHover : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ color: T.textSecondary, flex: 1 }}>{s.name}</span>
              <span style={{ color: T.text, fontWeight: 500 }}>{(s.pct * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

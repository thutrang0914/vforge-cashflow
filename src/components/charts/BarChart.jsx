import { useState } from 'react';
import T from '../../theme';
import { fmtShort } from '../../utils';

export default function BarChart({ data, bars, title, height = 240 }) {
  const [hover, setHover] = useState(null);

  if (!data.length) return null;

  const allVals = [];
  bars.forEach((b) => data.forEach((d) => allVals.push(d[b.key] || 0)));
  const maxVal = Math.max(...allVals, 0) || 1;

  const chartW = 560;
  const chartH = height - 50;
  const barGroupW = chartW / data.length;
  const barW = Math.min(barGroupW / (bars.length + 1), 30);
  const gap = (barGroupW - barW * bars.length) / 2;

  return (
    <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 16 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>{title}</div>}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        {bars.map((b) => (
          <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textSecondary }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: b.color }} />
            {b.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 620 ${height}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <g key={i}>
            <line x1="50" y1={20 + (1 - pct) * chartH} x2="610" y2={20 + (1 - pct) * chartH}
              stroke={T.border} strokeDasharray="4 4" />
            <text x="44" y={24 + (1 - pct) * chartH} textAnchor="end" fill={T.textMuted} fontSize="10">
              {fmtShort(maxVal * pct)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {bars.map((b, j) => {
              const val = d[b.key] || 0;
              const h = (val / maxVal) * chartH;
              const x = 50 + i * barGroupW + gap + j * barW;
              return (
                <rect
                  key={b.key}
                  x={x}
                  y={20 + chartH - h}
                  width={barW - 2}
                  height={h}
                  rx="3"
                  fill={b.color}
                  opacity={hover === null || hover === i ? 1 : 0.5}
                  style={{ transition: 'opacity 0.15s' }}
                />
              );
            })}
            <text
              x={50 + i * barGroupW + barGroupW / 2}
              y={height - 4}
              textAnchor="middle"
              fill={T.textMuted}
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12,
          color: T.textSecondary, marginTop: 4,
        }}>
          <span style={{ color: T.text }}>{data[hover].label}</span>
          {bars.map((b) => (
            <span key={b.key} style={{ color: b.color }}>
              {b.label}: {fmtShort(data[hover][b.key] || 0)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

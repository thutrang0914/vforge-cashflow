import { useState, useMemo } from 'react';
import T from '../../theme';
import { fmtShort } from '../../utils';

export default function TrendChart({ data, lines, height = 260, title }) {
  const [hover, setHover] = useState(null);

  const { points, maxY, minY, yTicks } = useMemo(() => {
    if (!data.length) return { points: {}, maxY: 0, minY: 0, yTicks: [] };
    let allVals = [];
    lines.forEach((l) => data.forEach((d) => allVals.push(d[l.key] || 0)));
    const max = Math.max(...allVals, 0);
    const min = Math.min(...allVals, 0);
    const range = max - min || 1;
    const pad = range * 0.1;
    const adjMax = max + pad;
    const adjMin = min - pad;
    const adjRange = adjMax - adjMin;

    const pts = {};
    lines.forEach((l) => {
      pts[l.key] = data.map((d, i) => ({
        x: 60 + (i / Math.max(data.length - 1, 1)) * 540,
        y: 20 + (1 - ((d[l.key] || 0) - adjMin) / adjRange) * (height - 50),
        val: d[l.key] || 0,
        label: d.label,
      }));
    });

    const ticks = [];
    const step = adjRange / 4;
    for (let i = 0; i <= 4; i++) {
      const val = adjMin + step * i;
      ticks.push({
        val,
        y: 20 + (1 - (val - adjMin) / adjRange) * (height - 50),
      });
    }

    return { points: pts, maxY: adjMax, minY: adjMin, yTicks: ticks };
  }, [data, lines, height]);

  if (!data.length) return null;

  const makePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 16 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>{title}</div>}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        {lines.map((l) => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.textSecondary }}>
            <div style={{ width: 12, height: 3, background: l.color, borderRadius: 2 }} />
            {l.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 620 ${height}`} style={{ width: '100%', height: 'auto' }}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1="60" y1={t.y} x2="600" y2={t.y} stroke={T.border} strokeDasharray="4 4" />
            <text x="50" y={t.y + 4} textAnchor="end" fill={T.textMuted} fontSize="10">
              {fmtShort(t.val)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <text
            key={i}
            x={60 + (i / Math.max(data.length - 1, 1)) * 540}
            y={height - 4}
            textAnchor="middle"
            fill={T.textMuted}
            fontSize="10"
          >
            {d.label}
          </text>
        ))}
        {lines.map((l) => (
          <path
            key={l.key}
            d={makePath(points[l.key] || [])}
            fill="none"
            stroke={l.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {hover !== null && (
          <g>
            <line
              x1={60 + (hover / Math.max(data.length - 1, 1)) * 540}
              y1="20"
              x2={60 + (hover / Math.max(data.length - 1, 1)) * 540}
              y2={height - 20}
              stroke={T.textMuted}
              strokeDasharray="3 3"
            />
            {lines.map((l) => {
              const pt = (points[l.key] || [])[hover];
              if (!pt) return null;
              return (
                <circle key={l.key} cx={pt.x} cy={pt.y} r="4" fill={l.color} stroke={T.surface} strokeWidth="2" />
              );
            })}
          </g>
        )}
        {data.map((_, i) => (
          <rect
            key={i}
            x={60 + (i / Math.max(data.length - 1, 1)) * 540 - 20}
            y="0"
            width="40"
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12,
          color: T.textSecondary, marginTop: 4,
        }}>
          {lines.map((l) => (
            <span key={l.key} style={{ color: l.color }}>
              {l.label}: {fmtShort(data[hover][l.key] || 0)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

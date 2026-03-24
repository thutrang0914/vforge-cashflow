import T from '../../theme';

export default function Table({ columns, data, onRowClick, emptyText = 'Không có dữ liệu' }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: T.radius, border: `1px solid ${T.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: T.surface }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '10px 14px', textAlign: col.align || 'left',
                  color: T.textSecondary, fontWeight: 500, fontSize: 12,
                  borderBottom: `1px solid ${T.border}`,
                  whiteSpace: 'nowrap', width: col.width,
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: 40, textAlign: 'center', color: T.textMuted,
              }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  borderBottom: i < data.length - 1 ? `1px solid ${T.border}` : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '10px 14px', color: T.text,
                      textAlign: col.align || 'left', whiteSpace: 'nowrap',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

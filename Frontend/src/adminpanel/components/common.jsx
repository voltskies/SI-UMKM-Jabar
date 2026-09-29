import { Search } from 'lucide-react';

export const C = { ink: '#0F172A', mute: '#64748B', line: '#E2E8F0', bg: '#F8FAFC', dark: '#164E43', link: '#008848', soft: '#F1F5F9' };
export const font = 'Inter, system-ui, sans-serif';
export const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
export const grid = (min = 200, gap = 14) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap });

const TONE = { amber: ['#92400E', '#FEF3C7'], green: ['#164E43', '#D1FAE5'], red: ['#991B1B', '#FEE2E2'], blue: ['#1E40AF', '#DBEAFE'], gray: ['#334155', '#E2E8F0'] };
export const STATUS_TONE = { 'Menunggu Verifikasi': 'amber', Diproses: 'blue', Disetujui: 'green', Selesai: 'green', Ditolak: 'red', 'Perlu Perbaikan': 'gray' };

export function Badge({ children, tone }) {
  const [fg, bg] = TONE[tone || STATUS_TONE[children] || 'gray'];
  return <span style={{ color: fg, background: bg, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{children}</span>;
}

export const Card = ({ title, right, children, style }) => (
  <section style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: 20, ...style }}>
    {title && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: C.ink }}>{title}</h3>{right}
      </div>
    )}
    {children}
  </section>
);

export const Btn = ({ dark, danger, style, ...p }) => (
  <button {...p} style={{
    padding: '9px 16px', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
    border: dark ? 'none' : `1px solid ${danger ? '#FCA5A5' : C.line}`, background: dark ? C.dark : '#fff',
    color: dark ? '#fff' : danger ? '#B91C1C' : C.ink, ...style,
  }} />
);

export function StatCard({ label, value, unit, note, icon: Icon }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: C.mute, fontSize: '0.78rem', fontWeight: 600 }}>
        {label}{Icon && <span style={{ background: C.bg, borderRadius: 8, padding: 6, display: 'flex' }}><Icon size={16} color={C.ink} /></span>}
      </div>
      <div style={{ margin: '10px 0 8px', color: C.ink }}>
        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</span>{unit && <span style={{ marginLeft: 6, color: C.mute }}>{unit}</span>}
      </div>
      {note && <Badge>{note}</Badge>}
    </Card>
  );
}

export const Header = ({ crumbs = [], title, desc, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
    <div>
      <div style={{ fontSize: '0.75rem', color: C.mute }}>
        {crumbs.map((c, i) => <span key={c}>{i > 0 && ' › '}<span style={i === crumbs.length - 1 ? { color: C.link, fontWeight: 600 } : {}}>{c}</span></span>)}
      </div>
      <h1 style={{ margin: '6px 0 4px', fontSize: '1.6rem', color: C.ink }}>{title}</h1>
      {desc && <p style={{ margin: 0, color: C.mute, fontSize: '0.9rem' }}>{desc}</p>}
    </div>
    {right}
  </div>
);

export const Chips = ({ items, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {items.map(([k, n]) => (
      <button key={k} onClick={() => onChange(k)} style={{
        padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
        border: `1px solid ${value === k ? C.dark : C.line}`, background: value === k ? C.dark : '#fff', color: value === k ? '#fff' : C.ink,
      }}>{k} <span style={{ opacity: 0.6 }}>{n}</span></button>
    ))}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
    <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 11 }} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: 'inherit', fontSize: '0.85rem' }} />
  </div>
);

export function DataTable({ cols, rows, onRow, activeId, kosong = 'Tidak ada data yang cocok.' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead><tr>{cols.map((c) => <th key={c.h} style={{ textAlign: 'left', padding: '8px 10px', color: C.mute, fontSize: '0.72rem', fontWeight: 700 }}>{c.h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onRow?.(r)} style={{ borderTop: `1px solid ${C.line}`, cursor: onRow ? 'pointer' : 'default', background: activeId === r.id ? C.soft : 'transparent' }}>
              {cols.map((c) => <td key={c.h} style={{ padding: '12px 10px', verticalAlign: 'middle' }}>{c.r(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ textAlign: 'center', color: C.mute, padding: 24 }}>{kosong}</p>}
    </div>
  );
}

export const Row = ({ label, value }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, padding: '8px 0', borderBottom: `1px solid ${C.bg}`, fontSize: '0.85rem' }}>
    <span style={{ color: C.mute }}>{label}</span><span style={{ color: C.ink, wordBreak: 'break-word' }}>{value}</span>
  </div>
);
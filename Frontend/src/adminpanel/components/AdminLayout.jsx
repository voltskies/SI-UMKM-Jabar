import { LayoutDashboard, HandCoins, ShieldCheck, Users, Settings, LogOut, Landmark } from 'lucide-react';
import { C, font } from './common';

const MENU = [
  [null, [['dashboard', 'Dashboard', LayoutDashboard]]],
  ['Layanan', [['bantuan', 'Bantuan Modal', HandCoins], ['legalitas', 'Sertifikasi Usaha', ShieldCheck]]],
  ['Manajemen', [['akun', 'Data Akun UMKM', Users]]],
];

export default function AdminLayout({ page, go, user, onKeluar, children }) {
  const btn = (key, label, Icon, on, color = 'rgba(255,255,255,0.78)', onClick = () => go(key)) => (
    <button key={label} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', borderRadius: 10,
      background: on ? '#fff' : 'transparent', color: on ? C.dark : color, fontWeight: on ? 700 : 500, fontFamily: 'inherit',
      fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
    }}><Icon size={16} /> {label}</button>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', background: C.bg, fontFamily: font }}>
      <aside style={{ background: C.dark, padding: 16, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div><div style={{ fontWeight: 800, color: '#fff' }}>SI-UMKM</div><div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)' }}>PROVINSI JAWA BARAT</div></div>
        </div>
        <nav style={{ display: 'grid', gap: 4 }}>
          {MENU.map(([grup, items]) => (
            <div key={grup || 'root'} style={{ marginBottom: 12 }}>
              {grup && <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', margin: '8px 12px' }}>{grup}</div>}
              {items.map(([k, l, I]) => btn(k, l, I, page === k))}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 4 }}>
          {btn('pengaturan', 'Pengaturan Akun', Settings, false, undefined, () => {})}
          {btn('keluar', 'Keluar Portal', LogOut, false, '#FCA5A5', onKeluar)}
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: `1px solid ${C.line}`, padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}`, borderRadius: 999, padding: '4px 12px 4px 4px', fontSize: '0.85rem', fontWeight: 600, color: C.ink }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: C.dark, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>{(user?.nama || 'A')[0]}</span>
            {user?.nama || 'Admin'}
          </span>
        </header>
        <main style={{ padding: 32, maxWidth: 1200 }}>{children}</main>
      </div>
    </div>
  );
}
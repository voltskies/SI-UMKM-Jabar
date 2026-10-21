import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, HandCoins, ShieldCheck, Users, LogOut, ChevronDown } from 'lucide-react';
import { C, font } from './common';

const MENU = [
  [null, [['dashboard', 'Dashboard', LayoutDashboard]]],
  ['Layanan', [['bantuan', 'Bantuan Modal', HandCoins], ['legalitas', 'Sertifikasi Usaha', ShieldCheck]]],
  ['Manajemen', [['akun', 'Data Akun UMKM', Users]]],
];

export default function AdminLayout({ page, go, user, onKeluar, children }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const namaAdmin = user?.nama?.trim() || 'Administrator Dinas';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: `1px solid ${C.line}`, padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}`, borderRadius: 999, padding: '4px 12px 4px 4px', fontSize: '0.85rem', fontWeight: 600, color: C.ink, background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#164E43', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.75rem' }}>{namaAdmin.charAt(0).toUpperCase()}</span>
              {namaAdmin}
              <ChevronDown size={15} color="#64748B" />
            </button>

            {profileOpen && (
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 260, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: '0 12px 28px rgba(15,23,42,0.16)', padding: 14, zIndex: 1000, boxSizing: 'border-box' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#008848', background: '#EAF1F1', borderRadius: 999, padding: '5px 9px', fontSize: '0.72rem', fontWeight: 700, marginBottom: 12 }}>
                  <ShieldCheck size={14} /> Admin Dinas
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.ink, marginBottom: 3 }}>{namaAdmin}</div>
                <div style={{ fontSize: '0.78rem', color: C.mute, wordBreak: 'break-word' }}>{user?.email}</div>
                {user?.nip && <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: 4 }}>NIP: {user.nip}</div>}
                <div style={{ height: 1, background: C.line, margin: '12px 0' }} />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onKeluar();
                    setProfileOpen(false);
                  }}
                  onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                  onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', borderRadius: 8, padding: '9px 10px', background: 'transparent', color: '#DC2626', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <LogOut size={16} /> Keluar Akun
                </button>
              </div>
            )}
          </div>
        </header>
        <main style={{ padding: 32, maxWidth: 1200 }}>{children}</main>
      </div>
    </div>
  );
}
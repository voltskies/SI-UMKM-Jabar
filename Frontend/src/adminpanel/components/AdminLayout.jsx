import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, HandCoins, ShieldCheck, Users, LogOut, ChevronDown, Menu, X, Bell } from 'lucide-react';
import { API_BASE_URL, C, font } from './common';

const MENU = [
  [null, [['dashboard', 'Dashboard', LayoutDashboard]]],
  ['Layanan', [['bantuan', 'Bantuan Modal', HandCoins], ['legalitas', 'Sertifikasi Usaha', ShieldCheck]]],
  ['Manajemen', [['akun', 'Data Akun UMKM', Users]]],
];

export default function AdminLayout({ page, go, user, onKeluar, children }) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({ pelatihan: 0, bantuan: 0, sertifikasi: 0, total: 0 });
  const profileRef = useRef(null);
  const namaAdmin = user?.nama?.trim() || 'Administrator Dinas';

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/admin/notifikasi`);
        if (active) {
          const counts = response.data?.data;
          if (!counts || !['pelatihan', 'bantuan', 'sertifikasi', 'total'].every((key) => Number.isInteger(counts[key]))) {
            throw new Error('Format jumlah notifikasi dari API tidak valid.');
          }
          setNotificationCounts(counts);
        }
      } catch (error) {
        console.error('Gagal memuat jumlah notifikasi admin:', error);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigasi = (key) => {
    go(key);
    if (isMobile) setSidebarOpen(false);
  };

  const btn = (key, label, Icon, on, color = 'rgba(255,255,255,0.78)', onClick = () => handleNavigasi(key)) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        borderRadius: 10,
        background: on ? '#fff' : 'transparent',
        color: on ? C.dark : color,
        fontWeight: on ? 700 : 500,
        fontFamily: 'inherit',
        fontSize: '0.85rem',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div
      className="admin-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '240px minmax(0, 1fr)',
        minHeight: '100svh',
        background: C.bg,
        fontFamily: font,
      }}
    >
      {/* Backdrop gelap saat sidebar drawer terbuka di HP */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Sidebar Kiri (Tetap di Desktop, Drawer Geser di HP) */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          background: C.dark,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          width: isMobile ? '250px' : 'auto',
          maxWidth: '82vw',
          height: '100svh',
          boxSizing: 'border-box',
          zIndex: isMobile ? 9999 : 10,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.25s ease-in-out',
          boxShadow: isMobile && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 800, color: '#fff' }}>SI-UMKM</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)' }}>PROVINSI JAWA BARAT</div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup Menu"
              style={{
                background: 'rgba(255,255,255,0.14)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav style={{ display: 'grid', gap: 4 }}>
          {MENU.map(([grup, items]) => (
            <div key={grup || 'root'} style={{ marginBottom: 12 }}>
              {grup && (
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', margin: '8px 12px' }}>
                  {grup}
                </div>
              )}
              {items.map(([k, l, I]) => btn(k, l, I, page === k))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Kolom Kanan: Topbar Header + Konten Utama */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          className="admin-header"
          style={{
            background: '#fff',
            borderBottom: `1px solid ${C.line}`,
            padding: isMobile ? '10px 16px' : '12px 32px',
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            alignItems: 'center',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Tombol Buka Sidebar khusus HP */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka Menu Navigasi"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                padding: '7px 10px',
                background: '#fff',
                color: C.ink,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Menu size={18} color={C.dark} />
              <span>Menu</span>
            </button>
          )}

          {/* Dropdown Profil Admin */}
          <div style={{ position: 'relative', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setNotificationOpen((open) => !open)}
                aria-label={`Notifikasi, ${notificationCounts.total} pengajuan perlu ditindaklanjuti`}
                aria-expanded={notificationOpen}
                aria-haspopup="true"
                style={{
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  width: 40,
                  height: 40,
                  border: `1px solid ${C.line}`,
                  borderRadius: '50%',
                  background: '#fff',
                  color: C.dark,
                  cursor: 'pointer',
                }}
              >
                <Bell size={19} />
                {notificationCounts.total > 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 18,
                      height: 18,
                      padding: '0 4px',
                      borderRadius: 999,
                      background: '#DC2626',
                      color: '#fff',
                      fontSize: '0.68rem',
                      lineHeight: '18px',
                      fontWeight: 700,
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  role="status"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 280,
                    maxWidth: 'calc(100vw - 32px)',
                    padding: 16,
                    background: '#fff',
                    border: `1px solid ${C.line}`,
                    borderRadius: 14,
                    boxShadow: '0 12px 28px rgba(15,23,42,0.16)',
                    zIndex: 1000,
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: C.ink, marginBottom: 10 }}>
                    Pengajuan perlu ditindaklanjuti
                  </div>
                  {[
                    ['Pendaftaran pelatihan', notificationCounts.pelatihan],
                    ['Permohonan bantuan', notificationCounts.bantuan],
                    ['Sertifikasi', notificationCounts.sertifikasi],
                  ].map(([label, count]) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '8px 0',
                        borderTop: `1px solid ${C.line}`,
                        color: C.mute,
                        fontSize: '0.82rem',
                      }}
                    >
                      <span>{label}</span>
                      <b style={{ color: C.ink }}>{count}</b>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, color: C.mute, fontSize: '0.72rem' }}>
                    Diperbarui otomatis setiap 15 detik.
                  </div>
                </div>
              )}
            </div>

            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  padding: '4px 12px 4px 4px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: C.ink,
                  background: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  maxWidth: isMobile ? '200px' : 'none',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#164E43',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {namaAdmin.charAt(0).toUpperCase()}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {namaAdmin}
                </span>
                <ChevronDown size={15} color="#64748B" style={{ flexShrink: 0 }} />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 260,
                    maxWidth: 'calc(100vw - 32px)',
                    background: '#fff',
                    border: `1px solid ${C.line}`,
                    borderRadius: 14,
                    boxShadow: '0 12px 28px rgba(15,23,42,0.16)',
                    padding: 14,
                    zIndex: 1000,
                    boxSizing: 'border-box',
                  }}
                >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#008848',
                    background: '#EAF1F1',
                    borderRadius: 999,
                    padding: '5px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = '#FEF2F2';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 10px',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <LogOut size={16} /> Keluar Akun
                </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className="admin-main"
          style={{
            padding: isMobile ? '18px 16px 32px' : 32,
            maxWidth: 1200,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Menu, User, Bell, ChevronDown, LogOut, LogIn, UserCheck, X } from 'lucide-react';
const notifikasiDummy = [ //ini data dummy ntar diubah
  { id: 1, judul: 'Pengajuan Bantuan Modal Disetujui', pesan: 'Pengajuan bantuan modal Anda telah disetujui oleh admin.', waktu: '2 jam lalu', dibaca: false },
  { id: 2, judul: 'Verifikasi Legalitas Diproses', pesan: 'Dokumen legalitas usaha Anda sedang diperiksa oleh admin.', waktu: '1 hari lalu', dibaca: false },
  { id: 3, judul: 'Pelatihan Baru Tersedia', pesan: 'Ada pelatihan baru "Digital Marketing untuk UMKM" yang bisa Anda ikuti.', waktu: '3 hari lalu', dibaca: true }
];

export default function Navbar({ halamanAktif, setHalaman, user, onLogout }) {
  const [dropdownLayanan, setDropdownLayanan] = useState(false);
  const [dropdownUser, setDropdownUser] = useState(false);
  const userMenuRef = useRef(null);
const [sidebarNotifOpen, setSidebarNotifOpen] = useState(false); //aku tambah ini
const jumlahBelumDibaca = notifikasiDummy.filter((n) => !n.dibaca).length;

  // Tutup dropdown otomatis jika klik di luar elemen
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownUser(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <nav style={{
      backgroundColor: '#164E43',
      color: '#FFFFFF',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      fontFamily: 'Inter, system-ui, sans-serif',
      zIndex: 50
    }}>
      {/* Brand / Logo */}
      <div 
        onClick={() => setHalaman('dashboard')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>
          SI-UMKM JABAR
        </span>
      </div>

      {/* Menu Navigasi Tengah */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '0.9rem', fontWeight: '500' }}>
        <span
          onClick={() => setHalaman('dashboard')}
          style={{
            cursor: 'pointer',
            opacity: halamanAktif === 'dashboard' ? 1 : 0.85,
            fontWeight: halamanAktif === 'dashboard' ? '700' : '500'
          }}
        >
          Beranda
        </span>

        <span
          onClick={() => setHalaman('pelatihan')}
          style={{
            cursor: 'pointer',
            opacity: halamanAktif === 'pelatihan' ? 1 : 0.85,
            fontWeight: halamanAktif === 'pelatihan' ? '700' : '500'
          }}
        >
          Pelatihan
        </span>

        {/* Dropdown Layanan */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownLayanan(!dropdownLayanan)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: 0.85 }}
          >
            Layanan <ChevronDown size={14} />
          </div>

          {dropdownLayanan && (
            <div style={{
              position: 'absolute',
              top: '32px',
              left: 0,
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '10px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              border: '1px solid #E2E8F0',
              padding: '8px 0',
              minWidth: '180px',
              zIndex: 100
            }}>
              <div 
                onClick={() => { setHalaman('bantuan'); setDropdownLayanan(false); }}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Bantuan UMKM
              </div>
              <div 
                onClick={() => { setHalaman('sertifikasi'); setDropdownLayanan(false); }}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Sertifikasi Produk
              </div>
            </div>
          )}
        </div>

               <span
          onClick={() => {
            setHalaman('dashboard');

            let percobaan = 0;
            const cobaScroll = () => {
              const target = document.getElementById('komunitas');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              } else if (percobaan < 20) {
                percobaan++;
                setTimeout(cobaScroll, 100);
              }
            };
            setTimeout(cobaScroll, 50);
          }}
          style={{ cursor: 'pointer', opacity: 0.85 }}
        >
          Gabung Komunitas
        </span>
      </div>
      
      {/* Bagian Kanan: Lonceng Notifikasi & Tombol User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} ref={userMenuRef}>
        <button
  type="button"
  onClick={() => setSidebarNotifOpen(true)}
  style={{
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    position: 'relative'
  }}
>
  <Bell size={18} />

  {jumlahBelumDibaca > 0 && (
    <span style={{
      position: 'absolute',
      top: '-4px',
      right: '-6px',
      backgroundColor: '#DC2626',
      color: '#FFF',
      borderRadius: '999px',
      fontSize: '0.62rem',
      fontWeight: '700',
      minWidth: '15px',
      height: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3px'
    }}>
      {jumlahBelumDibaca}
    </span>
  )}
</button>

        {/* Tombol Kapsul Hamburger + User */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownUser(!dropdownUser)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#164E43',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
            }}
          >
            <Menu size={16} />
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: user ? '#164E43' : '#E2E8F0',
              color: user ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={15} />
            </div>
          </button>

          {/* Menu Dropdown Profil / Login */}
          {dropdownUser && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 12px 24px -4px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
              minWidth: '240px',
              color: '#0F172A',
              padding: '12px',
              zIndex: 100
            }}>
              {user ? (
                <>
                  <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#008848', fontWeight: '700' }}>
                      <UserCheck size={14} /> Terverifikasi ({user.role})
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px', color: '#0F172A' }}>
                      {user.nama}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {user.email}
                    </div>
                    {user.nik && (
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                        NIK: {user.nik}
                      </div>
                    )}
                  </div>

                  <div 
                    onClick={() => { setDropdownUser(false); setHalaman('pelatihan'); }}
                    style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Pelatihan Saya
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownUser(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Keluar Akun
                  </button>
                </>
              ) : (
                <>
                  <div style={{ padding: '6px 8px 12px 8px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0F172A' }}>
                      Selamat Datang!
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Masuk untuk melihat pengajuan bantuan dan pelatihan.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownUser(false);
                      setHalaman('login');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#164E43',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    <LogIn size={15} /> Masuk / Daftar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
            </div>
    </nav>

    {/* ===== SIDEBAR NOTIFIKASI ===== */}
    {sidebarNotifOpen && (
      <>
        {/* Overlay gelap di belakang sidebar */}
        <div
          onClick={() => setSidebarNotifOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 200
          }}
        />

        {/* Panel Sidebar */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '340px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>

          {/* Header Sidebar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: '800',
              color: '#0F172A'
            }}>
              Notifikasi
            </h3>

            <button
              onClick={() => setSidebarNotifOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Isi Notifikasi */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {notifikasiDummy.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: '0.85rem',
                marginTop: '40px'
              }}>
                Belum ada notifikasi.
              </p>
            ) : (
              notifikasiDummy.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: notif.dibaca ? '#FFFFFF' : '#F0FDF4',
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  {!notif.dibaca && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#16A34A',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                  )}

                  <div>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#0F172A',
                      marginBottom: '3px'
                    }}>
                      {notif.judul}
                    </div>

                    <div style={{
                      fontSize: '0.8rem',
                      color: '#64748B',
                      lineHeight: '1.4',
                      marginBottom: '4px'
                    }}>
                      {notif.pesan}
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      color: '#94A3B8'
                    }}>
                      {notif.waktu}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )}
  </>
  );
}
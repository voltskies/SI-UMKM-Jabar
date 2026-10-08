import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Menu, User, Bell, ChevronDown, LogOut, LogIn, 
  UserCheck, X, Shield, CheckCircle2, Clock, AlertCircle, FileText 
} from 'lucide-react';

export default function Navbar({ halamanAktif, setHalaman, user, onLogout }) {
  const [dropdownLayanan, setDropdownLayanan] = useState(false);
  const [dropdownUser, setDropdownUser] = useState(false);
  const [sidebarNotifOpen, setSidebarNotifOpen] = useState(false);
  const [daftarNotif, setDaftarNotif] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const layananRef = useRef(null);
  const userMenuRef = useRef(null);

  const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

  // Hitung jumlah notifikasi yang belum dibaca
  const jumlahBelumDibaca = daftarNotif.filter((n) => !n.dibaca).length;

  // 1. Ambil Notifikasi Nyata dari Database
  const fetchNotifikasiReal = useCallback(async () => {
    if (!user) {
      setDaftarNotif([]);
      return;
    }

    try {
      setLoadingNotif(true);
      const items = [];

      // Skenario A: Jika yang login adalah ADMIN DINAS
      if (user.role === 'admin') {
        const [resBantuan, resSertifikasi] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/admin/pengajuan`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/api/v1/admin/sertifikasi`).catch(() => ({ data: { data: [] } }))
        ]);

        const bantuanAntrean = (resBantuan.data?.data || []).filter(
          (b) => b.status === 'Menunggu Verifikasi'
        );
        const sertifAntrean = (resSertifikasi.data?.data || []).filter(
          (s) => s.status === 'Menunggu Verifikasi'
        );

        bantuanAntrean.forEach((b) => {
          items.push({
            id: `adm-bantuan-${b.id}`,
            tipe: 'bantuan',
            judul: 'Permohonan Bantuan Masuk',
            pesan: `${b.nama_usaha} mengajukan bantuan modal sebesar Rp ${Number(String(b.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')}.`,
            waktu: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Baru saja',
            status: b.status,
            targetHalaman: 'admin',
            dibaca: false
          });
        });

        sertifAntrean.forEach((s) => {
          items.push({
            id: `adm-sertif-${s.id}`,
            tipe: 'sertifikasi',
            judul: 'Pengajuan Sertifikasi Baru',
            pesan: `${s.nama_usaha} mendaftarkan produk "${s.nama_produk}" (${s.jenis_sertifikasi}).`,
            waktu: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : 'Baru saja',
            status: s.status,
            targetHalaman: 'admin',
            dibaca: false
          });
        });
      } 
      // Skenario B: Jika yang login adalah PELAKU UMKM (Role umum)
      else {
        const [resBantuan, resSertifikasi] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/admin/pengajuan`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/api/v1/admin/sertifikasi`).catch(() => ({ data: { data: [] } }))
        ]);

        // Filter pengajuan milik user ini berdasarkan user_id
        const myBantuan = (resBantuan.data?.data || []).filter(
          (b) => b.user_id === user.id
        );
        const mySertifikasi = (resSertifikasi.data?.data || []).filter(
          (s) => s.user_id === user.id
        );

        myBantuan.forEach((b) => {
          let judul = `Permohonan Bantuan (${b.nomor_pengajuan})`;
          let pesan = `Status saat ini: ${b.status}.`;
          if (b.catatan_admin) pesan += ` Catatan Admin: "${b.catatan_admin}"`;

          items.push({
            id: `user-bantuan-${b.id}`,
            tipe: 'bantuan',
            judul: judul,
            pesan: pesan,
            waktu: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Terkini',
            status: b.status,
            targetHalaman: 'bantuan',
            dibaca: b.status === 'Disetujui' ? false : true
          });
        });

        mySertifikasi.forEach((s) => {
          let judul = `Legalitas & Sertifikasi (${s.nomor_registrasi})`;
          let pesan = `Pengajuan produk ${s.nama_produk} berstatus: ${s.status}.`;
          if (s.catatan_admin) pesan += ` Pesan: "${s.catatan_admin}"`;

          items.push({
            id: `user-sertif-${s.id}`,
            tipe: 'sertifikasi',
            judul: judul,
            pesan: pesan,
            waktu: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Terkini',
            status: s.status,
            targetHalaman: 'sertifikasi',
            dibaca: s.status === 'Selesai' ? false : true
          });
        });
      }

      setDaftarNotif(items);
    } catch (err) {
      console.error('Gagal mengambil data notifikasi:', err);
    } finally {
      setLoadingNotif(false);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchNotifikasiReal();
  }, [fetchNotifikasiReal]);

  // Tutup dropdown otomatis jika pengguna mengklik di luar elemen
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownUser(false);
      }
      if (layananRef.current && !layananRef.current.contains(event.target)) {
        setDropdownLayanan(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tandaiSemuaDibaca = () => {
    setDaftarNotif((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  const klikNotifikasi = (notif) => {
    // Tandai spesifik notif ini sudah dibaca
    setDaftarNotif((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n))
    );
    setSidebarNotifOpen(false);
    if (notif.targetHalaman && typeof setHalaman === 'function') {
      setHalaman(notif.targetHalaman);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Disetujui' || status === 'Selesai') {
      return <CheckCircle2 size={16} color="#16A34A" />;
    }
    if (status === 'Ditolak' || status === 'Perlu Perbaikan') {
      return <AlertCircle size={16} color="#DC2626" />;
    }
    return <Clock size={16} color="#D97706" />;
  };

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
          <div style={{ position: 'relative' }} ref={layananRef}>
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

          <a
            href="https://www.facebook.com/waroenkUMKM"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              cursor: 'pointer',
              opacity: 0.85,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            Gabung Komunitas
          </a>
        </div>
        
        {/* Bagian Kanan: Lonceng Notifikasi & Menu Profil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setSidebarNotifOpen(true);
              fetchNotifikasiReal();
            }}
            title="Lihat Notifikasi Terkini"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              position: 'relative',
              padding: '6px'
            }}
          >
            <Bell size={20} />
            {jumlahBelumDibaca > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                backgroundColor: '#DC2626',
                color: '#FFF',
                borderRadius: '999px',
                fontSize: '0.62rem',
                fontWeight: '800',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 0 0 2px #164E43'
              }}>
                {jumlahBelumDibaca}
              </span>
            )}
          </button>

          {/* Tombol Profil Kapsul */}
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
                        {user.nama || user.nama_lengkap}
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

                    {/* Tombol Akses Panel Admin Dinas */}
                    <div 
                      onClick={() => { setDropdownUser(false); setHalaman('admin'); }}
                      style={{ 
                        padding: '8px 10px', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#0F766E',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDFA'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Shield size={14} /> Panel Admin Dinas
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownUser(false);
                        localStorage.removeItem('user_umkm');
                        localStorage.removeItem('token');
                        sessionStorage.clear();
                        if (onLogout) {
                          onLogout();
                        } else {
                          window.location.reload();
                        }
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
          <div
            onClick={() => setSidebarNotifOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 200
            }}
          />

          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '360px',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                  Pemberitahuan
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {user ? (user.role === 'admin' ? 'Antrean Verifikasi Dinas' : 'Status Pengajuan Berkas Anda') : 'Notifikasi Pengguna'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {jumlahBelumDibaca > 0 && (
                  <button
                    type="button"
                    onClick={tandaiSemuaDibaca}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#008848',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Tandai dibaca
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSidebarNotifOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Konten Notifikasi */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                  <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '600' }}>Silakan masuk ke akun Anda</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                    Notifikasi verifikasi dan status pengajuan akan ditampilkan di sini.
                  </p>
                </div>
              ) : loadingNotif ? (
                <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', marginTop: '40px' }}>
                  Memeriksa notifikasi...
                </p>
              ) : daftarNotif.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                  <CheckCircle2 size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '600' }}>Semua Berkas Terkelola</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                    Belum ada antrean atau pembaruan status baru saat ini.
                  </p>
                </div>
              ) : (
                daftarNotif.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => klikNotifikasi(notif)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: notif.dibaca ? '#FFFFFF' : '#F0FDF4',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (notif.dibaca) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (notif.dibaca) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {getStatusIcon(notif.status)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A' }}>
                          {notif.judul}
                        </span>
                        {!notif.dibaca && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.45', marginBottom: '6px' }}>
                        {notif.pesan}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
                        <span>{notif.waktu}</span>
                        <span style={{ color: '#008848', fontWeight: '600' }}>Lihat detail →</span>
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
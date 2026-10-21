import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Menu, User, Bell, ChevronDown, LogOut, LogIn, 
  UserCheck, X, Shield, CheckCircle2, Clock, AlertCircle, FileText 
} from 'lucide-react';
import NotifikasiToast from './notifikasiToast';

const POLL_INTERVAL_MS = 10000;

export default function Navbar({ halamanAktif, setHalaman, user, onLogout, mode }) {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY >= 20);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownLayanan, setDropdownLayanan] = useState(false);
  const [dropdownUser, setDropdownUser] = useState(false);
  const [sidebarNotifOpen, setSidebarNotifOpen] = useState(false);
  const [daftarNotif, setDaftarNotif] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [versiDibaca, setVersiDibaca] = useState(0);

  const layananRef = useRef(null);
  const userMenuRef = useRef(null);
  const keyTerlihat = useRef(new Set());
  const sudahMuatPertama = useRef(false);
  const sedangFetch = useRef(false);

  const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;
  const storageKey = user ? `notif_dibaca_${user.role}_${user.id}` : null;
  const isDashboardMode = mode === 'dashboard';
  const isSolidSticky = mode === 'solid-sticky' || isDashboardMode;

  // Pantau scroll dan resize layar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isSolidSticky) return undefined;
    const handleScroll = () => setIsScrolled(window.scrollY >= 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSolidSticky]);

  const bacaKeysTersimpan = useCallback(() => {
    if (!storageKey) return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch {
      return new Set();
    }
  }, [storageKey]);

  const dibacaKeys = useMemo(() => bacaKeysTersimpan(), [bacaKeysTersimpan, versiDibaca]);

  const daftarNotifTampil = daftarNotif.map((n) => ({
    ...n,
    dibaca: !n.perluPerhatian || dibacaKeys.has(n.key)
  }));
  const jumlahBelumDibaca = daftarNotifTampil.filter((n) => !n.dibaca).length;

  useEffect(() => {
    sudahMuatPertama.current = false;
    keyTerlihat.current = new Set();
  }, [storageKey]);

  const tandaiDibaca = useCallback((keys) => {
    if (!storageKey) return;
    const next = bacaKeysTersimpan();
    keys.forEach((k) => next.add(k));
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch { /* ignore */ }
    setVersiDibaca((v) => v + 1);
  }, [storageKey, bacaKeysTersimpan]);

  const tutupToast = useCallback(() => setToast({ show: false, message: '' }), []);

  const fetchNotifikasiReal = useCallback(async (silent = false) => {
    if (!user) {
      setDaftarNotif([]);
      return;
    }
    if (sedangFetch.current) return;
    sedangFetch.current = true;

    try {
      if (!silent) setLoadingNotif(true);
      const items = [];

      const ambil = (path) =>
        axios.get(`${API_BASE_URL}${path}`).then((r) => r.data?.data || []).catch(() => null);

      const [dataBantuan, dataSertifikasi] = await Promise.all([
        ambil('/api/v1/admin/pengajuan'),
        ambil('/api/v1/admin/sertifikasi')
      ]);

      if (dataBantuan === null && dataSertifikasi === null) return;

      const listBantuan = dataBantuan || [];
      const listSertifikasi = dataSertifikasi || [];

      if (user.role === 'admin') {
        listBantuan
          .filter((b) => b.status === 'Menunggu Verifikasi')
          .forEach((b) => {
            items.push({
              id: `adm-bantuan-${b.id}`,
              key: `adm-bantuan-${b.id}|${b.status}`,
              tipe: 'bantuan',
              judul: 'Permohonan Bantuan Masuk',
              pesan: `${b.nama_usaha} mengajukan bantuan modal sebesar Rp ${Number(String(b.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')}.`,
              waktu: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Baru saja',
              status: b.status,
              targetHalaman: 'admin',
              perluPerhatian: true
            });
          });

        listSertifikasi
          .filter((s) => s.status === 'Menunggu Verifikasi')
          .forEach((s) => {
            items.push({
              id: `adm-sertif-${s.id}`,
              key: `adm-sertif-${s.id}|${s.status}`,
              tipe: 'sertifikasi',
              judul: 'Pengajuan Sertifikasi Baru',
              pesan: `${s.nama_usaha} mendaftarkan produk "${s.nama_produk}" (${s.jenis_sertifikasi}).`,
              waktu: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : 'Baru saja',
              status: s.status,
              targetHalaman: 'admin',
              perluPerhatian: true
            });
          });
      } else {
        listBantuan
          .filter((b) => b.user_id === user.id)
          .forEach((b) => {
            let pesan = `Status saat ini: ${b.status}.`;
            if (b.catatan_admin) pesan += ` Catatan Admin: "${b.catatan_admin}"`;

            items.push({
              id: `user-bantuan-${b.id}`,
              key: `user-bantuan-${b.id}|${b.status}|${b.catatan_admin || ''}`,
              tipe: 'bantuan',
              judul: `Permohonan Bantuan (${b.nomor_pengajuan})`,
              pesan,
              waktu: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Terkini',
              status: b.status,
              targetHalaman: 'bantuan',
              perluPerhatian: b.status !== 'Menunggu Verifikasi'
            });
          });

        listSertifikasi
          .filter((s) => s.user_id === user.id)
          .forEach((s) => {
            let pesan = `Pengajuan produk ${s.nama_produk} berstatus: ${s.status}.`;
            if (s.catatan_admin) pesan += ` Pesan: "${s.catatan_admin}"`;

            items.push({
              id: `user-sertif-${s.id}`,
              key: `user-sertif-${s.id}|${s.status}|${s.catatan_admin || ''}`,
              tipe: 'sertifikasi',
              judul: `Legalitas & Sertifikasi (${s.nomor_registrasi})`,
              pesan,
              waktu: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : 'Terkini',
              status: s.status,
              targetHalaman: 'sertifikasi',
              perluPerhatian: s.status !== 'Menunggu Verifikasi'
            });
          });
      }

      const baru = items.filter((n) => n.perluPerhatian && !keyTerlihat.current.has(n.key));
      items.forEach((n) => keyTerlihat.current.add(n.key));
      if (sudahMuatPertama.current && baru.length > 0) {
        setToast({
          show: true,
          message: baru.length === 1
            ? `${baru[0].judul}: ${baru[0].status}`
            : `${baru.length} notifikasi baru`
        });
      }
      sudahMuatPertama.current = true;
      setDaftarNotif(items);
    } catch (err) {
      console.error('Gagal mengambil data notifikasi:', err);
    } finally {
      sedangFetch.current = false;
      setLoadingNotif(false);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchNotifikasiReal();
  }, [fetchNotifikasiReal]);

  useEffect(() => {
    if (!user) return;
    const cek = () => {
      if (!document.hidden) fetchNotifikasiReal(true);
    };
    const timer = setInterval(cek, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', cek);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', cek);
    };
  }, [user, fetchNotifikasiReal]);

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
    tandaiDibaca(daftarNotif.filter((n) => n.perluPerhatian).map((n) => n.key));
  };

  const klikNotifikasi = (notif) => {
    tandaiDibaca([notif.key]);
    setSidebarNotifOpen(false);
    if (notif.targetHalaman && typeof setHalaman === 'function') {
      setHalaman(notif.targetHalaman);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Disetujui' || status === 'Selesai') return <CheckCircle2 size={16} color="#1B4143" />;
    if (status === 'Ditolak' || status === 'Perlu Perbaikan') return <AlertCircle size={16} color="#DC2626" />;
    return <Clock size={16} color="#D97706" />;
  };

  return (
    <>
      <NotifikasiToast show={toast.show} message={toast.message} onClose={tutupToast} />

      <nav style={{
        backgroundColor: '#1B4143',
        color: '#FFFFFF',
        padding: isSolidSticky
          ? (isMobile ? '12px 16px' : '12px max(16px, calc((100vw - 1200px) / 2))')
          : (isMobile ? '12px 20px' : '12px 32px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        boxSizing: 'border-box',
        // KUNCI LENGKUNG DI SEMUA PERANGKAT:
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
        fontFamily: 'Inter, system-ui, sans-serif',
        zIndex: 1000
      }}>
        {/* Brand / Logo (Dikunci agar teks tidak melipat) */}
        <div 
          onClick={() => setHalaman('dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <span style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>
            SI-UMKM JABAR
          </span>
        </div>

        {/* Menu Navigasi Desktop (Hanya muncul jika layar > 900px) */}
        {!isMobile && (
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
              style={{ cursor: 'pointer', opacity: 0.85, textDecoration: 'none', color: 'inherit' }}
            >
              Gabung Komunitas
            </a>
          </div>
        )}
        
        {/* Bagian Kanan: Lonceng Notifikasi & Menu User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }} ref={userMenuRef}>
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
            <Bell size={isMobile ? 18 : 20} />
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
                padding: '0 3px'
              }}>
                {jumlahBelumDibaca}
              </span>
            )}
          </button>

          {/* Tombol Menu Profil */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                if (isMobile) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setDropdownUser(!dropdownUser);
                }
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1B4143',
                border: 'none',
                borderRadius: '999px',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}
            >
              <Menu size={16} />
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: user ? '#1B4143' : '#E2E8F0',
                color: user ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={14} />
              </div>
            </button>

            {/* Menu Dropdown Desktop */}
            {!isMobile && dropdownUser && (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#1B4143', fontWeight: '700' }}>
                        <UserCheck size={14} /> Terverifikasi ({user.role})
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px', color: '#0F172A' }}>
                        {user.nama || user.nama_lengkap}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{user.email}</div>
                    </div>
                    <div 
                      onClick={() => { setDropdownUser(false); setHalaman('pelatihan'); }}
                      style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Pelatihan Saya
                    </div>
                    <div 
                      onClick={() => { setDropdownUser(false); setHalaman('admin'); }}
                      style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1B4143', fontWeight: '600' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef4f4'}
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
                        if (onLogout) onLogout();
                        else window.location.reload();
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#DC2626', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}
                    >
                      <LogOut size={15} /> Keluar Akun
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '6px 8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0F172A' }}>Selamat Datang!</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Masuk untuk layanan terpadu UMKM.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDropdownUser(false); setHalaman('login'); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1B4143', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '9px 12px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}
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

      {/* ===== MENU DRAWER RESPONSIVE UNTUK MOBILE ===== */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          backgroundColor: '#1B4143',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 999,
          boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
        }}>
          <div
            onClick={() => { setHalaman('dashboard'); setMobileMenuOpen(false); }}
            style={{ color: '#FFFFFF', padding: '8px 0', fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Beranda
          </div>
          <div
            onClick={() => { setHalaman('pelatihan'); setMobileMenuOpen(false); }}
            style={{ color: '#FFFFFF', padding: '8px 0', fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Pelatihan
          </div>
          <div
            onClick={() => { setHalaman('bantuan'); setMobileMenuOpen(false); }}
            style={{ color: '#FFFFFF', padding: '8px 0', fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Layanan Bantuan UMKM
          </div>
          <div
            onClick={() => { setHalaman('sertifikasi'); setMobileMenuOpen(false); }}
            style={{ color: '#FFFFFF', padding: '8px 0', fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer' }}
          >
            Layanan Sertifikasi Produk
          </div>
          <a
            href="https://www.facebook.com/waroenkUMKM"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FFFFFF', padding: '8px 0', fontWeight: '600', fontSize: '0.92rem', textDecoration: 'none' }}
          >
            Gabung Komunitas
          </a>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px', marginTop: '4px' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.84rem' }}>{user.nama || user.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('user_umkm');
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  style={{ background: 'none', border: 'none', color: '#FCA5A5', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setHalaman('login'); }}
                style={{ width: '100%', padding: '10px', backgroundColor: '#D97706', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Masuk / Daftar Akun
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== SIDEBAR NOTIFIKASI ===== */}
      {sidebarNotifOpen && (
        <>
          <div
            onClick={() => setSidebarNotifOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100 }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: isMobile ? '85vw' : '360px',
            maxWidth: '380px',
            backgroundColor: '#FFFFFF',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
            zIndex: 1101,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Pemberitahuan</h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {user ? (user.role === 'admin' ? 'Antrean Verifikasi Dinas' : 'Status Pengajuan Berkas') : 'Notifikasi Pengguna'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {jumlahBelumDibaca > 0 && (
                  <button
                    type="button"
                    onClick={tandaiSemuaDibaca}
                    style={{ background: 'none', border: 'none', color: '#1B4143', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
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

            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                  <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '600' }}>Silakan masuk ke akun Anda</p>
                </div>
              ) : loadingNotif ? (
                <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', marginTop: '40px' }}>Memeriksa notifikasi...</p>
              ) : daftarNotif.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                  <CheckCircle2 size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '600' }}>Semua Berkas Terkelola</p>
                </div>
              ) : (
                daftarNotifTampil.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => klikNotifikasi(notif)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: notif.dibaca ? '#FFFFFF' : '#eef4f4',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>{getStatusIcon(notif.status)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A' }}>{notif.judul}</span>
                        {!notif.dibaca && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1B4143' }} />}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.45', marginBottom: '6px' }}>{notif.pesan}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
                        <span>{notif.waktu}</span>
                        <span style={{ color: '#1B4143', fontWeight: '600' }}>Lihat detail →</span>
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
import { useState } from 'react';
import Dashboard from './pages/dashboard';
import Pelatihan from './pages/pelatihan';
import DetailPelatihan from './pages/detailPelatihan';
import Login from './pages/login';
import LoginAdmin from './pages/LoginAdmin';
import Bantuan from './pages/bantuan';
import Sertifikasi from './pages/sertifikasi';
import RiwayatDetail from './pages/riwayat';

// Import Admin App dari folder adminpanel
import AdminApp from './adminpanel/AdminApp';

export default function App() {
  const [halaman, setHalaman] = useState('dashboard');
  const [pelatihanTerpilih, setPelatihanTerpilih] = useState(null);
  const [notifTerpilih, setNotifTerpilih] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const simpanan = localStorage.getItem('user_umkm');
    return simpanan ? JSON.parse(simpanan) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user_umkm');
    localStorage.removeItem('token');
    sessionStorage.clear();
    setCurrentUser(null);
    setHalaman('dashboard');
  };

  // Dipanggil dari LoginAdmin setelah login admin berhasil
  const handleLoginAdmin = (adminData) => {
    localStorage.setItem('user_umkm', JSON.stringify(adminData));
    setCurrentUser(adminData);
  };

  // Wrapper navigasi aman: memproteksi halaman formulir layanan jika belum login
  const navigasiHalaman = (tujuan) => {
    const token = localStorage.getItem('token');
    const userStorage = localStorage.getItem('user_umkm');
    const isLoggedIn = Boolean(currentUser || token || userStorage);

    if ((tujuan === 'bantuan' || tujuan === 'sertifikasi') && !isLoggedIn) {
      alert('Silakan masuk ke akun UMKM Anda terlebih dahulu untuk mengakses layanan ini.');
      setHalaman('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setHalaman(tujuan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler saat notifikasi di drawer diklik "Lihat detail →"
  const handlePilihNotif = (notifItem) => {
    setNotifTerpilih(notifItem);
    setHalaman('riwayatDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // LOGIKA 1: Jika user yang login memiliki role 'admin'
  if (currentUser && currentUser.role === 'admin') {
    return (
      <AdminApp 
        user={currentUser} 
        onKeluar={handleLogout}
        setHalaman={navigasiHalaman} 
      />
    );
  }

  // Cek otentikasi aktif untuk halaman layanan
  const isLoggedIn = Boolean(
    currentUser || 
    localStorage.getItem('token') || 
    localStorage.getItem('user_umkm')
  );

  // LOGIKA 2: Alur Standar untuk Publik / Pelaku UMKM
  return (
    <div>
      {/* 1. Halaman Beranda (Dashboard Publik) */}
      {halaman === 'dashboard' && (
        <Dashboard
          user={currentUser}
          setHalaman={navigasiHalaman}
          onNavigasiPelatihan={() => navigasiHalaman('pelatihan')}
          onPilihNotif={handlePilihNotif}
        />
      )}

      {/* 2. Halaman Katalog Pelatihan */}
      {halaman === 'pelatihan' && (
        <Pelatihan
          user={currentUser}
          setHalaman={navigasiHalaman}
          onPilihPelatihan={(item) => {
            setPelatihanTerpilih(item);
            navigasiHalaman('detailPelatihan');
          }}
          onPilihNotif={handlePilihNotif}
        />
      )}

      {/* 3. Halaman Detail Pelatihan */}
      {halaman === 'detailPelatihan' && (
        <DetailPelatihan
          pelatihan={pelatihanTerpilih}
          user={currentUser}
          setHalaman={navigasiHalaman}
          onKembali={() => navigasiHalaman('pelatihan')}
          onArahkanLogin={() => navigasiHalaman('login')}
          onPilihNotif={handlePilihNotif}
        />
      )}

      {/* 4. Halaman Bantuan Usaha */}
      {halaman === 'bantuan' && (
        isLoggedIn ? (
          <Bantuan
            user={currentUser}
            setHalaman={navigasiHalaman}
            onPilihNotif={handlePilihNotif}
          />
        ) : (
          <Login
            setHalaman={navigasiHalaman}
            onLoginSukses={(userData) => {
              setCurrentUser(userData);
              navigasiHalaman('bantuan');
            }}
          />
        )
      )}

      {/* 5. Halaman Sertifikasi & Legalitas */}
      {halaman === 'sertifikasi' && (
        isLoggedIn ? (
          <Sertifikasi
            user={currentUser}
            setHalaman={navigasiHalaman}
            onPilihNotif={handlePilihNotif}
          />
        ) : (
          <Login
            setHalaman={navigasiHalaman}
            onLoginSukses={(userData) => {
              setCurrentUser(userData);
              navigasiHalaman('sertifikasi');
            }}
          />
        )
      )}

      {/* 6. Halaman Detail Riwayat Pengajuan Notifikasi */}
      {halaman === 'riwayatDetail' && (
        <RiwayatDetail
          data={notifTerpilih}
          user={currentUser}
          setHalaman={navigasiHalaman}
          onKembali={() => navigasiHalaman('dashboard')}
          onPilihNotif={handlePilihNotif}
        />
      )}

      {/* 7. Halaman Login */}
      {halaman === 'login' && (
        <Login
          setHalaman={navigasiHalaman}
          onLoginSukses={(userData) => {
            setCurrentUser(userData);
            if (userData?.role === 'admin') {
              navigasiHalaman('admin');
            } else {
              navigasiHalaman('dashboard');
            }
          }}
        />
      )}

      {/* 8. Halaman Login / Register Admin */}
      {halaman === 'login-admin' && (
        <LoginAdmin
          setHalaman={navigasiHalaman}
          onLoginSukses={handleLoginAdmin}
        />
      )}
    </div>
  );
}
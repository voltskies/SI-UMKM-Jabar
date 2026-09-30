import { useState } from 'react';
import Dashboard from './pages/dashboard';
import Pelatihan from './pages/pelatihan';
import DetailPelatihan from './pages/detailPelatihan';
import Login from './pages/login';
import Bantuan from './pages/bantuan';
import Sertifikasi from './pages/sertifikasi';

// Import Admin App dari folder adminpanel
import AdminApp from './adminpanel/AdminApp';

export default function App() {
  const [halaman, setHalaman] = useState('dashboard');
  const [pelatihanTerpilih, setPelatihanTerpilih] = useState(null);
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

  // LOGIKA 1: Jika user yang login di sistem memiliki role 'admin'
  if (currentUser && currentUser.role === 'admin') {
    return (
      <AdminApp 
        user={currentUser} 
        onKeluar={handleLogout}
        setHalaman={setHalaman} 
      />
    );
  }

  // LOGIKA 2: Jika halaman diarahkan manual ke 'admin' via menu/tombol navbar
  if (halaman === 'admin') {
    return (
      <AdminApp 
        user={currentUser} 
        onKeluar={() => setHalaman('dashboard')} 
        setHalaman={setHalaman} 
      />
    );
  }

  // LOGIKA 3: Alur Standar untuk Publik / Pelaku UMKM
  return (
    <div>
      {/* 1. Halaman Beranda (Dashboard Publik) */}
      {halaman === 'dashboard' && (
        <Dashboard
          user={currentUser}
          setHalaman={setHalaman}
          onNavigasiPelatihan={() => setHalaman('pelatihan')}
        />
      )}

      {/* 2. Halaman Katalog Pelatihan */}
      {halaman === 'pelatihan' && (
        <Pelatihan
          user={currentUser}
          setHalaman={setHalaman}
          onPilihPelatihan={(item) => {
            setPelatihanTerpilih(item);
            setHalaman('detailPelatihan');
          }}
        />
      )}

      {/* 3. Halaman Detail Pelatihan */}
      {halaman === 'detailPelatihan' && (
        <DetailPelatihan
          pelatihan={pelatihanTerpilih}
          user={currentUser}
          setHalaman={setHalaman}
          onKembali={() => setHalaman('pelatihan')}
          onArahkanLogin={() => setHalaman('login')}
        />
      )}

      {/* 4. Halaman Bantuan Usaha */}
      {halaman === 'bantuan' && (
        <Bantuan
          user={currentUser}
          setHalaman={setHalaman}
        />
      )}

      {/* 5. Halaman Sertifikasi & Legalitas */}
      {halaman === 'sertifikasi' && (
        <Sertifikasi
          user={currentUser}
          setHalaman={setHalaman}
        />
      )}

      {/* 6. Halaman Login */}
      {halaman === 'login' && (
        <Login
          setHalaman={setHalaman}
          onLoginSukses={(userData) => {
            setCurrentUser(userData);
            if (userData?.role === 'admin') {
              setHalaman('admin');
            } else {
              setHalaman('dashboard');
            }
          }}
        />
      )}
    </div>
  );
}
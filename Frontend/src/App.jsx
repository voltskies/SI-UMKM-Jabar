import { useState } from 'react';
import Dashboard from './pages/dashboard';
import Pelatihan from './pages/pelatihan';
import DetailPelatihan from './pages/detailPelatihan';
import Login from './pages/login';
import Bantuan from './pages/bantuan';
import Sertifikasi from './pages/sertifikasi'; // pastikan nama file sesuai: sertifikasi.jsx

export default function App() {
  const [halaman, setHalaman] = useState('dashboard');
  const [pelatihanTerpilih, setPelatihanTerpilih] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const simpanan = localStorage.getItem('user_umkm');
    return simpanan ? JSON.parse(simpanan) : null;
  });

  return (
    <div>
      {/* 1. Halaman Beranda (Dashboard) */}
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

      {/* 4. Halaman Pusat Bantuan */}
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
            setHalaman('dashboard');
          }}
        />
      )}
    </div>
  );
}
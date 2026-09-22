import { useState } from 'react';
import Navbar from './component/navbar';
import Footer from './component/footer';
import Dashboard from './pages/dashboard';
import Pelatihan from './pages/pelatihan';
import Bantuan from './pages/bantuan'; // 1. Tambahkan import ini
import Login from './pages/login';

export default function App() {
  const [halaman, setHalaman] = useState('dashboard');
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setHalaman('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Navbar */}
      <Navbar 
        halamanAktif={halaman} 
        setHalaman={setHalaman} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Konten Halaman */}
      <div style={{ flex: 1 }}>
        {halaman === 'dashboard' && (
          <Dashboard setHalaman={setHalaman} />
        )}

        {halaman === 'pelatihan' && (
          <Pelatihan setHalaman={setHalaman} user={user} />
        )}

        {/* 2. Tambahkan kondisi render Bantuan di sini */}
        {halaman === 'bantuan' && (
          <Bantuan onKembali={() => setHalaman('dashboard')} user={user} />
        )}

        {halaman === 'login' && (
          <Login 
            onKembali={() => setHalaman('dashboard')} 
            onLoginSukses={(dataUser) => {
              setUser(dataUser);
              setHalaman('dashboard');
            }} 
          />
        )}
      </div>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
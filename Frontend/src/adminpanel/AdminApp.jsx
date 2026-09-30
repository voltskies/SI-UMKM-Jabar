import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import DashboardAdmin from './pages/DashboardAdmin';
import BantuanAdmin from './pages/BantuanAdmin';
import LegalitasAdmin from './pages/LegalitasAdmin';
import AkunAdmin from './pages/AkunAdmin';

export default function AdminApp({ user, onKeluar, onLogout, onKembali, setHalaman }) {
  const [nav, setNav] = useState({ page: 'dashboard', id: null });
  const go = (page, id = null) => { setNav({ page, id }); window.scrollTo({ top: 0 }); };

  // Handler serbaguna untuk kembali ke portal beranda publik
  const handleExit = () => {
    if (typeof onKeluar === 'function') onKeluar();
    else if (typeof onKembali === 'function') onKembali();
    else if (typeof onLogout === 'function') onLogout();
    else if (typeof setHalaman === 'function') setHalaman('dashboard');
  };

  // Buat sesi profil admin aktif (jika masuk via shortcut bypass, gunakan identitas dinas sementara)
  const activeAdminUser = (user && user.role === 'admin') 
    ? user 
    : {
        id: 999,
        nama: user?.nama || user?.nama_lengkap || 'Administrator Dinas',
        email: user?.email || 'admin.dinas@jabarprov.go.id',
        role: 'admin',
        instansi: 'Dinas Koperasi & Usaha Kecil Provinsi Jawa Barat'
      };

  const halaman = {
    dashboard: <DashboardAdmin go={go} />,
    bantuan: <BantuanAdmin selectedId={nav.id} go={go} />,
    legalitas: <LegalitasAdmin selectedId={nav.id} />,
    akun: <AkunAdmin />,
  }[nav.page];

  return (
    <AdminLayout page={nav.page} go={go} user={activeAdminUser} onKeluar={handleExit}>
      {halaman}
    </AdminLayout>
  );
}
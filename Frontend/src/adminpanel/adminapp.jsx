import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import DashboardAdmin from './pages/DashboardAdmin';
import BantuanAdmin from './pages/BantuanAdmin';
import LegalitasAdmin from './pages/LegalitasAdmin';
import AkunAdmin from './pages/AkunAdmin';

// Pakai di App.jsx: {halaman === 'admin' && <AdminApp user={currentUser} onKeluar={...} />}
export default function AdminApp({ user, onKeluar }) {
  const [nav, setNav] = useState({ page: 'dashboard', id: null });
  const go = (page, id = null) => { setNav({ page, id }); window.scrollTo({ top: 0 }); };

  if (user?.role !== 'admin') {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Akses khusus admin dinas. Masuk dengan akun admin.</div>;
  }
  const halaman = {
    dashboard: <DashboardAdmin go={go} />,
    bantuan: <BantuanAdmin selectedId={nav.id} go={go} />,
    legalitas: <LegalitasAdmin selectedId={nav.id} />,
    akun: <AkunAdmin />,
  }[nav.page];

  return <AdminLayout page={nav.page} go={go} user={user} onKeluar={onKeluar}>{halaman}</AdminLayout>;
}
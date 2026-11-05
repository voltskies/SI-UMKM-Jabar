import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Mail, CreditCard, Phone, ShieldCheck } from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function Profil({ user, setHalaman, onKembali, onPilihNotif }) {
  const [dataUser, setDataUser] = useState(() => {
    if (user && Object.keys(user).length > 0) return user;
    try {
      return JSON.parse(localStorage.getItem('user_umkm') || '{}');
    } catch {
      return {};
    }
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://si-umkm-jabar.vercel.app';

  // Ambil data profil terbaru langsung dari backend jika ada ID user
  useEffect(() => {
    const userId = dataUser?.id;
    if (!userId) return;

    axios.get(`${API_BASE_URL}/api/v1/users/${userId}`)
      .then((res) => {
        const userFresh = res.data?.data || res.data;
        if (userFresh) {
          setDataUser((prev) => ({ ...prev, ...userFresh }));
          localStorage.setItem('user_umkm', JSON.stringify({ ...dataUser, ...userFresh }));
        }
      })
      .catch(() => {
        // Fallback jika endpoint khusus user tidak tersedia, gunakan data session
      });
  }, [dataUser?.id, API_BASE_URL]);

  // Ekstraksi nilai nomor WhatsApp dari semua kemungkinan nama variabel
  const nomorWaTampil = 
    dataUser?.nomor_whatsapp || 
    dataUser?.nomor_wa || 
    dataUser?.no_wa || 
    dataUser?.whatsapp || 
    dataUser?.phone || 
    '-';

  // Ekstraksi NIK
  const nikTampil = dataUser?.nik || '-';

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar setHalaman={setHalaman} user={dataUser} mode="solid-sticky" onPilihNotif={onPilihNotif} />

      <main style={{ flex: 1, maxWidth: '780px', width: '100%', margin: '0 auto', padding: '36px 20px 60px', boxSizing: 'border-box', textAlign: 'left' }}>
        
        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={() => (typeof onKembali === 'function' ? onKembali() : setHalaman('dashboard'))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#255456',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        {/* Card Profil Utama */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          padding: '32px'
        }}>
          {/* Header Profil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#1B4143',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: '800'
            }}>
              {(dataUser?.nama || dataUser?.nama_lengkap || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                {dataUser?.nama || dataUser?.nama_lengkap || 'Pengguna UMKM'}
              </h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '700' }}>
                <ShieldCheck size={14} /> Terverifikasi ({dataUser?.role || 'umum'})
              </div>
            </div>
          </div>

          {/* Rincian Identitas Akun */}
          <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#334155', marginBottom: '16px' }}>
            Informasi Akun Terdaftar
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <User size={14} /> Nama Lengkap
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>
                {dataUser?.nama || dataUser?.nama_lengkap || '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Mail size={14} /> Alamat Email
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>
                {dataUser?.email || '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CreditCard size={14} /> Nomor Induk Kependudukan (NIK)
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>
                {nikTampil}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Phone size={14} /> Nomor WhatsApp
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>
                {nomorWaTampil}
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
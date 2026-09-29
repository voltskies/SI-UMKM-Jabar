import { useState } from 'react';
import { ArrowLeft, Users, GraduationCap, RefreshCw, Share2 } from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function DetailPelatihan({ pelatihan, onKembali, setHalaman, user, onArahkanLogin }) {
  const [loading, setLoading] = useState(false);

  if (!pelatihan) return null;

  const handleKlikDaftar = async () => {
    // 1. Ambil data sesi pengguna dari props atau localStorage
    let currentUser = user;
    if (!currentUser) {
      const stored = localStorage.getItem('user_umkm');
      if (stored) {
        try {
          currentUser = JSON.parse(stored);
        } catch (e) {
          currentUser = null;
        }
      }
    }

    if (!currentUser || !currentUser.id) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk mendaftar pelatihan ini.');
      if (typeof onArahkanLogin === 'function') {
        onArahkanLogin();
      } else if (typeof setHalaman === 'function') {
        setHalaman('login');
      }
      return;
    }

    setLoading(true);

    try {
      // 2. Format payload data pendaftaran
      const payload = {
        user_id: parseInt(currentUser.id, 10),
        id_pelatihan: parseInt(pelatihan.id, 10) || 1,
        judul_pelatihan: String(pelatihan.judul || pelatihan.title || 'Pelatihan UMKM Jabar'),
        kategori: String(pelatihan.kategori || 'Fasilitasi UMKM'),
        penyelenggara: String(pelatihan.penyelenggara || 'Dinas KUK Provinsi Jawa Barat')
      };

      // 3. Kirim ke endpoint FastAPI
      const response = await fetch('http://127.0.0.1:8000/api/v1/layanan/pendaftaran-pelatihan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        let pesan = 'Gagal mendaftar pelatihan.';
        if (resData && resData.detail) {
          pesan = Array.isArray(resData.detail)
            ? resData.detail.map((err) => `${err.loc?.[1] || 'Input'}: ${err.msg}`).join(', ')
            : resData.detail;
        }
        throw new Error(pesan);
      }

      alert(resData.message || `Pendaftaran berhasil untuk akun: ${currentUser.nama || currentUser.nama_lengkap || 'Pelaku UMKM'}`);
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleKembali = () => {
    if (typeof onKembali === 'function') {
      onKembali();
    } else if (typeof setHalaman === 'function') {
      setHalaman('pelatihan');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header / Navbar */}
      <Navbar setHalaman={setHalaman} user={user} />

      {/* 2. Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #081E16 0%, #164E43 60%, #0F4D3A 100%)',
        color: '#FFFFFF',
        padding: '48px 8% 70px 8%',
        boxShadow: '0 4px 20px rgba(8, 30, 22, 0.25)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            type="button"
            onClick={handleKembali}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.9rem',
              marginBottom: '22px',
              padding: 0,
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#A7F3D0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
          >
            <ArrowLeft size={18} /> Kembali ke Katalog
          </button>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(6px)',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '14px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Program Resmi Dinas KUK Jawa Barat
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px 0', maxWidth: '850px', lineHeight: 1.3 }}>
            {pelatihan.judul || pelatihan.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.96rem', margin: '0 0 28px 0' }}>
            Pelatihan & Standardisasi ({pelatihan.kategori})
          </p>

          <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '22px' }}>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.75)' }}>Kategori</div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <GraduationCap size={16} color="#34D399" /> {pelatihan.kategori}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.75)' }}>Kapasitas Kuota</div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Users size={16} color="#34D399" /> {pelatihan.kuota || pelatihan.peserta || 150} Peserta
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.75)' }}>Alur Pendaftaran</div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <RefreshCw size={16} color="#34D399" /> Pendaftaran Terbuka (Mandiri)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Konten Utama */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '-40px auto 50px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Kolom Kiri */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)' }}>
            <div style={{ height: '360px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
              <img
                src={pelatihan.banner || pelatihan.image}
                alt={pelatihan.judul || pelatihan.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#008848', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {pelatihan.tag || 'Fasilitasi UMKM'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                Rincian Program Pelatihan
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 20px 0' }}>
                {pelatihan.deskripsi || 'Program pembinaan strategis dari Dinas KUK Jawa Barat untuk memperkuat kapabilitas manajemen usaha mikro, peningkatan mutu kemasan produk, kurasi pasar ritel modern, dan akselerasi omzet perdagangan digital.'}
              </p>
              
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Penyelenggara Teknis:
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  {pelatihan.penyelenggara || 'Dinas Koperasi & Usaha Kecil (KUK) Provinsi Jawa Barat'}
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '4px solid #008848',
                color: '#334155',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                marginBottom: '24px'
              }}>
                Pelatihan diselenggarakan secara <b>Daring Terpadu & Mandiri</b>. Peserta yang menyelesaikan kurikulum berhak mendapatkan sertifikat kelulusan resmi.
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleKlikDaftar}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#94A3B8' : '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#b45309';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#D97706';
                }}
              >
                {loading ? 'MEMPROSES PENDAFTARAN...' : 'DAFTAR SEKARANG'}
              </button>

              <button
                type="button"
                onClick={() => alert('Tautan pendaftaran disalin ke clipboard!')}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#164E43',
                  border: '1px solid #CBD5E1',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#164E43';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              >
                <Share2 size={16} /> Bagikan Pelatihan
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 4. Footer */}
      <Footer setHalaman={setHalaman} />

    </div>
  );
}
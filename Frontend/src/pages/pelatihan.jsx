import { useState } from 'react';
import { Users, Search, ArrowLeft, ExternalLink } from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

import fotoPelatihan1 from '../assets/pelatihan1.jpeg';
import fotoPelatihan2 from '../assets/pelatihan2.jpg';
import fotoPelatihan3 from '../assets/pelatihan3.jpg';
import fotoPelatihan4 from '../assets/pelatihan4.jpg';
import fotoPelatihan5 from '../assets/pelatihan5.jpg';
import fotoPelatihan6 from '../assets/pelatihan6.jpg';

export default function Pelatihan({ onKembali, onPilihPelatihan, setHalaman, user }) {
  const [keyword, setKeyword] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Navigasi kembali ke beranda
  const handleKembaliKeBeranda = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('dashboard');
    } else if (typeof onKembali === 'function') {
      onKembali();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigasi saat kartu pelatihan diklik
  const handleKlikPelatihan = (item) => {
    // 1. Cek sesi login dari props atau localStorage
    const token = localStorage.getItem('token');
    const userStorage = localStorage.getItem('user_umkm');
    const isLoggedIn = Boolean(user || token || userStorage);

    // 2. Jika belum login, arahkan ke login
    if (!isLoggedIn) {
      alert('Silakan masuk ke akun UMKM Anda terlebih dahulu untuk mendaftar pelatihan ini.');
      if (typeof setHalaman === 'function') {
        setHalaman('login');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Jika sudah login, kirim data item pelatihan dan alihkan ke halaman detail
    if (typeof onPilihPelatihan === 'function') {
      onPilihPelatihan(item);
    } else if (typeof setHalaman === 'function') {
      setHalaman('detailPelatihan');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const listPelatihan = [
    {
      id: 1,
      kategori: 'Pemasaran Digital',
      judul: 'Pelatihan Digitalisasi dan Pemasaran Online',
      kuota: 250,
      peserta: 180,
      banner: fotoPelatihan1,
      tag: 'Pemasaran & E-Commerce',
      penyelenggara: 'Dinas KUK Jawa Barat',
      deskripsi: 'Strategi optimasi media sosial, live selling, dan onboarding marketplace untuk ekspansi pasar produk UMKM Jawa Barat.'
    },
    {
      id: 2,
      kategori: 'Keuangan & Akuntansi',
      judul: 'Pelatihan Manajemen Keuangan dan Administrasi Kas Usaha',
      kuota: 150,
      peserta: 95,
      banner: fotoPelatihan2,
      tag: 'Tata Kelola Kas',
      penyelenggara: 'Pusat Layanan Usaha Terpadu (PLUT)',
      deskripsi: 'Penyusunan laporan arus kas sederhana, pemisahan keuangan pribadi dan modal usaha, serta mitigasi kredit pembiayaan.'
    },
    {
      id: 3,
      kategori: 'Legalitas Usaha',
      judul: 'Pelatihan Legalitas Perizinan NIB dan Standarisasi Sertifikasi Halal',
      kuota: 300,
      peserta: 240,
      banner: fotoPelatihan3,
      tag: 'NIB & Sertifikasi Halal',
      penyelenggara: 'Dinas Penanaman Modal & KUK',
      deskripsi: 'Fasilitasi teknis pengurusan Nomor Induk Berusaha (NIB) berbasis OSS, SPP-IRT, serta panduan sertifikasi halal self-declare.'
    },
    {
      id: 4,
      kategori: 'Inovasi Produk',
      judul: 'Pelatihan Inovasi Mutu dan Kurasi Standardisasi Kemasan Produk',
      kuota: 120,
      peserta: 70,
      banner: fotoPelatihan4,
      tag: 'Kemasan & Nilai Tambah',
      penyelenggara: 'Balai Standardisasi Industri Jabar',
      deskripsi: 'Peningkatan daya tarik kemasan komoditas kriya dan makanan olahan agar higienis, berdaya saing ritel modern, dan ramah lingkungan.'
    },
    {
      id: 5,
      kategori: 'Ekspor Komoditas',
      judul: 'Akselerasi UMKM Siap Ekspor: Prosedur dan Standar Pasar Global',
      kuota: 80,
      peserta: 60,
      banner: fotoPelatihan5,
      tag: 'Perdagangan Global',
      penyelenggara: 'Dinas Perindustrian dan Perdagangan',
      deskripsi: 'Pemahaman regulasi bea cukai, dokumen legalitas ekspor kriya dan olahan pangan, serta pemenuhan mutu pasar internasional.'
    },
    {
      id: 6,
      kategori: 'Pemasaran Digital',
      judul: 'Copywriting dan Pembuatan Konten Kreatif Promosi Produk Lokal',
      kuota: 200,
      peserta: 165,
      banner: fotoPelatihan6,
      tag: 'Konten Visual',
      penyelenggara: 'Kreatif Jabar Hub',
      deskripsi: 'Teknik penulisan promosi persuasif dan pembuatan katalog visual berbasis smartphone bagi pelaku usaha mikro.'
    }
  ];

  const filtered = listPelatihan.filter((item) => {
    const pencarian = keyword.toLowerCase();
    const cocokKataKunci =
      item.judul.toLowerCase().includes(pencarian) ||
      item.tag.toLowerCase().includes(pencarian) ||
      item.penyelenggara.toLowerCase().includes(pencarian);
    const cocokKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
    return cocokKataKunci && cocokKategori;
  });

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Navbar Atas */}
      <Navbar setHalaman={setHalaman} user={user} />

      {/* 2. Konten Utama */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '32px 24px 60px 24px', boxSizing: 'border-box' }}>
        
        {/* Header Navigasi & Pencarian */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <button
            type="button"
            onClick={handleKembaliKeBeranda}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#164E43',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '700',
              padding: '6px 0',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#008848')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#164E43')}
          >
            <ArrowLeft size={20} /> Kembali ke Beranda
          </button>

          <div style={{ position: 'relative', width: '380px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari tema pelatihan, sertifikasi, materi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: '999px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Judul & Deskripsi Katalog */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>
            Katalog Pelatihan & Pendampingan UMKM Jawa Barat
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem', maxWidth: '800px', margin: 0, lineHeight: '1.5' }}>
            Akselerasi keahlian usaha, perizinan, dan tata kelola bisnis Anda melalui kurikulum kurasi bersertifikat resmi tanpa dipungut biaya.
          </p>
        </div>

        {/* Filter Kategori */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['Semua', 'Pemasaran Digital', 'Keuangan & Akuntansi', 'Legalitas Usaha', 'Inovasi Produk', 'Ekspor Komoditas'].map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setFilterKategori(kat)}
              style={{
                padding: '7px 16px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: filterKategori === kat ? '#164E43' : '#E2E8F0',
                backgroundColor: filterKategori === kat ? '#164E43' : '#FFFFFF',
                color: filterKategori === kat ? '#FFFFFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: filterKategori === kat ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Grid Kartu Pelatihan */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleKlikPelatihan(item)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(22, 78, 67, 0.12)';
                e.currentTarget.style.borderColor = '#008848';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              {/* Thumbnail Foto */}
              <div style={{ position: 'relative', height: '180px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                <img
                  src={item.banner}
                  alt={item.judul}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(22, 78, 67, 0.88)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {item.kategori}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.78)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  padding: '5px 14px',
                  fontWeight: '500'
                }}>
                  {item.penyelenggara}
                </div>
              </div>

              {/* Isi Konten Kartu */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#008848', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {item.tag}
                  </span>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: '800',
                    color: '#0F172A',
                    margin: '8px 0',
                    lineHeight: 1.4,
                    minHeight: '44px'
                  }}>
                    {item.judul}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.deskripsi}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '14px',
                  fontSize: '0.82rem',
                  color: '#64748B'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#008848" />
                    <span>Kuota: <strong>{item.kuota.toLocaleString('id-ID')} Peserta</strong></span>
                  </div>
                  <span style={{ color: '#164E43', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Detail & Daftar <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* 3. Footer Bawah */}
      <Footer setHalaman={setHalaman} />

    </div>
  );
}
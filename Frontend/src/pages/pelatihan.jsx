import { useState } from 'react';
import { Users, Search, ArrowLeft, ExternalLink } from 'lucide-react';

export default function Pelatihan({ onKembali, onPilihPelatihan }) {
  const [keyword, setKeyword] = useState('');

  const listPelatihan = [
    {
      id: 1,
      kategori: 'Micro Skill',
      penyelenggara: 'Balai Besar Pelatihan SDM Komdigi Medan',
      judul: 'Kreasi Animasi 2D dengan Kecerdasan Artifisial',
      peserta: 2164,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      tag: 'Kecerdasan Artifisial'
    },
    {
      id: 2,
      kategori: 'Micro Skill',
      penyelenggara: 'Balai Besar Pelatihan SDM Komdigi Medan',
      judul: 'Kecerdasan Artifisial No-Code Studio: Membuat Aplikasi dan Website Tanpa Coding',
      peserta: 2631,
      banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      tag: 'No-Code Web'
    },
    {
      id: 3,
      kategori: 'Micro Skill',
      penyelenggara: 'Balai Besar Pelatihan SDM Komdigi Medan',
      judul: 'Dari Live ke Laku: Strategi Jitu Live Commerce untuk UMKM Digital',
      peserta: 787,
      banner: 'https://images.unsplash.com/photo-1556742049-0a67e557224e?w=600&auto=format&fit=crop&q=80',
      tag: 'Live Commerce'
    },
    {
      id: 4,
      kategori: 'Digital Entrepreneurship',
      penyelenggara: 'Dinas Koperasi & Usaha Kecil Jabar',
      judul: 'Digitalisasi Finansial dan Pembukuan Kas Usaha Mikro',
      peserta: 1420,
      banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      tag: 'Keuangan'
    }
  ];

  const filtered = listPelatihan.filter(item => 
    item.judul.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Tombol Back & Header Pencarian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button
          type="button"
          onClick={onKembali}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#164E43',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: '700'
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        <div style={{ position: 'relative', width: '360px' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari akademi, pelatihan, tema..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '999px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
          Katalog Pelatihan & Inkubasi Digital
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
          Tingkatkan kapabilitas digital usaha Anda melalui modul pelatihan resmi terakreditasi.
        </p>
      </div>

      {/* Grid Katalog Kartu Pelatihan */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onPilihPelatihan(item)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
            }}
          >
            {/* Visual Box Thumbnail */}
            <div style={{ position: 'relative', height: '180px', backgroundColor: '#0284C7', overflow: 'hidden' }}>
              <img
                src={item.banner}
                alt={item.judul}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700'
              }}>
                {item.kategori}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(2, 132, 199, 0.85)',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                padding: '4px 12px',
                fontWeight: '600'
              }}>
                {item.penyelenggara}
              </div>
            </div>

            {/* Konten Kartu */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284C7', textTransform: 'uppercase' }}>
                  {item.tag}
                </span>
                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginTop: '6px',
                  lineHeight: 1.4,
                  minHeight: '44px'
                }}>
                  {item.judul}
                </h3>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #F1F5F9',
                paddingTop: '14px',
                marginTop: '16px',
                fontSize: '0.8rem',
                color: '#64748B'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} />
                  <span>{item.peserta.toLocaleString('id-ID')} Peserta</span>
                </div>
                <span style={{ color: '#0284C7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Lihat Detail <ExternalLink size={14} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
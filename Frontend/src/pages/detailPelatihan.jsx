import { ArrowLeft, Users, GraduationCap, RefreshCw, Share2 } from 'lucide-react';

export default function DetailPelatihan({ pelatihan, onKembali, user, onArahkanLogin }) {
  if (!pelatihan) return null;

  const handleKlikDaftar = () => {
    if (!user) {
      // Jika belum login, redirect ke alur login
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk mendaftar pelatihan ini.');
      onArahkanLogin();
    } else {
      // Jika sudah login
      alert(`Pendaftaran berhasil untuk akun: ${user.nama}`);
    }
  };

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Banner Biru Atas (Sesuai Screenshot Digitalent) */}
      <div style={{ backgroundColor: '#0D6EFD', color: '#FFFFFF', padding: '42px 8%' }}>
        <button
          type="button"
          onClick={onKembali}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </button>

        <h1 style={{ fontSize: '2.1rem', fontWeight: '800', margin: '0 0 8px 0', maxWidth: '850px', lineHeight: 1.3 }}>
          {pelatihan.judul}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '0 0 28px 0' }}>
          Belajar Mandiri ({pelatihan.kategori})
        </p>

        <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)' }}>Kategori</div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <GraduationCap size={16} /> {pelatihan.kategori}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)' }}>Jumlah Peserta</div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Users size={16} /> {pelatihan.peserta} Peserta
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)' }}>Alur Pendaftaran</div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <RefreshCw size={16} /> Self Enrolment
            </div>
          </div>
        </div>
      </div>

      {/* Konten Dua Kolom */}
      <div style={{ maxWidth: '1240px', margin: '-40px auto 40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
        
        {/* Kolom Kiri: Gambar Ilustrasi */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
          <img src={pelatihan.banner} alt={pelatihan.judul} style={{ width: '100%', height: '360px', objectFit: 'cover' }} />
          <div style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>Deskripsi Pelatihan</h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Program ini diformulasikan untuk membekali pelaku UMKM di Jawa Barat dalam memanfaatkan otomasi digital, kecerdasan buatan, serta kanal pemasaran interaktif modern guna meningkatkan efisiensi operasional dan omzet penjualan.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Card Aksi Pendaftaran */}
        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
            <div style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Pelatihan diselenggarakan secara <b>Self-paced learning</b> atau dikerjakan secara mandiri melalui modul daring.
            </div>

            <button
              type="button"
              onClick={handleKlikDaftar}
              style={{
                width: '100%',
                backgroundColor: '#0D6EFD',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              DAFTAR SEKARANG
            </button>

            <button
              type="button"
              onClick={() => alert('Tautan disalin ke clipboard!')}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                color: '#0D6EFD',
                border: '1px solid #CBD5E1',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Share2 size={16} /> Bagikan pelatihan ini
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
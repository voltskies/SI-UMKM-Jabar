import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar, Tag, ShieldCheck, Building2 } from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function RiwayatDetail({ data, onKembali, setHalaman, user, onPilihNotif }) {
  const getStatusBadge = (status) => {
    if (status === 'Disetujui' || status === 'Selesai' || status === 'Terdaftar') {
      return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', icon: <CheckCircle2 size={16} /> };
    }
    if (status === 'Ditolak' || status === 'Perlu Perbaikan') {
      return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', icon: <AlertCircle size={16} /> };
    }
    return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: <Clock size={16} /> };
  };

  const badge = getStatusBadge(data?.status);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar setHalaman={setHalaman} user={user} mode="solid-sticky" onPilihNotif={onPilihNotif} />

      <main style={{ flex: 1, maxWidth: '820px', width: '100%', margin: '0 auto', padding: '36px 20px 60px', boxSizing: 'border-box', textAlign: 'left' }}>
        
        {/* Tombol Navigasi Kembali */}
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
            padding: 0,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1B4143')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#255456')}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        {/* Card Detail Pengajuan */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          padding: '32px',
          textAlign: 'left'
        }}>
          {/* Header Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf1f1', color: '#255456', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                <ShieldCheck size={13} /> Detail Status Pengajuan
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: '800', color: '#0F172A', textAlign: 'left' }}>
                {data?.judul || 'Rincian Pengajuan Layanan'}
              </h1>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                ID Berkas: <strong style={{ color: '#0F172A' }}>{data?.id || '-'}</strong>
              </span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              {badge.icon}
              <span>{data?.status || 'Menunggu'}</span>
            </div>
          </div>

          {/* Grid Informasi Tanggal & Kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={14} /> Tanggal Registrasi
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>
                {data?.waktu || 'Terkini'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Tag size={14} /> Kategori Layanan
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A', textTransform: 'capitalize' }}>
                {data?.tipe || 'Layanan Mandiri'}
              </div>
            </div>
          </div>

          {/* Pesan Keterangan & Catatan Admin */}
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} /> Informasi & Catatan Verifikasi:
            </h4>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '0.86rem',
              color: '#334155',
              lineHeight: '1.65'
            }}>
              {data?.pesan || 'Tidak ada catatan tambahan untuk berkas ini.'}
            </div>
          </div>
        </div>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
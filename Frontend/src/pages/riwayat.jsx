import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar, 
  Tag, ShieldCheck, Building2, FileText, Check, AlertTriangle, 
  HelpCircle, ExternalLink, ChevronRight
} from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function RiwayatDetail({ data, onKembali, setHalaman, user, onPilihNotif }) {
  const statusStr = (data?.status || 'Menunggu Verifikasi').trim();
  const isApproved = statusStr === 'Disetujui' || statusStr === 'Selesai' || statusStr === 'Terdaftar';
  const isRejected = statusStr === 'Ditolak' || statusStr === 'Perlu Perbaikan';
  const isPending = !isApproved && !isRejected;

  // Penentuan Lencana Status
  const getStatusBadge = () => {
    if (isApproved) {
      return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', icon: <CheckCircle2 size={16} /> };
    }
    if (isRejected) {
      return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', icon: <AlertCircle size={16} /> };
    }
    return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: <Clock size={16} /> };
  };

  const badge = getStatusBadge();

  // Ekstraksi info nomor registrasi / judul bersih
  const judulAsli = data?.judul || 'Pengajuan Layanan UMKM';
  const noRegMatch = judulAsli.match(/\(([^)]+)\)/);
  const nomorRegistrasi = noRegMatch ? noRegMatch[1] : (data?.id || 'REG-UMKM-JBR');

  // Langkah timeline tracking alur birokrasi
  const steps = [
    {
      title: 'Berkas Dikirim',
      desc: 'Pemohon telah mengunggah dokumen persyaratan',
      completed: true,
      current: false,
      date: data?.waktu || 'Terkirim'
    },
    {
      title: 'Verifikasi Administrator',
      desc: isPending ? 'Sedang ditinjau oleh tim teknis dinas' : 'Pemeriksaan kelengkapan dokumen selesai',
      completed: isApproved || isRejected,
      current: isPending,
      date: isPending ? 'Dalam Proses' : 'Selesai diverifikasi'
    },
    {
      title: isRejected ? 'Permohonan Ditolak / Revisi' : 'Keputusan & Validasi Akhir',
      desc: isApproved 
        ? 'Layanan disetujui, surat keputusan/sertifikat diterbitkan' 
        : isRejected 
        ? 'Dokumen perlu diperbaiki sesuai catatan verifikator' 
        : 'Menunggu hasil evaluasi berkas',
      completed: isApproved || isRejected,
      current: isApproved || isRejected,
      date: isApproved ? 'Terbit' : isRejected ? 'Perlu Tindakan' : 'Tahap Akhir',
      isError: isRejected
    }
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar setHalaman={setHalaman} user={user} mode="solid-sticky" onPilihNotif={onPilihNotif} />

      <main style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '0 auto', padding: '32px 20px 60px', boxSizing: 'border-box', textAlign: 'left' }}>
        
        {/* Navigasi Kembali */}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0b2b36')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#255456')}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        {/* Card Utama Pelacakan Status */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          padding: '32px',
          textAlign: 'left'
        }}>

          {/* Header Card Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '22px', marginBottom: '28px' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf1f1', color: '#255456', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <ShieldCheck size={14} /> Pelacakan Dokumen Real-Time
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 3.2vw, 24px)', fontWeight: '800', color: '#0F172A', textAlign: 'left', lineHeight: 1.3 }}>
                {data?.judul || 'Rincian Pengajuan Layanan'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#64748B', flexWrap: 'wrap' }}>
                <span>No. Registrasi: <strong style={{ color: '#0F172A' }}>{nomorRegistrasi}</strong></span>
                <span>•</span>
                <span>Kategori: <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{data?.tipe || 'Layanan UMKM'}</strong></span>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {badge.icon}
              <span>{statusStr}</span>
            </div>
          </div>

          {/* Stepper Tracking Visual (Alur Birokrasi) */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E293B', marginBottom: '18px', textAlign: 'left' }}>
              Tahapan Alur Pengajuan
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {/* Kolom Ikon & Garis Vertikal */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: step.isError ? '#DC2626' : (step.completed ? '#255456' : (step.current ? '#D97706' : '#E2E8F0')),
                        color: step.completed || step.current ? '#FFFFFF' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        zIndex: 2
                      }}>
                        {step.isError ? <AlertCircle size={16} /> : (step.completed ? <Check size={16} /> : idx + 1)}
                      </div>
                      
                      {!isLast && (
                        <div style={{
                          width: '2px',
                          flex: 1,
                          minHeight: '42px',
                          backgroundColor: step.completed ? '#255456' : '#E2E8F0',
                          margin: '4px 0'
                        }} />
                      )}
                    </div>

                    {/* Kolom Teks Status */}
                    <div style={{ paddingBottom: isLast ? '0' : '24px', flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: step.isError ? '#DC2626' : (step.completed || step.current ? '#0F172A' : '#94A3B8') }}>
                          {step.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>
                          {step.date}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kotak Ringkasan Rincian Berkas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={14} /> Tanggal Registrasi
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A' }}>
                {data?.waktu || 'Terkini'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Building2 size={14} /> Instansi Penyelenggara
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A' }}>
                Dinas KUK Provinsi Jawa Barat
              </div>
            </div>
          </div>

          {/* Kotak Pesan Catatan Verifikator Dinas */}
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#255456" /> Catatan & Ulasan Verifikator:
            </h4>
            <div style={{
              backgroundColor: isRejected ? '#FEF2F2' : (isApproved ? '#F0FDF4' : '#F8FAFC'),
              border: `1px solid ${isRejected ? '#FCA5A5' : (isApproved ? '#BBF7D0' : '#E2E8F0')}`,
              borderRadius: '12px',
              padding: '18px',
              fontSize: '0.86rem',
              color: isRejected ? '#991B1B' : (isApproved ? '#166534' : '#334155'),
              lineHeight: '1.65'
            }}>
              {data?.pesan || 'Tidak ada catatan tambahan untuk berkas ini.'}
            </div>
          </div>

          {/* Petunjuk Tindak Lanjut Pengguna */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            textAlign: 'left'
          }}>
            <HelpCircle size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E40AF', marginBottom: '2px' }}>
                Informasi Penting
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E3A8A', lineHeight: 1.5 }}>
                {isApproved && 'Selamat! Pengajuan Anda telah disetujui secara resmi. Anda dapat mencetak berkas sertifikasi atau menghadiri pelatihan sesuai jadwal tertera.'}
                {isRejected && 'Berkas ditolak atau memerlukan revisi. Silakan periksa kembali catatan evaluator di atas dan ajukan perbaikan berkas melalui halaman layanan terkait.'}
                {isPending && 'Dokumen pengajuan Anda saat ini berada dalam antrean pemeriksaan oleh tim verifikator Dinas KUK. Notifikasi akan diperbarui secara otomatis ketika status berubah.'}
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
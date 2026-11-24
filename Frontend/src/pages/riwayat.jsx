import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar, 
  ShieldCheck, Building2, FileText, Check, HelpCircle
} from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

const formatTanggal = (value) => {
  if (!value) return '—';
  const normalizedValue = typeof value === 'string'
    && value.includes('T')
    && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? `${value}Z`
    : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function RiwayatDetail({ data, onKembali, setHalaman, user, onPilihNotif }) {
  const [detailBackend, setDetailBackend] = useState(null);
  const [errorBackend, setErrorBackend] = useState(null);
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const API_BASE_URL = import.meta.env.VITE_API_URL
    || (isLocalHost ? `http://${window.location.hostname}:8000` : 'https://si-umkm-jabar.vercel.app');
  const recordKey = data?.recordType && data?.recordId && user?.id
    ? `${data.recordType}:${data.recordId}:${user.id}`
    : null;

  useEffect(() => {
    if (!recordKey) return undefined;

    let active = true;
    let fetching = false;
    const fetchDetail = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/layanan/riwayat/${data.recordType}/${data.recordId}`,
          { params: { user_id: user.id } }
        );
        if (!response.data?.data?.pengajuan) {
          throw new Error('Respons detail pengajuan tidak lengkap.');
        }
        if (active) {
          setDetailBackend({ key: recordKey, data: response.data.data });
          setErrorBackend(null);
        }
      } catch (error) {
        console.error('Gagal memperbarui detail pengajuan:', error);
        if (active) setErrorBackend({ key: recordKey, message: 'Status terbaru belum dapat dimuat dari server.' });
      } finally {
        fetching = false;
      }
    };

    fetchDetail();
    const timer = window.setInterval(() => {
      if (!document.hidden) fetchDetail();
    }, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchDetail();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [API_BASE_URL, data?.recordId, data?.recordType, recordKey, user?.id]);

  const snapshot = detailBackend?.key === recordKey ? detailBackend.data : null;
  const errorMessage = errorBackend?.key === recordKey ? errorBackend.message : null;
  const isLoadingDetail = Boolean(recordKey && !snapshot && !errorMessage);
  const pengajuan = snapshot?.pengajuan;
  const riwayatStatus = snapshot?.riwayat || [];
  const statusStr = String(pengajuan?.status || data?.status || 'Status belum tersedia').trim();
  const isApproved = statusStr === 'Disetujui' || statusStr === 'Selesai' || statusStr === 'Terdaftar';
  const isRejected = statusStr === 'Ditolak' || statusStr === 'Perlu Perbaikan';
  const isPending = !isApproved && !isRejected;

  // Penentuan Lencana Status (Nuansa Glass Abu Netral)
  const getStatusBadge = () => {
    if (isApproved) {
      return {
        bg: 'rgba(241, 245, 249, 0.85)',
        text: '#1E293B',
        border: 'rgba(148, 163, 184, 0.45)',
        icon: <CheckCircle2 size={16} color="#255456" />
      };
    }
    if (isRejected) {
      return {
        bg: 'rgba(241, 245, 249, 0.85)',
        text: '#334155',
        border: 'rgba(148, 163, 184, 0.5)',
        icon: <AlertCircle size={16} color="#991B1B" />
      };
    }
    return {
      bg: 'rgba(241, 245, 249, 0.85)',
      text: '#334155',
      border: 'rgba(148, 163, 184, 0.4)',
      icon: <Clock size={16} color="#475569" />
    };
  };

  const badge = getStatusBadge();

  // Ekstraksi info nomor registrasi / judul bersih
  const judulAsli = data?.judul || 'Pengajuan Layanan UMKM';
  const noRegMatch = judulAsli.match(/\(([^)]+)\)/);
  const nomorRegistrasi = pengajuan?.nomor_pengajuan
    || pengajuan?.nomor_registrasi
    || (noRegMatch ? noRegMatch[1] : (data?.recordId || 'REG-UMKM-JBR'));
  const waktuPengajuan = pengajuan?.created_at || pengajuan?.tanggal_daftar || data?.waktu;
  const steps = [
    {
      title: 'Pengajuan diterima',
      desc: 'Data pengajuan tercatat di sistem.',
      completed: true,
      current: false,
      date: formatTanggal(pengajuan?.created_at || pengajuan?.tanggal_daftar || data?.waktu)
    },
    ...riwayatStatus.map((event, index) => {
      const statusBerubah = event.status_sebelumnya !== event.status_baru;
      return {
        title: statusBerubah ? `Status diperbarui: ${event.status_baru}` : 'Catatan verifikator diperbarui',
        desc: event.catatan_admin || `Status pengajuan: ${event.status_baru}.`,
        completed: true,
        current: index === riwayatStatus.length - 1 && event.status_baru === statusStr,
        date: formatTanggal(event.changed_at),
        isError: event.status_baru === 'Ditolak' || event.status_baru === 'Perlu Perbaikan'
      };
    }),
    ...(!riwayatStatus.length || riwayatStatus[riwayatStatus.length - 1]?.status_baru !== statusStr ? [{
      title: `Status terkini: ${statusStr}`,
      desc: pengajuan?.catatan_admin
        || (isPending ? 'Pengajuan sedang menunggu atau menjalani verifikasi admin.' : 'Status ini tercatat; riwayat perubahan sebelumnya belum tersedia.'),
      completed: isApproved || isRejected,
      current: true,
      date: snapshot ? 'Status terkini dari verifikator' : 'Status pada notifikasi',
      isError: isRejected
    }] : [])
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
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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

          {isLoadingDetail && (
            <div
              role="status"
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(241, 245, 249, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(203, 213, 225, 0.6)',
                color: '#334155',
                fontSize: '0.82rem'
              }}
            >
              Mengambil status terbaru dari server...
            </div>
          )}
          {errorMessage && (
            <div
              role="alert"
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(241, 245, 249, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(203, 213, 225, 0.7)',
                color: '#334155',
                fontSize: '0.82rem'
              }}
            >
              {errorMessage} Informasi yang terlihat mungkin belum mencerminkan pembaruan terakhir admin.
            </div>
          )}

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
                        backgroundColor: step.isError ? '#475569' : (step.completed ? '#255456' : (step.current ? '#64748B' : '#E2E8F0')),
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
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: step.completed || step.current ? '#0F172A' : '#94A3B8' }}>
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
            <div style={{ backgroundColor: 'rgba(241, 245, 249, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(203, 213, 225, 0.5)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={14} /> Tanggal Registrasi
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A' }}>
                {formatTanggal(waktuPengajuan)}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(241, 245, 249, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(203, 213, 225, 0.5)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Building2 size={14} /> Instansi Penyelenggara
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A' }}>
                Dinas KUK Provinsi Jawa Barat
              </div>
            </div>
          </div>

          {/* Kotak Pesan Catatan Verifikator Dinas (Transparan Glass Abu) */}
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#255456" /> Catatan & Ulasan Verifikator:
            </h4>
            <div style={{
              backgroundColor: 'rgba(241, 245, 249, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(203, 213, 225, 0.65)',
              borderRadius: '12px',
              padding: '18px',
              fontSize: '0.86rem',
              color: '#334155',
              lineHeight: '1.65'
            }}>
              {snapshot
                ? (pengajuan?.catatan_admin || 'Belum ada catatan dari verifikator.')
                : (data?.pesan || 'Belum ada catatan tambahan untuk berkas ini.')}
            </div>
          </div>

          {/* Petunjuk Tindak Lanjut Pengguna (Transparan Glass Abu) */}
          <div style={{
            backgroundColor: 'rgba(241, 245, 249, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(203, 213, 225, 0.65)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            textAlign: 'left'
          }}>
            <HelpCircle size={18} color="#475569" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B', marginBottom: '2px' }}>
                Informasi Penting
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                {isApproved && 'Pengajuan Anda telah disetujui oleh admin. Ikuti petunjuk pada catatan verifikator jika ada.'}
                {isRejected && 'Berkas ditolak atau memerlukan revisi. Silakan periksa kembali catatan evaluator di atas dan ajukan perbaikan berkas melalui halaman layanan terkait.'}
                {isPending && 'Pengajuan Anda masih menunggu atau sedang diproses verifikator. Status diperbarui dari backend secara berkala.'}
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Calendar, 
  Building2, FileText, Check, HelpCircle
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

export default function TrackingRiwayat({ data, onKembali, setHalaman, user, onPilihNotif }) {
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
  const isInProgress = statusStr === 'Diproses' || statusStr === 'Perlu Perbaikan';
  const isTerminalRejection = statusStr === 'Ditolak';
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
  const tahapAktif = isApproved || isTerminalRejection ? 2 : isInProgress ? 1 : 0;
  const waktuDiproses = [...riwayatStatus].reverse().find((event) =>
    event.status_baru === 'Diproses' || event.status_baru === 'Perlu Perbaikan'
  )?.changed_at;
  const waktuSelesai = [...riwayatStatus].reverse().find((event) =>
    event.status_baru === 'Disetujui' || event.status_baru === 'Selesai' || event.status_baru === 'Ditolak'
  )?.changed_at;
  const tahapanTracking = [
    {
      title: 'Baru diterima',
      desc: tahapAktif === 0
        ? 'Pengajuan sudah tercatat dan menunggu pemeriksaan admin.'
        : 'Pengajuan tercatat di sistem.',
      date: formatTanggal(waktuPengajuan)
    },
    {
      title: 'Diproses',
      desc: isInProgress
        ? (statusStr === 'Perlu Perbaikan'
          ? (pengajuan?.catatan_admin || 'Admin meminta perbaikan pada pengajuan.')
          : 'Pengajuan sedang ditinjau oleh verifikator.')
        : tahapAktif > 1
          ? 'Tahap verifikasi telah dilalui.'
          : 'Menunggu pengajuan mulai diproses.',
      date: waktuDiproses ? formatTanggal(waktuDiproses) : (isInProgress ? 'Sedang berlangsung' : 'Belum dimulai')
    },
    {
      title: isTerminalRejection
        ? 'Ditolak'
        : data?.recordType === 'pelatihan'
          ? 'Pendaftaran tercatat'
          : 'Selesai',
      desc: isApproved
        ? data?.recordType === 'pelatihan'
          ? 'Pendaftaran pelatihan Anda sudah tercatat.'
          : `Status akhir dari admin: ${statusStr}.`
        : isTerminalRejection
          ? (pengajuan?.catatan_admin || 'Pengajuan ditolak oleh admin.')
          : 'Menunggu keputusan akhir dari admin.',
      date: waktuSelesai
        ? formatTanggal(waktuSelesai)
        : (isApproved || isTerminalRejection ? 'Status terkini dari backend' : 'Belum selesai')
    }
  ].map((step, index) => ({
    ...step,
    completed: index < tahapAktif || (index === tahapAktif && (isApproved || isTerminalRejection)),
    current: index === tahapAktif,
    isError: index === 2 && isTerminalRejection
  }));
  const eventHistory = [...riwayatStatus].reverse();

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

          <section aria-label="Status tracking pengajuan" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                Tahapan Pengajuan
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Status diperbarui otomatis setiap 10 detik</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {tahapanTracking.map((step, index) => (
                <div
                  key={step.title}
                  aria-current={step.current ? 'step' : undefined}
                  style={{
                    minHeight: '146px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${step.isError ? '#FCA5A5' : step.current ? '#255456' : 'rgba(203, 213, 225, 0.65)'}`,
                    backgroundColor: step.isError ? 'rgba(254, 242, 242, 0.8)' : step.current ? 'rgba(234, 241, 241, 0.9)' : 'rgba(241, 245, 249, 0.65)'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    marginBottom: '12px',
                    backgroundColor: step.isError ? '#DC2626' : step.completed ? '#255456' : step.current ? '#64748B' : '#E2E8F0',
                    color: step.completed || step.current || step.isError ? '#FFFFFF' : '#64748B'
                  }}>
                    {step.isError ? <AlertCircle size={16} /> : step.completed ? <Check size={16} /> : step.current ? <Clock size={16} /> : index + 1}
                  </div>
                  <div style={{ fontSize: '0.87rem', fontWeight: '800', color: '#0F172A', marginBottom: '5px' }}>
                    {step.title}
                  </div>
                  <p style={{ fontSize: '0.77rem', lineHeight: 1.5, color: '#475569', margin: '0 0 8px' }}>
                    {step.desc}
                  </p>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{step.date}</span>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Riwayat verifikasi admin" style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E293B', margin: '0 0 12px' }}>
              Riwayat Pembaruan Admin
            </h3>
            {eventHistory.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {eventHistory.map((event) => (
                  <article
                    key={event.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(203, 213, 225, 0.65)',
                      backgroundColor: 'rgba(241, 245, 249, 0.65)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>
                        {event.status_sebelumnya
                          ? `${event.status_sebelumnya} → ${event.status_baru}`
                          : event.status_baru}
                      </strong>
                      <time dateTime={event.changed_at} style={{ color: '#64748B', fontSize: '0.72rem' }}>
                        {formatTanggal(event.changed_at)}
                      </time>
                    </div>
                    <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '0.79rem', lineHeight: 1.5 }}>
                      {event.catatan_admin || 'Admin memperbarui status pengajuan.'}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(241, 245, 249, 0.65)', color: '#64748B', fontSize: '0.79rem', lineHeight: 1.5 }}>
                {snapshot
                  ? `Belum ada riwayat perubahan admin. Status terbaru: ${statusStr}.`
                  : 'Riwayat perubahan status akan tampil setelah detail berhasil dimuat dari server.'}
              </p>
            )}
          </section>

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
import { useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Users, GraduationCap, RefreshCw, Share2, 
  Upload, CheckCircle2, AlertCircle, X, Copy, Check,
  MessageCircle, Send, Globe
} from 'lucide-react';
import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function DetailPelatihan({ pelatihan, onKembali, setHalaman, user, onArahkanLogin }) {
  const [loading, setLoading] = useState(false);
  const [berkasSyarat, setBerkasSyarat] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [suksesMsg, setSuksesMsg] = useState('');

  // State untuk modal share & status copy link
  const [bukaModalShare, setBukaModalShare] = useState(false);
  const [sudahDisalin, setSudahDisalin] = useState(false);

  if (!pelatihan) return null;

  const envUrl = import.meta.env.VITE_API_URL;
  let cleanUrl = (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) ? envUrl : 'https://si-umkm-jabar.vercel.app';

  if (cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.replace('http://', 'https://');
  }

  const API_BASE_URL = cleanUrl;
  const shareUrl = window.location.href;
  const shareTitle = `Ayo ikuti pelatihan UMKM Jabar: "${pelatihan.judul || pelatihan.title}" dari ${pelatihan.penyelenggara || 'Dinas KUK Jawa Barat'}!`;

  // Fungsi Salin Link
  const handleSalinLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setSudahDisalin(true);
    setTimeout(() => setSudahDisalin(false), 2500);
  };

  // Link Share ke Medsos
  const linkWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`;
  const linkFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const linkTelegram = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;

  const handleKlikDaftar = async () => {
    setErrorMsg('');
    setSuksesMsg('');

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

    if (!currentUser || (!currentUser.id && !currentUser.nik && !currentUser.email)) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk mendaftar pelatihan ini.');
      if (typeof onArahkanLogin === 'function') {
        onArahkanLogin();
      } else if (typeof setHalaman === 'function') {
        setHalaman('login');
      }
      return;
    }

    // Validasi Wajib Upload Dokumen Syarat
    if (!berkasSyarat) {
      setErrorMsg('Dokumen Syarat / KTP wajib diunggah sebelum mendaftar pelatihan.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_id', parseInt(currentUser.id, 10));
      formData.append('id_pelatihan', parseInt(pelatihan.id || 1, 10));
      formData.append('judul_pelatihan', pelatihan.judul || pelatihan.title || 'Pelatihan UMKM Jabar');
      formData.append('kategori', pelatihan.kategori || 'Fasilitasi UMKM');
      formData.append('penyelenggara', pelatihan.penyelenggara || 'Dinas KUK Jawa Barat');
      formData.append('file_syarat', berkasSyarat);

      const response = await axios.post(`${API_BASE_URL}/api/v1/layanan/pendaftaran-pelatihan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.status === 'success' || response.status === 200 || response.status === 201) {
        setSuksesMsg(response.data?.message || 'Pendaftaran pelatihan berhasil disimpan!');
        window.dispatchEvent(new Event('update_notifikasi'));
      }
    } catch (err) {
      console.error('Pendaftaran gagal detail:', err);
      const errRes = err.response?.data;
      let pesan = 'Gagal memproses pendaftaran ke server.';
      
      if (errRes) {
        if (typeof errRes.detail === 'string') {
          pesan = errRes.detail;
        } else if (Array.isArray(errRes.detail)) {
          pesan = errRes.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
        } else if (errRes.message) {
          pesan = errRes.message;
        } else {
          pesan = JSON.stringify(errRes);
        }
      } else if (err.message) {
        pesan = err.message;
      }
      
      setErrorMsg(pesan);
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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar setHalaman={setHalaman} user={user} mode="solid-sticky" />

      {/* Hero Header Bagian Atas */}
      <div style={{
        background: 'linear-gradient(135deg, #255456 0%, #1E4648 100%)',
        color: '#FFFFFF',
        padding: '36px 20px 64px 20px',
        boxShadow: '0 4px 20px rgba(37, 84, 86, 0.25)',
        textAlign: 'left'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
          
          {/* Tombol Kembali & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '16px', textAlign: 'left' }}>
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
                fontSize: '0.88rem',
                padding: 0,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
            >
              <ArrowLeft size={18} /> Kembali ke Katalog
            </button>

            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>•</span>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(6px)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Program Resmi Dinas KUK Jawa Barat
            </div>
          </div>

          {/* Judul & Kategori Pelatihan */}
          <h1 style={{ 
            fontSize: 'clamp(24px, 3.2vw, 32px)', 
            fontWeight: '800', 
            margin: '0 0 8px 0', 
            maxWidth: '900px', 
            lineHeight: 1.3,
            textAlign: 'left'
          }}>
            {pelatihan.judul || pelatihan.title}
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '0.9rem', 
            margin: '0 0 24px 0',
            textAlign: 'left' 
          }}>
            Pelatihan & Standardisasi ({pelatihan.kategori})
          </p>

          {/* Metadata Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            flexWrap: 'wrap', 
            borderTop: '1px solid rgba(255,255,255,0.15)', 
            paddingTop: '20px',
            textAlign: 'left'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.75)' }}>Kategori</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <GraduationCap size={16} color="#a6c6c7" /> {pelatihan.kategori}
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.75)' }}>Kapasitas Kuota</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Users size={16} color="#a6c6c7" /> {pelatihan.kuota || pelatihan.peserta || 150} Peserta
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.75)' }}>Alur Pendaftaran</div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <RefreshCw size={16} color="#a6c6c7" /> Pendaftaran Terbuka (Mandiri)
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Konten Utama Detail & Formulir Pendaftaran */}
      <main className="responsive-page-content" style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '-36px auto 50px auto', padding: '0 20px', boxSizing: 'border-box', textAlign: 'left' }}>
        <div className="responsive-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Kolom Kiri: Foto Banner & Rincian */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)', textAlign: 'left' }}>
            <div className="responsive-detail-image" style={{ height: '340px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
              <img
                src={pelatihan.banner || pelatihan.image}
                alt={pelatihan.judul || pelatihan.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '28px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#255456', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                {pelatihan.tag || 'Fasilitasi UMKM'}
              </span>
              <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0', textAlign: 'left' }}>
                Rincian Program Pelatihan
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 20px 0', textAlign: 'left' }}>
                {pelatihan.deskripsi || 'Program pembinaan strategis dari Dinas KUK Jawa Barat untuk memperkuat kapabilitas manajemen usaha mikro dan akselerasi omzet perdagangan digital.'}
              </p>
              
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px', textAlign: 'left' }}>
                  Penyelenggara Teknis:
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, textAlign: 'left' }}>
                  {pelatihan.penyelenggara || 'Dinas Koperasi & Usaha Kecil (KUK) Provinsi Jawa Barat'}
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Pendaftaran */}
          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '26px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0', textAlign: 'left' }}>
                Pendaftaran Pelatihan
              </h3>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '11px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', textAlign: 'left' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {suksesMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#eaf1f1', border: '1px solid #a6c6c7', color: '#255456', padding: '11px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', textAlign: 'left' }}>
                  <CheckCircle2 size={16} />
                  <span>{suksesMsg}</span>
                </div>
              )}

              {/* Upload Berkas Syarat Pelatihan (Wajib) */}
              <div style={{ 
                marginBottom: '18px', 
                border: berkasSyarat ? '1px solid #255456' : '1px dashed #CBD5E1', 
                padding: '14px', 
                borderRadius: '8px', 
                backgroundColor: berkasSyarat ? '#F0FDF4' : '#F8FAFC', 
                textAlign: 'left' 
              }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                  Unggah Dokumen Syarat / KTP (Wajib PDF/PNG/JPG) *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setBerkasSyarat(file);
                    if (file) setErrorMsg('');
                  }}
                  style={{ fontSize: '0.78rem', width: '100%', color: '#334155' }}
                />
                {berkasSyarat ? (
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600', marginTop: '6px', textAlign: 'left' }}>
                    ✓ Dokumen terpilih: {berkasSyarat.name}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                    * Unggah berkas identitas/syarat untuk membuka tombol daftar
                  </div>
                )}
              </div>

              {/* Tombol Aksi - Hanya aktif jika berkasSyarat sudah ada */}
              <button
                type="button"
                disabled={loading || !berkasSyarat}
                onClick={handleKlikDaftar}
                style={{
                  width: '100%',
                  backgroundColor: loading 
                    ? '#94A3B8' 
                    : (!berkasSyarat ? '#CBD5E1' : '#D97706'),
                  color: !berkasSyarat ? '#64748B' : '#FFFFFF',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: (loading || !berkasSyarat) ? 'not-allowed' : 'pointer',
                  boxShadow: (!berkasSyarat || loading) ? 'none' : '0 4px 14px rgba(217, 119, 6, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading 
                  ? 'MEMPROSES PENDAFTARAN...' 
                  : (!berkasSyarat ? 'UNGGAH DOKUMEN UNTUK DAFTAR' : 'DAFTAR SEKARANG')}
              </button>

              <button
                type="button"
                onClick={() => setBukaModalShare(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#255456',
                  border: '1px solid #CBD5E1',
                  padding: '11px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#255456';
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

      <Footer setHalaman={setHalaman} />

      {/* MODAL BAGIKAN KE SOSMED & SALIN LINK */}
      {bukaModalShare && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            textAlign: 'left'
          }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#eaf1f1', borderRadius: '10px', color: '#255456' }}>
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Bagikan Pelatihan</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Ajak rekan UMKM lain untuk bergabung</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBukaModalShare(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tombol Medsos */}
            <div className="responsive-social-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: '#1E293B',
                  fontSize: '0.74rem',
                  fontWeight: '600'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#255456', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <MessageCircle size={24} />
                </div>
                WhatsApp
              </a>

              <a
                href={linkTelegram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: '#1E293B',
                  fontSize: '0.74rem',
                  fontWeight: '600'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#229ED9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <Send size={22} />
                </div>
                Telegram
              </a>

              <a
                href={linkFacebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: '#1E293B',
                  fontSize: '0.74rem',
                  fontWeight: '600'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <Globe size={22} />
                </div>
                Facebook
              </a>

              <a
                href={linkTwitter}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  color: '#1E293B',
                  fontSize: '0.74rem',
                  fontWeight: '600'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>𝕏</span>
                </div>
                Twitter/X
              </a>
            </div>

            {/* Salin Tautan */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                Atau salin tautan langsung:
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '6px 8px 6px 14px'
              }}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.82rem',
                    color: '#64748B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSalinLink}
                  style={{
                    backgroundColor: '#255456',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {sudahDisalin ? (
                    <>
                      <Check size={14} /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Salin
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
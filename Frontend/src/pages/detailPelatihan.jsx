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

  const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;
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
      const formData = new FormData();
      formData.append('user_id', currentUser.id);
      formData.append('id_pelatihan', pelatihan.id || 1);
      formData.append('judul_pelatihan', pelatihan.judul || pelatihan.title || 'Pelatihan UMKM Jabar');
      formData.append('kategori', pelatihan.kategori || 'Fasilitasi UMKM');
      formData.append('penyelenggara', pelatihan.penyelenggara || 'Dinas KUK Provinsi Jawa Barat');

      if (berkasSyarat) {
        formData.append('file_syarat', berkasSyarat);
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/layanan/pendaftaran-pelatihan`, formData);

      if (response.data.status === 'success') {
        setSuksesMsg(response.data.message || 'Pendaftaran pelatihan berhasil disimpan!');
      }
    } catch (err) {
      console.error('Pendaftaran gagal:', err);
      const pesan = err.response?.data?.detail || 'Gagal menghubungi server backend. Pastikan server FastAPI aktif.';
      setErrorMsg(typeof pesan === 'string' ? pesan : JSON.stringify(pesan));
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
      <Navbar setHalaman={setHalaman} user={user} />

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
              padding: 0
            }}
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

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '-40px auto 50px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '28px', alignItems: 'start' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)' }}>
            <div style={{ height: '360px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
              <img
                src={pelatihan.banner || pelatihan.image}
                alt={pelatihan.judul || pelatihan.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '30px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#008848', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {pelatihan.tag || 'Fasilitasi UMKM'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: '10px 0 14px 0' }}>
                Rincian Program Pelatihan
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 20px 0' }}>
                {pelatihan.deskripsi || 'Program pembinaan strategis dari Dinas KUK Jawa Barat untuk memperkuat kapabilitas manajemen usaha mikro dan akselerasi omzet perdagangan digital.'}
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

          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)'
            }}>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {suksesMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{suksesMsg}</span>
                </div>
              )}

              {/* Upload Berkas Syarat Pelatihan */}
              <div style={{ marginBottom: '20px', border: '1px dashed #CBD5E1', padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Unggah Dokumen Syarat / KTP (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setBerkasSyarat(e.target.files[0] || null)}
                  style={{ fontSize: '0.78rem' }}
                />
                {berkasSyarat && (
                  <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '6px' }}>
                    ✓ Berkas terpilih: {berkasSyarat.name}
                  </div>
                )}
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
              >
                {loading ? 'MEMPROSES & UPLOAD KE CLOUD...' : 'DAFTAR SEKARANG'}
              </button>

              {/* Tombol Bagikan Pelatihan */}
              <button
                type="button"
                onClick={() => setBukaModalShare(true)}
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
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#DCFCE7', borderRadius: '10px', color: '#16A34A' }}>
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

            {/* Tombol-tombol Medsos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
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
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
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
                    backgroundColor: sudahDisalin ? '#16A34A' : '#164E43',
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
import { useState } from 'react';
import { 
  ArrowLeft, Lock, Mail, User, Phone, Eye, EyeOff, 
  Layers, GraduationCap, FileCheck, ShieldCheck, ArrowRight, CreditCard
} from 'lucide-react';

export default function Login({ onKembali, onLoginSukses, setHalaman }) {
  const [isRegister, setIsRegister] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State data form
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');
  const [nik, setNik] = useState('');

  // Navigasi kembali ke Dashboard
  const handleKembaliKeDashboard = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('dashboard');
    } else if (typeof onKembali === 'function') {
      onKembali();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister && password !== confirmPassword) {
      alert('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Pendaftaran Akun ke FastAPI
        const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nik,
            nama_lengkap: namaLengkap,
            email,
            nomor_whatsapp: nomorWhatsapp,
            password
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.detail || 'Pendaftaran akun gagal');
        }

        alert('Pendaftaran berhasil! Silakan masuk menggunakan email dan kata sandi Anda.');
        setIsRegister(false);
      } else {
        // Masuk Akun
        const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.detail || 'Email atau kata sandi tidak cocok.');
        }

        alert(`Login berhasil! Selamat datang, ${resData.data.nama}`);
        if (typeof onLoginSukses === 'function') {
          onLoginSukses(resData.data);
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '88vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Tombol Navigasi Kembali */}
      <div style={{ maxWidth: '1020px', width: '100%', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={handleKembaliKeDashboard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#164E43',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: '700',
            padding: '6px 0',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#008848')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#164E43')}
        >
          <ArrowLeft size={17} /> Kembali ke Beranda
        </button>
      </div>

      {/* Kontainer Utama Layout 2 Kolom Mockup UI */}
      <div style={{
        maxWidth: '1020px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1.25fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        
        {/* Kolom Kiri: Informasi Layanan */}
        <div style={{
          background: 'linear-gradient(145deg, #164E43 0%, #0F352E 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 18px 30px -10px rgba(22, 78, 67, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(6px)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700',
              letterSpacing: '0.4px',
              marginBottom: '20px'
            }}>
              Portal Resmi SI-UMKM Jabar
            </div>

            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: 1.2, margin: '0 0 10px 0' }}>
              {isRegister ? 'Buat Akun Anda' : 'Selamat Datang'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.82)', margin: '0 0 32px 0', lineHeight: 1.5 }}>
              {isRegister 
                ? 'Bangun usaha lebih berkembang bersama integrasi layanan terpadu UMKM Jawa Barat.'
                : 'Akses kembali pemantauan program bantuan, sertifikasi legalitas, dan kurasi pelatihan usaha.'}
            </p>

            {/* Daftar Fitur / Nilai Tambah Platform */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>1. Layanan UMKM Terintegrasi</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Akses berbagai fasilitas dalam satu platform</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>2. Pelatihan & Pendampingan</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Tingkatkan kemampuan manajemen dan pemasaran</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>3. Legalitas Lebih Mudah</div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Ajukan dan pantau proses verifikasi perizinan</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.65)',
            marginTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '16px'
          }}>
            <span>Dinas KUK Provinsi Jawa Barat</span>
            <span>SI-UMKM v1.0</span>
          </div>
        </div>

        {/* Kolom Kanan: Card Formulir */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
              {isRegister ? 'Formulir Pendaftaran' : 'Masuk ke Akun'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              {isRegister 
                ? 'Silakan lengkapi informasi identitas akun pemilik usaha di bawah ini.'
                : 'Masukkan alamat email dan kata sandi yang telah terdaftar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    NIK<span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="Masukkan 16 digit NIK sesuai KTP"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Nama Lengkap <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap pemilik usaha"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                Email <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="contoh: pemilik@umkmjabar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Input Password & Konfirmasi Password Berdampingan */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr',
              gap: '12px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 34px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Konfirmasi Password <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 34px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: 0
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Nomor WhatsApp <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#008848'
                  }}>
                    +62
                  </div>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="8xxxxxxxxxx"
                      value={nomorWhatsapp}
                      onChange={(e) => setNomorWhatsapp(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
              <ShieldCheck size={14} color="#008848" />
              <span>Pastikan data akun aktif untuk menerima notifikasi status permohonan.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#164E43',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                boxShadow: '0 4px 12px rgba(22, 78, 67, 0.25)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F352E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#164E43')}
            >
              {loading ? 'Memproses...' : isRegister ? 'Lanjutkan Pendaftaran' : 'Masuk Sekarang'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Opsi Beralih Antara Masuk dan Daftar */}
          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: '#64748B' }}>
            {isRegister ? 'Sudah memiliki akun terdaftar?' : 'Belum memiliki akun terdaftar?'}{' '}
            <span
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: '#008848', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
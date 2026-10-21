import emailjs from '@emailjs/browser';
import { useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Lock, Mail, User, Phone, Eye, EyeOff, 
  ArrowRight, CreditCard, X
} from 'lucide-react';

export default function Login({ onKembali, onLoginSukses, setHalaman }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State data formulir autentikasi
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');
  const [nik, setNik] = useState('');

  // State Modal Lupa Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Input Email, 2 = Input OTP & Password Baru
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Kredensial EmailJS Browser SDK (Port 443 HTTPS - Bebas Blokir ISP / Wi-Fi)
  const EMAILJS_SERVICE_ID = 'service_vr07rh';
  const EMAILJS_TEMPLATE_ID = 'template_318btwq';
  const EMAILJS_PUBLIC_KEY = 'BrC6NgRExKr6v1fz7';

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

    if (isRegister) {
      if (!/^\d{16}$/.test(nik.trim())) {
        alert('NIK tidak valid! Wajib tepat 16 digit angka.');
        return;
      }
      if (!/^\d{10,13}$/.test(nomorWhatsapp.trim())) {
        alert('Nomor WhatsApp tidak valid! Harus 10 sampai 13 digit angka.');
        return;
      }
      if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
        alert('Format email wajib menggunakan akun @gmail.com!');
        return;
      }
      if (password.length < 6) {
        alert('Kata sandi minimal 6 karakter!');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
          nik: nik.trim(),
          nama_lengkap: namaLengkap.trim(),
          email: email.trim().toLowerCase(),
          nomor_whatsapp: nomorWhatsapp.trim(),
          password: password
        });

        alert(res.data.message || 'Pendaftaran berhasil! Akun Anda langsung aktif. Silakan masuk.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, { 
          email: email.trim().toLowerCase(), 
          password: password 
        });

        localStorage.setItem('user_umkm', JSON.stringify(res.data.data));
        localStorage.setItem('token', 'session-token-umkm-jabar');

        alert(`Login berhasil! Selamat datang, ${res.data.data.nama}`);

        if (typeof onLoginSukses === 'function') {
          onLoginSukses(res.data.data);
        } else if (typeof setHalaman === 'function') {
          setHalaman('dashboard');
        }
      }
    } catch (err) {
      console.error("Detail Error API:", err);
      if (err.response) {
        const detailMsg = err.response.data?.detail || err.response.data?.message || `Error Server (${err.response.status})`;
        const pesan = Array.isArray(detailMsg) 
          ? detailMsg.map((d) => d.msg || JSON.stringify(d)).join(', ') 
          : typeof detailMsg === 'object' ? JSON.stringify(detailMsg) : detailMsg;
        alert(`Gagal: ${pesan}`);
      } else if (err.request) {
        alert(`Koneksi terputus ke ${API_BASE_URL}. Pastikan backend uvicorn berjalan.`);
      } else {
        alert(`Gagal: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler Lupa Password Tahap 1: Kirim Kode OTP Langsung via Browser SDK EmailJS
  const handleKirimOtpLupaPassword = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      alert('Masukkan email Anda terlebih dahulu.');
      return;
    }

    setForgotLoading(true);

    // Generate 6 digit kode OTP acak
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Kirim email lewat EmailJS browser SDK (Port 443 HTTPS resmi)
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          email: targetEmail,
          passcode: generatedOtp
        },
        EMAILJS_PUBLIC_KEY
      );

      // Simpan OTP dan waktu kadaluwarsa (5 menit) ke sessionStorage browser
      sessionStorage.setItem(`otp_val_${targetEmail}`, generatedOtp);
      sessionStorage.setItem(`otp_exp_${targetEmail}`, (Date.now() + 5 * 60 * 1000).toString());

      alert(`Kode verifikasi OTP berhasil dikirimkan ke email ${targetEmail}! Silakan periksa kotak masuk atau spam.`);
      setForgotStep(2);
    } catch (err) {
      console.error("Gagal kirim via EmailJS:", err);
      alert(`Gagal mengirim kode verifikasi: ${err.text || err.message || 'Periksa koneksi internet Anda.'}`);
    } finally {
      setForgotLoading(false);
    }
  };

  // Handler Lupa Password Tahap 2: Validasi OTP & Simpan Password Baru
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();

    if (!forgotOtp.trim()) {
      alert('Masukkan 6 digit kode OTP yang diterima di email!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Kata sandi baru minimal 6 karakter!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    // Verifikasi OTP dari sessionStorage
    const storedOtp = sessionStorage.getItem(`otp_val_${targetEmail}`);
    const storedExp = sessionStorage.getItem(`otp_exp_${targetEmail}`);

    if (!storedOtp || storedOtp !== forgotOtp.trim()) {
      alert('Kode OTP yang Anda masukkan salah!');
      return;
    }

    if (storedExp && Date.now() > parseInt(storedExp, 10)) {
      alert('Kode OTP sudah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.');
      setForgotStep(1);
      return;
    }

    setForgotLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        email: targetEmail,
        otp: forgotOtp.trim(),
        new_password: newPassword
      });

      alert(res.data.message || 'Kata sandi berhasil diperbarui! Silakan masuk menggunakan kata sandi baru.');
      
      // Bersihkan session OTP
      sessionStorage.removeItem(`otp_val_${targetEmail}`);
      sessionStorage.removeItem(`otp_exp_${targetEmail}`);

      setShowForgotModal(false);
      setForgotStep(1);
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setEmail(targetEmail);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      alert(`Gagal: ${detail}`);
    } finally {
      setForgotLoading(false);
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
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative'
    }}>
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
            padding: '6px 0'
          }}
        >
          <ArrowLeft size={17} /> Kembali ke Beranda
        </button>
      </div>

      <div style={{
        maxWidth: '1020px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1.25fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        
        {/* Kolom Kiri */}
        <div style={{
          background: 'linear-gradient(145deg, #164E43 0%, #0F352E 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 18px 30px -10px rgba(22, 78, 67, 0.35)'
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>1. Layanan UMKM Terintegrasi</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Akses berbagai fasilitas dalam satu platform</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>2. Pelatihan & Pendampingan</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Tingkatkan kemampuan manajemen dan pemasaran</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>3. Legalitas Lebih Mudah</div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>Ajukan dan pantau proses verifikasi perizinan</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '32px' }}>
            <span>Dinas KUK Provinsi Jawa Barat</span>
            <span>SI-UMKM v1.0</span>
          </div>
        </div>

        {/* Kolom Kanan */}
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
                ? 'Lengkapi informasi identitas pemilik usaha di bawah ini.'
                : 'Masukkan alamat email dan kata sandi yang telah terdaftar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    NIK <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="16 digit angka sesuai KTP"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    NAMA LENGKAP <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap sesuai KTP"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                EMAIL <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="contoh: nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                    PASSWORD <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  {!isRegister && (
                    <span
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setShowForgotModal(true);
                      }}
                      style={{ fontSize: '0.74rem', color: '#008848', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Lupa kata sandi?
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 34px 10px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    KONFIRMASI PASSWORD <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 34px 10px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  NOMOR WHATSAPP <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="08xxxxxxxxxx (10 - 13 digit)"
                    value={nomorWhatsapp}
                    onChange={(e) => setNomorWhatsapp(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

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
                boxShadow: '0 4px 12px rgba(22, 78, 67, 0.25)'
              }}
            >
              {loading ? 'Memproses...' : isRegister ? 'Lanjutkan Pendaftaran' : 'Masuk Sekarang'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: '#64748B' }}>
            {isRegister ? 'Sudah memiliki akun terdaftar?' : 'Belum memiliki akun terdaftar?'}{' '}
            <span
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: '#008848', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: '#64748B' }}>
            <span
              onClick={() => setHalaman('admin')}
              style={{ color: '#008848', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Masuk Sebagai Admin Dinas
            </span>
          </div>
        </div>
      </div>

      {/* MODAL POP-UP LUPA PASSWORD */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px 26px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                {forgotStep === 1 ? 'Pemulihan Kata Sandi' : 'Verifikasi OTP & Reset'}
              </h3>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {forgotStep === 1 
                ? 'Masukkan alamat email yang terdaftar untuk menerima kode verifikasi OTP pemulihan kata sandi.'
                : `Kode OTP 6 digit telah dikirimkan ke email ${forgotEmail}. Silakan periksa inbox atau folder spam Anda.`}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleKirimOtpLupaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    ALAMAT EMAIL TERDAFTAR <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="contoh: nama@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    backgroundColor: '#164E43',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {forgotLoading ? 'Mengirim Kode OTP...' : 'Kirim Kode Verifikasi'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    KODE VERIFIKASI OTP (6 DIGIT) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid #164E43',
                      fontSize: '1.1rem',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      fontWeight: '800',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    KATA SANDI BARU <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px 34px 10px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    KONFIRMASI KATA SANDI BARU <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      flex: 1,
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Kirim Ulang
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 2,
                      backgroundColor: '#164E43',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '11px',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {forgotLoading ? 'Memperbarui...' : 'Simpan Kata Sandi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
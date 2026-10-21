import { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import axios from 'axios';
import { 
  ArrowLeft, Lock, Mail, User, Phone, Eye, EyeOff, 
  ShieldCheck, ArrowRight, CreditCard, KeyRound, X
} from 'lucide-react';
import bgLogin from '../assets/login.jpg';

export default function Login({ onKembali, onLoginSukses, setHalaman }) {
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 900);
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

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State Modal Lupa Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Kredensial EmailJS Browser SDK
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

  const handleKirimOtpLupaPassword = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      alert('Masukkan email Anda terlebih dahulu.');
      return;
    }

    setForgotLoading(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          email: targetEmail,
          passcode: generatedOtp
        },
        EMAILJS_PUBLIC_KEY
      );

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
      width: '100vw',
      minHeight: '100vh',
      marginLeft: 'calc((100% - 100vw) / 2)',
      boxSizing: 'border-box',
      position: 'relative',
      backgroundImage: `url(${bgLogin})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'left'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 53, 46, 0.65)' }} />

      {/* Tombol Kembali ke Beranda: Polos tanpa background/kotak */}
      <button
        type="button"
        onClick={handleKembaliKeDashboard}
        style={{
          position: 'absolute',
          top: isCompact ? '18px' : '26px',
          left: isCompact ? '18px' : '32px',
          zIndex: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          color: '#FFFFFF',
          cursor: 'pointer',
          fontSize: isCompact ? '0.86rem' : '0.94rem',
          fontWeight: '600',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
          transition: 'opacity 0.2s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateX(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <ArrowLeft size={isCompact ? 17 : 19} />
        <span>Kembali ke Beranda</span>
      </button>

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1440px',
        minHeight: '100vh',
        margin: '0 auto',
        padding: isCompact ? '80px 16px 24px' : '32px 32px 24px',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: isCompact ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 500px',
        gap: isCompact ? '0' : '48px',
        alignItems: 'center'
      }}>
        <div style={{
          display: isCompact ? 'none' : 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#FFFFFF',
          textAlign: 'left',
          maxWidth: '620px'
        }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', lineHeight: 1.2, margin: '0 0 16px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Kelola Usaha Lebih Mudah. Ajukan Layanan Lebih Cepat.
          </h1>
          <p style={{ maxWidth: '560px', fontSize: '1rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.92)', margin: 0 }}>
            Akses layanan terpadu UMKM Jawa Barat untuk mengembangkan usaha, mendapatkan pendampingan, dan mengajukan berbagai fasilitasi.
          </p>
        </div>

        <div style={{ height: isCompact ? 'calc(100vh - 108px)' : 'calc(100vh - 48px - 0.5cm)', minHeight: 0, width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: 'rgba(225,240,170,0.10)', backdropFilter: 'blur(14px) brightness(1.25)', WebkitBackdropFilter: 'blur(14px) brightness(1.25)', border: '1px solid rgba(255,255,255,0.30)', borderRadius: '20px', padding: isCompact ? '24px' : '32px', boxShadow: '0 18px 50px rgba(0,0,0,0.24)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxSizing: 'border-box' }}>
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: isRegister ? 'flex-start' : 'center', padding: '2px' }}>
              <div style={{ marginBottom: isRegister ? '24px' : '16px' }}>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.2 }}>
                  {isRegister ? 'Buat Akun Anda' : 'Selamat Datang Kembali'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                  {isRegister ? 'Lengkapi data diri untuk membuat akun UMKM.' : 'Masuk untuk melanjutkan ke layanan SI-UMKM Jabar.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isRegister && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                        NIK <span style={{ color: '#FCA5A5' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <CreditCard size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" required maxLength={16} placeholder="16 digit angka sesuai KTP" value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', height: '46px', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                        NAMA LENGKAP <span style={{ color: '#FCA5A5' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" required placeholder="Nama lengkap sesuai KTP" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} style={{ width: '100%', height: '46px', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                    EMAIL <span style={{ color: '#FCA5A5' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" required placeholder="contoh: nama@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', height: '46px', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                      PASSWORD <span style={{ color: '#FCA5A5' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', height: '46px', padding: '10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0, display: 'flex' }}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {isRegister && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                        KONFIRMASI PASSWORD <span style={{ color: '#FCA5A5' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type={showConfirmPassword ? 'text' : 'password'} required placeholder="Ulangi kata sandi" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', height: '46px', padding: '10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0, display: 'flex' }}>
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '7px' }}>
                      NOMOR WHATSAPP <span style={{ color: '#FCA5A5' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={17} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" required maxLength={13} placeholder="08xxxxxxxxxx (10 - 13 digit)" value={nomorWhatsapp} onChange={(e) => setNomorWhatsapp(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', height: '46px', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                {!isRegister && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: '#164E43', width: '16px', height: '16px', margin: 0 }} />
                      Ingat saya
                    </label>
                    <span
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setShowForgotModal(true);
                      }}
                      style={{ color: '#FDE68A', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Lupa password?
                    </span>
                  </div>
                )}

                {isRegister && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
                    <ShieldCheck size={15} color="#164E43" />
                    <span style={{ marginLeft: '6px' }}>Data Anda terlindungi</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#164E43', color: '#FFFFFF', border: 'none', borderRadius: '999px', minHeight: '48px', padding: '12px 18px', fontSize: '0.95rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', boxShadow: '0 5px 14px rgba(22,78,67,0.2)' }}
                >
                  {loading ? 'Memproses...' : isRegister ? 'Lanjutkan Pendaftaran' : 'Masuk'}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#FDE68A', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#FFFFFF' }}>
            <span onClick={() => setHalaman('login-admin')} style={{ fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
              Masuk Sebagai Admin Dinas
            </span>
          </div>
        </div>
      </div>

      {/* Modal Lupa Password */}
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
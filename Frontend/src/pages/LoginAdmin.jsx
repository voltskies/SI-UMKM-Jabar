import { useEffect, useState } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { 
  ArrowLeft, ArrowRight, Mail, Lock, User, CreditCard, 
  Briefcase, Eye, EyeOff, X 
} from 'lucide-react';
import bgLogin from '../assets/diskuk.jpg';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Kredensial EmailJS Browser SDK (Port 443 HTTPS)
const EMAILJS_SERVICE_ID = 'service_vr07rh';
const EMAILJS_TEMPLATE_ID = 'template_318btwq';
const EMAILJS_PUBLIC_KEY = 'BrC6NgRExKr6v1fz7';

const inputStyle = {
  width: '100%',
  height: '46px',
  padding: '10px 42px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.55)',
  backgroundColor: 'rgba(255,255,255,0.92)',
  color: '#0F172A',
  fontSize: '0.9rem',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#FFFFFF',
  marginBottom: '7px'
};

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={17} color="#64748B" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
        {children}
      </div>
    </div>
  );
}

export default function LoginAdmin({ setHalaman, onLoginSukses }) {
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 900);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Modal Lupa Password Admin
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Input Email, 2 = Input OTP & Password Baru
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!/^\d{18}$/.test(nip.trim())) {
        alert('NIP wajib tepat 18 digit angka sesuai standar pegawai!');
        return;
      }
      if (password.length < 8) {
        alert('Kata sandi admin minimal 8 karakter!');
        return;
      }
      if (password !== confirmPassword) {
        alert('Konfirmasi kata sandi tidak cocok!');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/admin/register`, {
          nama: nama.trim(),
          nip: nip.trim(),
          jabatan: jabatan.trim(),
          email: email.trim().toLowerCase(),
          password: password
        });

        alert(res.data.message || 'Pendaftaran admin dinas berhasil! Data masuk ke database.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/admin/login`, {
          email: email.trim().toLowerCase(),
          password: password
        });

        localStorage.setItem('admin_umkm', JSON.stringify(res.data.data));
        localStorage.setItem('token_admin', 'session-token-admin-dinas');

        alert(`Login berhasil! Selamat datang, ${res.data.data.nama}`);

        if (typeof onLoginSukses === 'function') {
          onLoginSukses(res.data.data);
        } else if (typeof setHalaman === 'function') {
          setHalaman('admin');
        }
      }
    } catch (err) {
      console.error('Error Admin Auth:', err);
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message;
      alert(`Gagal: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  // Handler Lupa Password Admin Tahap 1: Kirim Kode OTP via EmailJS
  const handleKirimOtpAdmin = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      alert('Masukkan email instansi Anda terlebih dahulu.');
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

      sessionStorage.setItem(`otp_val_admin_${targetEmail}`, generatedOtp);
      sessionStorage.setItem(`otp_exp_admin_${targetEmail}`, (Date.now() + 5 * 60 * 1000).toString());

      alert(`Kode OTP pemulihan berhasil dikirim ke email ${targetEmail}! Silakan cek kotak masuk atau folder spam.`);
      setForgotStep(2);
    } catch (err) {
      console.error('Gagal kirim via EmailJS:', err);
      alert(`Gagal mengirim kode verifikasi: ${err.text || err.message || 'Periksa koneksi internet Anda.'}`);
    } finally {
      setForgotLoading(false);
    }
  };

  // Handler Lupa Password Admin Tahap 2: Validasi OTP & Update Password ke Database
  const handleResetPasswordAdmin = async (e) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();

    if (!forgotOtp.trim()) {
      alert('Masukkan 6 digit kode OTP yang diterima di email!');
      return;
    }
    if (newPassword.length < 8) {
      alert('Kata sandi baru admin minimal 8 karakter!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    const storedOtp = sessionStorage.getItem(`otp_val_admin_${targetEmail}`);
    const storedExp = sessionStorage.getItem(`otp_exp_admin_${targetEmail}`);

    if (!storedOtp || storedOtp !== forgotOtp.trim()) {
      alert('Kode OTP yang Anda masukkan salah!');
      return;
    }

    if (storedExp && Date.now() > parseInt(storedExp, 10)) {
      alert('Kode OTP sudah kedaluwarsa (lebih dari 5 menit). Silakan kirim ulang kode.');
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

      alert(res.data.message || 'Kata sandi akun admin berhasil diperbarui! Silakan masuk.');
      
      sessionStorage.removeItem(`otp_val_admin_${targetEmail}`);
      sessionStorage.removeItem(`otp_exp_admin_${targetEmail}`);

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
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1440px',
        minHeight: '100vh',
        margin: '0 auto',
        padding: isCompact ? '82px 16px 20px' : '24px',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 0,
        alignItems: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: isCompact ? '18px' : '24px',
          left: isCompact ? '16px' : '24px',
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          color: '#FFFFFF',
          textAlign: 'left'
        }}>
          <div>
            {!isCompact && (
              <button
                type="button"
                onClick={() => setHalaman('login')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', padding: 0 }}
              >
                <ArrowLeft size={17} /> Kembali ke Login Pengguna
              </button>
            )}
          </div>
          {isCompact && (
            <button
              type="button"
              onClick={() => setHalaman('login')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', padding: 0 }}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
        </div>

        <div style={{ height: isCompact ? 'calc(100vh - 108px)' : 'calc(100vh - 48px - 0.5cm)', minHeight: 0, width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: 'rgba(225,240,170,0.10)', backdropFilter: 'blur(14px) brightness(1.25)', WebkitBackdropFilter: 'blur(14px) brightness(1.25)', border: '1px solid rgba(255,255,255,0.30)', borderRadius: '20px', padding: isCompact ? '24px' : '32px', boxShadow: '0 18px 50px rgba(0,0,0,0.24)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxSizing: 'border-box' }}>
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: isRegister ? 'flex-start' : 'center', padding: '2px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.2 }}>
                  {isRegister ? 'Registrasi Admin Dinas' : 'Login Admin Dinas'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                  {isRegister ? 'Lengkapi data pegawai untuk mendaftarkan akun admin.' : 'Masuk ke panel pengelolaan Dinas KUK Jawa Barat.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isRegister && (
                  <>
                    <Field label="NAMA LENGKAP" icon={User}>
                      <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap pegawai" style={inputStyle} />
                    </Field>
                    <Field label="NIP" icon={CreditCard}>
                      <input type="text" required maxLength={18} value={nip} onChange={(e) => setNip(e.target.value.replace(/\D/g, ''))} placeholder="18 digit angka" style={inputStyle} />
                    </Field>
                    <Field label="JABATAN / BIDANG" icon={Briefcase}>
                      <input type="text" required value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Contoh: Staf Bidang Legalitas" style={inputStyle} />
                    </Field>
                  </>
                )}

                <Field label="EMAIL" icon={Mail}>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email instansi" style={inputStyle} />
                </Field>

                <Field label="PASSWORD" icon={Lock}>
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" style={{ ...inputStyle, paddingRight: '42px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>

                {/* Baris Lupa Password (Persis di Bawah Input Password Seperti Form Pengguna) */}
                {!isRegister && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '-4px' }}>
                    <span
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setShowForgotModal(true);
                      }}
                      style={{ fontSize: '0.82rem', color: '#FDE68A', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Lupa password?
                    </span>
                  </div>
                )}

                {isRegister && (
                  <>
                    <Field label="KONFIRMASI PASSWORD" icon={Lock}>
                      <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi" style={{ ...inputStyle, paddingRight: '42px' }} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </Field>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#164E43',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '999px',
                    minHeight: '48px',
                    padding: '12px 18px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 5px 14px rgba(22,78,67,0.2)'
                  }}
                >
                  {loading ? 'Menyimpan...' : isRegister ? 'Daftar' : 'Masuk'}
                  <ArrowRight size={17} />
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                {isRegister ? 'Sudah punya akun admin?' : 'Belum punya akun admin?'}{' '}
                <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#FDE68A', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#FFFFFF' }}>
            Panel SI-UMKM Jabar
          </div>
        </div>
      </div>

      {/* MODAL POP-UP LUPA PASSWORD ADMIN (Identik dengan Modal Pengguna) */}
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
                ? 'Masukkan alamat email instansi yang terdaftar untuk menerima kode verifikasi OTP pemulihan kata sandi.'
                : `Kode OTP 6 digit telah dikirimkan ke email ${forgotEmail}. Silakan periksa kotak masuk atau folder spam Anda.`}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleKirimOtpAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <form onSubmit={handleResetPasswordAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      placeholder="Minimal 8 karakter"
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
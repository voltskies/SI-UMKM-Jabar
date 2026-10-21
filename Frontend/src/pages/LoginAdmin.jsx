import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Mail, Lock, User, CreditCard, Briefcase, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import bgLogin from '../assets/diskuk.jpg';

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
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kode, setKode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!/^\d{16}$/.test(nip)) return alert('NIP harus tepat 16 digit angka!');
      if (password.length < 8) return alert('Kata sandi minimal 8 karakter!');
      if (password !== confirmPassword) return alert('Konfirmasi kata sandi tidak cocok!');

      // TODO backend: POST /admin/auth/register (backend yang cek kode registrasi)
      alert('Pendaftaran berhasil! Akun akan aktif setelah disetujui Dinas.');
      setIsRegister(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      // TODO backend: POST /admin/auth/login
      onLoginSukses({ nama: 'Administrator Dinas', email, role: 'admin' });
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
                  {isRegister ? 'Lengkapi data pegawai untuk mengajukan akun admin.' : 'Masuk ke panel pengelolaan Dinas KUK Jawa Barat.'}
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
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" style={{ ...inputStyle, paddingRight: '42px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>

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

                <button type="submit" style={{ backgroundColor: '#164E43', color: '#FFFFFF', border: 'none', borderRadius: '999px', minHeight: '48px', padding: '12px 18px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', marginTop: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 5px 14px rgba(22,78,67,0.2)' }}>
                  {isRegister ? 'Daftar' : 'Masuk'}
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
            Panel Dinas KUK Jawa Barat
          </div>
        </div>
      </div>
    </div>
  );
}

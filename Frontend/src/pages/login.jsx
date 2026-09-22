import { useState } from 'react';
import { ArrowLeft, Lock, Mail, ShieldCheck, User, Phone, CreditCard } from 'lucide-react';

export default function Login({ onKembali, onLoginSukses }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // State data form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Eksekusi Daftar ke Database MySQL via FastAPI
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

        alert('Akun berhasil dibuat! Silakan langsung login dengan email dan password.');
        setIsRegister(false);
      } else {
        // 2. Eksekusi Login
        const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.detail || 'Email atau password salah');
        }

        alert(`Login berhasil! Selamat datang, ${resData.data.nama}`);
        onLoginSukses(resData.data);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: '#F8FAFC',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '36px',
        width: '100%',
        maxWidth: isRegister ? '480px' : '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        transition: 'max-width 0.2s ease'
      }}>
        <button
          type="button"
          onClick={onKembali}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '16px',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#E8F5E9',
            color: '#164E43',
            marginBottom: '10px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
            {isRegister ? 'Daftar Akun UMKM Baru' : 'Masuk Akun UMKM'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
            {isRegister ? 'Lengkapi identitas untuk mendaftar ke database' : 'Masuk untuk mengakses layanan & pelatihan'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  NIK (16 Digit)
                </label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Contoh: 3201xxxxxxxxxxxx"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Nama Lengkap Sesuai KTP
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Nomor WhatsApp Aktif
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={nomorWhatsapp}
                    onChange={(e) => setNomorWhatsapp(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
              Alamat Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#164E43',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px'
            }}
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#64748B' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum memiliki akun terdaftar?'}{' '}
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#164E43', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
          </span>
        </div>
      </div>
    </div>
  );
}
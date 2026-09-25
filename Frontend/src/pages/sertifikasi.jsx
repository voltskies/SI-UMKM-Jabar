import { useState } from 'react';
import {
  Award, ArrowLeft, CheckCircle2, Circle, Clock,
  FileText, XCircle, Mail, ShieldCheck
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

// Daftar dokumen legalitas yang dibutuhkan
const syaratLegalitas = [
  { id: 'ktp', nama: 'Foto KTP Pemilik Usaha', keterangan: 'Sesuai identitas pemilik/penanggung jawab usaha' },
  { id: 'npwp', nama: 'NPWP', keterangan: 'NPWP pribadi atau usaha' },
  { id: 'nib', nama: 'NIB (Nomor Induk Berusaha)', keterangan: 'Diperoleh melalui OSS (Online Single Submission)' },
  { id: 'foto_usaha', nama: 'Foto Tempat/Produk Usaha', keterangan: 'Menunjukkan usaha benar-benar berjalan' },
  { id: 'surat_izin', nama: 'Surat Izin Usaha (jika ada)', keterangan: 'Opsional, misal SIUP/izin dari kelurahan' }
];

const generateNomorRegistrasi = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const huruf = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `LGL-2026-${huruf}${rand}`;
};

const statusAwalDummy = {
  status: 'belum',
  nomorRegistrasi: '',
  catatanAdmin: ''
};

export default function Sertifikasi({ onKembali, setHalaman, user }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'form'
  const [dataLegalitas, setDataLegalitas] = useState(statusAwalDummy);

  const [dataPemohon, setDataPemohon] = useState({
    nik: user?.nik || '',
    nama_lengkap: user?.nama || user?.nama_lengkap || '',
    email: user?.email || '',
    nomor_whatsapp: user?.nomor_whatsapp || '',
    nama_usaha: ''
  });
  const [fileTerupload, setFileTerupload] = useState({});
  const [errorForm, setErrorForm] = useState('');
  const [nomorSukses, setNomorSukses] = useState(null);

  // Navigasi kembali ke Dashboard beranda
  const handleKembaliKeDashboard = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('dashboard');
    } else if (typeof onKembali === 'function') {
      onKembali();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bukaForm = () => {
    setFileTerupload({});
    setErrorForm('');
    setView('form');
  };

  const handleInputPemohon = (e) => {
    const { name, value } = e.target;
    setDataPemohon((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadDokumen = (idDokumen, file) => {
    setFileTerupload((prev) => ({ ...prev, [idDokumen]: file }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setErrorForm('');

    if (dataPemohon.nik.length !== 16 || !/^\d+$/.test(dataPemohon.nik)) {
      setErrorForm('NIK harus berupa 16 digit angka.');
      return;
    }

    const wajibBelumLengkap = syaratLegalitas
      .filter((d) => d.id !== 'surat_izin')
      .filter((d) => !fileTerupload[d.id]);

    if (wajibBelumLengkap.length > 0) {
      setErrorForm(`Dokumen belum lengkap: ${wajibBelumLengkap.map((d) => d.nama).join(', ')}`);
      return;
    }

    const nomorBaru = generateNomorRegistrasi();
    setDataLegalitas({ status: 'diajukan', nomorRegistrasi: nomorBaru, catatanAdmin: '' });
    setNomorSukses(nomorBaru);
  };

  const tutupModalSukses = () => {
    setNomorSukses(null);
    setDataPemohon({ nik: '', nama_lengkap: '', email: '', nomor_whatsapp: '', nama_usaha: '' });
    setView('dashboard');
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header / Navbar */}
      <Navbar setHalaman={setHalaman} user={user} />

      {/* 2. Main Content */}
      <main style={{ flex: 1, width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 20px 60px 20px', boxSizing: 'border-box' }}>
        
        {/* Tombol Navigasi Kembali */}
        <button
          type="button"
          onClick={view === 'form' ? () => setView('dashboard') : handleKembaliKeDashboard}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#164E43',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#008848')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#164E43')}
        >
          <ArrowLeft size={18} /> {view === 'form' ? 'Kembali ke Panel Legalitas' : 'Kembali ke Halaman Utama'}
        </button>

        {/* ============== TAMPILAN 1: STATUS DASHBOARD ============== */}
        {view === 'dashboard' ? (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Pendaftaran Legalitas Usaha
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
                Legalitas UMKM
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                Lengkapi dokumen legalitas usaha Anda agar terdaftar resmi di SI-UMKM Jabar.
              </p>
            </div>

            {/* STATUS: BELUM PERNAH DAFTAR */}
            {dataLegalitas.status === 'belum' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '16px', padding: '36px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'inline-flex', padding: '14px', backgroundColor: '#F1F5F9', borderRadius: '50%', color: '#94A3B8', marginBottom: '14px' }}>
                  <FileText size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                  Usaha Anda belum terdaftar
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748B' }}>
                  Lengkapi dokumen legalitas untuk mendapatkan status terverifikasi di SI-UMKM Jabar.
                </p>
                <button
                  type="button"
                  onClick={bukaForm}
                  style={{
                    backgroundColor: '#164E43',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 78, 67, 0.25)'
                  }}
                >
                  Daftarkan Legalitas Usaha
                </button>
              </div>
            )}

            {/* STATUS: SUDAH DIAJUKAN / DIPROSES */}
            {(dataLegalitas.status === 'diajukan' || dataLegalitas.status === 'diverifikasi') && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                padding: '28px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Pengajuan Legalitas Usaha</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>No. Registrasi: {dataLegalitas.nomorRegistrasi}</span>
                  </div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Menunggu Verifikasi Admin
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {['Diajukan', 'Diperiksa Admin', 'Keputusan'].map((label, idx) => {
                    const tahapSekarang = dataLegalitas.status === 'diajukan' ? 0 : 1;
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                          {idx < tahapSekarang ? (
                            <CheckCircle2 size={22} color="#16A34A" />
                          ) : idx === tahapSekarang ? (
                            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid #164E43', backgroundColor: '#FFF' }} />
                          ) : (
                            <Circle size={22} color="#CBD5E1" />
                          )}
                          <span style={{ fontSize: '0.72rem', marginTop: '6px', color: idx <= tahapSekarang ? '#164E43' : '#94A3B8', fontWeight: idx === tahapSekarang ? '700' : '500', textAlign: 'center' }}>
                            {label}
                          </span>
                        </div>
                        {idx < 2 && (
                          <div style={{ flex: 1, height: '2px', backgroundColor: idx < tahapSekarang ? '#16A34A' : '#E2E8F0', marginBottom: '18px' }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '20px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px', fontSize: '0.8rem', color: '#64748B' }}>
                  Dokumen Anda sedang diperiksa oleh admin Dinas KUK. Anda akan mendapat notifikasi setelah ada keputusan verifikasi.
                </div>
              </div>
            )}

            {/* STATUS: DISETUJUI */}
            {dataLegalitas.status === 'disetujui' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #BBF7D0',
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', padding: '14px', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A', marginBottom: '14px' }}>
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                  Usaha Anda telah terverifikasi
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  No. Registrasi: {dataLegalitas.nomorRegistrasi} — Status legalitas aktif di SI-UMKM Jabar.
                </p>
              </div>
            )}

            {/* STATUS: DITOLAK */}
            {dataLegalitas.status === 'ditolak' && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #FECACA', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <XCircle size={22} color="#DC2626" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Pengajuan Ditolak</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>
                  No. Registrasi: {dataLegalitas.nomorRegistrasi}
                </p>
                {dataLegalitas.catatanAdmin && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#991B1B', margin: '12px 0' }}>
                    Catatan admin: {dataLegalitas.catatanAdmin}
                  </div>
                )}
                <button
                  type="button"
                  onClick={bukaForm}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#164E43',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Ajukan Ulang
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ============== TAMPILAN 2: FORM PENDAFTARAN ============== */
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '36px' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
                <Award size={14} /> Pendaftaran Legalitas Usaha
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>
                Form Pendaftaran Legalitas UMKM
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                Data ini akan diverifikasi oleh admin sebelum usaha Anda dinyatakan terdaftar resmi.
              </p>
            </div>

            {errorForm && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                color: '#991B1B',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '0.85rem'
              }}>
                <XCircle size={18} />
                <span>{errorForm}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              {/* Data Pemohon & Usaha */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#164E43', marginBottom: '14px' }}>1. Informasi Pemohon & Usaha</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>NIK *</label>
                    <input type="text" name="nik" maxLength={16} required value={dataPemohon.nik} onChange={handleInputPemohon} placeholder="16 digit sesuai KTP" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nama Lengkap *</label>
                    <input type="text" name="nama_lengkap" required value={dataPemohon.nama_lengkap} onChange={handleInputPemohon} placeholder="Nama sesuai KTP" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email *</label>
                    <input type="email" name="email" required value={dataPemohon.email} onChange={handleInputPemohon} placeholder="nama@email.com" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nomor WhatsApp *</label>
                    <input type="text" name="nomor_whatsapp" required value={dataPemohon.nomor_whatsapp} onChange={handleInputPemohon} placeholder="08xxxxxxxxxx" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nama Usaha *</label>
                  <input type="text" name="nama_usaha" required value={dataPemohon.nama_usaha} onChange={handleInputPemohon} placeholder="Nama usaha/UMKM Anda" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Upload Dokumen Legalitas */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#164E43', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={17} /> 2. Berkas Persyaratan (PDF / JPG / PNG)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {syaratLegalitas.map((dok) => (
                    <div key={dok.id} style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        {dok.nama} {dok.id !== 'surat_izin' && '*'}
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleUploadDokumen(dok.id, e.target.files[0])}
                        style={{ fontSize: '0.78rem' }}
                      />
                      {fileTerupload[dok.id] && (
                        <div style={{ fontSize: '0.76rem', color: '#16A34A', marginTop: '6px' }}>
                          ✓ {fileTerupload[dok.id].name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#164E43',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 78, 67, 0.25)'
                }}
              >
                Kirim Pengajuan Legalitas
              </button>
            </form>
          </div>
        )}

      </main>

      {/* 3. Footer Bawah */}
      <Footer setHalaman={setHalaman} />

      {/* Modal Notifikasi Sukses */}
      {nomorSukses && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'inline-flex', padding: '14px', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A', marginBottom: '16px' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
              Pengajuan Berhasil Dikirim!
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px' }}>
              Dokumen Anda akan diverifikasi oleh admin Dinas KUK Jawa Barat. Simpan nomor registrasi ini:
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px dashed #164E43',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1.1rem',
              fontWeight: '800',
              color: '#164E43',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
              {nomorSukses}
            </div>
            <button
              type="button"
              onClick={tutupModalSukses}
              style={{
                width: '100%',
                backgroundColor: '#164E43',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Lihat Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Award, ArrowLeft, CheckCircle2, Circle, Clock,
  FileText, XCircle, Mail, ShieldCheck, Upload,
  User, Building2, FileCheck
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function Sertifikasi({ onKembali, setHalaman, user }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'form'
  const [dataLegalitas, setDataLegalitas] = useState({
    status: 'belum',
    nomorRegistrasi: '',
    catatanAdmin: ''
  });

  // Ambil user dari props atau localStorage
  const activeUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem('user_umkm') || '{}');
    } catch {
      return {};
    }
  })();

  // Deteksi nomor WA dari berbagai kemungkinan nama variabel
  const userWa = 
    activeUser?.nomor_whatsapp || 
    activeUser?.nomor_wa || 
    activeUser?.no_wa || 
    activeUser?.whatsapp || 
    activeUser?.phone || 
    '';

  const [dataPemohon, setDataPemohon] = useState({
    nik: activeUser?.nik || '',
    nama_lengkap: activeUser?.nama || activeUser?.nama_lengkap || '',
    email: activeUser?.email || '',
    nomor_whatsapp: userWa,
    nama_usaha: '',
    nama_produk: '',
    jenis_sertifikasi: 'Sertifikasi Halal',
    deskripsi_produk: '',
    nib: ''
  });

  // Sinkronisasi otomatis saat state user terisi/berubah
  useEffect(() => {
    const waTerbaru = 
      user?.nomor_whatsapp || 
      user?.nomor_wa || 
      user?.no_wa || 
      user?.whatsapp || 
      user?.phone || 
      '';

    if (user) {
      setDataPemohon((prev) => ({
        ...prev,
        nik: prev.nik || user.nik || '',
        nama_lengkap: prev.nama_lengkap || user.nama || user.nama_lengkap || '',
        email: prev.email || user.email || '',
        nomor_whatsapp: prev.nomor_whatsapp || waTerbaru
      }));
    }
  }, [user]);

  const [files, setFiles] = useState({
    file_ktp: null,
    file_foto_produk: null,
    file_dokumen_pendukung: null
  });

  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [nomorSukses, setNomorSukses] = useState(null);

  // Menggunakan URL environment atau fallback ke domain backend HTTPS Vercel
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/:8000$/, '').replace(/^http:\/\//i, 'https://')
    : 'https://si-umkm-jabar.vercel.app';

  const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7 MB

  // Style input konsisten agar selalu berlatar putih dan teks kontras gelap
  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '0.84rem',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    boxSizing: 'border-box',
    textAlign: 'left'
  };

  const handleKembaliKeDashboard = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('dashboard');
    } else if (typeof onKembali === 'function') {
      onKembali();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bukaForm = () => {
    setFiles({ file_ktp: null, file_foto_produk: null, file_dokumen_pendukung: null });
    setErrorForm('');
    setView('form');
  };

  const handleInputPemohon = (e) => {
    const { name, value } = e.target;
    setDataPemohon((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (!selectedFiles || !selectedFiles[0]) return;

    const file = selectedFiles[0];

    // Validasi batas ukuran file (7 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorForm(`Ukuran file "${file.name}" melebihi batas maksimal 7 MB.`);
      e.target.value = '';
      setFiles((prev) => ({ ...prev, [name]: null }));
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // Validasi tipe file
    if (name === 'file_ktp' || name === 'file_foto_produk') {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
        const label = name === 'file_ktp' ? 'Foto KTP' : 'Foto Tempat / Kemasan Produk';
        setErrorForm(`${label} harus berformat PDF, JPG, atau PNG.`);
        e.target.value = '';
        setFiles((prev) => ({ ...prev, [name]: null }));
        return;
      }
    } else if (name === 'file_dokumen_pendukung') {
      // Dokumen pendukung wajib PDF
      if (file.type !== 'application/pdf' && fileExt !== 'pdf') {
        setErrorForm('Dokumen Pendukung / NIB / Surat Keterangan Usaha wajib berformat PDF.');
        e.target.value = '';
        setFiles((prev) => ({ ...prev, [name]: null }));
        return;
      }
    }

    setErrorForm('');
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorForm('');

    const cleanNik = dataPemohon.nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      setErrorForm('NIK harus berupa 16 digit angka.');
      return;
    }

    if (!files.file_ktp) {
      setErrorForm('Foto KTP wajib diunggah.');
      return;
    }

    if (!files.file_foto_produk) {
      setErrorForm('Foto Tempat atau Produk Usaha wajib diunggah.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nik', cleanNik);
      formData.append('nama_lengkap', dataPemohon.nama_lengkap.trim());
      formData.append('email', dataPemohon.email.trim());
      formData.append('nomor_whatsapp', dataPemohon.nomor_whatsapp.trim());
      formData.append('nama_usaha', dataPemohon.nama_usaha.trim());
      formData.append('nama_produk', dataPemohon.nama_produk.trim());
      formData.append('jenis_sertifikasi', dataPemohon.jenis_sertifikasi);
      formData.append('deskripsi_produk', dataPemohon.deskripsi_produk.trim());
      
      if (dataPemohon.nib.trim()) {
        formData.append('nib', dataPemohon.nib.trim());
      }

      formData.append('file_ktp', files.file_ktp);
      formData.append('file_foto_produk', files.file_foto_produk);
      if (files.file_dokumen_pendukung) {
        formData.append('file_dokumen_pendukung', files.file_dokumen_pendukung);
      }

      const targetUrl = `${API_BASE_URL}/api/v1/layanan/pengajuan-sertifikasi`;

      const res = await axios.post(targetUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.status === 'success' || res.status === 201) {
        const noReg = res.data.nomor_registrasi;
        setDataLegalitas({ 
          status: 'diajukan', 
          nomorRegistrasi: noReg, 
          catatanAdmin: '' 
        });
        setNomorSukses(noReg);
        window.dispatchEvent(new Event('update_notifikasi'));
      }
    } catch (err) {
      console.error("Detail error pendaftaran sertifikasi:", err);
      const errRes = err.response?.data;
      let pesan = "Terjadi kesalahan saat memproses pendaftaran sertifikasi.";

      if (errRes) {
        if (typeof errRes.detail === "string") {
          pesan = errRes.detail;
        } else if (Array.isArray(errRes.detail)) {
          pesan = errRes.detail.map((d) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
        } else if (errRes.message) {
          pesan = errRes.message;
        } else {
          pesan = JSON.stringify(errRes);
        }
      } else if (err.message) {
        pesan = err.message;
      }

      setErrorForm(pesan);
    } finally {
      setLoading(false);
    }
  };

  const tutupModalSukses = () => {
    setNomorSukses(null);
    setDataPemohon({
      nik: '',
      nama_lengkap: '',
      email: '',
      nomor_whatsapp: '',
      nama_usaha: '',
      nama_produk: '',
      jenis_sertifikasi: 'Sertifikasi Halal',
      deskripsi_produk: '',
      nib: ''
    });
    setView('dashboard');
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header Navbar */}
      <Navbar setHalaman={setHalaman} user={user} mode="solid-sticky" />

      {/* 2. Konten Utama (Spacing Rapi & Selaras) */}
      <main style={{ flex: 1, width: '100%', maxWidth: '860px', margin: '0 auto', padding: '32px 20px 60px 20px', boxSizing: 'border-box', textAlign: 'left' }}>
        
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
            color: '#255456',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1B4143')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#255456')}
        >
          <ArrowLeft size={18} /> {view === 'form' ? 'Kembali ke Panel Legalitas' : 'Kembali ke Halaman Utama'}
        </button>

        {/* VIEW 1: STATUS DASHBOARD */}
        {view === 'dashboard' ? (
          <div>
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf1f1', color: '#255456', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Pendaftaran Legalitas & Standardisasi Usaha
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(21px, 3vw, 26px)', fontWeight: '800', color: '#0F172A', textAlign: 'left', lineHeight: 1.3 }}>
                Legalitas & Sertifikasi UMKM
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', textAlign: 'left', lineHeight: '1.5' }}>
                Pantau permohonan sertifikasi Halal, BPOM, NIB, dan izin edar resmi dari Dinas KUK Jawa Barat.
              </p>
            </div>

            {/* STATUS: BELUM DAFTAR */}
            {dataLegalitas.status === 'belum' && (
              <div className="responsive-form-card" style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px dashed #CBD5E1', 
                borderRadius: '16px', 
                padding: '36px 24px', 
                textAlign: 'center', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                maxWidth: '640px',
                margin: '0 auto'
              }}>
                <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#F1F5F9', borderRadius: '50%', color: '#94A3B8', marginBottom: '12px' }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
                  Belum Ada Pengajuan Sertifikasi Aktif
                </h3>
                <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Lengkapi dokumen persyaratan untuk memperoleh nomor registrasi dan status verifikasi resmi dari dinas.
                </p>
                <button
                  type="button"
                  onClick={bukaForm}
                  style={{
                    backgroundColor: '#255456',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px 24px',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 84, 86, 0.2)'
                  }}
                >
                  Daftarkan Sertifikasi Baru
                </button>
              </div>
            )}

            {/* STATUS: DIAJUKAN */}
            {dataLegalitas.status === 'diajukan' && (
              <div className="responsive-form-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Pengajuan Legalitas Berhasil</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>No. Registrasi: {dataLegalitas.nomorRegistrasi}</span>
                  </div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '700' }}>
                    Menunggu Verifikasi Admin
                  </span>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px', fontSize: '0.82rem', color: '#64748B' }}>
                  Dokumen persyaratan Anda telah terunggah ke Storage dan masuk ke antrean audit legalitas.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: FORM PENDAFTARAN */
          <div className="responsive-form-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '32px', textAlign: 'left' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '18px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eaf1f1', color: '#255456', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
                <FileCheck size={14} /> Standarisasi Mutu & Legalitas Usaha
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(21px, 3vw, 26px)', fontWeight: '800', color: '#0F172A', textAlign: 'left' }}>
                Form Permohonan Sertifikasi UMKM
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', textAlign: 'left' }}>
                Lengkapi identitas penanggung jawab dan rincian produk yang akan diajukan standardisasi.
              </p>
            </div>

            {errorForm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '11px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.84rem', textAlign: 'left' }}>
                <XCircle size={18} />
                <span>{errorForm}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} style={{ textAlign: 'left' }}>
              {/* Bagian 1: Data Pemohon */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#255456', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <User size={17} /> 1. Informasi Pemilik Usaha
                </h3>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>NIK *</label>
                    <input 
                      type="text" 
                      name="nik" 
                      maxLength={16} 
                      required 
                      value={dataPemohon.nik} 
                      onChange={handleInputPemohon} 
                      placeholder="16 digit sesuai KTP" 
                      style={inputStyle} 
                    />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Nama Lengkap *</label>
                    <input 
                      type="text" 
                      name="nama_lengkap" 
                      required 
                      value={dataPemohon.nama_lengkap} 
                      onChange={handleInputPemohon} 
                      placeholder="Nama sesuai KTP" 
                      style={inputStyle} 
                    />
                  </div>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Email Aktif *</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={dataPemohon.email} 
                      onChange={handleInputPemohon} 
                      placeholder="nama@gmail.com" 
                      style={inputStyle} 
                    />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Nomor WhatsApp *</label>
                    <input 
                      type="text" 
                      name="nomor_whatsapp" 
                      required 
                      value={dataPemohon.nomor_whatsapp} 
                      onChange={handleInputPemohon} 
                      placeholder="08xxxxxxxxxx" 
                      style={inputStyle} 
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Data Usaha & Produk */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#255456', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <Building2 size={17} /> 2. Rincian Usaha & Produk
                </h3>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Nama Usaha / Merek Dagang *</label>
                    <input 
                      type="text" 
                      name="nama_usaha" 
                      required 
                      value={dataPemohon.nama_usaha} 
                      onChange={handleInputPemohon} 
                      placeholder="Misal: Keripik Singkong Barokah" 
                      style={inputStyle} 
                    />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Nama Produk yang Diajukan *</label>
                    <input 
                      type="text" 
                      name="nama_produk" 
                      required 
                      value={dataPemohon.nama_produk} 
                      onChange={handleInputPemohon} 
                      placeholder="Misal: Keripik Pedas Rasa Jeruk" 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Jenis Sertifikasi yang Diajukan *</label>
                    <select 
                      name="jenis_sertifikasi" 
                      value={dataPemohon.jenis_sertifikasi} 
                      onChange={handleInputPemohon} 
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="Sertifikasi Halal">Sertifikasi Halal (BPJPH)</option>
                      <option value="Izin Edar BPOM">Izin Edar BPOM</option>
                      <option value="SPP-PIRT">Sertifikat Produksi Pangan Industri Rumah Tangga (P-IRT)</option>
                      <option value="Hak Kekayaan Intelektual (HKI)">Hak Kekayaan Intelektual (Merek Dagang / HKI)</option>
                      <option value="Standardisasi SNI">Standardisasi Mutu SNI</option>
                    </select>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Nomor Induk Berusaha (NIB)</label>
                    <input 
                      type="text" 
                      name="nib" 
                      value={dataPemohon.nib} 
                      onChange={handleInputPemohon} 
                      placeholder="Opsional / jika ada" 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>Deskripsi Singkat Komposisi / Produk *</label>
                  <textarea 
                    name="deskripsi_produk" 
                    required 
                    rows={3} 
                    value={dataPemohon.deskripsi_produk} 
                    onChange={handleInputPemohon} 
                    placeholder="Uraikan komposisi bahan baku, proses pengolahan, atau izin edar yang telah dimiliki sebelumnya..." 
                    style={{ ...inputStyle, resize: 'vertical' }} 
                  />
                </div>
              </div>

              {/* Bagian 3: Unggah Berkas */}
              <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#255456', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <Upload size={17} /> 3. Berkas Persyaratan (Maks. 7 MB)
                </h3>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left' }}>
                  
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Foto KTP Pemohon * <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(PDF/JPG/PNG, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_ktp" 
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" 
                      required 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_ktp && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>✓ {files.file_ktp.name}</div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Foto Tempat / Kemasan Produk * <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(PDF/JPG/PNG, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_foto_produk" 
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" 
                      required 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_foto_produk && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>✓ {files.file_foto_produk.name}</div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', gridColumn: 'span 2', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Dokumen Pendukung / NIB / Surat Keterangan Usaha (Opsional) <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(Wajib PDF, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_dokumen_pendukung" 
                      accept=".pdf,application/pdf" 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_dokumen_pendukung && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>✓ {files.file_dokumen_pendukung.name}</div>
                    )}
                  </div>

                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#94A3B8' : '#255456',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 84, 86, 0.2)'
                }}
              >
                {loading ? 'Mengunggah Berkas...' : 'Kirim Permohonan Sertifikasi'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* 3. Footer Bawah */}
      <Footer setHalaman={setHalaman} />

      {/* MODAL SUKSES */}
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
            padding: '32px 24px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#eaf1f1', borderRadius: '50%', color: '#255456', marginBottom: '14px' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
              Pengajuan Berhasil Dikirim!
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 18px' }}>
              Berkas Anda telah tersimpan di cloud storage dan tercatat di database Dinas KUK Jawa Barat. Simpan nomor registrasi ini:
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px dashed #255456',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '1.05rem',
              fontWeight: '800',
              color: '#255456',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}>
              {nomorSukses}
            </div>
            <button
              type="button"
              onClick={tutupModalSukses}
              style={{
                width: '100%',
                backgroundColor: '#255456',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
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
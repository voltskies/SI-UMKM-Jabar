import { useState } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, CheckCircle2, AlertCircle, ArrowLeft, 
  Building2, User, Phone, Mail, DollarSign, HelpCircle, FileCheck
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function Bantuan({ onKembali, setHalaman, user }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'form'
  const [dataBantuan, setDataBantuan] = useState({
    status: 'belum',
    nomorPengajuan: '',
    catatanAdmin: ''
  });

  const [formData, setFormData] = useState({
    nik: user?.nik || '',
    nama_lengkap: user?.nama || user?.nama_lengkap || '',
    email: user?.email || '',
    nomor_whatsapp: user?.nomor_whatsapp || '',
    nama_usaha: '',
    kategori_usaha: 'Kuliner',
    jumlah_dana: '',
    tujuan_penggunaan: '',
    nib: ''
  });

  const [files, setFiles] = useState({
    file_ktp: null,
    file_kk: null,
    file_nib: null,
    file_proposal: null
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suksesNomor, setSuksesNomor] = useState(null);

  // Basis URL backend yang aman untuk production HTTPS Vercel
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/:8000$/, '').replace(/^http:\/\//i, 'https://')
    : 'https://si-umkm-jabar.vercel.app';

  const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7 MB dalam satuan bytes

  // Style input konsisten agar selalu putih dan tidak terkena dark mode browser
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
    setFiles({ file_ktp: null, file_kk: null, file_nib: null, file_proposal: null });
    setErrorMsg('');
    setView('form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (!selectedFiles || !selectedFiles[0]) return;

    const file = selectedFiles[0];

    // Validasi batas ukuran file (7 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`Ukuran file "${file.name}" melebihi batas maksimal 7 MB.`);
      e.target.value = '';
      setFiles((prev) => ({ ...prev, [name]: null }));
      return;
    }

    // Validasi tipe format file
    if (name === 'file_ktp') {
      const validKtpTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!validKtpTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
        setErrorMsg('Foto KTP harus berformat PDF, JPG, atau PNG.');
        e.target.value = '';
        setFiles((prev) => ({ ...prev, [name]: null }));
        return;
      }
    } else {
      // file_kk, file_nib, file_proposal wajib PDF
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (file.type !== 'application/pdf' && fileExt !== 'pdf') {
        const labelMap = {
          file_kk: 'Kartu Keluarga (KK)',
          file_nib: 'Dokumen NIB',
          file_proposal: 'Proposal Usaha'
        };
        setErrorMsg(`${labelMap[name] || 'Dokumen'} wajib berformat PDF.`);
        e.target.value = '';
        setFiles((prev) => ({ ...prev, [name]: null }));
        return;
      }
    }

    setErrorMsg('');
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi NIK wajib 16 digit angka
    const cleanNik = formData.nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      setErrorMsg('NIK harus berupa tepat 16 digit angka.');
      return;
    }

    // Validasi file KTP wajib diunggah
    if (!files.file_ktp) {
      setErrorMsg('Berkas Foto KTP wajib diunggah.');
      return;
    }

    try {
      setLoading(true);

      // Bersihkan karakter non-digit dari nominal bantuan
      const nominalClean = Number(String(formData.jumlah_dana).replace(/\D/g, '')) || 0;
      if (nominalClean <= 0) {
        setErrorMsg('Nominal bantuan yang diajukan harus berupa angka yang valid.');
        setLoading(false);
        return;
      }

      const dataPayload = new FormData();
      dataPayload.append('nik', cleanNik);
      dataPayload.append('nama_lengkap', formData.nama_lengkap.trim());
      dataPayload.append('email', formData.email.trim());
      dataPayload.append('nomor_whatsapp', formData.nomor_whatsapp.trim());
      dataPayload.append('nama_usaha', formData.nama_usaha.trim());
      
      // Mengirim kategori/sektor usaha agar cocok dengan backend
      dataPayload.append('kategori_usaha', formData.kategori_usaha);
      dataPayload.append('sektor_usaha', formData.kategori_usaha);

      // Mengirim jumlah nominal dana
      dataPayload.append('jumlah_dana', nominalClean);
      dataPayload.append('nominal_bantuan', nominalClean);

      dataPayload.append('tujuan_penggunaan', formData.tujuan_penggunaan.trim());
      
      if (formData.nib && formData.nib.trim()) {
        dataPayload.append('nib', formData.nib.trim());
      }

      // Lampirkan berkas ke payload form
      dataPayload.append('file_ktp', files.file_ktp);
      if (files.file_kk) {
        dataPayload.append('file_kk', files.file_kk);
      }
      if (files.file_nib) {
        dataPayload.append('file_nib', files.file_nib);
      }
      if (files.file_proposal) {
        dataPayload.append('file_proposal', files.file_proposal);
      }

      const targetUrl = `${API_BASE_URL}/api/v1/layanan/pengajuan-bantuan`;
      const res = await axios.post(targetUrl, dataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.status === 'success' || res.status === 200 || res.status === 201) {
        const noPengajuan = res.data.nomor_pengajuan || `BNT-${Date.now()}`;
        setDataBantuan({
          status: 'diajukan',
          nomorPengajuan: noPengajuan,
          catatanAdmin: ''
        });
        setSuksesNomor(noPengajuan);

        // Trigger sinkronisasi notifikasi navbar
        window.dispatchEvent(new Event('update_notifikasi'));
      }
    } catch (err) {
      console.error("Gagal mengirim bantuan:", err);
      const errRes = err.response?.data;
      let pesan = 'Gagal memproses permohonan bantuan.';

      if (errRes) {
        if (typeof errRes.detail === 'string') {
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

      setErrorMsg(pesan);
    } finally {
      setLoading(false);
    }
  };

  const tutupModalSukses = () => {
    setSuksesNomor(null);
    setFormData({
      nik: '',
      nama_lengkap: '',
      email: '',
      nomor_whatsapp: '',
      nama_usaha: '',
      kategori_usaha: 'Kuliner',
      jumlah_dana: '',
      tujuan_penggunaan: '',
      nib: ''
    });
    setView('dashboard');
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header / Navbar */}
      <Navbar setHalaman={setHalaman} user={user} mode="solid-sticky" />

      {/* 2. Konten Utama */}
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
          <ArrowLeft size={18} /> {view === 'form' ? 'Kembali ke Panel Bantuan' : 'Kembali ke Halaman Utama'}
        </button>

        {/* VIEW 1: STATUS DASHBOARD */}
        {view === 'dashboard' ? (
          <div>
            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
                <FileCheck size={14} /> Fasilitasi Pemulihan & Modal UMKM
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(21px, 3vw, 26px)', fontWeight: '800', color: '#0F172A', textAlign: 'left', lineHeight: 1.3 }}>
                Permohonan Bantuan Usaha
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', textAlign: 'left', lineHeight: '1.5' }}>
                Pantau permohonan hibah modal usaha dan fasilitasi pemulihan bisnis resmi dari Dinas KUK Provinsi Jawa Barat.
              </p>
            </div>

            {/* STATUS: BELUM DAFTAR */}
            {dataBantuan.status === 'belum' && (
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
                  Belum Ada Pengajuan Bantuan Aktif
                </h3>
                <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Lengkapi profil usaha dan dokumen persyaratan untuk mengajukan bantuan modal serta memperoleh nomor verifikasi resmi dari dinas.
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
                  Ajukan Permohonan Bantuan
                </button>
              </div>
            )}

            {/* STATUS: DIAJUKAN */}
            {dataBantuan.status === 'diajukan' && (
              <div className="responsive-form-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Permohonan Berhasil Dikirim</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>No. Registrasi: {dataBantuan.nomorPengajuan}</span>
                  </div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '700' }}>
                    Menunggu Verifikasi Admin
                  </span>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px', fontSize: '0.82rem', color: '#64748B' }}>
                  Dokumen persyaratan bantuan usaha Anda telah terunggah ke Storage dan masuk ke sistem antrean audit.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: FORM PENDAFTARAN */
          <div className="responsive-form-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '32px', textAlign: 'left' }}>
            {/* Header Card Form */}
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '18px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
                <FileCheck size={14} /> Fasilitasi Pemulihan & Modal UMKM
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(21px, 3vw, 26px)', fontWeight: '800', color: '#0F172A', textAlign: 'left' }}>
                Form Permohonan Bantuan Usaha
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', textAlign: 'left' }}>
                Isi data diri dan informasi profil usaha Anda secara lengkap untuk verifikasi kelayakan bantuan modal dari Dinas KUK Provinsi Jawa Barat.
              </p>
            </div>

            {/* Notifikasi Error */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                color: '#991B1B',
                padding: '11px 14px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.84rem',
                textAlign: 'left'
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              {/* Bagian 1: Data Pemohon */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#255456', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <User size={17} /> 1. Informasi Pemohon
                </h3>
                
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nomor Induk Kependudukan (NIK) *
                    </label>
                    <input
                      type="text"
                      name="nik"
                      maxLength={16}
                      required
                      value={formData.nik}
                      onChange={handleInputChange}
                      placeholder="16 digit sesuai KTP Jabar"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nama Lengkap Pemohon *
                    </label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      required
                      value={formData.nama_lengkap}
                      onChange={handleInputChange}
                      placeholder="Nama sesuai KTP"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Email Aktif *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contoh@gmail.com"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="nomor_whatsapp"
                      required
                      value={formData.nomor_whatsapp}
                      onChange={handleInputChange}
                      placeholder="08xxxxxxxxxx"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Data Usaha & Kebutuhan Bantuan */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#255456', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <Building2 size={17} /> 2. Rincian Usaha & Kebutuhan Dana
                </h3>

                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nama Usaha / Merek Dagang *
                    </label>
                    <input
                      type="text"
                      name="nama_usaha"
                      required
                      value={formData.nama_usaha}
                      onChange={handleInputChange}
                      placeholder="Misal: Keripik Singkong Barokah"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Sektor Kategori Usaha *
                    </label>
                    <select
                      name="kategori_usaha"
                      value={formData.kategori_usaha}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="Kuliner">Kuliner & Makanan</option>
                      <option value="Fashion">Fashion & Tekstil</option>
                      <option value="Kerajinan">Kerajinan & Kriya</option>
                      <option value="Agribisnis">Agribisnis & Pertanian</option>
                      <option value="Jasa">Jasa & Servis</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nomor Induk Berusaha (NIB)
                    </label>
                    <input
                      type="text"
                      name="nib"
                      value={formData.nib}
                      onChange={handleInputChange}
                      placeholder="Opsional / jika ada"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                      Nominal Bantuan yang Diajukan (Rp) *
                    </label>
                    <input
                      type="text"
                      name="jumlah_dana"
                      required
                      value={formData.jumlah_dana}
                      onChange={handleInputChange}
                      placeholder="Contoh: 10.000.000"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '5px', textAlign: 'left' }}>
                    Rencana Tujuan Penggunaan Dana *
                  </label>
                  <textarea
                    name="tujuan_penggunaan"
                    required
                    rows={3}
                    value={formData.tujuan_penggunaan}
                    onChange={handleInputChange}
                    placeholder="Jelaskan kebutuhan pengadaan alat produksi, modal bahan baku, atau perluasan jangkauan pasar..."
                    style={{ 
                      ...inputStyle, 
                      resize: 'vertical' 
                    }}
                  />
                </div>
              </div>

              {/* Bagian 3: Dokumen Pendukung */}
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
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>
                        ✓ {files.file_ktp.name}
                      </div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Kartu Keluarga (KK) <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(Wajib PDF, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_kk" 
                      accept=".pdf,application/pdf" 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_kk && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>
                        ✓ {files.file_kk.name}
                      </div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Dokumen NIB (Jika ada) <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(Wajib PDF, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_nib" 
                      accept=".pdf,application/pdf" 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_nib && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>
                        ✓ {files.file_nib.name}
                      </div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '12px', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px', textAlign: 'left' }}>
                      Proposal Usaha / Rencana Anggaran <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>(Wajib PDF, Maks. 7MB)</span>
                    </label>
                    <input 
                      type="file" 
                      name="file_proposal" 
                      accept=".pdf,application/pdf" 
                      onChange={handleFileChange} 
                      style={{ fontSize: '0.76rem', width: '100%', color: '#334155' }} 
                    />
                    {files.file_proposal && (
                      <div style={{ fontSize: '0.74rem', color: '#255456', marginTop: '6px', textAlign: 'left' }}>
                        ✓ {files.file_proposal.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Submit */}
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
                  transition: '0.2s',
                  boxShadow: '0 4px 12px rgba(37, 84, 86, 0.2)'
                }}
              >
                {loading ? 'Mengunggah Berkas ke Supabase...' : 'Kirim Permohonan Bantuan Modal'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* 3. Footer Bawah */}
      <Footer setHalaman={setHalaman} />

      {/* Modal Sukses */}
      {suksesNomor && (
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
              Berkas Anda telah tersimpan di cloud storage dan masuk ke sistem antrean verifikasi Dinas KUK Jawa Barat. Harap simpan nomor registrasi pengajuan ini:
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
              {suksesNomor}
            </div>

            <button
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
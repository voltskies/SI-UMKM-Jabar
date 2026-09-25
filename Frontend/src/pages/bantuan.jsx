import { useState } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, CheckCircle2, AlertCircle, ArrowLeft, 
  Building2, User, Phone, Mail, DollarSign, HelpCircle, FileCheck
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

export default function Bantuan({ onKembali, setHalaman, user }) {
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

  const handleKembaliKeBeranda = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('dashboard');
    } else if (typeof onKembali === 'function') {
      onKembali();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi dasar
    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      setErrorMsg('NIK harus berupa 16 digit angka.');
      return;
    }

    if (!files.file_ktp) {
      setErrorMsg('File KTP wajib diunggah.');
      return;
    }

    try {
      setLoading(true);
      const dataPayload = new FormData();
      dataPayload.append('nik', formData.nik);
      dataPayload.append('nama_lengkap', formData.nama_lengkap);
      dataPayload.append('email', formData.email);
      dataPayload.append('nomor_whatsapp', formData.nomor_whatsapp);
      dataPayload.append('nama_usaha', formData.nama_usaha);
      dataPayload.append('kategori_usaha', formData.kategori_usaha);
      dataPayload.append('jumlah_dana', formData.jumlah_dana);
      dataPayload.append('tujuan_penggunaan', formData.tujuan_penggunaan);
      if (formData.nib) dataPayload.append('nib', formData.nib);

      // File Lampiran
      dataPayload.append('file_ktp', files.file_ktp);
      if (files.file_kk) dataPayload.append('file_kk', files.file_kk);
      if (files.file_nib) dataPayload.append('file_nib', files.file_nib);
      if (files.file_proposal) dataPayload.append('file_proposal', files.file_proposal);

      const res = await axios.post('http://127.0.0.1:8000/api/v1/layanan/pengajuan-bantuan', dataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.status === 'success') {
        setSuksesNomor(res.data.nomor_pengajuan);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Terjadi kesalahan saat mengirim pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. Header / Navbar */}
      <Navbar setHalaman={setHalaman} user={user} />

      {/* 2. Konten Utama Form Bantuan */}
      <main style={{ flex: 1, width: '100%', maxWidth: '900px', margin: '0 auto', padding: '40px 20px 60px 20px', boxSizing: 'border-box' }}>
        
        {/* Tombol Navigasi Kembali */}
        <button
          type="button"
          onClick={handleKembaliKeBeranda}
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
            marginBottom: '24px',
            padding: 0,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#008848')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#164E43')}
        >
          <ArrowLeft size={18} /> Kembali ke Halaman Utama
        </button>

        {/* Card Form */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          padding: '36px'
        }}>
          {/* Header Card */}
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
              <FileCheck size={14} /> Fasilitasi Pemulihan & Modal UMKM
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
              Form Permohonan Bantuan Usaha
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5' }}>
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
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Bagian 1: Data Pemohon */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#164E43', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> 1. Informasi Pemohon
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
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
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    required
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    placeholder="Nama sesuai KTP"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Email Aktif *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contoh@gmail.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="nomor_whatsapp"
                    required
                    value={formData.nomor_whatsapp}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Usaha & Kebutuhan Bantuan */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#164E43', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} /> 2. Rincian Usaha & Kebutuhan Dana
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nama Usaha / Merek Dagang *
                  </label>
                  <input
                    type="text"
                    name="nama_usaha"
                    required
                    value={formData.nama_usaha}
                    onChange={handleInputChange}
                    placeholder="Misal: Keripik Singkong Barokah"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Sektor Kategori Usaha *
                  </label>
                  <select
                    name="kategori_usaha"
                    value={formData.kategori_usaha}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', boxSizing: 'border-box' }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nomor Induk Berusaha (NIB)
                  </label>
                  <input
                    type="text"
                    name="nib"
                    value={formData.nib}
                    onChange={handleInputChange}
                    placeholder="Opsional / jika ada"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nominal Bantuan yang Diajukan (Rp) *
                  </label>
                  <input
                    type="text"
                    name="jumlah_dana"
                    required
                    value={formData.jumlah_dana}
                    onChange={handleInputChange}
                    placeholder="Contoh: 10.000.000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Rencana Tujuan Penggunaan Dana *
                </label>
                <textarea
                  name="tujuan_penggunaan"
                  required
                  rows={3}
                  value={formData.tujuan_penggunaan}
                  onChange={handleInputChange}
                  placeholder="Jelaskan kebutuhan pengadaan alat produksi, modal bahan baku, atau perluasan jangkauan pasar..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Bagian 3: Dokumen Pendukung */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#164E43', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} /> 3. Berkas Persyaratan (PDF / JPG / PNG)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Foto KTP Pemohon *
                  </label>
                  <input type="file" name="file_ktp" accept="image/*,application/pdf" required onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                </div>

                <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Kartu Keluarga (KK)
                  </label>
                  <input type="file" name="file_kk" accept="image/*,application/pdf" onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                </div>

                <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Dokumen NIB (Jika ada)
                  </label>
                  <input type="file" name="file_nib" accept="application/pdf,image/*" onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                </div>

                <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Proposal Usaha / Rencana Anggaran
                  </label>
                  <input type="file" name="file_proposal" accept="application/pdf" onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                </div>
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#94A3B8' : '#164E43',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: '0.2s',
                boxShadow: '0 4px 14px rgba(22, 78, 67, 0.25)'
              }}
            >
              {loading ? 'Mengunggah Berkas Permohonan...' : 'Kirim Permohonan Bantuan Modal'}
            </button>
          </form>
        </div>
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
            padding: '36px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'inline-flex', padding: '14px', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A', marginBottom: '16px' }}>
              <CheckCircle2 size={44} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
              Pengajuan Berhasil Dikirim!
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px' }}>
              Berkas Anda telah masuk ke sistem antrean verifikasi Dinas KUK Jawa Barat. Harap simpan nomor registrasi pengajuan ini:
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px dashed #008848',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1.15rem',
              fontWeight: '800',
              color: '#008848',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
              {suksesNomor}
            </div>

            <button
              onClick={() => {
                setSuksesNomor(null);
                handleKembaliKeBeranda();
              }}
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
              Selesai & Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
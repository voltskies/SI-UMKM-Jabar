import { useState } from 'react';
import axios from 'axios';
import {
  Award, ArrowLeft, CheckCircle2, Circle, Clock,
  FileText, XCircle, Mail, ShieldCheck, Upload
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

  const [dataPemohon, setDataPemohon] = useState({
    nik: user?.nik || '',
    nama_lengkap: user?.nama || user?.nama_lengkap || '',
    email: user?.email || '',
    nomor_whatsapp: user?.nomor_whatsapp || '',
    nama_usaha: '',
    nama_produk: '',
    jenis_sertifikasi: 'Sertifikasi Halal',
    deskripsi_produk: '',
    nib: ''
  });

  const [files, setFiles] = useState({
    file_ktp: null,
    file_foto_produk: null,
    file_dokumen_pendukung: null
  });

  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [nomorSukses, setNomorSukses] = useState(null);

  const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

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
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
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
      // Susun ke FormData sesuai parameter FastAPI Form(...) dan File(...)
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

      // Kirim langsung ke backend FastAPI
      const res = await axios.post(`${API_BASE_URL}/api/v1/layanan/pengajuan-sertifikasi`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        const noReg = res.data.nomor_registrasi;
        setDataLegalitas({ 
          status: 'diajukan', 
          nomorRegistrasi: noReg, 
          catatanAdmin: '' 
        });
        setNomorSukses(noReg);
      }
    } catch (err) {
      console.error('Gagal mengajukan sertifikasi:', err);
      const detailMsg = err.response?.data?.detail;
      const pesan = Array.isArray(detailMsg)
        ? detailMsg.map((d) => d.msg).join(', ')
        : detailMsg || 'Terjadi kesalahan saat memproses pendaftaran sertifikasi.';
      setErrorForm(typeof pesan === 'string' ? pesan : JSON.stringify(pesan));
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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <Navbar setHalaman={setHalaman} user={user} />

      <main style={{ flex: 1, width: '100%', maxWidth: '840px', margin: '0 auto', padding: '40px 20px 60px 20px', boxSizing: 'border-box' }}>
        
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
            padding: 0
          }}
        >
          <ArrowLeft size={18} /> {view === 'form' ? 'Kembali ke Panel Legalitas' : 'Kembali ke Halaman Utama'}
        </button>

        {/* VIEW 1: STATUS DASHBOARD */}
        {view === 'dashboard' ? (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Pendaftaran Legalitas & Standardisasi Usaha
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: '800', color: '#0F172A' }}>
                Legalitas & Sertifikasi UMKM
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                Pantau permohonan sertifikasi Halal, BPOM, NIB, dan izin edar resmi dari Dinas KUK Jawa Barat.
              </p>
            </div>

            {/* STATUS: BELUM DAFTAR */}
            {dataLegalitas.status === 'belum' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '16px', padding: '36px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'inline-flex', padding: '14px', backgroundColor: '#F1F5F9', borderRadius: '50%', color: '#94A3B8', marginBottom: '14px' }}>
                  <FileText size={32} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                  Belum Ada Pengajuan Sertifikasi Aktif
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#64748B' }}>
                  Lengkapi dokumen persyaratan untuk memperoleh nomor registrasi dan status verifikasi resmi dari dinas.
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
                  Daftarkan Sertifikasi Baru
                </button>
              </div>
            )}

            {/* STATUS: DIAJUKAN */}
            {dataLegalitas.status === 'diajukan' && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'gap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Pengajuan Legalitas Berhasil</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>No. Registrasi: {dataLegalitas.nomorRegistrasi}</span>
                  </div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Menunggu Verifikasi Admin
                  </span>
                </div>

                <div style={{ marginTop: '20px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px', fontSize: '0.82rem', color: '#64748B' }}>
                  Dokumen persyaratan Anda telah terunggah ke Cloud Storage Supabase dan masuk ke antrean audit legalitas Dinas KUK Jawa Barat.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: FORM PENDAFTARAN */
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', padding: '36px' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '8px' }}>
                <Award size={14} /> Fasilitasi Sertifikasi & Jaminan Mutu Produk
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>
                Form Permohonan Sertifikasi UMKM
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                Lengkapi identitas penanggung jawab dan rincian produk yang akan diajukan standardisasi.
              </p>
            </div>

            {errorForm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
                <XCircle size={18} />
                <span>{errorForm}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              {/* Bagian 1: Data Pemohon */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#164E43', marginBottom: '14px' }}>
                  1. Informasi Pemilik Usaha
                </h3>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Aktif *</label>
                    <input type="email" name="email" required value={dataPemohon.email} onChange={handleInputPemohon} placeholder="nama@gmail.com" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nomor WhatsApp *</label>
                    <input type="text" name="nomor_whatsapp" required value={dataPemohon.nomor_whatsapp} onChange={handleInputPemohon} placeholder="08xxxxxxxxxx" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Data Usaha & Produk */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#164E43', marginBottom: '14px' }}>
                  2. Rincian Usaha & Produk
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nama Usaha / Merek Dagang *</label>
                    <input type="text" name="nama_usaha" required value={dataPemohon.nama_usaha} onChange={handleInputPemohon} placeholder="Misal: Keripik Singkong Barokah" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nama Produk yang Diajukan *</label>
                    <input type="text" name="nama_produk" required value={dataPemohon.nama_produk} onChange={handleInputPemohon} placeholder="Misal: Keripik Pedas Rasa Jeruk" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Jenis Sertifikasi yang Diajukan *</label>
                    <select name="jenis_sertifikasi" value={dataPemohon.jenis_sertifikasi} onChange={handleInputPemohon} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFF', boxSizing: 'border-box' }}>
                      <option value="Sertifikasi Halal">Sertifikasi Halal (BPJPH)</option>
                      <option value="Izin Edar BPOM">Izin Edar BPOM</option>
                      <option value="SPP-PIRT">Sertifikat Produksi Pangan Industri Rumah Tangga (P-IRT)</option>
                      <option value="Hak Kekayaan Intelektual (HKI)">Hak Kekayaan Intelektual (Merek Dagang / HKI)</option>
                      <option value="Standardisasi SNI">Standardisasi Mutu SNI</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nomor Induk Berusaha (NIB)</label>
                    <input type="text" name="nib" value={dataPemohon.nib} onChange={handleInputPemohon} placeholder="Opsional / jika ada" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Deskripsi Singkat Komposisi / Produk *</label>
                  <textarea name="deskripsi_produk" required rows={3} value={dataPemohon.deskripsi_produk} onChange={handleInputPemohon} placeholder="Uraikan komposisi bahan baku, proses pengolahan, atau izin edar yang telah dimiliki sebelumnya..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Bagian 3: Unggah Berkas */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#164E43', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={17} /> 3. Berkas Persyaratan (PDF / JPG / PNG)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Foto KTP Pemohon *
                    </label>
                    <input type="file" name="file_ktp" accept="image/jpeg,image/png,application/pdf" required onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                    {files.file_ktp && (
                      <div style={{ fontSize: '0.76rem', color: '#16A34A', marginTop: '6px' }}>✓ {files.file_ktp.name}</div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Foto Tempat / Kemasan Produk *
                    </label>
                    <input type="file" name="file_foto_produk" accept="image/jpeg,image/png,application/pdf" required onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                    {files.file_foto_produk && (
                      <div style={{ fontSize: '0.76rem', color: '#16A34A', marginTop: '6px' }}>✓ {files.file_foto_produk.name}</div>
                    )}
                  </div>

                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '14px', backgroundColor: '#F8FAFC', gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Dokumen Pendukung / NIB / Surat Keterangan Usaha (Opsional)
                    </label>
                    <input type="file" name="file_dokumen_pendukung" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} style={{ fontSize: '0.78rem' }} />
                    {files.file_dokumen_pendukung && (
                      <div style={{ fontSize: '0.76rem', color: '#16A34A', marginTop: '6px' }}>✓ {files.file_dokumen_pendukung.name}</div>
                    )}
                  </div>

                </div>
              </div>

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
                  boxShadow: '0 4px 14px rgba(22, 78, 67, 0.25)'
                }}
              >
                {loading ? 'Mengunggah Berkas ke Supabase Storage...' : 'Kirim Permohonan Sertifikasi'}
              </button>
            </form>
          </div>
        )}

      </main>

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
              Berkas Anda telah tersimpan di cloud storage dan tercatat di database Dinas KUK Jawa Barat. Simpan nomor registrasi ini:
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
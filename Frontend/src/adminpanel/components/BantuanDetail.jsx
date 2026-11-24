import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header, Card, Badge, Btn, Row, C, grid } from './common';

const envUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost'))
  ? envUrl.replace(/\/+$/, '').replace(/^http:\/\//i, 'https://')
  : 'https://si-umkm-jabar.vercel.app';

export default function BantuanDetail({ item, onKembali, onUbah }) {
  const [catatan, setCatatan] = useState(item.catatan_admin || '');
  const [err, setErr] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTabletOrMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const putuskan = (status) => {
    if (status !== 'Disetujui' && !catatan.trim()) {
      return setErr('Isi catatan untuk pemohon terlebih dahulu.');
    }
    setErr('');
    onUbah(status, catatan.trim());
  };

  // Buka dokumen fisik di tab baru
  const bukaDokumen = (pathUrl) => {
    if (!pathUrl) {
      alert('Dokumen tidak dilampirkan oleh pemohon.');
      return;
    }
    const fullUrl = pathUrl.startsWith('http') ? pathUrl : `${API_BASE_URL}${pathUrl}`;
    window.open(fullUrl, '_blank');
  };

  const daftarBerkas = [
    { label: 'Foto KTP Pemohon', path: item.file_ktp },
    { label: 'Kartu Keluarga (KK)', path: item.file_kk },
    { label: 'Dokumen NIB', path: item.file_nib },
    { label: 'Proposal Usaha / Anggaran', path: item.file_proposal }
  ];

  const berkasTerunggah = daftarBerkas.filter((b) => Boolean(b.path));

  return (
    <>
      <Btn
        onClick={onKembali}
        style={{
          marginBottom: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}
      >
        <ArrowLeft size={14} /> Kembali ke daftar
      </Btn>

      <Header
        crumbs={['Bantuan Modal', 'Detail']}
        title="Detail Pengajuan Bantuan"
        desc={`${item.nomor_pengajuan} · diajukan ${item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}`}
        right={<Badge>{item.status}</Badge>}
      />

      <div
        className="admin-content-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isTabletOrMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 320px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          <Card title="Data Identitas & Usaha" style={isMobile ? { padding: 16 } : {}}>
            <Row label="User ID Akun" value={`#${item.user_id}`} />
            <Row label="Nama Usaha" value={item.nama_usaha} />
            <Row label="Sektor Kategori" value={item.kategori_usaha} />
            <Row label="Nomor NIB" value={item.nib || 'Tidak dilampirkan'} />
          </Card>

          <Card title="Data Pengajuan Bantuan" style={isMobile ? { padding: 16 } : {}}>
            <div style={grid(isMobile ? 140 : 180)}>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}>
                <div style={{ color: C.mute, fontSize: '0.75rem' }}>Skema Fasilitasi</div>
                <b>Fasilitasi Modal UMKM Jabar</b>
              </div>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}>
                <div style={{ color: C.mute, fontSize: '0.75rem' }}>Jumlah Dana Diajukan</div>
                <b style={{ fontSize: '1.15rem', color: '#255456' }}>
                  {item.jumlah_dana ? `Rp ${Number(String(item.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')}` : '-'}
                </b>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '0.85rem', color: C.ink, lineHeight: 1.6, wordBreak: 'break-word' }}>
                <b>Rencana Penggunaan:</b> {item.tujuan_penggunaan || 'Tidak ada deskripsi'}
              </p>
            </div>
          </Card>

          <Card
            title="Berkas Persyaratan yang Diunggah"
            right={<span style={{ fontSize: '0.75rem', color: C.mute }}>{berkasTerunggah.length} berkas terlampir</span>}
            style={isMobile ? { padding: 16 } : {}}
          >
            {berkasTerunggah.length === 0 ? (
              <div style={{ color: C.mute, fontSize: '0.85rem', padding: '10px 0' }}>Tidak ada berkas yang diunggah.</div>
            ) : (
              berkasTerunggah.map((b) => (
                <div
                  key={b.label}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 10,
                    padding: '12px 0',
                    borderBottom: `1px solid ${C.bg}`,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.ink }}>{b.label}</div>
                    <div
                      style={{
                        color: C.mute,
                        fontSize: '0.72rem',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        marginTop: 2,
                      }}
                    >
                      {b.path}
                    </div>
                  </div>
                  <Btn
                    onClick={() => bukaDokumen(b.path)}
                    style={{
                      padding: '8px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      flexShrink: 0,
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    <ExternalLink size={13} /> Buka Berkas
                  </Btn>
                </div>
              ))
            )}
          </Card>
        </div>

        <Card
          title="Tindakan Verifikasi Admin"
          style={{
            position: isTabletOrMobile ? 'static' : 'sticky',
            top: 16,
            padding: isMobile ? 16 : 20,
          }}
        >
          <label style={{ fontSize: '0.75rem', color: C.mute, fontWeight: 600 }}>Catatan Review Internal Dinas</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={5}
            placeholder="Tuliskan catatan verifikasi atau alasan keputusan..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              margin: '6px 0 10px',
              padding: 10,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              resize: 'vertical',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              colorScheme: 'light',
            }}
          />
          {err && <div style={{ color: '#B91C1C', fontSize: '0.78rem', marginBottom: 8 }}>{err}</div>}
          <div style={{ display: 'grid', gap: 8 }}>
            <Btn dark style={{ width: '100%', textAlign: 'center' }} onClick={() => putuskan('Disetujui')}>
              Setujui Pengajuan
            </Btn>
            <Btn style={{ width: '100%', textAlign: 'center' }} onClick={() => putuskan('Diproses')}>
              Tandai Sedang Diproses
            </Btn>
            <Btn style={{ width: '100%', textAlign: 'center' }} onClick={() => putuskan('Perlu Perbaikan')}>
              Minta Perbaikan Berkas
            </Btn>
            <Btn danger style={{ width: '100%', textAlign: 'center' }} onClick={() => putuskan('Ditolak')}>
              Tolak Pengajuan
            </Btn>
          </div>
        </Card>
      </div>
    </>
  );
}
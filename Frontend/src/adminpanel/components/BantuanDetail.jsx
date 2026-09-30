import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header, Card, Badge, Btn, Row, C, grid } from './common';

export default function BantuanDetail({ item, onKembali, onUbah }) {
  const [catatan, setCatatan] = useState(item.catatan_admin || '');
  const [err, setErr] = useState('');

  const putuskan = (status) => {
    if (status !== 'Disetujui' && !catatan.trim()) {
      return setErr('Isi catatan untuk pemohon terlebih dahulu.');
    }
    setErr('');
    onUbah(status, catatan.trim());
  };

  const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

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
      <Btn onClick={onKembali} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={14} /> Kembali ke daftar
      </Btn>
      <Header
        crumbs={['Bantuan Modal', 'Detail']}
        title="Detail Pengajuan Bantuan"
        desc={`${item.nomor_pengajuan} · diajukan ${item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}`}
        right={<Badge>{item.status}</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Data Identitas & Usaha">
            <Row label="User ID Akun" value={`#${item.user_id}`} />
            <Row label="Nama Usaha" value={item.nama_usaha} />
            <Row label="Sektor Kategori" value={item.kategori_usaha} />
            <Row label="Nomor NIB" value={item.nib || 'Tidak dilampirkan'} />
          </Card>

          <Card title="Data Pengajuan Bantuan">
            <div style={grid(180)}>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}>
                <div style={{ color: C.mute, fontSize: '0.75rem' }}>Skema Fasilitasi</div>
                <b>Fasilitasi Modal UMKM Jabar</b>
              </div>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}>
                <div style={{ color: C.mute, fontSize: '0.75rem' }}>Jumlah Dana Diajukan</div>
                <b style={{ fontSize: '1.2rem', color: '#164E43' }}>
                  {item.jumlah_dana ? `Rp ${Number(String(item.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')}` : '-'}
                </b>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: '0.85rem', color: C.ink, lineHeight: 1.6 }}>
                <b>Rencana Penggunaan:</b> {item.tujuan_penggunaan || 'Tidak ada deskripsi'}
              </p>
            </div>
          </Card>

          <Card title="Berkas Persyaratan yang Diunggah" right={<span style={{ fontSize: '0.75rem', color: C.mute }}>{berkasTerunggah.length} berkas terlampir</span>}>
            {berkasTerunggah.length === 0 ? (
              <div style={{ color: C.mute, fontSize: '0.85rem', padding: '10px 0' }}>Tidak ada berkas yang diunggah.</div>
            ) : (
              berkasTerunggah.map((b) => (
                <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.bg}` }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.label}</div>
                    <div style={{ color: C.mute, fontSize: '0.72rem' }}>{b.path}</div>
                  </div>
                  <Btn onClick={() => bukaDokumen(b.path)} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ExternalLink size={13} /> Buka Berkas
                  </Btn>
                </div>
              ))
            )}
          </Card>
        </div>

        <Card title="Tindakan Verifikasi Admin" style={{ position: 'sticky', top: 16 }}>
          <label style={{ fontSize: '0.75rem', color: C.mute }}>Catatan Review Internal Dinas</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={5}
            placeholder="Tuliskan catatan verifikasi atau alasan keputusan..."
            style={{ width: '100%', boxSizing: 'border-box', margin: '6px 0', padding: 10, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }}
          />
          {err && <div style={{ color: '#B91C1C', fontSize: '0.78rem', marginBottom: 8 }}>{err}</div>}
          <div style={{ display: 'grid', gap: 8 }}>
            <Btn dark onClick={() => putuskan('Disetujui')}>Setujui Pengajuan</Btn>
            <Btn onClick={() => putuskan('Diproses')}>Tandai Sedang Diproses</Btn>
            <Btn onClick={() => putuskan('Perlu Perbaikan')}>Minta Perbaikan Berkas</Btn>
            <Btn danger onClick={() => putuskan('Ditolak')}>Tolak Pengajuan</Btn>
          </div>
        </Card>
      </div>
    </>
  );
}
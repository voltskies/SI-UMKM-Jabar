import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header, Card, Badge, Btn, Row, C, rp, grid } from './common';

export default function BantuanDetail({ item, onKembali, onUbah }) {
  const [catatan, setCatatan] = useState(item.catatan || '');
  const [err, setErr] = useState('');

  const putuskan = (status) => {
    if (status !== 'Disetujui' && !catatan.trim()) return setErr('Isi catatan untuk pemohon terlebih dulu.');
    setErr('');
    onUbah(status, catatan.trim());
  };

  return (
    <>
      <Btn onClick={onKembali} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Kembali ke daftar</Btn>
      <Header crumbs={['Bantuan Modal', 'Detail']} title="Detail Pengajuan Bantuan" desc={`${item.id} · diajukan ${item.tanggal}`} right={<Badge>{item.status}</Badge>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Data Pemohon">
            <Row label="Nama lengkap" value={item.pemohon} /><Row label="NIK" value={item.nik} />
            <Row label="Email" value={item.email} /><Row label="WhatsApp" value={item.wa} /><Row label="Alamat" value={item.alamat} />
          </Card>
          <Card title="Data UMKM">
            <Row label="Nama usaha" value={item.usaha} /><Row label="Kategori" value={item.kategori} />
          </Card>
          <Card title="Data Pengajuan Bantuan">
            <div style={grid(180)}>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}><div style={{ color: C.mute, fontSize: '0.75rem' }}>Skema bantuan</div><b>{item.program}</b></div>
              <div style={{ background: C.soft, borderRadius: 10, padding: 14 }}><div style={{ color: C.mute, fontSize: '0.75rem' }}>Jumlah dana</div><b style={{ fontSize: '1.2rem' }}>{rp(item.dana)}</b></div>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.ink }}><b>Tujuan penggunaan:</b> {item.tujuan}</p>
            <div style={{ height: 8, borderRadius: 99, background: C.line, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '60%', background: C.dark }} /><div style={{ width: '40%', background: '#008848' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: C.mute, marginTop: 6 }}><span>60% Alat produksi</span><span>40% Bahan baku</span></div>
          </Card>
          <Card title="Dokumen Persyaratan" right={<span style={{ fontSize: '0.75rem', color: C.mute }}>{item.dokumen.length} berkas terlampir</span>}>
            {item.dokumen.map(([nama, info]) => (
              <div key={nama} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.bg}` }}>
                <div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{nama}</div><div style={{ color: C.mute, fontSize: '0.72rem' }}>{info}</div></div>
                <Btn style={{ padding: '5px 12px' }}>Lihat Dokumen</Btn>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Tindakan Admin" style={{ position: 'sticky', top: 16 }}>
          <label style={{ fontSize: '0.75rem', color: C.mute }}>Catatan review internal</label>
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={5} placeholder="Tuliskan catatan atau alasan keputusan"
            style={{ width: '100%', boxSizing: 'border-box', margin: '6px 0', padding: 10, border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: 'inherit', fontSize: '0.85rem', resize: 'vertical' }} />
          {err && <div style={{ color: '#B91C1C', fontSize: '0.78rem', marginBottom: 8 }}>{err}</div>}
          <div style={{ display: 'grid', gap: 8 }}>
            <Btn dark onClick={() => putuskan('Disetujui')}>Setujui Pengajuan</Btn>
            <Btn onClick={() => putuskan('Perlu Perbaikan')}>Minta Perbaikan</Btn>
            <Btn danger onClick={() => putuskan('Ditolak')}>Tolak Pengajuan</Btn>
          </div>
        </Card>
      </div>
    </>
  );
}
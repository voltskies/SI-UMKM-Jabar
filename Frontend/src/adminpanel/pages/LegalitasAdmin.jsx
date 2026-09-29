import { useState, useEffect } from 'react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C, grid } from '../components/common';
import { legalitas as awal, distribusi } from '../data/mockData';

const LANGKAH = ['Pengajuan berkas selesai', 'Verifikasi pendamping lapangan', 'Sidang & penetapan', 'Penerbitan sertifikat'];
const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Selesai'];

export default function LegalitasAdmin({ selectedId }) {
  const [data, setData] = useState(awal);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');
  const [aktifId, setAktifId] = useState(selectedId || awal[0].id);
  useEffect(() => { if (selectedId) setAktifId(selectedId); }, [selectedId]);

  const n = (s) => (s === 'Semua' ? data.length : data.filter((d) => d.status === s).length);
  const rows = data.filter((d) => (filter === 'Semua' || d.status === filter) && `${d.id} ${d.usaha} ${d.pemilik}`.toLowerCase().includes(q.toLowerCase()));
  const aktif = data.find((d) => d.id === aktifId);
  const majuTahap = () => setData((p) => p.map((d) => (d.id === aktifId && d.tahap < 4 ? { ...d, tahap: d.tahap + 1, status: d.tahap + 1 === 4 ? 'Selesai' : 'Diproses' } : d)));

  return (
    <>
      <Header crumbs={['Portal Layanan', 'Layanan', 'Legalitas']} title="Pengajuan Legalitas" desc="Kelola dan verifikasi permohonan legalitas usaha (NIB, Halal, PIRT, HAKI) dari pelaku UMKM." />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Daftar Berkas Permohonan Masuk">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
              <SearchBox value={q} onChange={setQ} placeholder="Cari nomor, pemilik, atau usaha" />
            </div>
            <DataTable rows={rows} activeId={aktifId} onRow={(r) => setAktifId(r.id)} cols={[
              { h: 'No. Pengajuan', r: (r) => <b>{r.id}</b> },
              { h: 'Pemohon & UMKM', r: (r) => <><div style={{ fontWeight: 600 }}>{r.pemilik}</div><div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.usaha}</div></> },
              { h: 'Jenis', r: (r) => r.jenis },
              { h: 'Tanggal', r: (r) => r.tanggal },
              { h: 'Status', r: (r) => <Badge>{r.status}</Badge> },
            ]} />
          </Card>
          <Card title="Distribusi Jenis Legalitas Aktif">
            <div style={grid(120)}>
              {distribusi.map(([k, v]) => (
                <div key={k} style={{ background: C.soft, borderRadius: 10, padding: 14 }}>
                  <div style={{ color: C.mute, fontSize: '0.75rem' }}>{k}</div><b style={{ fontSize: '1.3rem', color: C.ink }}>{v}</b> <span style={{ color: C.mute }}>Berkas</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {aktif && (
          <Card style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 16 }}>
            <div style={{ background: '#164E43', color: '#fff', padding: 20 }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Detail permohonan</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0' }}>{aktif.id}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{aktif.jenis} · {aktif.usaha}</div>
            </div>
            <div style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 12px' }}>Alur Tracking Permohonan <span style={{ color: C.mute, fontWeight: 500, fontSize: '0.75rem' }}>Tahap {aktif.tahap} dari 4</span></h4>
              {LANGKAH.map((l, i) => (
                <div key={l} style={{ display: 'flex', gap: 10, marginBottom: 12, opacity: i < aktif.tahap ? 1 : 0.45 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: i < aktif.tahap ? C.dark : C.line, color: '#fff', fontSize: '0.65rem', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{i < aktif.tahap ? '✓' : ''}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: i === aktif.tahap - 1 ? 700 : 500 }}>{l}</span>
                </div>
              ))}
              <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                <Btn dark onClick={majuTahap} disabled={aktif.tahap >= 4}>Update Status Alur Permohonan</Btn>
                <Btn>Kirim Catatan</Btn>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
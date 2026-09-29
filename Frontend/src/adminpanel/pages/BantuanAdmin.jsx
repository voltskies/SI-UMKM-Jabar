import { useState } from 'react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C, rp } from '../components/common';
import BantuanDetail from '../components/Bantuandetail';
import { bantuan as awal } from '../data/mockData';

const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Perlu Perbaikan', 'Disetujui', 'Ditolak'];

export default function BantuanAdmin({ selectedId, go }) {
  const [data, setData] = useState(awal);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');
  const item = data.find((d) => d.id === selectedId);

  if (item) {
    return <BantuanDetail item={item} onKembali={() => go('bantuan')}
      onUbah={(status, catatan) => setData((p) => p.map((d) => (d.id === item.id ? { ...d, status, catatan } : d)))} />;
  }

  const n = (s) => (s === 'Semua' ? data.length : data.filter((d) => d.status === s).length);
  const rows = data.filter((d) => (filter === 'Semua' || d.status === filter) &&
    `${d.id} ${d.usaha} ${d.pemohon}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <Header crumbs={['Portal Layanan', 'Layanan', 'Bantuan Modal']} title="Pengajuan Bantuan Modal" desc="Kelola dan verifikasi permohonan bantuan modal usaha UMKM." />
      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
          <SearchBox value={q} onChange={setQ} placeholder="Cari nomor, pemohon, atau usaha" />
        </div>
        <DataTable rows={rows} onRow={(r) => go('bantuan', r.id)} cols={[
          { h: 'No. Pengajuan', r: (r) => <b style={{ color: C.ink }}>{r.id}</b> },
          { h: 'Pemohon & UMKM', r: (r) => <><div style={{ fontWeight: 600, color: C.ink }}>{r.pemohon}</div><div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.usaha}</div></> },
          { h: 'Dana diajukan', r: (r) => rp(r.dana) },
          { h: 'Tanggal', r: (r) => r.tanggal },
          { h: 'Status', r: (r) => <Badge>{r.status}</Badge> },
          { h: '', r: () => <Btn style={{ padding: '5px 12px' }}>Periksa</Btn> },
        ]} />
      </Card>
    </>
  );
}
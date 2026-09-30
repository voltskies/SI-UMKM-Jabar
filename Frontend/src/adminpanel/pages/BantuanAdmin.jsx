import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C, rp } from '../components/common';
import BantuanDetail from '../components/BantuanDetail';

const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Perlu Perbaikan', 'Disetujui', 'Ditolak'];
const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

export default function BantuanAdmin({ selectedId, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');

  // 1. Ambil data asli dari endpoint FastAPI
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/pengajuan`);
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat pengajuan bantuan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const item = data.find((d) => d.id === selectedId || d.nomor_pengajuan === selectedId);

  if (item) {
    return (
      <BantuanDetail
        item={item}
        onKembali={() => {
          loadData();
          go('bantuan');
        }}
        onUbah={async (status, catatan) => {
          try {
            await axios.patch(`${API_BASE_URL}/api/v1/admin/pengajuan/${item.id}`, {
              status: status,
              catatan_admin: catatan
            });
            await loadData();
            go('bantuan');
          } catch (err) {
            alert('Gagal memperbarui status pengajuan: ' + (err.response?.data?.detail || err.message));
          }
        }}
      />
    );
  }

  const n = (s) => (s === 'Semua' ? data.length : data.filter((d) => d.status === s).length);
  const rows = data.filter((d) => {
    const cocokFilter = filter === 'Semua' || d.status === filter;
    const term = `${d.nomor_pengajuan || ''} ${d.nama_usaha || ''} ${d.user_id || ''}`.toLowerCase();
    return cocokFilter && term.includes(q.toLowerCase());
  });

  return (
    <>
      <Header
        crumbs={['Portal Layanan', 'Layanan', 'Bantuan Modal']}
        title="Pengajuan Bantuan Modal"
        desc="Kelola dan verifikasi permohonan bantuan modal usaha UMKM yang tersimpan di database."
      />
      <Card>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
          <SearchBox value={q} onChange={setQ} placeholder="Cari nomor pengajuan atau nama usaha" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.mute }}>Memuat data pengajuan dari database...</div>
        ) : (
          <DataTable
            rows={rows}
            onRow={(r) => go('bantuan', r.id)}
            cols={[
              { h: 'No. Pengajuan', r: (r) => <b style={{ color: C.ink }}>{r.nomor_pengajuan}</b> },
              {
                h: 'Usaha & Kategori',
                r: (r) => (
                  <>
                    <div style={{ fontWeight: 600, color: C.ink }}>{r.nama_usaha}</div>
                    <div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.kategori_usaha}</div>
                  </>
                )
              },
              { h: 'Dana Diajukan', r: (r) => (r.jumlah_dana ? `Rp ${Number(String(r.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')}` : '-') },
              { h: 'Tanggal', r: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-') },
              { h: 'Status', r: (r) => <Badge>{r.status}</Badge> },
              { h: '', r: () => <Btn style={{ padding: '5px 12px' }}>Periksa</Btn> }
            ]}
          />
        )}
      </Card>
    </>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C } from '../components/common';
import BantuanDetail from '../components/BantuanDetail';

const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Perlu Perbaikan', 'Disetujui', 'Ditolak'];

const envUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost'))
  ? envUrl.replace(/\/+$/, '').replace(/^http:\/\//i, 'https://')
  : 'https://si-umkm-jabar.vercel.app';

export default function BantuanAdmin({ selectedId, go }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const formatDana = (nominal) =>
    nominal ? `Rp ${Number(String(nominal).replace(/\D/g, '') || 0).toLocaleString('id-ID')}` : '-';

  return (
    <>
      <Header
        crumbs={['Portal Layanan', 'Layanan', 'Bantuan Modal']}
        title="Pengajuan Bantuan Modal"
        desc="Kelola dan verifikasi permohonan bantuan modal usaha UMKM yang tersimpan di database."
        right={<Btn onClick={loadData}>Muat Ulang</Btn>}
      />
      <Card style={isMobile ? { padding: 14 } : {}}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
          <SearchBox value={q} onChange={setQ} placeholder="Cari nomor pengajuan atau nama usaha" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.mute }}>
            Memuat data pengajuan dari database...
          </div>
        ) : isMobile ? (
          rows.length === 0 ? (
            <p style={{ textAlign: 'center', color: C.mute, padding: 24 }}>Tidak ada data yang cocok.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  onClick={() => go('bantuan', r.id)}
                  style={{
                    border: `1px solid ${C.line}`,
                    borderRadius: 12,
                    padding: 14,
                    background: '#fff',
                    display: 'grid',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ color: C.ink, fontSize: '0.88rem' }}>{r.nomor_pengajuan}</b>
                    <Badge>{r.status}</Badge>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: C.ink, fontSize: '0.92rem' }}>{r.nama_usaha}</div>
                    <div style={{ color: C.mute, fontSize: '0.78rem' }}>{r.kategori_usaha}</div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: C.mute,
                      paddingTop: 6,
                      borderTop: `1px solid ${C.bg}`,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: C.dark }}>{formatDana(r.jumlah_dana)}</span>
                    <span>{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}</span>
                  </div>

                  <Btn
                    dark
                    style={{ width: '100%', textAlign: 'center', marginTop: 4 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      go('bantuan', r.id);
                    }}
                  >
                    Periksa Dokumen →
                  </Btn>
                </div>
              ))}
            </div>
          )
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
              { h: 'Dana Diajukan', r: (r) => formatDana(r.jumlah_dana) },
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
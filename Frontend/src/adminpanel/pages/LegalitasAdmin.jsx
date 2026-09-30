import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C, grid } from '../components/common';

const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Selesai', 'Ditolak'];
const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

export default function LegalitasAdmin({ selectedId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');
  const [aktifId, setAktifId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/sertifikasi`);
      if (res.data && res.data.data) {
        setData(res.data.data);
        if (!aktifId && res.data.data.length > 0) {
          setAktifId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data legalitas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedId) setAktifId(selectedId);
  }, [selectedId]);

  const aktif = data.find((d) => d.id === aktifId);

  const updateStatus = async (statusBaru) => {
    if (!aktif) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/admin/sertifikasi/${aktif.id}`, {
        status: statusBaru,
        catatan_admin: aktif.catatan_admin || 'Telah diperbarui oleh admin dinas'
      });
      await loadData();
      alert(`Status sertifikasi berhasil diubah menjadi: ${statusBaru}`);
    } catch (err) {
      alert('Gagal memperbarui sertifikasi: ' + (err.response?.data?.detail || err.message));
    }
  };

  const bukaDokumen = (pathUrl) => {
    if (!pathUrl) return alert('Berkas tidak tersedia.');
    const fullUrl = pathUrl.startsWith('http') ? pathUrl : `${API_BASE_URL}${pathUrl}`;
    window.open(fullUrl, '_blank');
  };

  const n = (s) => (s === 'Semua' ? data.length : data.filter((d) => d.status === s).length);
  const rows = data.filter((d) => {
    const matchFilter = filter === 'Semua' || d.status === filter;
    const term = `${d.nomor_registrasi || ''} ${d.nama_usaha || ''} ${d.nama_produk || ''}`.toLowerCase();
    return matchFilter && term.includes(q.toLowerCase());
  });

  return (
    <>
      <Header
        crumbs={['Portal Layanan', 'Layanan', 'Legalitas']}
        title="Pengajuan Legalitas & Sertifikasi"
        desc="Kelola dan verifikasi permohonan sertifikasi produk halal, P-IRT, BPOM, dan merek dari database."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Daftar Berkas Permohonan Masuk">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
              <SearchBox value={q} onChange={setQ} placeholder="Cari nomor, produk, atau usaha" />
            </div>

            {loading ? (
              <div style={{ padding: 30, textAlign: 'center', color: C.mute }}>Memuat data sertifikasi...</div>
            ) : (
              <DataTable
                rows={rows}
                activeId={aktifId}
                onRow={(r) => setAktifId(r.id)}
                cols={[
                  { h: 'No. Registrasi', r: (r) => <b>{r.nomor_registrasi}</b> },
                  {
                    h: 'Usaha & Produk',
                    r: (r) => (
                      <>
                        <div style={{ fontWeight: 600 }}>{r.nama_usaha}</div>
                        <div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.nama_produk}</div>
                      </>
                    )
                  },
                  { h: 'Jenis', r: (r) => r.jenis_sertifikasi },
                  { h: 'Tanggal', r: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-') },
                  { h: 'Status', r: (r) => <Badge>{r.status}</Badge> }
                ]}
              />
            )}
          </Card>
        </div>

        {aktif && (
          <Card style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 16 }}>
            <div style={{ background: '#164E43', color: '#fff', padding: 20 }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Detail Permohonan Sertifikasi</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>{aktif.nomor_registrasi}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{aktif.jenis_sertifikasi} · {aktif.nama_usaha}</div>
            </div>

            <div style={{ padding: 20, display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: C.mute }}>Produk & Deskripsi:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{aktif.nama_produk}</div>
                <div style={{ fontSize: '0.8rem', color: C.mute, marginTop: 4, lineHeight: 1.4 }}>{aktif.deskripsi_produk}</div>
              </div>

              <div style={{ borderTop: `1px solid ${C.bg}`, paddingTop: 10 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>Berkas Lampiran Pemohon:</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {aktif.file_ktp && (
                    <Btn onClick={() => bukaDokumen(aktif.file_ktp)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      Foto KTP <ExternalLink size={13} />
                    </Btn>
                  )}
                  {aktif.file_foto_produk && (
                    <Btn onClick={() => bukaDokumen(aktif.file_foto_produk)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      Foto Produk / Kemasan <ExternalLink size={13} />
                    </Btn>
                  )}
                  {aktif.file_dokumen_pendukung && (
                    <Btn onClick={() => bukaDokumen(aktif.file_dokumen_pendukung)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      Dokumen Pendukung <ExternalLink size={13} />
                    </Btn>
                  )}
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${C.bg}`, paddingTop: 12, display: 'grid', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', color: C.mute }}>Status Terkini: <b>{aktif.status}</b></div>
                <Btn dark onClick={() => updateStatus('Selesai')}>Terbitkan Sertifikasi (Selesai)</Btn>
                <Btn onClick={() => updateStatus('Diproses')}>Tandai Sedang Diproses</Btn>
                <Btn danger onClick={() => updateStatus('Ditolak')}>Tolak Berkas</Btn>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
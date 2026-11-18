import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, C } from '../components/common';

const FILTER = ['Semua', 'Menunggu Verifikasi', 'Diproses', 'Selesai', 'Ditolak'];

// Konfigurasi URL API yang aman untuk localhost & production HTTPS Vercel
const envUrl = import.meta.env.VITE_API_URL;
let cleanApiUrl = (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) 
  ? envUrl.replace(/\/+$/, '')
  : 'https://si-umkm-jabar.vercel.app';

if (cleanApiUrl.startsWith('http://')) {
  cleanApiUrl = cleanApiUrl.replace('http://', 'https://');
}

const API_BASE_URL = cleanApiUrl;

export default function LegalitasAdmin({ selectedId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [q, setQ] = useState('');
  const [aktifId, setAktifId] = useState(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));
  const detailRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTabletOrMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/sertifikasi`);
      
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }

      setData(list);
      if (list.length > 0) {
        setAktifId((prev) => (prev && list.some((item) => item.id === prev) ? prev : list[0].id));
      } else {
        setAktifId(null);
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

  const handleSelectItem = (id) => {
    setAktifId(id);
    if (isTabletOrMobile && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const aktif = data.find((d) => d.id === aktifId);

  const updateStatus = async (statusBaru) => {
    if (!aktif) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/admin/sertifikasi/${aktif.id}`, {
        status: statusBaru,
        catatan_admin: aktif.catatan_admin || 'Telah diverifikasi oleh admin dinas'
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
        right={<Btn onClick={loadData}>Muat Ulang</Btn>}
      />

      <div
        className="admin-content-grid admin-content-grid-wide"
        style={{
          display: 'grid',
          gridTemplateColumns: isTabletOrMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 360px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          <Card title="Daftar Berkas Permohonan Masuk" style={isMobile ? { padding: 14 } : {}}>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 14,
                alignItems: isMobile ? 'stretch' : 'center',
              }}
            >
              <Chips items={FILTER.map((s) => [s, n(s)])} value={filter} onChange={setFilter} />
              <SearchBox value={q} onChange={setQ} placeholder="Cari nomor, produk, atau usaha" />
            </div>

            {loading ? (
              <div style={{ padding: 30, textAlign: 'center', color: C.mute }}>Memuat data sertifikasi dari backend...</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: C.mute }}>Belum ada berkas pengajuan sertifikasi yang masuk.</div>
            ) : isMobile ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {rows.map((r) => {
                  const isSelected = r.id === aktifId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectItem(r.id)}
                      style={{
                        border: isSelected ? `2px solid ${C.dark}` : `1px solid ${C.line}`,
                        background: isSelected ? C.soft : '#fff',
                        borderRadius: 12,
                        padding: 14,
                        display: 'grid',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <b style={{ fontSize: '0.86rem', color: C.ink }}>{r.nomor_registrasi}</b>
                        <Badge>{r.status}</Badge>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{r.nama_usaha}</div>
                      <div style={{ fontSize: '0.8rem', color: C.mute }}>
                        {r.nama_produk} · <span style={{ color: C.link, fontWeight: 600 }}>{r.jenis_sertifikasi}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: C.mute, marginTop: 2 }}>
                        Tanggal: {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <DataTable
                rows={rows}
                activeId={aktifId}
                onRow={(r) => handleSelectItem(r.id)}
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
          <div ref={detailRef} style={{ position: isTabletOrMobile ? 'static' : 'sticky', top: 16, minWidth: 0 }}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#255456', color: '#fff', padding: isMobile ? 16 : 20 }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Detail Permohonan Sertifikasi</div>
                <div style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, margin: '4px 0', wordBreak: 'break-word' }}>
                  {aktif.nomor_registrasi}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{aktif.jenis_sertifikasi} · {aktif.nama_usaha}</div>
              </div>

              <div style={{ padding: isMobile ? 16 : 20, display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: C.mute }}>Produk & Deskripsi:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>{aktif.nama_produk}</div>
                  <div style={{ fontSize: '0.8rem', color: C.mute, marginTop: 4, lineHeight: 1.4 }}>{aktif.deskripsi_produk}</div>
                </div>

                <div style={{ borderTop: `1px solid ${C.bg}`, paddingTop: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>Berkas Lampiran Pemohon:</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {aktif.file_ktp && (
                      <Btn onClick={() => bukaDokumen(aktif.file_ktp)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        Foto KTP <ExternalLink size={13} />
                      </Btn>
                    )}
                    {aktif.file_foto_produk && (
                      <Btn onClick={() => bukaDokumen(aktif.file_foto_produk)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        Foto Produk / Kemasan <ExternalLink size={13} />
                      </Btn>
                    )}
                    {aktif.file_dokumen_pendukung && (
                      <Btn onClick={() => bukaDokumen(aktif.file_dokumen_pendukung)} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        Dokumen Pendukung <ExternalLink size={13} />
                      </Btn>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.bg}`, paddingTop: 12, display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: C.mute }}>Status Terkini: <b>{aktif.status}</b></div>
                  <Btn dark style={{ width: '100%', textAlign: 'center' }} onClick={() => updateStatus('Selesai')}>
                    Terbitkan Sertifikasi (Selesai)
                  </Btn>
                  <Btn style={{ width: '100%', textAlign: 'center' }} onClick={() => updateStatus('Diproses')}>
                    Tandai Sedang Diproses
                  </Btn>
                  <Btn danger style={{ width: '100%', textAlign: 'center' }} onClick={() => updateStatus('Ditolak')}>
                    Tolak Berkas
                  </Btn>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
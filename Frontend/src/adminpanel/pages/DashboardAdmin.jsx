import { useState, useEffect } from 'react';
import axios from 'axios';
import { HandCoins, ShieldCheck, ClipboardList, BellRing } from 'lucide-react';
import { Header, Card, Badge, Btn, StatCard, C, grid } from '../components/common';

const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

export default function DashboardAdmin({ go }) {
  const [bantuanList, setBantuanList] = useState([]);
  const [sertifList, setSertifList] = useState([]);
  const [loading, setLoading] = useState(true);

  const hariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Ambil data bantuan & sertifikasi secara bersamaan
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resBantuan, resSertif] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/admin/pengajuan`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE_URL}/api/v1/admin/sertifikasi`).catch(() => ({ data: { data: [] } }))
        ]);
        setBantuanList(resBantuan.data?.data || []);
        setSertifList(resSertif.data?.data || []);
      } catch (err) {
        console.error('Gagal mengambil ringkasan dashboard admin:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hitung jumlah menunggu verifikasi
  const bantuanMenunggu = bantuanList.filter((b) => b.status === 'Menunggu Verifikasi');
  const sertifMenunggu = sertifList.filter((s) => s.status === 'Menunggu Verifikasi');
  const totalAntrean = bantuanMenunggu.length + sertifMenunggu.length;

  return (
    <>
      <Header
        crumbs={['Portal Layanan', 'Dashboard']}
        title="Selamat Datang, Admin Dinas"
        desc="Kelola pengajuan layanan UMKM dan pantau verifikasi berkas permohonan secara real-time."
        right={<Badge>{`Hari ini, ${hariIni}`}</Badge>}
      />

      <div style={grid(220)}>
        <StatCard
          label="Pengajuan Bantuan"
          value={loading ? '...' : bantuanList.length}
          unit="Pengajuan"
          note={`${bantuanMenunggu.length} Menunggu Verifikasi`}
          icon={HandCoins}
        />
        <StatCard
          label="Pengajuan Legalitas"
          value={loading ? '...' : sertifList.length}
          unit="Pengajuan"
          note={`${sertifMenunggu.length} Menunggu Verifikasi`}
          icon={ShieldCheck}
        />
        <StatCard
          label="Perlu Ditindaklanjuti"
          value={loading ? '...' : totalAntrean}
          unit="Berkas"
          note="Memerlukan respon admin hari ini"
          icon={ClipboardList}
        />
      </div>

      <Card
        style={{ marginTop: 20 }}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={18} /> Antrean Verifikasi Berkas Masuk
          </span>
        }
        right={<Badge tone="amber">{totalAntrean} Antrean Aktif</Badge>}
      >
        <p style={{ margin: '-6px 0 14px', color: C.mute, fontSize: '0.85rem' }}>
          Pengajuan berkas dari masyarakat yang memerlukan pengecekan dokumen.
        </p>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: C.mute }}>Memeriksa antrean berkas...</div>
        ) : totalAntrean === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: C.mute, fontSize: '0.88rem' }}>
            Semua permohonan bantuan dan sertifikasi sudah selesai diverifikasi.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {bantuanMenunggu.map((b) => (
              <div
                key={`bantuan-${b.id}`}
                style={{ background: C.soft, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontWeight: 700, color: C.ink, fontSize: '0.9rem' }}>
                    Permohonan Bantuan Modal: {b.nomor_pengajuan}
                    <span style={{ color: C.mute, fontWeight: 500, fontSize: '0.75rem', marginLeft: 8 }}>
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div style={{ color: C.link, fontWeight: 600, fontSize: '0.8rem', margin: '2px 0 4px' }}>
                    {b.nama_usaha} ({b.kategori_usaha})
                  </div>
                  <div style={{ color: C.mute, fontSize: '0.82rem' }}>
                    Nominal: Rp {Number(String(b.jumlah_dana).replace(/\D/g, '') || 0).toLocaleString('id-ID')} · {b.tujuan_penggunaan}
                  </div>
                </div>
                <Btn dark onClick={() => go('bantuan', b.id)}>Periksa Dokumen →</Btn>
              </div>
            ))}

            {sertifMenunggu.map((s) => (
              <div
                key={`sertif-${s.id}`}
                style={{ background: C.soft, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontWeight: 700, color: C.ink, fontSize: '0.9rem' }}>
                    Sertifikasi Produk: {s.nomor_registrasi}
                    <span style={{ color: C.mute, fontWeight: 500, fontSize: '0.75rem', marginLeft: 8 }}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div style={{ color: C.link, fontWeight: 600, fontSize: '0.8rem', margin: '2px 0 4px' }}>
                    {s.nama_usaha} · {s.jenis_sertifikasi}
                  </div>
                  <div style={{ color: C.mute, fontSize: '0.82rem' }}>
                    Produk: <b>{s.nama_produk}</b> — {s.deskripsi_produk}
                  </div>
                </div>
                <Btn dark onClick={() => go('legalitas', s.id)}>Periksa Berkas →</Btn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
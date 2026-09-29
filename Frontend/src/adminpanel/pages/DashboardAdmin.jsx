import { HandCoins, ShieldCheck, ClipboardList, BellRing } from 'lucide-react';
import { Header, Card, Badge, Btn, StatCard, C, grid } from '../components/common';
import { antrean, ringkasan } from '../data/mockData';

export default function DashboardAdmin({ go }) {
  const hariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <>
      <Header crumbs={['Portal Layanan', 'Dashboard']} title="Selamat Datang, Admin"
        desc="Kelola pengajuan layanan UMKM dengan mudah melalui dashboard ini." right={<Badge>{`Hari ini, ${hariIni}`}</Badge>} />
      <div style={grid(220)}>
        <StatCard label="Pengajuan Bantuan" value={ringkasan.bantuan} unit="Pengajuan" note="32 Menunggu Verifikasi" icon={HandCoins} />
        <StatCard label="Pengajuan Legalitas" value={ringkasan.legalitas} unit="Pengajuan" note="19 Menunggu Verifikasi" icon={ShieldCheck} />
        <StatCard label="Perlu Ditindaklanjuti" value={ringkasan.tindak} unit="Berkas" note="Memerlukan respon admin hari ini" icon={ClipboardList} />
      </div>
      <Card style={{ marginTop: 20 }} title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BellRing size={18} /> Perlu Ditindaklanjuti</span>}
        right={<Badge tone="amber">{antrean.length} Antrean</Badge>}>
        <p style={{ margin: '-6px 0 14px', color: C.mute, fontSize: '0.85rem' }}>Pengajuan prioritas yang memerlukan validasi admin segera.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {antrean.map((a) => (
            <div key={a.id} style={{ background: C.soft, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: '0.9rem' }}>{a.judul} <span style={{ color: C.mute, fontWeight: 500, fontSize: '0.75rem', marginLeft: 6 }}>{a.waktu}</span></div>
                <div style={{ color: C.link, fontWeight: 600, fontSize: '0.8rem', margin: '2px 0 6px' }}>{a.usaha}</div>
                <div style={{ color: C.mute, fontSize: '0.82rem' }}>{a.isi}</div>
              </div>
              <Btn dark onClick={() => go(a.ke, a.ref)}>Periksa →</Btn>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
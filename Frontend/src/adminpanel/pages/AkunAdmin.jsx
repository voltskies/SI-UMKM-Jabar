import { useState } from 'react';
import { Users, Store, HandHelping, BadgeCheck } from 'lucide-react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, StatCard, C, grid } from '../components/common';
import { akun } from '../data/mockData';

const ROLES = ['Semua', 'UMKM', 'Pendamping', 'Admin Dinas'];
const TONE = { UMKM: 'blue', Pendamping: 'amber', 'Admin Dinas': 'gray' };

export default function AkunAdmin() {
  const [role, setRole] = useState('Semua');
  const [q, setQ] = useState('');
  const [aktifId, setAktifId] = useState(akun[0].id);
  const rows = akun.filter((a) => (role === 'Semua' || a.role === role) && `${a.nama} ${a.email} ${a.instansi}`.toLowerCase().includes(q.toLowerCase()));
  const aktif = akun.find((a) => a.id === aktifId);
  const n = (r) => (r === 'Semua' ? akun.length : akun.filter((a) => a.role === r).length);

  return (
    <>
      <Header crumbs={['Portal Layanan', 'Manajemen', 'Data Akun UMKM']} title="Manajemen Akun Pengguna"
        desc="Kelola hak akses portal, data pelaku UMKM, dan pendamping lapangan."
        right={<div style={{ display: 'flex', gap: 8 }}><Btn>Daftar Pengguna</Btn><Btn dark>Tambah Akun Baru</Btn></div>} />
      <div style={grid(190)}>
        <StatCard label="Total Akun" value="1.240" icon={Users} />
        <StatCard label="Pelaku UMKM Aktif" value="1.180" icon={Store} />
        <StatCard label="Pendamping" value="45" icon={HandHelping} />
        <StatCard label="Butuh Verifikasi" value="12" icon={BadgeCheck} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start', marginTop: 16 }}>
        <Card title="Data Akun Terverifikasi">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <Chips items={ROLES.map((r) => [r, n(r)])} value={role} onChange={setRole} />
            <SearchBox value={q} onChange={setQ} placeholder="Cari nama, email, atau usaha" />
          </div>
          <DataTable rows={rows} activeId={aktifId} onRow={(r) => setAktifId(r.id)} cols={[
            { h: 'Profil & Nama', r: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: C.line, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{r.nama.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <b>{r.nama}</b></div> },
            { h: 'Email & Telepon', r: (r) => <><div>{r.email}</div><div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.telp}</div></> },
            { h: 'Role & Instansi', r: (r) => <><Badge tone={TONE[r.role]}>{r.role}</Badge><div style={{ color: C.mute, fontSize: '0.75rem', marginTop: 2 }}>{r.instansi}</div></> },
          ]} />
        </Card>
        {aktif && (
          <Card style={{ position: 'sticky', top: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 12, background: C.dark, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{aktif.nama.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
            <h3 style={{ margin: '10px 0 2px' }}>{aktif.nama}</h3>
            <div style={{ color: C.mute, fontSize: '0.8rem', marginBottom: 12 }}>{aktif.email}</div>
            <Badge tone={TONE[aktif.role]}>{aktif.role}</Badge>
            <div style={{ color: C.mute, fontSize: '0.8rem', margin: '12px 0' }}>{aktif.instansi} · {aktif.telp}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <Btn dark>Edit Data</Btn><Btn>Kirim Notifikasi</Btn><Btn danger>Nonaktifkan Akun Ini</Btn>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
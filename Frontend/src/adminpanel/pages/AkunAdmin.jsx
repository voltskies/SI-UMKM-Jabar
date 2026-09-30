import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Store, HandHelping, BadgeCheck } from 'lucide-react';
import { Header, Card, Chips, SearchBox, DataTable, Badge, Btn, StatCard, C, grid } from '../components/common';

const ROLES = ['Semua', 'Pelaku UMKM', 'Admin Dinas'];
const TONE = { 'Pelaku UMKM': 'blue', 'Admin Dinas': 'green' };
const API_BASE_URL = `http://${window.location.hostname || '127.0.0.1'}:8000`;

export default function AkunAdmin() {
  const [dataAkun, setDataAkun] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('Semua');
  const [q, setQ] = useState('');
  const [aktifId, setAktifId] = useState(null);

  // Ambil daftar pengguna nyata dari MySQL melalui API FastAPI
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/users`);
      if (res.data && res.data.data) {
        const mapped = res.data.data.map((u) => ({
          ...u,
          roleDisplay: u.role === 'admin' ? 'Admin Dinas' : 'Pelaku UMKM'
        }));
        setDataAkun(mapped);
        if (mapped.length > 0) {
          setAktifId(mapped[0].id);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data akun:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalAkun = dataAkun.length;
  const totalUMKM = dataAkun.filter((a) => a.roleDisplay === 'Pelaku UMKM').length;
  const totalAdmin = dataAkun.filter((a) => a.roleDisplay === 'Admin Dinas').length;

  const n = (r) => {
    if (r === 'Semua') return dataAkun.length;
    return dataAkun.filter((a) => a.roleDisplay === r).length;
  };

  const rows = dataAkun.filter((a) => {
    const matchRole = role === 'Semua' || a.roleDisplay === role;
    const term = `${a.nama || ''} ${a.email || ''} ${a.telp || ''} ${a.nik || ''}`.toLowerCase();
    return matchRole && term.includes(q.toLowerCase());
  });

  const aktif = dataAkun.find((a) => a.id === aktifId);

  return (
    <>
      <Header
        crumbs={['Portal Layanan', 'Manajemen', 'Data Akun UMKM']}
        title="Manajemen Akun Pengguna"
        desc="Kelola data akun terdaftar, hak akses portal, dan identitas pelaku UMKM dari database."
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={loadUsers}>Muat Ulang</Btn>
          </div>
        }
      />

      <div style={grid(190)}>
        <StatCard label="Total Akun Terdaftar" value={totalAkun} icon={Users} />
        <StatCard label="Pelaku UMKM" value={totalUMKM} icon={Store} />
        <StatCard label="Admin Dinas" value={totalAdmin} icon={HandHelping} />
        <StatCard label="Terverifikasi NIK" value={dataAkun.filter((a) => Boolean(a.nik)).length} icon={BadgeCheck} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start', marginTop: 16 }}>
        <Card title="Data Pengguna dari Database">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <Chips items={ROLES.map((r) => [r, n(r)])} value={role} onChange={setRole} />
            <SearchBox value={q} onChange={setQ} placeholder="Cari NIK, nama lengkap, atau email..." />
          </div>

          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: C.mute }}>Memuat data akun pengguna...</div>
          ) : (
            <DataTable
              rows={rows}
              activeId={aktifId}
              onRow={(r) => setAktifId(r.id)}
              cols={[
                {
                  h: 'Profil & Nama',
                  r: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: C.soft, color: C.dark, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                        {(r.nama || 'U').slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <b>{r.nama}</b>
                        {r.nik && <div style={{ fontSize: '0.72rem', color: C.mute }}>NIK: {r.nik}</div>}
                      </div>
                    </div>
                  )
                },
                {
                  h: 'Email & WhatsApp',
                  r: (r) => (
                    <>
                      <div>{r.email}</div>
                      <div style={{ color: C.mute, fontSize: '0.75rem' }}>{r.telp || '-'}</div>
                    </>
                  )
                },
                {
                  h: 'Role & Instansi',
                  r: (r) => (
                    <>
                      <Badge tone={TONE[r.roleDisplay]}>{r.roleDisplay}</Badge>
                      <div style={{ color: C.mute, fontSize: '0.75rem', marginTop: 2 }}>{r.instansi}</div>
                    </>
                  )
                }
              ]}
            />
          )}
        </Card>

        {aktif && (
          <Card style={{ position: 'sticky', top: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 12, background: C.dark, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
              {(aktif.nama || 'U').slice(0, 2).toUpperCase()}
            </span>
            <h3 style={{ margin: '10px 0 2px' }}>{aktif.nama}</h3>
            <div style={{ color: C.mute, fontSize: '0.8rem', marginBottom: 12 }}>{aktif.email}</div>
            <Badge tone={TONE[aktif.roleDisplay]}>{aktif.roleDisplay}</Badge>
            <div style={{ color: C.mute, fontSize: '0.8rem', margin: '12px 0', lineHeight: 1.5 }}>
              <div><b>WhatsApp:</b> {aktif.telp || '-'}</div>
              <div><b>NIK:</b> {aktif.nik || '-'}</div>
              <div><b>Instansi:</b> {aktif.instansi}</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <Btn dark onClick={() => alert(`Detail akun ${aktif.nama} tersinkron di sistem database.`)}>
                Sinkronkan Data
              </Btn>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
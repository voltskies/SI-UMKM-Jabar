import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#164E43',
      color: '#FFFFFF',
      padding: '40px 24px 20px',
      marginTop: 'auto',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '30px',
        paddingBottom: '30px',
        borderBottom: '1px solid rgba(255,255,255,0.15)'
      }}>
        {/*profil*/}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 10px' }}>
            SI-UMKM JABAR
          </h3>
          <p style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Sistem Informasi & Integrasi Layanan Usaha Mikro, Kecil, dan Menengah Provinsi Jawa Barat.
          </p>
        </div>

        {/*layanan*/}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 12px', color: '#D99B26' }}>
            Layanan Terpadu
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.84rem', lineHeight: '2', color: 'rgba(255,255,255,0.85)' }}>
            <li>Pelatihan & Pembinaan</li>
            <li>Permohonan Bantuan Modal</li>
            <li>Pendampingan Sertifikasi Produk</li>
          </ul>
        </div>

        {/*kontak*/}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 12px', color: '#D99B26' }}>
            Kontak
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Jl. Soekarno-Hatta No. 705, Bandung</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} />
              <span>(022) 7302775</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginTop: '20px' }}>
        © 2026 SI-UMKM JABAR.
      </div>
    </footer>
  );
}
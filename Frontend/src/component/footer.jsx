import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer" style={{
      backgroundColor: '#1B4143',
      color: '#FFFFFF',
      padding: '44px 24px 20px',
      width: '100%',
      margin: 'auto 0 0',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'left'
    }}>
      <style>{`
        @media (max-width: 768px) {
          .site-footer {
            padding: 28px 20px 16px !important;
          }

          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding-bottom: 20px !important;
            text-align: left !important;
          }

          .footer-grid h3 {
            font-size: 1.05rem !important;
            margin-bottom: 6px !important;
            text-align: left !important;
          }

          .footer-desc {
            font-size: 0.82rem !important;
            line-height: 1.5 !important;
            text-align: left !important;
          }

          .footer-layanan {
            display: block !important;
            text-align: left !important;
          }

          .footer-kontak h4 {
            display: block !important;
            text-align: left !important;
          }

          .footer-kontak > div {
            align-items: flex-start !important;
          }

          .footer-kontak > div > div {
            justify-content: flex-start !important;
            font-size: 0.82rem !important;
          }
        }
      `}</style>
      
      <div className="footer-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: '40px',
        paddingBottom: '32px',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        textAlign: 'left'
      }}>
        {/* 1. Profil & Deskripsi */}
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 10px', color: '#FFFFFF', textAlign: 'left', letterSpacing: '0.3px' }}>
            SI-UMKM JABAR
          </h3>
          <p className="footer-desc" style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', margin: 0, textAlign: 'left', maxWidth: '360px' }}>
            Sistem Informasi & Integrasi Layanan Usaha Mikro, Kecil, dan Menengah Provinsi Jawa Barat.
          </p>
        </div>

        {/* 2. Layanan Terpadu */}
        <div className="footer-layanan" style={{ textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 12px', color: '#D99B26', textAlign: 'left' }}>
            Layanan Terpadu
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.84rem', lineHeight: '2.1', color: 'rgba(255,255,255,0.85)', textAlign: 'left' }}>
            <li>Pelatihan & Pembinaan</li>
            <li>Permohonan Bantuan Modal</li>
            <li>Pendampingan Sertifikasi Produk</li>
          </ul>
        </div>

        {/* 3. Kontak Dinas */}
        <div className="footer-kontak" style={{ textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 12px', color: '#D99B26', textAlign: 'left' }}>
            Kontak
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '3px', color: '#D99B26' }} />
              <span style={{ lineHeight: '1.5' }}>Jl. Soekarno-Hatta No. 705, Bandung</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginTop: '22px' }}>
        © 2026 SI-UMKM JABAR.
      </div>
    </footer>
  );
}
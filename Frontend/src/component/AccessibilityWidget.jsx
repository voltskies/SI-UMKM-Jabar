import { useState, useEffect } from 'react';
import { 
  Accessibility, X, Type, Sun, Contrast, EyeOff, 
  RotateCcw, Droplet, AlignLeft, Space
} from 'lucide-react';

export default function AccessibilityWidget() {
  const [bukaMenu, setBukaMenu] = useState(false);

  // State pengaturan aksesibilitas
  const [fontScale, setFontScale] = useState(100); // persen: 100%, 110%, 120%
  const [modeWarna, setModeWarna] = useState('normal'); // 'normal' | 'grayscale' | 'high-contrast' | 'invert' | 'deuteranopia'
  const [spasiTeks, setSpasiTeks] = useState(false);
  const [sembunyiGambar, setSembunyiGambar] = useState(false);

  // Shortcut keyboard CTRL + U seperti pada contoh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setBukaMenu((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Terapkan filter & gaya ke seluruh halaman (<html> / <body>)
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.style.fontSize = `${fontScale}%`;

    // Filter warna untuk pengguna buta warna & gangguan penglihatan
    let filterValue = 'none';
    if (modeWarna === 'grayscale') {
      filterValue = 'grayscale(100%)';
    } else if (modeWarna === 'high-contrast') {
      filterValue = 'contrast(150%) saturate(120%)';
    } else if (modeWarna === 'invert') {
      filterValue = 'invert(100%) hue-rotate(180deg)';
    } else if (modeWarna === 'deuteranopia') {
      // Penyesuaian spektrum warna merah-hijau (buta warna parsial)
      filterValue = 'sepia(35%) saturate(160%) hue-rotate(-15deg) contrast(115%)';
    }
    htmlEl.style.filter = filterValue;

    // Spasi teks & tinggi baris
    document.body.style.letterSpacing = spasiTeks ? '0.08em' : 'normal';
    document.body.style.lineHeight = spasiTeks ? '1.8' : '';

    // Sembunyikan gambar
    const styleId = 'a11y-hide-images';
    let styleTag = document.getElementById(styleId);
    if (sembunyiGambar) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.innerHTML = 'img, svg.recharts-surface { opacity: 0.08 !important; }';
        document.head.appendChild(styleTag);
      }
    } else if (styleTag) {
      styleTag.remove();
    }
  }, [fontScale, modeWarna, spasiTeks, sembunyiGambar]);

  const resetSemua = () => {
    setFontScale(100);
    setModeWarna('normal');
    setSpasiTeks(false);
    setSembunyiGambar(false);
  };

  const cardBtnStyle = (aktif) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 8px',
    borderRadius: '12px',
    border: aktif ? '2px solid #255456' : '1px solid #E2E8F0',
    backgroundColor: aktif ? '#eaf1f1' : '#FFFFFF',
    color: aktif ? '#255456' : '#0F172A',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease'
  });

  return (
    <>
      {/* Tombol Melayang di Pojok Kiri Bawah */}
      <button
        type="button"
        onClick={() => setBukaMenu(true)}
        title="Menu Aksesibilitas"
        aria-label="Buka Menu Aksesibilitas"
        style={{
          position: 'fixed',
          bottom: '22px',
          left: '22px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#255456',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9998
        }}
      >
        <Accessibility size={24} />
      </button>

      {/* Drawer Panel Menu Aksesibilitas */}
      {bukaMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '320px',
            maxWidth: '90vw',
            height: '100svh',
            backgroundColor: '#F8FAFC',
            boxShadow: '6px 0 25px rgba(0,0,0,0.18)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          {/* Header Biru / Hijau Khas SI-UMKM */}
          <div
            style={{
              backgroundColor: '#255456',
              color: '#FFFFFF',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem' }}>
                Menu Aksesibilitas (CTRL+U)
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                SI-UMKM Provinsi Jawa Barat
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBukaMenu(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid Pilihan Fitur */}
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', marginBottom: '10px', textTransform: 'uppercase' }}>
              Mode Buta Warna & Kontras
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setModeWarna(modeWarna === 'grayscale' ? 'normal' : 'grayscale')}
                style={cardBtnStyle(modeWarna === 'grayscale')}
              >
                <Droplet size={22} />
                <span>Monokrom (Buta Warna Total)</span>
              </button>

              <button
                type="button"
                onClick={() => setModeWarna(modeWarna === 'deuteranopia' ? 'normal' : 'deuteranopia')}
                style={cardBtnStyle(modeWarna === 'deuteranopia')}
              >
                <Sun size={22} />
                <span>Filter Merah-Hijau</span>
              </button>

              <button
                type="button"
                onClick={() => setModeWarna(modeWarna === 'high-contrast' ? 'normal' : 'high-contrast')}
                style={cardBtnStyle(modeWarna === 'high-contrast')}
              >
                <Contrast size={22} />
                <span>Kontras Tinggi+</span>
              </button>

              <button
                type="button"
                onClick={() => setModeWarna(modeWarna === 'invert' ? 'normal' : 'invert')}
                style={cardBtnStyle(modeWarna === 'invert')}
              >
                <AlignLeft size={22} />
                <span>Balik Warna (Invert)</span>
              </button>
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', marginBottom: '10px', textTransform: 'uppercase' }}>
              Teks & Tampilan
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFontScale((prev) => Math.min(prev + 10, 130))}
                style={cardBtnStyle(fontScale > 100)}
              >
                <Type size={22} />
                <span>Perbesar Teks ({fontScale}%)</span>
              </button>

              <button
                type="button"
                onClick={() => setFontScale((prev) => Math.max(prev - 10, 90))}
                style={cardBtnStyle(fontScale < 100)}
              >
                <Type size={17} />
                <span>Perkecil Teks</span>
              </button>

              <button
                type="button"
                onClick={() => setSpasiTeks(!spasiTeks)}
                style={cardBtnStyle(spasiTeks)}
              >
                <Space size={22} />
                <span>Spasi Teks</span>
              </button>

              <button
                type="button"
                onClick={() => setSembunyiGambar(!sembunyiGambar)}
                style={cardBtnStyle(sembunyiGambar)}
              >
                <EyeOff size={22} />
                <span>Redupkan Gambar</span>
              </button>
            </div>
          </div>

          {/* Tombol Reset */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <button
              type="button"
              onClick={resetSemua}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F1F5F9',
                color: '#0F172A',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={15} /> Reset Pengaturan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
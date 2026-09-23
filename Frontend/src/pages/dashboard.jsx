import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Store, MapPin, Tag, Search, TrendingUp, CheckCircle, ArrowRight, 
  X, Phone, FileText, ShieldCheck, Award,
  ChevronLeft, ChevronRight, Users, MessageSquare, Calendar, Radio
} from 'lucide-react';
import NotifikasiToast from '../component/notifikasiToast';

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: '/src/assets/hero1.jpg',
    badge: 'Portal Resmi E-Governance Jawa Barat',
    title: 'SI-UMKM Jawa Barat',
    desc: 'Sistem Informasi & Integrasi Layanan UMKM Jawa Barat. Menghubungkan lebih dari 7,05 juta potensi UMKM dengan fasilitasi legalitas dan investasi digital.',
    btnText: 'Ajukan Layanan Mandiri'
  },
  {
    id: 2,
    image: '/src/assets/hero2.jpg',
    badge: 'Pemberdayaan Sentra Kreatif',
    title: 'Pemetaan 27 Kabupaten/Kota',
    desc: 'Eksplorasi potensi kriya, kuliner, fashion, dan agroindustri unggulan Jawa Barat berbasis integrasi peta geospasial interaktif.',
    btnText: 'Jelajahi Pemetaan'
  },
  {
    id: 3,
    image: '/src/assets/hero3.jpg',
    badge: 'Standardisasi & Fasilitasi Legalitas',
    title: 'Pendampingan & Sertifikasi Produk',
    desc: 'Akselerasi izin berusaha dan jaminan mutu produk lokal demi mewujudkan UMKM Jabar Juara yang siap ekspor.',
    btnText: 'Konsultasi Legalitas'
  }
];

const DAFTAR_PELATIHAN = [
  {
    id: 1,
    title: 'Pelatihan Digitalisasi dan Pemasaran Online',
    image: ''
  },
  {
    id: 2,
    title: 'Pelatihan Manajemen Keuangan Administrasi',
    image: ''
  },
  {
    id: 3,
    title: 'Pelatihan Legalitas dan Standarisasi Produk',
    image: ''
  },
  {
    id: 4,
    title: 'Pelatihan Inovasi dan Kualitas Produk',
    image: ''
  }
];

const KABUPATEN_KOTA_JABAR = [
  'Semua Wilayah', 'Kabupaten Bogor', 'Kabupaten Sukabumi', 'Kabupaten Cianjur',
  'Kabupaten Bandung', 'Kabupaten Garut', 'Kabupaten Tasikmalaya', 'Kabupaten Ciamis',
  'Kabupaten Kuningan', 'Kabupaten Cirebon', 'Kabupaten Majalengka', 'Kabupaten Sumedang',
  'Kabupaten Indramayu', 'Kabupaten Subang', 'Kabupaten Purwakarta', 'Kabupaten Karawang',
  'Kabupaten Bekasi', 'Kabupaten Bandung Barat', 'Kabupaten Pangandaran', 'Kota Bogor',
  'Kota Sukabumi', 'Kota Bandung', 'Kota Cirebon', 'Kota Bekasi', 'Kota Depok',
  'Kota Cimahi', 'Kota Tasikmalaya', 'Kota Banjar'
];

// Helper penentuan warna dinamis
const getMarkerColor = (kategori) => {
  const kat = (kategori || '').toUpperCase();
  
  if (kat.includes('AKSESORIS') || kat.includes('CRAFT') || kat.includes('KRIYA') || kat.includes('KERAJINAN')) {
    return '#EAB308'; // Kuning
  }
  if (kat.includes('KULINER') || kat.includes('MAKANAN') || kat.includes('MINUMAN') || kat.includes('OBAT')) {
    return '#16A34A'; // Hijau
  }
  if (kat.includes('FASHION') || kat.includes('BATIK') || kat.includes('KONVEKSI') || kat.includes('BORDIR')) {
    return '#9333EA'; // Ungu
  }
  if (kat.includes('JASA') || kat.includes('AGRIBISNIS') || kat.includes('INDUSTRI') || kat.includes('MEBEL') || kat.includes('DEKORASI')) {
    return '#0284C7'; // Biru
  }
  return '#164E43'; // Default hijau tua pemprov
};

const getKeunggulanText = (kategori, customUnggulan) => {
  if (customUnggulan && customUnggulan.trim() !== '') return customUnggulan;
  const kat = (kategori || '').toUpperCase();
  
  if (kat.includes('AKSESORIS') || kat.includes('CRAFT') || kat.includes('KRIYA') || kat.includes('KERAJINAN')) {
    return 'Kriya anyaman bambu & aksesoris etnik kontemporer berdaya saing ekspor';
  }
  if (kat.includes('KULINER') || kat.includes('MAKANAN') || kat.includes('MINUMAN')) {
    return 'Cita rasa otentik khas Pasundan, higienis, dan tersertifikasi halal';
  }
  if (kat.includes('FASHION') || kat.includes('BATIK') || kat.includes('KONVEKSI')) {
    return 'Motif pakem Parahyangan & jahitan garmen butik berstandar mutu tinggi';
  }
  if (kat.includes('AGRIBISNIS')) {
    return 'Hasil tani hortikultura segar dan bibit organik unggulan tanah Priangan';
  }
  if (kat.includes('MEBEL')) {
    return 'Mebel kayu jati solid berkonstruksi presisi dengan ornamen ukir khas';
  }
  return 'Komoditas binaan terkurasi Dinas Koperasi & Usaha Kecil Jawa Barat';
};

export default function Dashboard({ onNavigasiPelatihan, setHalaman }) {
  const [umkmList, setUmkmList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterActive, setFilterActive] = useState('Semua');
  const [selectedKabKota, setSelectedKabKota] = useState('Semua Wilayah');
  const [selectedUMKM, setSelectedUMKM] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [isPelatihanVisible, setIsPelatihanVisible] = useState(false);
  const pelatihanSectionRef = useRef(null);

  // Fungsi navigasi langsung ke page pelatihan
  const handlePindahKePelatihan = () => {
    if (typeof setHalaman === 'function') {
      setHalaman('pelatihan');
    } else if (typeof onNavigasiPelatihan === 'function') {
      onNavigasiPelatihan();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPelatihanVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (pelatihanSectionRef.current) {
      observer.observe(pelatihanSectionRef.current);
    }

    return () => {
      if (pelatihanSectionRef.current) {
        observer.unobserve(pelatihanSectionRef.current);
      }
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const fetchUMKM = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/umkm');
      setUmkmList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Gagal mengambil data dari API FastAPI:', err);
    }
  };

  useEffect(() => {
    fetchUMKM();
  }, []);

  const filteredUMKM = umkmList.filter((item) => {
    const nama = (item.nama_usaha || '').toLowerCase();
    const kat = (item.kategori || '').toLowerCase();
    const kab = (item.kabupaten_kota || '').toLowerCase();
    const q = searchKeyword.toLowerCase();

    const matchesSearch = nama.includes(q) || kat.includes(q) || kab.includes(q);
    const matchesCategory =
      filterActive === 'Semua' || kat.includes(filterActive.toLowerCase());
    const matchesKabKota =
      selectedKabKota === 'Semua Wilayah' ||
      kab.includes(selectedKabKota.toLowerCase());

    return matchesSearch && matchesCategory && matchesKabKota;
  });

  const isFilterActive = searchKeyword.trim() !== '' || selectedKabKota !== 'Semua Wilayah' || filterActive !== 'Semua';

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Carousel Hero Section */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        overflow: 'hidden',
        marginBottom: '35px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          width: `${CAROUSEL_SLIDES.length * 100}%`,
          height: '100%',
          transform: `translateX(-${currentSlide * (100 / CAROUSEL_SLIDES.length)}%)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          {CAROUSEL_SLIDES.map((slide) => (
            <div
              key={slide.id}
              style={{
                width: `${100 / CAROUSEL_SLIDES.length}%`,
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(8,30,22,0.85) 0%, rgba(15,23,42,0.65) 55%, rgba(0,0,0,0.4) 100%)'
              }} />

              <div style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: '1200px',
                width: '100%',
                padding: '0 6%',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(6px)',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  <CheckCircle size={15} />
                  {slide.badge}
                </div>

                <h1 style={{
                  fontSize: '44px',
                  fontWeight: '800',
                  lineHeight: '1.2',
                  margin: '0 0 16px',
                  maxWidth: '750px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  {slide.title}
                </h1>

                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  maxWidth: '620px',
                  margin: '0 0 26px',
                  color: 'rgba(255,255,255,0.9)'
                }}>
                  {slide.desc}
                </p>

                <button
                  onClick={handlePindahKePelatihan}
                  style={{
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b45309')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#D97706')}
                >
                  {slide.btnText}
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            color: '#1E293B',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 10
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            color: '#1E293B',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 10
          }}
        >
          <ChevronRight size={22} />
        </button>

        <div style={{
          position: 'absolute',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}>
          {CAROUSEL_SLIDES.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: currentSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* Konten Utama */}
      <main style={{ maxWidth: '1200px', margin: 'auto', padding: '0 20px 50px' }}>
        
        {/* Statistik Ringkas */}
        <section style={{ marginBottom: '45px', marginTop: '10px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748B',
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              Data Terkini
            </span>
            <h2 style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: '0.5px'
            }}>
              UMKM DI JAWA BARAT
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            maxWidth: '1050px',
            margin: '0 auto'
          }}>
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>
                Total UMKM Terdata
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                {umkmList.length > 0 ? `${umkmList.length.toLocaleString('id-ID')} Unit` : '7.055.660 Unit'}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>
                Wilayah Sebaran
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                27 Kab / Kota
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '500', marginBottom: '6px' }}>
                Sektor Prioritas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                4 Sektor Utama
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Pencarian */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Jasa'].map((kat) => (
              <button
                key={kat}
                onClick={() => setFilterActive(kat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: filterActive === kat ? '700' : '500',
                  backgroundColor: filterActive === kat ? '#008848' : '#fff',
                  color: filterActive === kat ? '#fff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {kat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1', maxWidth: '580px' }}>
            <select
              value={selectedKabKota}
              onChange={(e) => setSelectedKabKota(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                backgroundColor: '#fff',
                color: '#334155',
                cursor: 'pointer',
                minWidth: '180px'
              }}
            >
              {KABUPATEN_KOTA_JABAR.map((kab) => (
                <option key={kab} value={kab}>{kab}</option>
              ))}
            </select>

            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari nama usaha atau produk..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Pemetaan Spasial & Hasil Pencarian */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '50px'
        }}>
          {/* Peta Interaktif Leaflet */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0F172A' }}>
                Pemetaan Spasial Komoditas
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                *Arahkan kursor ke titik untuk melihat keunggulan
              </div>
            </div>

            {/* Legenda Warna Sesuai Sektor */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '0.75rem',
              color: '#334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EAB308', display: 'inline-block' }}></span>
                <span><strong>Kuning:</strong> Aksesoris & Kriya</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }}></span>
                <span><strong>Hijau:</strong> Makanan & Minuman</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#9333EA', display: 'inline-block' }}></span>
                <span><strong>Ungu:</strong> Fashion & Batik</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7', display: 'inline-block' }}></span>
                <span><strong>Biru:</strong> Jasa, Mebel & Lainnya</span>
              </div>
            </div>

            <div style={{ height: '500px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <MapContainer 
                center={[-6.9175, 107.6191]} 
                zoom={8} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Seluruh Titik Koordinat UMKM */}
                {filteredUMKM
                  .filter((item) => item.latitude && item.longitude)
                  .map((item) => {
                    const markerColor = getMarkerColor(item.kategori);
                    const infoUnggulan = getKeunggulanText(item.kategori, item.produk_unggulan);

                    const lat = parseFloat(item.latitude);
                    const lng = parseFloat(item.longitude);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                      <CircleMarker
                        key={item.id}
                        center={[lat, lng]}
                        pathOptions={{
                          color: markerColor,
                          fillColor: markerColor,
                          fillOpacity: 0.82,
                          weight: 1.5
                        }}
                        radius={6}
                      >
                        {/* Hover Tooltip Ringkas & Menarik */}
                        <Tooltip direction="top" offset={[0, -6]} opacity={0.96}>
                          <div style={{ fontSize: '0.78rem', lineHeight: '1.4', maxWidth: '220px' }}>
                            <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
                              {item.nama_usaha}
                            </div>
                            <div style={{ color: markerColor, fontWeight: '700', fontSize: '0.73rem' }}>
                              ● Kategori: {item.kategori}
                            </div>
                            <div style={{ color: '#475569', marginTop: '3px', fontStyle: 'italic', fontSize: '0.72rem' }}>
                              ★ {infoUnggulan}
                            </div>
                          </div>
                        </Tooltip>

                        {/* Modal Pop-up Saat Titik Diklik */}
                        <Popup>
                          <div style={{ fontSize: '0.85rem' }}>
                            <h4 style={{ margin: '0 0 4px 0', color: '#164E43', fontSize: '0.92rem' }}>
                              {item.nama_usaha}
                            </h4>
                            <p style={{ margin: '0 0 6px 0', color: '#64748B', fontSize: '0.78rem' }}>
                              {item.alamat}
                            </p>
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: markerColor,
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}>
                              {item.kategori}
                            </span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
              </MapContainer>
            </div>
          </div>

          {/* Kolom Hasil Pencarian */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                Hasil Pencarian ({isFilterActive ? filteredUMKM.length : 0})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Terverifikasi</span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {!isFilterActive ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 16px', 
                  color: '#94A3B8', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Search size={28} color="#CBD5E1" />
                  <span>Ketik nama usaha di kolom pencarian untuk menampilkan data UMKM.</span>
                </div>
              ) : filteredUMKM.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 10px', color: '#94A3B8', fontSize: '0.85rem' }}>
                  Tidak ada data UMKM yang cocok dengan pencarian.
                </div>
              ) : (
                filteredUMKM.slice(0, 50).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${getMarkerColor(item.kategori)}`,
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: '#FAFAFA'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0F172A', marginBottom: '4px' }}>
                      {item.nama_usaha}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: getMarkerColor(item.kategori), fontWeight: '600', marginBottom: '4px' }}>
                      <Tag size={12} /> {item.kategori}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#64748B', marginBottom: '8px' }}>
                      <MapPin size={12} /> {item.kabupaten_kota}
                    </div>
                    <button
                      onClick={() => setSelectedUMKM(item)}
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #CBD5E1',
                        color: '#008848',
                        fontSize: '0.76rem',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Lihat Profil Lengkap
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Detail UMKM */}
        {selectedUMKM && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedUMKM(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'inline-block', backgroundColor: `${getMarkerColor(selectedUMKM.kategori)}20`, color: getMarkerColor(selectedUMKM.kategori), padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px' }}>
                {selectedUMKM.kategori}
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                {selectedUMKM.nama_usaha}
              </h3>

              <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {selectedUMKM.alamat || selectedUMKM.kabupaten_kota}
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  KEUNGGULAN PRODUK & KOMODITAS:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0F172A', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "{getKeunggulanText(selectedUMKM.kategori, selectedUMKM.produk_unggulan)}"
                </div>
              </div>

              <button
                onClick={() => setSelectedUMKM(null)}
                style={{
                  width: '100%',
                  backgroundColor: '#164E43',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Bagian Pelatihan Interaktif */}
        <section
          ref={pelatihanSectionRef}
          style={{
            marginBottom: '50px',
            overflow: 'hidden',
            padding: '10px 0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0F172A',
                margin: '0 0 6px',
                position: 'relative',
                display: 'inline-block'
              }}>
                Pelatihan
                <div style={{ width: '45px', height: '3px', backgroundColor: '#008848', marginTop: '4px', borderRadius: '2px' }}></div>
              </h2>
            </div>

            {/* Tombol Lihat Selengkapnya di Header Pelatihan */}
            <button
              onClick={handlePindahKePelatihan}
              style={{
                background: 'none',
                border: 'none',
                color: '#008848',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Lihat Selengkapnya <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '18px'
          }}>
            {DAFTAR_PELATIHAN.map((item, index) => {
              const isFromLeft = index < 2;
              const initialOffset = isFromLeft ? '-70px' : '70px';
              const transitionDelay = `${(index % 2) * 0.12}s`;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                    opacity: isPelatihanVisible ? 1 : 0,
                    transform: isPelatihanVisible ? 'translateX(0)' : `translateX(${initialOffset})`,
                    transition: `transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) ${transitionDelay}, opacity 0.75s ease ${transitionDelay}, box-shadow 0.2s ease`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 16px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#0F172A',
                        lineHeight: '1.4',
                        minHeight: '40px'
                      }}>
                        {item.title}
                      </h3>
                    </div>

                    {/* Tombol Selengkapnya di Tiap Kartu Pelatihan */}
                    <button
                      onClick={handlePindahKePelatihan}
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#0F4D3A',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0F4D3A';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                        e.currentTarget.style.color = '#0F4D3A';
                      }}
                    >
                      Selengkapnya
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Komunitas UMKM */}
        <section style={{
          backgroundColor: '#D99B26',
          borderRadius: '20px',
          padding: '40px',
          color: '#FFFFFF',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '30px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(217, 155, 38, 0.35)'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 12px', color: '#FFFFFF' }}>
              Bergabung ke Komunitas
            </h2>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0 0 24px',
              color: 'rgba(255,255,255,0.92)',
              maxWidth: '520px'
            }}>
              Terhubung dengan ribuan pelaku UMKM se-Jawa Barat. Berbagi pengalaman, tips bisnis, informasi pelatihan, dan peluang kolaborasi bersama komunitas yang suportif dan aktif.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} />
                <span>12.400+ anggota aktif dari seluruh Jawa Barat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={18} />
                <span>Sharing tips bisnis dan informasi peluang usaha</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} />
                <span>Info pelatihan dan event terbaru</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={18} />
                <span>Networking dan kolaborasi antar UMKM</span>
              </div>
            </div>

            <a
              href="https://www.facebook.com/waroenkUMKM"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#1E4A3B',
                color: '#FFFFFF',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14352a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1E4A3B')}
            >
              Gabung Sekarang
            </a>
          </div>

          <div style={{
            height: '270px',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            <img
              src="/src/assets/komunitas_umkm_jabar.jpg"
              alt="Foto Komunitas UMKM Jawa Barat"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
import { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, CheckCircle, ArrowRight, X, MapPin, Tag,
  ChevronLeft, ChevronRight, Users, MessageSquare, Calendar, Radio
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';

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
    image: '/src/assets/pelatihan1.jpeg'
  },
  {
    id: 2,
    title: 'Pelatihan Manajemen Keuangan Administrasi',
    image: '/src/assets/pelatihan2.jpg'
  },
  {
    id: 3,
    title: 'Pelatihan Legalitas dan Standarisasi Produk',
    image: '/src/assets/pelatihan3.jpg'
  },
  {
    id: 4,
    title: 'Pelatihan Inovasi dan Kualitas Produk',
    image: '/src/assets/pelatihan4.jpg'
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

// Pemetaan Warna Poligon Wilayah Sesuai Konfigurasi MapChart
const getWilayahMapChartColor = (rawName = '') => {
  const w = rawName.toLowerCase();

  // 1. #cc3333 -> Bandung Barat, Kota Bandung, Bandung
  if (w.includes('bandung')) return '#cc3333';

  // 2. #762a83 -> Bogor, Subang, Cirebon, Pangandaran
  if (w.includes('bogor') || w.includes('subang') || w.includes('cirebon') || w.includes('pangandaran')) {
    return '#762a83';
  }

  // 3. #74add1 -> Karawang, Sumedang
  if (w.includes('karawang') || w.includes('sumedang')) return '#74add1';

  // 4. #00441b -> Indramayu, Garut, Bekasi
  if (w.includes('indramayu') || w.includes('garut') || w.includes('bekasi')) return '#00441b';

  // 5. #b2df8a -> Purwakarta, Ciamis
  if (w.includes('purwakarta') || w.includes('ciamis')) return '#b2df8a';

  // 6. #800026 -> Cianjur, Majalengka, Banjar
  if (w.includes('cianjur') || w.includes('majalengka') || w.includes('banjar')) return '#800026';

  // 7. #ffffb3 -> Sukabumi, Waduk Cirata, Cimahi, Tasikmalaya, Depok
  if (w.includes('sukabumi') || w.includes('cirata') || w.includes('cimahi') || w.includes('tasikmalaya') || w.includes('depok')) {
    return '#ffffb3';
  }

  // 8. #ffff33 -> Kuningan
  if (w.includes('kuningan')) return '#ffff33';

  return '#E2E8F0';
};

function MapZoomListener({ onZoomChanged }) {
  const map = useMapEvents({
    zoomend: () => onZoomChanged(map.getZoom())
  });
  return null;
}

const getMarkerColor = (kategori) => {
  const kat = (kategori || '').toUpperCase();
  if (kat.includes('AKSESORIS') || kat.includes('CRAFT') || kat.includes('KRIYA') || kat.includes('KERAJINAN')) return '#EAB308';
  if (kat.includes('KULINER') || kat.includes('MAKANAN') || kat.includes('MINUMAN') || kat.includes('OBAT')) return '#16A34A';
  if (kat.includes('FASHION') || kat.includes('BATIK') || kat.includes('KONVEKSI') || kat.includes('BORDIR')) return '#9333EA';
  if (kat.includes('JASA') || kat.includes('AGRIBISNIS') || kat.includes('INDUSTRI') || kat.includes('MEBEL') || kat.includes('DEKORASI')) return '#0284C7';
  return '#164E43';
};

const getKeunggulanText = (kategori) => {
  const kat = (kategori || '').toUpperCase();
  if (kat.includes('AKSESORIS') || kat.includes('CRAFT') || kat.includes('KRIYA')) return 'Kriya anyaman bambu & aksesoris etnik kontemporer berdaya saing ekspor';
  if (kat.includes('KULINER') || kat.includes('MAKANAN') || kat.includes('MINUMAN')) return 'Cita rasa otentik khas Pasundan, higienis, dan tersertifikasi halal';
  if (kat.includes('FASHION') || kat.includes('BATIK')) return 'Motif pakem Parahyangan & jahitan garmen butik berstandar mutu tinggi';
  if (kat.includes('AGRIBISNIS')) return 'Hasil tani hortikultura segar dan bibit organik unggulan tanah Priangan';
  if (kat.includes('MEBEL')) return 'Mebel kayu jati solid berkonstruksi presisi dengan ornamen ukir khas';
  return 'Komoditas binaan terkurasi Dinas Koperasi & Usaha Kecil Jawa Barat';
};

export default function Dashboard({ onNavigasiPelatihan, setHalaman, user }) {
  const [umkmList, setUmkmList] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterActive, setFilterActive] = useState('Semua');
  const [selectedKabKota, setSelectedKabKota] = useState('Semua Wilayah');
  const [selectedUMKM, setSelectedUMKM] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(8);

  const [isPelatihanVisible, setIsPelatihanVisible] = useState(false);
  const pelatihanSectionRef = useRef(null);

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
        if (entry.isIntersecting) setIsPelatihanVisible(true);
      },
      { threshold: 0.25 }
    );
    if (pelatihanSectionRef.current) observer.observe(pelatihanSectionRef.current);
    return () => {
      if (pelatihanSectionRef.current) observer.unobserve(pelatihanSectionRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 1. Mengambil Batas Wilayah Poligon GeoJSON Jawa Barat
  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple/32-jawa-barat.geojson')
      .then((res) => {
        setGeoData(res.data);
      })
      .catch((err) => {
        console.error('Gagal memuat batas wilayah Jawa Barat:', err);
      });
  }, []);

  // 2. Mengambil Titik Data UMKM dari Database FastAPI
  const fetchUMKM = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/umkm');
      const responseData = res.data;
      const dataArray = Array.isArray(responseData)
        ? responseData
        : (responseData.data || responseData.items || []);
      setUmkmList(dataArray);
    } catch (err) {
      console.error('Gagal mengambil data dari API FastAPI:', err);
    }
  };

  useEffect(() => {
    fetchUMKM();
  }, []);

  // Filter Data UMKM
  const filteredUMKM = useMemo(() => {
    return umkmList.filter((item) => {
      const nama = (item.nama_usaha || '').toLowerCase();
      const kat = (item.kategori || '').toLowerCase();
      const kab = (item.kabupaten_kota || '').toLowerCase();
      const q = searchKeyword.toLowerCase().trim();

      const matchesSearch = q === '' || nama.includes(q) || kat.includes(q) || kab.includes(q);

      let matchesCategory = true;
      if (filterActive === 'Kuliner') matchesCategory = kat.includes('kuliner') || kat.includes('makanan') || kat.includes('minuman') || kat.includes('obat');
      else if (filterActive === 'Fashion') matchesCategory = kat.includes('fashion') || kat.includes('batik') || kat.includes('konveksi') || kat.includes('bordir');
      else if (filterActive === 'Kerajinan') matchesCategory = kat.includes('aksesoris') || kat.includes('craft') || kat.includes('kriya') || kat.includes('kerajinan');
      else if (filterActive === 'Jasa') matchesCategory = kat.includes('jasa') || kat.includes('agribisnis') || kat.includes('industri') || kat.includes('mebel') || kat.includes('dekorasi');

      const matchesKabKota =
        selectedKabKota === 'Semua Wilayah' ||
        kab.includes(selectedKabKota.toLowerCase());

      return matchesSearch && matchesCategory && matchesKabKota;
    });
  }, [umkmList, searchKeyword, filterActive, selectedKabKota]);

  // Agregasi Jumlah UMKM Per Kabupaten/Kota dari Database
  const totalUMKMPerDaerah = useMemo(() => {
    const counts = {};
    umkmList.forEach((item) => {
      const kab = (item.kabupaten_kota || '').trim().toUpperCase();
      if (kab) {
        counts[kab] = (counts[kab] || 0) + 1;
      }
    });
    return counts;
  }, [umkmList]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar setHalaman={setHalaman} user={user} />

      {/* Hero Carousel */}
      <section style={{ position: 'relative', width: '100%', height: '460px', overflow: 'hidden', marginBottom: '35px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
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
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,30,22,0.85) 0%, rgba(15,23,42,0.65) 55%, rgba(0,0,0,0.4) 100%)' }} />
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', width: '100%', padding: '0 6%', boxSizing: 'border-box' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                  <CheckCircle size={15} />
                  {slide.badge}
                </div>
                <h1 style={{ fontSize: '44px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px', maxWidth: '750px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  {slide.title}
                </h1>
                <p style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '620px', margin: '0 0 26px', color: 'rgba(255,255,255,0.9)' }}>
                  {slide.desc}
                </p>
                <button
                  onClick={handlePindahKePelatihan}
                  style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
                >
                  {slide.btnText}
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1))}
          style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1))}
          style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <ChevronRight size={22} />
        </button>
      </section>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: 'auto', padding: '0 20px 50px', boxSizing: 'border-box' }}>
        
        {/* Ringkasan Data */}
        <section style={{ marginBottom: '45px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Data Terkini</span>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>UMKM DI JAWA BARAT</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '1050px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '6px' }}>Total UMKM Terdata</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>
                {umkmList.length > 0 ? `${umkmList.length.toLocaleString('id-ID')} Unit` : 'Memuat Data...'}
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '6px' }}>Wilayah Sebaran</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>27 Kab / Kota</div>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '22px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '6px' }}>Sektor Prioritas</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>4 Sektor Utama</div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
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
                  color: filterActive === kat ? '#fff' : '#475569'
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
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', cursor: 'pointer', minWidth: '180px' }}
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
                style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Map Section & List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px', alignItems: 'start', marginBottom: '50px' }}>
          
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0F172A' }}>Pemetaan Spasial Komoditas</div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {zoomLevel < 9 ? '*Mode Poligon Tematik (Perbesar/zoom peta untuk melihat detail titik UMKM)' : '*Arahkan kursor ke titik UMKM'}
              </div>
            </div>

            {/* Legenda MapChart & Kategori Titik */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#334155' }}>
              {zoomLevel < 9 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>Zonasi MapChart:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#cc3333' }}></span> Bandung Raya</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#762a83' }}></span> Bogor & Cirebon</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#00441b' }}></span> Bekasi & Indramayu</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ffffb3', border: '1px solid #CBD5E1' }}></span> Sukabumi & Tasik</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#800026' }}></span> Cianjur & Majalengka</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EAB308' }}></span><span><strong>Kuning:</strong> Aksesoris & Kriya</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span><span><strong>Hijau:</strong> Makanan & Minuman</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#9333EA' }}></span><span><strong>Ungu:</strong> Fashion & Batik</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7' }}></span><span><strong>Biru:</strong> Jasa, Mebel & Lainnya</span></div>
                </>
              )}
            </div>

            <div style={{ height: '520px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <MapContainer center={[-6.9175, 107.6191]} zoom={8} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <MapZoomListener onZoomChanged={(z) => setZoomLevel(z)} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 1. SEBELUM ZOOM (zoom < 9): Poligon batas wilayah berlekuk asli sesuai MapChart */}
                {zoomLevel < 9 && geoData && (
                  <GeoJSON
                    key="jabar-geojson-polygons"
                    data={geoData}
                    style={(feature) => {
                      const nama = feature?.properties?.shapeName || feature?.properties?.KABKOT || feature?.properties?.name || '';
                      return {
                        fillColor: getWilayahMapChartColor(nama),
                        weight: 1.5,
                        opacity: 1,
                        color: '#1E293B',
                        fillOpacity: 0.82
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      const namaDaerah = (feature?.properties?.shapeName || feature?.properties?.KABKOT || feature?.properties?.name || 'Daerah Jawa Barat').toUpperCase();
                      const jumlahTerdata = totalUMKMPerDaerah[namaDaerah] || 0;

                      layer.bindTooltip(
                        `<div style="text-align: center; padding: 2px;">
                          <strong>${namaDaerah}</strong><br/>
                          <span style="color: #008848; font-weight: bold;">${jumlahTerdata} UMKM Terdata</span><br/>
                          <span style="font-size: 11px; color: #64748B;">Perbesar peta untuk melihat sebaran unit</span>
                        </div>`,
                        { sticky: true, direction: 'center' }
                      );
                    }}
                  />
                )}

                {/* 2. SETELAH ZOOM (zoom >= 9): Titik Komoditas dari database (Latitude & Longitude) */}
                {zoomLevel >= 9 && filteredUMKM.map((item) => {
                  const rawLat = item.latitude;
                  const rawLng = item.longitude;
                  if (!rawLat || !rawLng) return null;

                  const lat = parseFloat(String(rawLat).replace(',', '.').trim());
                  const lng = parseFloat(String(rawLng).replace(',', '.').trim());
                  if (isNaN(lat) || isNaN(lng)) return null;

                  const markerColor = getMarkerColor(item.kategori);

                  return (
                    <CircleMarker
                      key={item.id}
                      center={[lat, lng]}
                      pathOptions={{
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.85,
                        weight: 2
                      }}
                      radius={7}
                    >
                      <Tooltip direction="top" offset={[0, -6]} opacity={1} sticky={true}>
                        <div style={{ fontSize: '0.78rem', maxWidth: '220px' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>{item.nama_usaha}</div>
                          <div style={{ color: markerColor, fontWeight: '700' }}>● {item.kategori}</div>
                          <div style={{ color: '#475569' }}>📍 {item.kabupaten_kota}</div>
                        </div>
                      </Tooltip>

                      <Popup>
                        <div style={{ fontSize: '0.85rem' }}>
                          <h4 style={{ margin: '0 0 4px 0', color: '#164E43' }}>{item.nama_usaha}</h4>
                          <p style={{ margin: '0 0 6px 0', color: '#64748B', fontSize: '0.78rem' }}>{item.alamat || item.kabupaten_kota}</p>
                          <span style={{ display: 'inline-block', backgroundColor: markerColor, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700' }}>
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

          {/* Kolom Daftar UMKM */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', height: '630px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Daftar UMKM ({filteredUMKM.length})</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Terverifikasi</span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {filteredUMKM.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 10px', color: '#94A3B8', fontSize: '0.85rem' }}>
                  Tidak ada data UMKM yang cocok.
                </div>
              ) : (
                filteredUMKM.map((item) => (
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
                      style={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', color: '#008848', fontSize: '0.76rem', fontWeight: '600', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}
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
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative' }}>
              <button onClick={() => setSelectedUMKM(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
              <div style={{ display: 'inline-block', backgroundColor: `${getMarkerColor(selectedUMKM.kategori)}20`, color: getMarkerColor(selectedUMKM.kategori), padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px' }}>
                {selectedUMKM.kategori}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>{selectedUMKM.nama_usaha}</h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {selectedUMKM.alamat || selectedUMKM.kabupaten_kota}
              </p>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>KEUNGGULAN PRODUK:</div>
                <div style={{ fontSize: '0.85rem', color: '#0F172A', fontStyle: 'italic' }}>
                  "{getKeunggulanText(selectedUMKM.kategori)}"
                </div>
              </div>
              <button onClick={() => setSelectedUMKM(null)} style={{ width: '100%', backgroundColor: '#164E43', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Section Pelatihan */}
        <section ref={pelatihanSectionRef} style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Pelatihan</h2>
            <button onClick={handlePindahKePelatihan} style={{ background: 'none', border: 'none', color: '#008848', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Lihat Selengkapnya <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
            {DAFTAR_PELATIHAN.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>{item.title}</h3>
                  <button onClick={handlePindahKePelatihan} style={{ backgroundColor: '#F1F5F9', color: '#0F4D3A', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                    Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Komunitas */}
        <section style={{ backgroundColor: '#D99B26', borderRadius: '20px', padding: '40px', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 12px' }}>Bergabung ke Komunitas</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px', color: 'rgba(255,255,255,0.92)' }}>
              Terhubung dengan ribuan pelaku UMKM se-Jawa Barat. Berbagi pengalaman, tips bisnis, informasi pelatihan, dan peluang kolaborasi bersama komunitas yang aktif.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} /><span>12.400+ anggota aktif dari seluruh Jawa Barat</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={18} /><span>Sharing tips bisnis dan peluang usaha</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={18} /><span>Info pelatihan dan event terbaru</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Radio size={18} /><span>Networking dan kolaborasi antar UMKM</span></div>
            </div>
            <a href="https://www.facebook.com/waroenkUMKM" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#1E4A3B', color: '#FFFFFF', textDecoration: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>
              Gabung Sekarang
            </a>
          </div>
          <div style={{ height: '270px', borderRadius: '14px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)' }}>
            <img src="/src/assets/komunitas_umkm_jabar.jpg" alt="Komunitas UMKM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </section>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
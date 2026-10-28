import { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Popup, Pane, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, ArrowRight, X, MapPin, Tag, Users, MessageSquare, Calendar, Radio,
  Building2, Map, Layers
} from 'lucide-react';

import Navbar from '../component/navbar';
import Footer from '../component/footer';
import videoLanding from '../assets/landing.mp4';

const DAFTAR_PELATIHAN = [
  {
    id: 1,
    title: 'Pelatihan Digitalisasi dan Pemasaran Online',
    image: '/pelatihan1.jpeg'
  },
  {
    id: 2,
    title: 'Pelatihan Manajemen Keuangan Administrasi',
    image: '/pelatihan2.jpg'
  },
  {
    id: 3,
    title: 'Pelatihan Legalitas dan Standarisasi Produk',
    image: '/pelatihan3.jpg'
  },
  {
    id: 4,
    title: 'Pelatihan Inovasi dan Kualitas Produk',
    image: '/pelatihan4.jpg'
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

const namaWilayah = (f) => {
  const { NAME_2: n, TYPE_2: t } = f.properties || {};
  if (!n) return '';
  if (t === 'Kota' && !n.startsWith('Kota ')) return `Kota ${n}`;
  return t === 'Kabupaten' ? `Kabupaten ${n}` : n;
};

const bersihkanNamaWilayah = (str = '') => {
  return String(str)
    .toLowerCase()
    .replace(/kabupaten|kab\.|kota/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

// Per wilayah
const KELOMPOK_MAPCHART = [
  { warna: '#cc3333', wilayah: ['bandung'] },
  { warna: '#762a83', wilayah: ['bogor', 'subang', 'cirebon', 'pangandaran'] },
  { warna: '#74add1', wilayah: ['karawang', 'sumedang'] },
  { warna: '#255456', wilayah: ['indramayu', 'garut', 'bekasi'] },
  { warna: '#a6c6c7', wilayah: ['purwakarta', 'ciamis'] },
  { warna: '#800026', wilayah: ['cianjur', 'majalengka', 'banjar'] },
  { warna: '#ffffb3', wilayah: ['sukabumi', 'cimahi', 'tasikmalaya', 'depok'] },
  { warna: '#ffff33', wilayah: ['kuningan'] },
];

const getWarnaMapChart = (nama = '') => {
  const w = bersihkanNamaWilayah(nama);
  const g = KELOMPOK_MAPCHART.find((k) => k.wilayah.some((x) => w.includes(x)));
  return g ? g.warna : '#CFD8DC';
};

const WARNA_SEKTOR = {
  'Kuliner': '#255456',
  'Fashion': '#9333EA',
  'Kerajinan & Kriya': '#EAB308',
  'Agribisnis & Peternakan': '#15803D',
  'Jasa & Lainnya': '#0284C7'
};

const normalisasiKategori = (rawKategori = '') => {
  const kat = String(rawKategori).toUpperCase().trim();

  if (kat.includes('KULINER') || kat.includes('MAKANAN') || kat.includes('MINUMAN') || kat.includes('PANGAN') || kat.includes('SNACK') || kat.includes('KOPI') || kat.includes('OBAT')) {
    return 'Kuliner';
  }
  if (kat.includes('FASHION') || kat.includes('BATIK') || kat.includes('BORDIR') || kat.includes('KONVEKSI') || kat.includes('BUSANA') || kat.includes('PAKAIAN') || kat.includes('TEKSTIL')) {
    return 'Fashion';
  }
  if (kat.includes('AKSESORIS') || kat.includes('CRAFT') || kat.includes('KRIYA') || kat.includes('KERAJINAN') || kat.includes('ANYAMAN') || kat.includes('GERABAH')) {
    return 'Kerajinan & Kriya';
  }
  if (kat.includes('AGRIBISNIS') || kat.includes('PERTANIAN') || kat.includes('PETERNAKAN') || kat.includes('PERIKANAN') || kat.includes('BIBIT') || kat.includes('TANI')) {
    return 'Agribisnis & Peternakan';
  }
  return 'Jasa & Lainnya';
};

const getMarkerColor = (kategori) => {
  const sektor = normalisasiKategori(kategori);
  return WARNA_SEKTOR[sektor] || '#0284C7';
};

const getKeunggulanText = (dominan) => {
  switch (dominan) {
    case 'Kuliner':
      return 'Cita rasa otentik khas Pasundan, higienis, dan tersertifikasi halal';
    case 'Fashion':
      return 'Motif pakem Parahyangan & jahitan butik berstandar mutu tinggi';
    case 'Kerajinan & Kriya':
      return 'Kriya anyaman & aksesoris etnik kontemporer berdaya saing ekspor';
    case 'Agribisnis & Peternakan':
      return 'Hasil komoditas tani segar dan bibit unggulan tanah Priangan';
    default:
      return 'Komoditas binaan terkurasi Dinas Koperasi & Usaha Kecil Jawa Barat';
  }
};

const STYLE_BATAS_SAJA = { fill: false, weight: 0.7, opacity: 0.5, color: '#1E293B' };

function MapZoomListener({ onZoomChanged }) {
  const map = useMapEvents({
    zoomend: () => onZoomChanged(map.getZoom())
  });
  return null;
}

export default function Dashboard({ onNavigasiPelatihan, setHalaman, user }) {
  const [umkmList, setUmkmList] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterActive, setFilterActive] = useState('Semua');
  const [selectedKabKota, setSelectedKabKota] = useState('Semua Wilayah');
  const [selectedUMKM, setSelectedUMKM] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(8);

  const [isPelatihanVisible, setIsPelatihanVisible] = useState(false);
  const [isPelatihanHovered, setIsPelatihanHovered] = useState(false);
  const pelatihanSectionRef = useRef(null);
  const pelatihanTrackRef = useRef(null);

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
    if (!isPelatihanVisible || isPelatihanHovered) return undefined;

    const track = pelatihanTrackRef.current;
    if (!track) return undefined;

    let animationFrame;
    let previousTime;
    const scroll = (time) => {
      if (previousTime !== undefined) {
        track.scrollLeft += (time - previousTime) * 0.025;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0 && track.scrollLeft >= maxScroll) {
          track.scrollLeft = 0;
        }
      }
      previousTime = time;
      animationFrame = window.requestAnimationFrame(scroll);
    };

    animationFrame = window.requestAnimationFrame(scroll);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPelatihanVisible, isPelatihanHovered]);

  useEffect(() => {
    axios.get('/geo/jabar.json')
      .then((res) => {
        setGeoData({
          ...res.data,
          features: res.data.features.filter((f) => f.properties.TYPE_2 !== 'Water Body'),
        });
      })
      .catch((err) => console.error('Gagal memuat GeoJSON Jawa Barat:', err));
  }, []);

  const fetchUMKM = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://si-umkm-jabar.vercel.app';
      const res = await axios.get(`${API_BASE_URL}/api/v1/umkm`);
      const resData = res.data;
      const dataArray = Array.isArray(resData)
        ? resData
        : (resData.data || resData.items || resData.results || []);
      setUmkmList(dataArray);
    } catch (err) {
      console.error('Gagal mengambil data dari API FastAPI:', err);
    }
  };

  useEffect(() => {
    fetchUMKM();
  }, []);

  // Hitung per wilayah
  const dynamicDataWilayah = useMemo(() => {
    const peta = {};

    umkmList.forEach((item) => {
      const rawKab = item.kabupaten_kota || item.kabupaten || item.kota || item.wilayah || '';
      const key = bersihkanNamaWilayah(rawKab);
      if (!key) return;

      if (!peta[key]) {
        peta[key] = {
          total: 0,
          rincian: {
            'Kuliner': 0,
            'Fashion': 0,
            'Kerajinan & Kriya': 0,
            'Agribisnis & Peternakan': 0,
            'Jasa & Lainnya': 0
          }
        };
      }

      peta[key].total += 1;
      const sektor = normalisasiKategori(item.kategori || item.sektor || item.jenis_usaha || '');
      peta[key].rincian[sektor] = (peta[key].rincian[sektor] || 0) + 1;
    });

    Object.keys(peta).forEach((key) => {
      const r = peta[key].rincian;
      let sektorDominan = 'Belum Ada Data';
      let maxCount = 0;

      Object.entries(r).forEach(([sektor, count]) => {
        if (count > maxCount) {
          maxCount = count;
          sektorDominan = sektor;
        }
      });

      peta[key].dominan = maxCount > 0 ? sektorDominan : 'Belum Ada Data';
    });

    return peta;
  }, [umkmList]);

  // Style wilayah
  const styleWilayah = (feature) => ({
    weight: 0.8,
    opacity: 0.8,
    color: '#1E293B',
    fillColor: getWarnaMapChart(namaWilayah(feature)),
    fillOpacity: 0.55
  });

  // Hover
  const handleEachWilayah = (feature, layer) => {
    const nama = namaWilayah(feature);
    const key = bersihkanNamaWilayah(nama);
    const d = dynamicDataWilayah[key];

    if (!d || d.total === 0) {
      layer.bindTooltip(
        `<div style="max-width:220px;padding:4px;">
           <strong style="font-size:13px;color:#0F172A;">${nama}</strong><br/>
           <span style="font-size:11px;color:#64748B;">Belum ada UMKM terdaftar di database untuk wilayah ini.</span>
         </div>`,
        { sticky: true, direction: 'top' }
      );
    } else {
      const rincianHtml = Object.entries(d.rincian)
        .sort((a, b) => b[1] - a[1])
        .filter(([, count]) => count > 0)
        .map(([kat, jml]) => `${kat}: <b>${jml}</b>`)
        .join('<br/>');

      const warnaDominan = WARNA_SEKTOR[d.dominan] || '#255456';

      layer.bindTooltip(
        `<div style="max-width:240px;line-height:1.5;">
           <strong style="font-size:13px;color:#0F172A;">${nama}</strong><br/>
           <span style="color:${warnaDominan};font-weight:800;font-size:12px;">● Dominan: ${d.dominan}</span><br/>
           <span style="font-weight:700;color:#334155;">${d.total.toLocaleString('id-ID')} UMKM terdata di Database</span><br/>
           <div style="font-size:11px;color:#475569;margin:4px 0;padding:4px 0;border-top:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;">
             ${rincianHtml}
           </div>
           <span style="font-size:10.5px;color:#64748B;font-style:italic;">${getKeunggulanText(d.dominan)}</span>
         </div>`,
        { sticky: true, direction: 'top' }
      );
    }

    layer.on('tooltipopen', () => {
      if (layer._map && layer._map.getZoom() >= 9) layer.closeTooltip();
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 2.2, fillOpacity: 0.85 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(styleWilayah(feature));
      },
    });
  };

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
      else if (filterActive === 'Agribisnis') matchesCategory = kat.includes('agribisnis') || kat.includes('tani') || kat.includes('ternak');
      else if (filterActive === 'Jasa') matchesCategory = kat.includes('jasa') || kat.includes('industri') || kat.includes('mebel') || kat.includes('dekorasi');

      const targetWilayah = bersihkanNamaWilayah(selectedKabKota);
      const dataWilayah = bersihkanNamaWilayah(kab);
      const matchesKabKota =
        selectedKabKota === 'Semua Wilayah' ||
        dataWilayah.includes(targetWilayah) ||
        targetWilayah.includes(dataWilayah);

      return matchesSearch && matchesCategory && matchesKabKota;
    });
  }, [umkmList, searchKeyword, filterActive, selectedKabKota]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Animasi card */}
      <style>{`
        .split-card-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .split-card {
          position: relative;
          cursor: pointer;
          flex: 1 1 300px;
          height: 220px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .split-card .face {
          width: 100%;
          height: 180px;
          transition: 0.5s;
          border-radius: 16px;
        }

        .split-card .face.face1 {
          position: relative;
          background: #1B4143;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
          transform: translateY(60px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .split-card:hover .face.face1 {
          background: #008848;
          transform: translateY(0);
        }

        .split-card .face.face1 .content {
          opacity: 0.95;
          transition: 0.5s;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }

        .split-card:hover .face.face1 .content {
          opacity: 1;
        }

        .split-card .face.face1 .icon-box {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          margin-bottom: 8px;
          transition: 0.5s;
        }

        .split-card:hover .face.face1 .icon-box {
          transform: scale(1.1);
          background: #FFFFFF;
          color: #008848;
        }

        .split-card .face.face1 h3 {
          margin: 4px 0 2px;
          padding: 0;
          color: #FFFFFF;
          text-align: center;
          font-size: 1.35rem;
          font-weight: 800;
        }

        .split-card .face.face1 span {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .split-card .face.face2 {
          position: absolute;
          background: #FFFFFF;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
          transform: translateY(60px);
          z-index: 1;
        }

        .split-card:hover .face.face2 {
          transform: translateY(120px);
        }

        .split-card .face.face2 .content {
          text-align: center;
        }

        .split-card .face.face2 .content p {
          margin: 0 0 10px;
          padding: 0;
          font-size: 0.82rem;
          color: #475569;
          line-height: 1.45;
        }

        .split-card .face.face2 .content a {
          margin: 0;
          display: inline-block;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 5px 12px;
          border: 1px solid #1B4143;
          border-radius: 6px;
          color: #1B4143;
          transition: 0.3s;
        }

        .split-card .face.face2 .content a:hover {
          background: #1B4143;
          color: #FFFFFF;
        }

        .jitter-filter-bar {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .jitter-pill-btn {
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .jitter-pill-btn:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .jitter-input-control:focus {
          border-color: #008848 !important;
          box-shadow: 0 0 0 3px rgba(0, 136, 72, 0.14);
          outline: none;
        }
      `}</style>

      <Navbar setHalaman={setHalaman} user={user} />

      {/* Hero Video */}
      <section style={{ position: 'relative', width: '100%', height: 'calc(100vh - 1cm + 48px)', margin: '-48px 0 35px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src={videoLanding} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(27, 65, 67, 0.88) 0%, rgba(15,23,42,0.65) 55%, rgba(0,0,0,0.4) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', width: '100%', height: '100%', margin: '0 auto', padding: '0 6%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#FFFFFF' }}>
          <h1 style={{ fontSize: '44px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px', maxWidth: '750px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            SI-UMKM Jawa Barat
          </h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '620px', margin: '0 0 26px', color: 'rgba(255,255,255,0.9)' }}>
            Sistem Informasi & Integrasi Layanan UMKM Jawa Barat. Menghubungkan potensi UMKM dengan fasilitasi legalitas dan investasi digital.
          </p>
          <button
            onClick={handlePindahKePelatihan}
            style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(217,119,6,0.35)', width: 'fit-content' }}
          >
            Ajukan Layanan Mandiri
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: 'auto', padding: '0 20px 50px', boxSizing: 'border-box' }}>
        
        <section style={{ marginBottom: '90px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Data Terkini Database</span>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>UMKM DI JAWA BARAT</h2>
          </div>

          <div className="split-card-container">
            {/* Card 1: Total UMKM */}
            <div className="split-card">
              <div className="face face1">
                <div className="content">
                  <div className="icon-box">
                    <Building2 size={26} />
                  </div>
                  <h3>{umkmList.length > 0 ? `${umkmList.length.toLocaleString('id-ID')} Unit` : 'Memuat...'}</h3>
                  <span>Total UMKM Terdata</span>
                </div>
              </div>
              <div className="face face2">
                <div className="content">
                  <p>Jumlah unit usaha binaan yang terdaftar dan terverifikasi secara resmi di basis data SI-UMKM Jabar.</p>
                  <a href="#peta-section">Lihat Persebaran</a>
                </div>
              </div>
            </div>

            {/* Card 2: Wilayah Terjangkau */}
            <div className="split-card">
              <div className="face face1">
                <div className="content">
                  <div className="icon-box">
                    <Map size={26} />
                  </div>
                  <h3>{umkmList.length > 0 ? `${new Set(umkmList.map(u => bersihkanNamaWilayah(u.kabupaten_kota))).size} Kab/Kota` : '27 Kab/Kota'}</h3>
                  <span>Wilayah Terjangkau</span>
                </div>
              </div>
              <div className="face face2">
                <div className="content">
                  <p>Cakupan spasial komoditas pelaku usaha mikro di seluruh kabupaten dan kota se-Jawa Barat.</p>
                  <a href="#peta-section">Eksplorasi Wilayah</a>
                </div>
              </div>
            </div>

            {/* Card 3: Sektor Terintegrasi */}
            <div className="split-card">
              <div className="face face1">
                <div className="content">
                  <div className="icon-box">
                    <Layers size={26} />
                  </div>
                  <h3>5 Sektor Utama</h3>
                  <span>Sektor Terintegrasi</span>
                </div>
              </div>
              <div className="face face2">
                <div className="content">
                  <p>Mencakup komoditas Kuliner, Fashion, Kriya & Kerajinan, Agribisnis, serta Jasa & Mebel.</p>
                  <a href="#peta-section">Filter Komoditas</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div id="peta-section" className="jitter-filter-bar" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Agribisnis', 'Jasa'].map((kat) => (
              <button
                key={kat}
                onClick={() => setFilterActive(kat)}
                className="jitter-pill-btn"
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: filterActive === kat ? '1px solid #008848' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: filterActive === kat ? '700' : '500',
                  backgroundColor: filterActive === kat ? '#008848' : '#FFFFFF',
                  color: filterActive === kat ? '#FFFFFF' : '#475569',
                  boxShadow: filterActive === kat ? '0 4px 12px rgba(0, 136, 72, 0.28)' : 'none'
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
              className="jitter-input-control"
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                cursor: 'pointer',
                minWidth: '180px',
                backgroundColor: '#F8FAFC',
                color: '#1E293B'
              }}
            >
              {KABUPATEN_KOTA_JABAR.map((kab) => (
                <option key={kab} value={kab}>{kab}</option>
              ))}
            </select>

            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari nama usaha atau produk..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="jitter-input-control"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A'
                }}
              />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px', alignItems: 'start', marginBottom: '50px' }}>
          
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0F172A' }}>Pemetaan Spasial Komoditas</div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {zoomLevel < 9 ? '*Arahkan kursor ke titik UMKM' : '*Klik pada titik UMKM untuk melihat detail'}
              </div>
            </div>

            {/* Legenda Wilayah */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#334155' }}>
              {zoomLevel < 9 && KELOMPOK_MAPCHART.map((k) => (
                <div key={k.warna} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: k.warna, border: '1px solid #1E293B' }}></span>
                  <span style={{ textTransform: 'capitalize' }}>{k.wilayah.join(', ')}</span>
                </div>
              ))}
              {zoomLevel >= 9 && <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: WARNA_SEKTOR['Kerajinan & Kriya'] }}></span><span><strong>Kuning:</strong> Kriya & Aksesoris</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: WARNA_SEKTOR['Kuliner'] }}></span><span><strong>Hijau Tua:</strong> Kuliner</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: WARNA_SEKTOR['Fashion'] }}></span><span><strong>Ungu:</strong> Fashion & Batik</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: WARNA_SEKTOR['Agribisnis & Peternakan'] }}></span><span><strong>Hijau:</strong> Agribisnis</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: WARNA_SEKTOR['Jasa & Lainnya'] }}></span><span><strong>Biru:</strong> Jasa & Mebel</span></div>
              </>}
            </div>

            <div style={{ height: '520px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
              <MapContainer center={[-6.9175, 107.6191]} zoom={8} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <MapZoomListener onZoomChanged={(z) => setZoomLevel(z)} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {geoData && (
                  <Pane name="wilayah" style={{ zIndex: 350 }}>
                  {zoomLevel < 9 ? (
                    <GeoJSON
                      key={`wilayah-berwarna-${umkmList.length}`}
                      pane="wilayah"
                      data={geoData}
                      style={styleWilayah}
                      onEachFeature={handleEachWilayah}
                    />
                  ) : (
                    <GeoJSON
                      key="wilayah-batas"
                      pane="wilayah"
                      data={geoData}
                      style={STYLE_BATAS_SAJA}
                      interactive={false}
                    />
                  )}
                  </Pane>
                )}

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
                          <h4 style={{ margin: '0 0 4px 0', color: '#1B4143' }}>{item.nama_usaha}</h4>
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
                      style={{ backgroundColor: '#fff', border: '1px solid #CBD5E1', color: '#1B4143', fontSize: '0.76rem', fontWeight: '600', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}
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
                  "{getKeunggulanText(normalisasiKategori(selectedUMKM.kategori))}"
                </div>
              </div>
              <button onClick={() => setSelectedUMKM(null)} style={{ width: '100%', backgroundColor: '#1B4143', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Section Pelatihan */}
        <section ref={pelatihanSectionRef} style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Pelatihan</h2>
            <button onClick={handlePindahKePelatihan} style={{ background: 'none', border: 'none', color: '#1B4143', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Lihat Selengkapnya <ArrowRight size={16} />
            </button>
          </div>

          <div
            ref={pelatihanTrackRef}
            onMouseEnter={() => setIsPelatihanHovered(true)}
            onMouseLeave={() => setIsPelatihanHovered(false)}
            onTouchStart={() => setIsPelatihanHovered(true)}
            onTouchEnd={() => setIsPelatihanHovered(false)}
            style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#1B4143 #E2E8F0' }}
          >
            <div style={{ display: 'flex', gap: '18px', width: 'max-content', padding: '8px 2px 16px 2px', boxSizing: 'border-box' }}>
              {DAFTAR_PELATIHAN.map((item) => (
                <div
                  key={item.id}
                  style={{ flex: '0 0 min(280px, 82vw)', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s ease, box-shadow 0.25s ease', transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 24px rgba(27,65,67,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.06)';
                  }}
                >
                  <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>{item.title}</h3>
                    <button
                      onClick={handlePindahKePelatihan}
                      style={{ backgroundColor: '#F1F5F9', color: '#1B4143', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                    >
                      Selengkapnya
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Komunitas */}
        <section style={{ backgroundColor: 'rgba(217,155,38,0.82)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 12px 32px rgba(27,65,67,0.18)', borderRadius: '20px', padding: '40px', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1B4143', margin: '0 0 12px' }}>Bergabung ke Komunitas</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px', color: 'rgba(255,255,255,0.92)' }}>
              Terhubung dengan ribuan pelaku UMKM se-Jawa Barat. Berbagi pengalaman, tips bisnis, informasi pelatihan, dan peluang kolaborasi bersama komunitas yang aktif.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={18} /><span>12.000+ anggota aktif dari seluruh Jawa Barat</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={18} /><span>Sharing tips bisnis dan peluang usaha</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={18} /><span>Info pelatihan dan event terbaru</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Radio size={18} /><span>Networking dan kolaborasi antar UMKM</span></div>
            </div>
            <a
              href="https://www.facebook.com/waroenkUMKM"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1B4143';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(27,65,67,0.45)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              style={{ backgroundColor: 'rgba(27,65,67,0.45)', color: '#FFFFFF', textDecoration: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', transition: 'background-color 0.25s ease, color 0.25s ease' }}
            >
              Gabung Sekarang
            </a>
          </div>
          <div style={{ height: '270px', borderRadius: '14px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)' }}>
            <img src="/komunitas_umkm_jabar.jpg" alt="Komunitas UMKM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </section>

      </main>

      <Footer setHalaman={setHalaman} />
    </div>
  );
}
// Data contoh. Nanti ganti dengan axios.get ke endpoint /api/v1/admin/...
const DOK = [['KTP Pemilik Usaha', 'ktp.pdf · 1,2 MB'], ['Kartu Keluarga', 'kk.pdf · 1,0 MB'], ['NIB', 'nib.pdf · 0,9 MB'], ['Proposal Usaha', 'proposal.pdf · 4,8 MB']];
const mk = (id, usaha, pemohon, kategori, dana, tanggal, status, tujuan) => ({
  id, usaha, pemohon, kategori, dana, tanggal, status, tujuan, dokumen: DOK, program: 'Bantuan Modal Usaha & Alat Produksi',
  nik: '3273260904870002', email: pemohon.toLowerCase().replace(' ', '.') + '@gmail.com', wa: '0812-2345-6789',
  alamat: 'Jl. Contoh No. 14, Kota Bandung, Jawa Barat',
});

export const ringkasan = { bantuan: 128, legalitas: 94, tindak: 51 };

export const bantuan = [
  mk('BNT-2025-0142', 'Kedai Rasa Bandung', 'Budi Santoso', 'Kuliner', 15000000, '24 Okt 2025', 'Menunggu Verifikasi', 'Pembelian mesin pengemas vakum dan tambahan stok bahan baku untuk memenuhi pesanan reseller.'),
  mk('BNT-2025-0139', 'Tenun Garut Asli', 'Siti Nurhaliza', 'Fashion', 30000000, '23 Okt 2025', 'Diproses', 'Penambahan alat tenun dan pelatihan penenun baru.'),
  mk('BNT-2025-0131', 'Keripik Mangga Cirebon', 'Dedi Suherman', 'Kuliner', 12000000, '22 Okt 2025', 'Perlu Perbaikan', 'Perbaikan kemasan dan pembelian mesin perajang.'),
  mk('BNT-2025-0120', 'Sepatu Kulit Cibaduyut', 'Rian Pratama', 'Kerajinan', 45000000, '20 Okt 2025', 'Disetujui', 'Ekspansi workshop produksi.'),
  mk('BNT-2025-0111', 'Kopi Lembang Rasa', 'Cecep Hendrawan', 'Kuliner', 20000000, '18 Okt 2025', 'Ditolak', 'Renovasi kedai dan alat seduh.'),
];

export const antrean = [
  { id: 1, judul: 'Verifikasi Dokumen Bantuan', usaha: 'Kedai Rasa Bandung', waktu: 'Baru', isi: 'Proposal kelayakan & data KTP penanggung jawab belum divalidasi oleh verifikator.', ke: 'bantuan', ref: 'BNT-2025-0142' },
  { id: 2, judul: 'Pemeriksaan Berkas Legalitas NIB', usaha: 'Tenun Garut Asli', waktu: '15m lalu', isi: 'Surat Keterangan Usaha (SKU) tingkat desa baru diunggah oleh pemohon.', ke: 'legalitas', ref: '#LGL-2025-0889' },
  { id: 3, judul: 'Review Revisi Berkas Pemohon', usaha: 'Keripik Mangga Cirebon', waktu: '1j lalu', isi: 'Perbaikan Kartu Keluarga dan Surat Domisili usaha telah diperbarui.', ke: 'bantuan', ref: 'BNT-2025-0131' },
  { id: 4, judul: 'Persetujuan Akhir Bantuan Dana', usaha: 'Sepatu Kulit Cibaduyut', waktu: '3j lalu', isi: 'Lolos verifikasi lapangan, menunggu surat penetapan rekomendasi dinas.', ke: 'bantuan', ref: 'BNT-2025-0120' },
];

export const legalitas = [
  { id: '#LGL-2025-0891', usaha: 'Kedai Rasa Bandung', pemilik: 'Budi Santoso', jenis: 'Halal (SEHATI)', tanggal: '24 Okt 2025', status: 'Menunggu Verifikasi', tahap: 2 },
  { id: '#LGL-2025-0889', usaha: 'Tenun Garut Asli', pemilik: 'Siti Nurhaliza', jenis: 'NIB OSS-RBA', tanggal: '24 Okt 2025', status: 'Diproses', tahap: 2 },
  { id: '#LGL-2025-0865', usaha: 'Pempek Wangi', pemilik: 'Dedan Suherman', jenis: 'PIRT', tanggal: '23 Okt 2025', status: 'Diproses', tahap: 3 },
  { id: '#LGL-2025-0852', usaha: 'Batik Mega Cirebon', pemilik: 'Risa Kusumawati', jenis: 'Sertifikasi Halal', tanggal: '22 Okt 2025', status: 'Selesai', tahap: 4 },
  { id: '#LGL-2025-0840', usaha: 'Kerupuk Sukabumi', pemilik: 'Ahmad Fauzi', jenis: 'PIRT', tanggal: '21 Okt 2025', status: 'Selesai', tahap: 4 },
];
export const distribusi = [['Halal (SEHATI)', 48], ['NIB Usaha Mikro', 26], ['PIRT Pangan', 14], ['HAKI Merek', 6]];

export const akun = [
  { id: 1, nama: 'Budi Santoso', email: 'budi.santoso@gmail.com', telp: '0812-2345-6789', role: 'UMKM', instansi: 'Kedai Rasa Bandung' },
  { id: 2, nama: 'Rani Septiani, M.M.', email: 'rani.septiani@dokopukm.jabar.go.id', telp: '0813-5890-1122', role: 'Pendamping', instansi: 'Instruktur Sertifikasi Halal' },
  { id: 3, nama: 'Rian Pratama', email: 'rian.admin@jabarprov.go.id', telp: '0811-2099-445', role: 'Admin Dinas', instansi: 'Dinkop UKM Jabar' },
  { id: 4, nama: 'Siti Nurhaliza', email: 'siti.tenungarut@gmail.com', telp: '0821-1456-7890', role: 'UMKM', instansi: 'Tenun Garut Asli' },
  { id: 5, nama: 'Cecep Hendrawan', email: 'cecep.hendra@gmail.com', telp: '0857-9912-3456', role: 'UMKM', instansi: 'Kopi Lembang Rasa' },
];
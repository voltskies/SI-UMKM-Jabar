import random
from database import SessionLocal
import models

db = SessionLocal()

# Titik koordinat pusat Kabupaten & Kota di Jawa Barat
KOORDINAT_WILAYAH = {
    "KABUPATEN BOGOR": (-6.5518, 106.6291),
    "KOTA BOGOR": (-6.5971, 106.8060),
    "KABUPATEN SUKABUMI": (-6.9833, 106.7167),
    "KOTA SUKABUMI": (-6.9277, 106.9300),
    "KABUPATEN CIANJUR": (-6.8174, 107.1378),
    "KABUPATEN BANDUNG": (-7.0252, 107.5198),
    "KOTA BANDUNG": (-6.9175, 107.6191),
    "KABUPATEN BANDUNG BARAT": (-6.8436, 107.5029),
    "KOTA CIMAHI": (-6.8722, 107.5420),
    "KABUPATEN GARUT": (-7.2278, 107.9086),
    "KABUPATEN TASIKMALAYA": (-7.3582, 108.1128),
    "KOTA TASIKMALAYA": (-7.3274, 108.2207),
    "KABUPATEN CIAMIS": (-7.3256, 108.3533),
    "KOTA BANJAR": (-7.3689, 108.5332),
    "KABUPATEN PANGANDARAN": (-7.6833, 108.4833),
    "KABUPATEN KUNINGAN": (-6.9806, 108.4842),
    "KABUPATEN CIREBON": (-6.7588, 108.4800),
    "KOTA CIREBON": (-6.7320, 108.5523),
    "KABUPATEN MAJALENGKA": (-6.8361, 108.2278),
    "KABUPATEN SUMEDANG": (-6.8586, 107.9269),
    "KABUPATEN INDRAMAYU": (-6.3264, 108.3200),
    "KABUPATEN SUBANG": (-6.5716, 107.7587),
    "KABUPATEN PURWAKARTA": (-6.5569, 107.4433),
    "KABUPATEN KARAWANG": (-6.3056, 107.2894),
    "KABUPATEN BEKASI": (-6.2416, 107.1489),
    "KOTA BEKASI": (-6.2383, 106.9756),
    "KOTA DEPOK": (-6.4025, 106.7942),
}

# Keunggulan spesifik sesuai jenis komoditas
DATA_KEUNGGULAN = {
    "KULINER": "Cita rasa otentik khas Sunda dan telah terverifikasi halal",
    "MAKANAN": "Olahan camilan renyah higienis tanpa bahan pengawet",
    "MINUMAN": "Seduhan kopi robusta/arabika priangan dan olahan herbal alami",
    "FASHION": "Jahitan rapi berstandar butik dengan bahan adem berkualitas ekspor",
    "BATIK": "Motif pakem khas Parahyangan menggunakan pewarna ramah lingkungan",
    "KONVEKSI": "Kapasitas produksi busana partai besar dengan pengerjaan cepat",
    "CRAFT": "Kerajinan tangan dari anyaman serat alam bambu dan mendong",
    "AKSESORIS": "Sentuhan aksesoris handmade bernuansa etnik kontemporer",
    "AGRIBISNIS": "Hasil tani hortikultura segar dan bibit perkebunan unggul",
    "MEBEL": "Konstruksi kayu solid kokoh dengan ukiran bernilai seni tinggi",
    "JASA": "Layanan servis profesional, cepat, dan bergaransi lokal",
    "OBAT-OBATAN": "Racikan herbal jamu tradisional penambah imunitas berizin edar",
    "DEKORASI": "Dekorasi interior estetis berbahan daur ulang dan ramah lingkungan",
    "INDUSTRI": "Produk manufaktur skala rumahan dengan standardisasi mutu"
}

def seed_data():
    daftar_umkm = db.query(models.UMKM).all()

    if not daftar_umkm:
        print("Tabel UMKM masih kosong. Silakan import data dasar terlebih dahulu.")
        return

    print(f"Sedang memperbarui koordinat & data unggulan untuk {len(daftar_umkm)} data UMKM...")

    for item in daftar_umkm:
        wilayah_str = (item.kabupaten_kota or "").strip().upper()
        kategori_str = (item.kategori or "").strip().upper()

        # 1. Menentukan koordinat dasar
        base_coord = None
        for nama_wilayah, titik in KOORDINAT_WILAYAH.items():
            if nama_wilayah in wilayah_str:
                base_coord = titik
                break

        if not base_coord:
            base_coord = (-6.9175, 107.6191)  # Koordinat default Jawa Barat (Bandung)

        # Beri sebaran acak radius ~3-5 km agar marker tidak bertumpuk di 1 titik
        lat_offset = random.uniform(-0.035, 0.035)
        lng_offset = random.uniform(-0.035, 0.035)

        item.latitude = str(round(base_coord[0] + lat_offset, 6))
        item.longitude = str(round(base_coord[1] + lng_offset, 6))

        # 2. Menentukan deskripsi produk unggulan untuk fitur hover
        keunggulan = DATA_KEUNGGULAN.get(kategori_str, "Komoditas binaan terkurasi Dinas KUK Jawa Barat")
        item.produk_unggulan = keunggulan

    db.commit()
    print("Pembaruan selesai! Koordinat dan produk unggulan berhasil disimpan ke database.")

if __name__ == "__main__":
    seed_data()
    db.close()
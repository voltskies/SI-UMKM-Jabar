import os
import pandas as pd
from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

def run_import():
    csv_file = "data-kategori_UMKM.csv"

    if not os.path.exists(csv_file):
        print(f"[ERROR] File '{csv_file}' tidak ditemukan di folder Backend!")
        return

    db = SessionLocal()

    try:
        # Baca CSV
        df = pd.read_csv(csv_file)
        df.columns = [c.lower().strip() for c in df.columns]

        print("INFORMASI DATASET")
        print("Kolom terdeteksi:", df.columns.tolist())
        print(f"Total baris ditemukan: {len(df)}")
        print(df.head(2))

        db.query(models.UMKM).delete()

        entries = []
        for _, row in df.iterrows():
            kab_kota = (
                row.get("nama_kabupaten_kota")
                or row.get("kabupaten_kota")
                or "Jawa Barat"
            )

            kategori = (
                row.get("jenis_usaha")
                or row.get("kategori_usaha")
                or "Umum"
            )

            umkm_entry = models.UMKM(
                nama_usaha=f"UMKM {kategori} {kab_kota}",
                kategori=str(kategori).strip(),
                kabupaten_kota=str(kab_kota).strip(),
                alamat=f"Sentra Usaha {kab_kota}, Jawa Barat",
                latitude=None,
                longitude=None
            )
            entries.append(umkm_entry)

        db.bulk_save_objects(entries)
        db.commit()

        print("=" * 35)
        print(f"[SUKSES] Berhasil memasukkan {len(entries)} data UMKM ke MySQL!")
        print("=" * 35)

    except Exception as e:
        db.rollback()
        print(f"\n[GAGAL] Terjadi error saat import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_import()
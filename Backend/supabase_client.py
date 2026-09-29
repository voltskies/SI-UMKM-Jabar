import os
import time
from fastapi import UploadFile, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "umkm-files")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL dan SUPABASE_KEY belum terpasang di file .env!")

# Inisialisasi koneksi ke Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Tipe file yang diizinkan (PDF, PNG, JPG/JPEG)
ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"]

async def upload_file_to_supabase(file: UploadFile, folder: str) -> str:
    """
    Fungsi untuk mengunggah file (PDF, PNG, JPG) ke bucket Supabase.
    - folder: 'pelatihan' atau 'sertifikasi'
    - return: public URL file yang tersimpan
    """
    # 1. Validasi format file
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format file tidak didukung! Hanya diperbolehkan file PDF, PNG, atau JPG."
        )

    # 2. Baca isi file & validasi batas ukuran (maksimal 5 MB)
    contents = await file.read()
    max_size = 5 * 1024 * 1024  # 5 MB
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400, 
            detail="Ukuran file terlalu besar! Maksimal 5 MB."
        )

    # 3. Format nama file agar unik dan aman (waktu_namafile)
    timestamp = int(time.time())
    clean_name = file.filename.replace(" ", "_")
    file_path = f"{folder}/{timestamp}_{clean_name}"

    # 4. Upload ke Storage Supabase
    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengunggah file ke Supabase Storage: {str(e)}"
        )

    # 5. Ambil dan kembalikan URL publik file
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    return public_url
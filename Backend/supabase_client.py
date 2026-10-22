import os
import time
from fastapi import UploadFile, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "umkm-files")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL dan SUPABASE_KEY belum terpasang di file .env!")

# Inisialisasi koneksi ke Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

async def upload_file_to_supabase(file: UploadFile, folder: str = "berkas") -> str:
    """
    Fungsi untuk memvalidasi dan mengunggah berkas ke Supabase Storage.
    - file: Objek UploadFile dari FastAPI
    - folder: Folder tujuan (misal: 'pelatihan', 'sertifikasi', 'bantuan')
    - return: Public URL file yang tersimpan
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File berkas tidak boleh kosong."
        )

    # 1. Validasi format berkas
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format file tidak didukung! Hanya diperbolehkan berkas PDF, PNG, atau JPG."
        )

    # 2. Baca isi berkas & validasi batas ukuran (Maksimal 5 MB)
    contents = await file.read()
    max_size = 5 * 1024 * 1024  # 5 MB
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400, 
            detail="Ukuran file terlalu besar! Maksimal ukuran file adalah 5 MB."
        )

    # 3. Format penamaan berkas agar unik
    timestamp = int(time.time())
    file_ext = os.path.splitext(file.filename)[1].lower()
    clean_base_name = os.path.splitext(os.path.basename(file.filename))[0].replace(" ", "_")
    file_path = f"{folder}/{timestamp}_{clean_base_name}{file_ext}"

    # 4. Upload berkas ke Supabase Storage
    try:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=contents,
            file_options={"content-type": content_type}
        )
    except Exception as e:
        print(f"[SUPABASE UPLOAD ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengunggah file ke Supabase Storage: {str(e)}"
        )

    # 5. Dapatkan dan kembalikan URL publik
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    return public_url
import os
import re
import uuid
from typing import Optional

import bcrypt
from fastapi import FastAPI, Depends, Query, Form, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from supabase_client import upload_file_to_supabase

# 1. Konfigurasi Hashing Password Langsung via pustaka bcrypt
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:71]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:71]
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

# Membuat tabel database otomatis jika belum ada
models.Base.metadata.create_all(bind=engine)

# Metadata Kategori Swagger Docs
tags_metadata = [
    {"name": "Umum", "description": "Endpoint autentikasi akun dan status server API SI-UMKM Jabar."},
    {"name": "Pelaku UMKM", "description": "Layanan direktori UMKM, pendaftaran pelatihan, permohonan bantuan, dan sertifikasi."},
    {"name": "Pelatihan", "description": "Layanan khusus katalog dan pendaftaran pelatihan bersertifikat."},
    {"name": "Sertifikasi", "description": "Layanan pengajuan dan upload berkas sertifikasi legalitas."},
    {"name": "Admin Dinas", "description": "Panel dinas untuk pemantauan dan verifikasi berkas."},
]

app = FastAPI(
    title="SI-UMKM Jabar API",
    description="Backend API untuk Platform SI-UMKM Jawa Barat",
    version="1.0.0",
    openapi_tags=tags_metadata
)

# CORS TERBUKA PENUH (Mengatasi masalah origin localhost vs 127.0.0.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SKEMA REQUEST PYDANTIC
class RegisterUserRequest(BaseModel):
    nik: str
    nama_lengkap: str
    email: str
    nomor_whatsapp: str
    password: str

class LoginUserRequest(BaseModel):
    email: str
    password: str

class VerifikasiRequest(BaseModel):
    status: str
    catatan_admin: Optional[str] = None


# ==============================================================================
# 1. KELOMPOK: UMUM & AUTENTIKASI
# ==============================================================================

@app.get("/", tags=["Umum"], summary="Cek Kesiapan Server API")
def read_root():
    return {"status": "success", "message": "API SI-UMKM Jabar siap digunakan!"}


@app.post("/api/v1/auth/register", tags=["Umum"], status_code=status.HTTP_201_CREATED, summary="Registrasi Akun Baru")
def register_user(payload: RegisterUserRequest, db: Session = Depends(get_db)):
    nik_clean = payload.nik.strip()
    email_clean = payload.email.strip().lower()
    wa_clean = payload.nomor_whatsapp.strip()

    if not re.fullmatch(r"^\d{16}$", nik_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIK tidak valid. Harus tepat 16 digit angka."
        )

    if not re.fullmatch(r"^\d{10,13}$", wa_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nomor WhatsApp tidak valid. Harus berupa angka dengan panjang 10 sampai 13 digit."
        )

    if not re.fullmatch(r"^[a-zA-Z0-9_.+-]+@gmail\.com$", email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format email tidak valid. Wajib menggunakan akun @gmail.com."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi terlalu pendek. Minimal 6 karakter."
        )

    user_exist = db.query(models.User).filter(
        (models.User.nik == nik_clean) | (models.User.email == email_clean)
    ).first()
    if user_exist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIK atau Email sudah terdaftar di sistem."
        )

    hashed_pwd = hash_password(payload.password)

    user_baru = models.User(
        nik=nik_clean,
        nama_lengkap=payload.nama_lengkap.strip(),
        email=email_clean,
        nomor_whatsapp=wa_clean,
        password=hashed_pwd,
        role="umum"
    )

    db.add(user_baru)
    db.commit()
    db.refresh(user_baru)

    return {
        "status": "success",
        "message": "Pendaftaran akun berhasil!",
        "data": {
            "id": user_baru.id,
            "nik": user_baru.nik,
            "nama_lengkap": user_baru.nama_lengkap,
            "email": user_baru.email,
            "role": user_baru.role
        }
    }


@app.post("/api/v1/auth/login", tags=["Umum"], summary="Masuk ke Akun")
def login_user(payload: LoginUserRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()

    user = db.query(models.User).filter(
        models.User.email == email_clean
    ).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak cocok."
        )

    return {
        "status": "success",
        "message": "Login berhasil!",
        "data": {
            "id": user.id,
            "nik": user.nik,
            "nama": user.nama_lengkap,
            "email": user.email,
            "role": user.role
        }
    }


# ==============================================================================
# 2. KELOMPOK: PELAKU UMKM & LAYANAN
# ==============================================================================

@app.get("/api/v1/umkm", tags=["Pelaku UMKM"], summary="Ambil Direktori Data UMKM")
def get_all_umkm(
    kategori: Optional[str] = Query(None),
    wilayah: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.UMKM)
    if kategori:
        query = query.filter(models.UMKM.kategori.ilike(f"%{kategori}%"))
    if wilayah:
        query = query.filter(models.UMKM.kabupaten_kota.ilike(f"%{wilayah}%"))
    data = query.all()
    return {"status": "success", "total": len(data), "data": data}


@app.post("/api/v1/layanan/pendaftaran-pelatihan", tags=["Pelaku UMKM"], status_code=status.HTTP_201_CREATED, summary="Daftar Pelatihan")
async def daftar_pelatihan(
    user_id: int = Form(...),
    id_pelatihan: int = Form(...),
    judul_pelatihan: str = Form(...),
    kategori: Optional[str] = Form(None),
    penyelenggara: Optional[str] = Form(None),
    file_syarat: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    sudah_daftar = db.query(models.PendaftaranPelatihan).filter(
        models.PendaftaranPelatihan.user_id == user_id,
        models.PendaftaranPelatihan.id_pelatihan == id_pelatihan
    ).first()

    if sudah_daftar:
        raise HTTPException(status_code=400, detail="Anda sudah mendaftar di pelatihan ini.")

    # Upload berkas ke folder 'pelatihan' di Supabase
    url_berkas = None
    if file_syarat:
        url_berkas = await upload_file_to_supabase(file_syarat, folder="pelatihan")

    pendaftaran = models.PendaftaranPelatihan(
        user_id=user_id,
        id_pelatihan=id_pelatihan,
        judul_pelatihan=judul_pelatihan,
        kategori=kategori,
        penyelenggara=penyelenggara,
        metode_belajar="Daring Terpadu & Mandiri",
        status="Terdaftar",
        file_syarat=url_berkas
    )
    db.add(pendaftaran)
    db.commit()
    db.refresh(pendaftaran)

    return {
        "status": "success",
        "message": "Berhasil mendaftar pelatihan.",
        "file_url": url_berkas,
        "data": pendaftaran
    }


@app.post("/api/v1/layanan/pengajuan-bantuan", tags=["Pelaku UMKM"], status_code=status.HTTP_201_CREATED, summary="Ajukan Bantuan")
async def ajukan_bantuan(
    nik: str = Form(...),
    nama_lengkap: str = Form(...),
    email: str = Form(...),
    nomor_whatsapp: str = Form(...),
    nama_usaha: str = Form(...),
    kategori_usaha: str = Form(...),
    jumlah_dana: str = Form(...),
    tujuan_penggunaan: str = Form(...),
    nib: Optional[str] = Form(None),
    file_ktp: UploadFile = File(...),
    file_kk: Optional[UploadFile] = File(None),
    file_nib: Optional[UploadFile] = File(None),
    file_proposal: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if not re.fullmatch(r"^\d{16}$", nik):
        raise HTTPException(status_code=400, detail="NIK harus 16 digit angka.")

    user = db.query(models.User).filter(models.User.nik == nik).first()
    if not user:
        user = models.User(
            nik=nik,
            nama_lengkap=nama_lengkap,
            email=email,
            password=hash_password("default12345"),
            nomor_whatsapp=nomor_whatsapp,
            role="umum"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Upload langsung ke Supabase Storage (folder 'bantuan')
    url_ktp = await upload_file_to_supabase(file_ktp, folder="bantuan")
    url_kk = await upload_file_to_supabase(file_kk, folder="bantuan") if file_kk else None
    url_nib = await upload_file_to_supabase(file_nib, folder="bantuan") if file_nib else None
    url_proposal = await upload_file_to_supabase(file_proposal, folder="bantuan") if file_proposal else None

    no_pengajuan = f"ONT-2026-{uuid.uuid4().hex[:4].upper()}"
    pengajuan = models.PengajuanBantuan(
        nomor_pengajuan=no_pengajuan,
        user_id=user.id,
        nama_usaha=nama_usaha,
        kategori_usaha=kategori_usaha,
        nib=nib,
        jumlah_dana=jumlah_dana,
        tujuan_penggunaan=tujuan_penggunaan,
        file_ktp=url_ktp,
        file_kk=url_kk,
        file_nib=url_nib,
        file_proposal=url_proposal,
        status="Menunggu Verifikasi"
    )
    db.add(pengajuan)
    db.commit()
    db.refresh(pengajuan)

    return {"status": "success", "nomor_pengajuan": no_pengajuan}


@app.post("/api/v1/layanan/pengajuan-sertifikasi", tags=["Pelaku UMKM"], status_code=status.HTTP_201_CREATED, summary="Ajukan Sertifikasi")
async def ajukan_sertifikasi(
    nik: str = Form(...),
    nama_lengkap: str = Form(...),
    email: str = Form(...),
    nomor_whatsapp: str = Form(...),
    nama_usaha: str = Form(...),
    nama_produk: str = Form(...),
    jenis_sertifikasi: str = Form(...),
    deskripsi_produk: str = Form(...),
    nib: Optional[str] = Form(None),
    file_ktp: UploadFile = File(...),
    file_foto_produk: UploadFile = File(...),
    file_dokumen_pendukung: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    if not re.fullmatch(r"^\d{16}$", nik):
        raise HTTPException(status_code=400, detail="NIK harus 16 digit angka.")

    user = db.query(models.User).filter(models.User.nik == nik).first()
    if not user:
        user = models.User(
            nik=nik,
            nama_lengkap=nama_lengkap,
            email=email,
            password=hash_password("default12345"),
            nomor_whatsapp=nomor_whatsapp,
            role="umum"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Upload ke Supabase Storage (folder 'sertifikasi')
    url_ktp = await upload_file_to_supabase(file_ktp, folder="sertifikasi")
    url_foto_produk = await upload_file_to_supabase(file_foto_produk, folder="sertifikasi")
    url_pendukung = await upload_file_to_supabase(file_dokumen_pendukung, folder="sertifikasi") if file_dokumen_pendukung else None

    no_reg = f"SRT-2026-{uuid.uuid4().hex[:4].upper()}"
    sertifikasi = models.PengajuanSertifikasi(
        nomor_registrasi=no_reg,
        user_id=user.id,
        nama_usaha=nama_usaha,
        nama_produk=nama_produk,
        jenis_sertifikasi=jenis_sertifikasi,
        deskripsi_produk=deskripsi_produk,
        nib=nib,
        file_ktp=url_ktp,
        file_foto_produk=url_foto_produk,
        file_dokumen_pendukung=url_pendukung,
        status="Menunggu Verifikasi"
    )
    db.add(sertifikasi)
    db.commit()
    db.refresh(sertifikasi)
    return {"status": "success", "nomor_registrasi": no_reg}


# ==============================================================================
# 3. KELOMPOK: UPLOAD FILE STANDALONE
# ==============================================================================

@app.post("/api/pelatihan/upload", tags=["Pelatihan"], summary="Upload Mandiri Berkas Pelatihan")
async def upload_berkas_pelatihan(file: UploadFile = File(...)):
    file_url = await upload_file_to_supabase(file, folder="pelatihan")
    return {
        "status": "success",
        "message": "Berkas pelatihan berhasil diunggah",
        "file_url": file_url
    }


@app.post("/api/sertifikasi/upload", tags=["Sertifikasi"], summary="Upload Mandiri Berkas Sertifikasi")
async def upload_berkas_sertifikasi(file: UploadFile = File(...)):
    file_url = await upload_file_to_supabase(file, folder="sertifikasi")
    return {
        "status": "success",
        "message": "Berkas sertifikasi berhasil diunggah",
        "file_url": file_url
    }


# ==============================================================================
# 4. KELOMPOK: ADMIN DINAS
# ==============================================================================

@app.get("/api/v1/admin/pengajuan", tags=["Admin Dinas"], summary="Get Semua Pengajuan")
def get_semua_pengajuan(status_filter: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(models.PengajuanBantuan)
    if status_filter:
        q = q.filter(models.PengajuanBantuan.status.ilike(f"%{status_filter}%"))
    return {"status": "success", "data": q.order_by(models.PengajuanBantuan.created_at.desc()).all()}


@app.patch("/api/v1/admin/pengajuan/{pengajuan_id}", tags=["Admin Dinas"], summary="Verifikasi Pengajuan")
def verifikasi_pengajuan(pengajuan_id: int, payload: VerifikasiRequest, db: Session = Depends(get_db)):
    pengajuan = db.query(models.PengajuanBantuan).filter(models.PengajuanBantuan.id == pengajuan_id).first()
    if not pengajuan:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
    pengajuan.status = payload.status
    pengajuan.catatan_admin = payload.catatan_admin
    db.commit()
    return {"status": "success", "message": "Status berhasil diperbarui."}


@app.get("/api/v1/admin/sertifikasi", tags=["Admin Dinas"], summary="Get Semua Sertifikasi")
def get_semua_sertifikasi(status_filter: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(models.PengajuanSertifikasi)
    if status_filter:
        q = q.filter(models.PengajuanSertifikasi.status.ilike(f"%{status_filter}%"))
    return {"status": "success", "data": q.order_by(models.PengajuanSertifikasi.created_at.desc()).all()}


@app.patch("/api/v1/admin/sertifikasi/{sertifikasi_id}", tags=["Admin Dinas"], summary="Verifikasi Sertifikasi")
def verifikasi_sertifikasi(sertifikasi_id: int, payload: VerifikasiRequest, db: Session = Depends(get_db)):
    sertifikasi = db.query(models.PengajuanSertifikasi).filter(models.PengajuanSertifikasi.id == sertifikasi_id).first()
    if not sertifikasi:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
    sertifikasi.status = payload.status
    sertifikasi.catatan_admin = payload.catatan_admin
    db.commit()
    return {"status": "success", "message": "Status sertifikasi berhasil diperbarui."}

# Tambahkan di Backend/main.py pada bagian route Admin Dinas
@app.get("/api/v1/admin/users", tags=["Admin Dinas"], summary="Get Semua Akun Pengguna")
def get_semua_user(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.id.desc()).all()
    # Format data agar cocok dan aman dikonsumsi frontend
    data = []
    for u in users:
        data.append({
            "id": u.id,
            "nik": u.nik,
            "nama": u.nama_lengkap,
            "email": u.email,
            "telp": u.nomor_whatsapp,
            "role": u.role or "umum",
            "instansi": "Pelaku UMKM Jawa Barat" if u.role == "umum" else "Dinas KUK Jawa Barat"
        })
    return {"status": "success", "data": data}
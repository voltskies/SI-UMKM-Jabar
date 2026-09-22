from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nik = Column(String(16), unique=True, index=True, nullable=False)
    nama_lengkap = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    nomor_whatsapp = Column(String(20), nullable=False)
    role = Column(String(20), default="pemohon")  # pemohon / admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relasi ke pengajuan bantuan
    pengajuan = relationship("PengajuanBantuan", back_populates="pemohon")


class UMKM(Base):
    __tablename__ = "umkm"

    id = Column(Integer, primary_key=True, index=True)
    nama_usaha = Column(String(150), nullable=False)
    kategori = Column(String(100), index=True, nullable=False)  # Kuliner, Fashion, dll.
    kabupaten_kota = Column(String(100), index=True, nullable=False)
    alamat = Column(Text, nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)


class PengajuanBantuan(Base):
    __tablename__ = "pengajuan_bantuan"

    id = Column(Integer, primary_key=True, index=True)
    nomor_pengajuan = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Detail Usaha & Bantuan
    nama_usaha = Column(String(150), nullable=False)
    kategori_usaha = Column(String(100), nullable=False)
    nib = Column(String(50), nullable=True)
    jumlah_dana = Column(String(50), nullable=False)
    tujuan_penggunaan = Column(Text, nullable=False)
    
    # Path File Berkas yang diupload
    file_ktp = Column(String(255), nullable=False)
    file_kk = Column(String(255), nullable=True)
    file_nib = Column(String(255), nullable=True)
    file_proposal = Column(String(255), nullable=True)
    
    # Status Verifikasi Admin
    status = Column(String(50), default="Menunggu Verifikasi")  # Menunggu Verifikasi, Disetujui, Ditolak
    catatan_admin = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relasi balik ke User
    pemohon = relationship("User", back_populates="pengajuan")
import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function NotifikasiToast({ show, message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!show) return;

    // Timer otomatis untuk menutup notifikasi setelah durasi tercapai
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  // Jika kondisi show bernilai false, komponen tidak dirender sama sekali
  if (!show) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        backgroundColor: '#164E43',
        color: '#FFFFFF',
        padding: '14px 18px',
        borderRadius: '12px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.22)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '360px',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'slideInToast 0.3s ease forwards'
      }}
    >
      <style>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Ikon Sukses */}
      <CheckCircle size={20} color="#4ADE80" style={{ flexShrink: 0 }} />

      {/* Pesan Notifikasi */}
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: '600',
          lineHeight: 1.4,
          flex: 1
        }}
      >
        {message}
      </span>

      {/* Tombol Tutup Manual (X) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          display: 'flex',
          padding: 0,
          flexShrink: 0
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
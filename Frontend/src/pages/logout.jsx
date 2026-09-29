import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Hapus seluruh data sesi/token pengguna
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.clear();

    // Arahkan kembali ke halaman beranda atau login
    navigate("/", { replace: true });
    window.location.reload();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600 font-medium">Sedang keluar dari akun...</p>
    </div>
  );
};

export default Logout;
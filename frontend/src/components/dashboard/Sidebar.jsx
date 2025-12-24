import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "📁", label: "Kelola Aset", path: "/aset" },
    { icon: "🗺️", label: "Peta", path: "/peta" },
    { icon: "⏱️", label: "Riwayat Aktivitas", path: "/aktivitas" },
    { icon: "🔔", label: "Notifikasi", path: "/notifikasi" },
    { icon: "💾", label: "Backup & Restore", path: "/backup" },
    { icon: "⚙️", label: "Pengaturan", path: "/pengaturan" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <aside className="border-r-2 border-black bg-white w-64 min-h-screen">
      {/* Menu Title */}
      <div className="border-2 border-black bg-white px-4 py-3 font-bold text-sm m-4">
        MENU
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 px-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.path)}
            className="w-full text-left border-2 border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-4 mt-8 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full text-left border-2 border-black px-4 py-2 text-sm hover:bg-red-100 transition font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

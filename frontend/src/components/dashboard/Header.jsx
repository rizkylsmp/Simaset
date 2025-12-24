import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="border-b-2 border-black bg-white">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo Section */}
        <div className="flex items-center border-2 border-black px-4 py-2 font-bold">
          [LOGO] SMAT
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-4">
          {[
            "Dashboard",
            "Data Aset",
            "Peta Interaktif",
            "Riwayat",
            "Backup",
          ].map((tab) => (
            <button
              key={tab}
              className="border-2 border-black px-4 py-2 text-sm font-medium hover:bg-gray-100 transition"
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* User Icons */}
        <div className="flex gap-4">
          <button className="w-8 h-8 border-2 border-black flex items-center justify-center text-sm font-bold hover:bg-gray-100">
            🔔
          </button>
          <button className="w-8 h-8 border-2 border-black flex items-center justify-center text-sm font-bold hover:bg-gray-100">
            👤
          </button>
        </div>
      </div>
    </header>
  );
}

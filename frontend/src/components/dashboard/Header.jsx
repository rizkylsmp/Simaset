import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Navigation items with paths
  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Data Aset", path: "/aset" },
    { label: "Peta Interaktif", path: "/peta" },
    { label: "Riwayat", path: "/riwayat" },
    { label: "Backup", path: "/backup" },
  ];

  // Sample notifications for dropdown preview
  const notifications = [
    {
      id: 1,
      icon: "👤",
      title: "Login Berhasil",
      time: "2 menit yang lalu",
      isNew: true,
    },
    {
      id: 2,
      icon: "📝",
      title: "Perubahan Data Aset",
      time: "15 menit yang lalu",
      isNew: true,
    },
    {
      id: 3,
      icon: "⚠️",
      title: "Peringatan Sistem",
      time: "1 jam yang lalu",
      isNew: true,
    },
  ];

  const unreadCount = notifications.filter((n) => n.isNew).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b-2 border-black bg-white">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo Section */}
        <div 
          className="flex items-center border-2 border-black px-4 py-2 font-bold cursor-pointer hover:bg-gray-100"
          onClick={() => navigate("/dashboard")}
        >
          [LOGO] SMAT
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`border-2 border-black px-4 py-2 text-sm font-medium transition ${
                isActivePath(item.path)
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Icons */}
        <div className="flex gap-4">
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileDropdown(false);
              }}
              className="w-8 h-8 border-2 border-black flex items-center justify-center text-sm font-bold hover:bg-gray-100 relative"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-lg z-50">
                {/* Dropdown Header */}
                <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
                  <span className="font-bold text-sm">🔔 Notifikasi</span>
                  <span className="bg-red-500 text-xs px-2 py-0.5 font-bold">
                    {unreadCount} Baru
                  </span>
                </div>

                {/* Notification Items */}
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                        notif.isNew ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{notif.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{notif.title}</span>
                            {notif.isNew && (
                              <span className="bg-orange-500 text-white text-[10px] px-1 font-bold">
                                BARU
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Footer */}
                <div className="border-t-2 border-black">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      navigate("/notifikasi");
                    }}
                    className="w-full px-4 py-2 text-center text-sm font-bold hover:bg-gray-100"
                  >
                    Lihat Semua Notifikasi →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Icon with Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="w-8 h-8 border-2 border-black flex items-center justify-center text-sm font-bold hover:bg-gray-100"
            >
              👤
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-lg z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b-2 border-black bg-gray-50">
                  <div className="font-bold text-sm">{user?.nama_lengkap || "User"}</div>
                  <div className="text-xs text-gray-600">{user?.email || "user@email.com"}</div>
                  <div className="mt-1">
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/profil");
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>👤</span> Profil Saya
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/pengaturan");
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>⚙️</span> Pengaturan
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t-2 border-black">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

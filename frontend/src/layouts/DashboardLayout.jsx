import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

// Desktop Sidebar Component
function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "📁", label: "Kelola Aset", path: "/aset" },
    { icon: "🗺️", label: "Peta", path: "/peta" },
    { icon: "⏱️", label: "Riwayat", path: "/riwayat" },
    { icon: "🔔", label: "Notifikasi", path: "/notifikasi" },
    { icon: "💾", label: "Backup", path: "/backup" },
    { icon: "⚙️", label: "Pengaturan", path: "/pengaturan" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    onNavigate?.();
  };

  const handleMenuClick = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="bg-white w-60 flex flex-col border-r border-gray-200 shadow-sm h-full overflow-hidden">
      {/* Menu Title */}
      <div className="px-4 py-4 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu Utama</span>
      </div>

      {/* Menu Items - No scroll, fit content */}
      <nav className="flex-1 py-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-200 ${
              isActivePath(item.path)
                ? "bg-gray-900 text-white border-l-4 border-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section - Fixed at bottom */}
      <div className="border-t border-gray-100 p-3 space-y-1 bg-white mt-auto">
        <button
          onClick={() => handleMenuClick("/profil")}
          className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg flex items-center gap-3 transition-all duration-200"
        >
          <span className="text-lg">👤</span>
          <span className="font-medium">Profil Saya</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center gap-3 transition-all duration-200"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}

// Header Component
function Header({ onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Data Aset", path: "/aset" },
    { label: "Peta", path: "/peta" },
    { label: "Riwayat", path: "/riwayat" },
    { label: "Backup", path: "/backup" },
  ];

  const notifications = [
    { id: 1, icon: "👤", title: "Login Berhasil", time: "2 menit lalu", isNew: true },
    { id: 2, icon: "📝", title: "Data Aset Diperbarui", time: "15 menit lalu", isNew: true },
    { id: 3, icon: "⚠️", title: "Peringatan Sistem", time: "1 jam lalu", isNew: false },
  ];

  const unreadCount = notifications.filter((n) => n.isNew).length;

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

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200 mr-2"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-gray-600 transition-colors">SINKRONA</h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">Sistem Manajemen Aset</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActivePath(item.path)
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileDropdown(false);
              }}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifikasi</span>
                  <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} Baru
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notif.isNew ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{notif.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">{notif.title}</span>
                            {notif.isNew && (
                              <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
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
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate("/notifikasi");
                  }}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.nama_lengkap || "User"}</p>
                <p className="text-[10px] text-gray-500">{user?.role || "Role"}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.nama_lengkap || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email || "email@domain.com"}</p>
                      <span className="inline-block mt-1 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {user?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate("/profil"); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span>👤</span> Profil Saya
                  </button>
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate("/pengaturan"); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span>⚙️</span> Pengaturan
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                  >
                    <span>🚪</span> Keluar
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

// Main Dashboard Layout
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - fixed height, no scroll */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar with Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar onNavigate={closeSidebar} />
            </div>
          </>
        )}
        
        {/* Main Content - scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

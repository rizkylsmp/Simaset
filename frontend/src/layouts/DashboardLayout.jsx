import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { notifikasiService } from "../services/api";
import {
  ChartBar,
  Folder,
  MapTrifold,
  ClockCounterClockwise,
  Bell,
  FloppyDisk,
  Gear,
  UserCircle,
  SignOut,
  Sun,
  Moon,
  List,
  X,
  CaretDown,
  User,
  PencilSimple,
  WarningCircle,
  Buildings,
  Info,
  CheckCircle,
} from "@phosphor-icons/react";

// Desktop Sidebar Component
function Sidebar({ onNavigate, unreadNotifCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { icon: ChartBar, label: "Dashboard", path: "/dashboard" },
    { icon: Folder, label: "Kelola Aset", path: "/aset" },
    { icon: MapTrifold, label: "Peta", path: "/peta" },
    { icon: ClockCounterClockwise, label: "Riwayat", path: "/riwayat" },
    {
      icon: Bell,
      label: "Notifikasi",
      path: "/notifikasi",
      badge: unreadNotifCount,
    },
    { icon: FloppyDisk, label: "Backup", path: "/backup" },
    { icon: Gear, label: "Pengaturan", path: "/pengaturan" },
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
    <aside className="bg-surface w-60 flex flex-col border-r border-border shadow-sm h-full overflow-hidden">
      {/* Menu Title */}
      <div className="px-4 py-4 border-b border-border-light">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Menu Utama
        </span>
      </div>

      {/* Menu Items - No scroll, fit content */}
      <nav className="flex-1 py-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-200 ${
              isActivePath(item.path)
                ? "bg-accent text-white dark:bg-white dark:text-gray-900 border-l-4 border-accent dark:border-white"
                : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary border-l-4 border-transparent"
            }`}
          >
            <item.icon
              size={20}
              weight={isActivePath(item.path) ? "fill" : "regular"}
            />
            <span className="font-medium flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span
                className={`w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${
                  isActivePath(item.path)
                    ? "bg-white text-accent dark:bg-gray-900 dark:text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section - Fixed at bottom */}
      <div className="border-t border-border-light p-3 space-y-1 bg-surface mt-auto">
        <button
          onClick={() => handleMenuClick("/profil")}
          className="w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary rounded-lg flex items-center gap-3 transition-all duration-200"
        >
          <UserCircle size={20} />
          <span className="font-medium">Profil Saya</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg flex items-center gap-3 transition-all duration-200"
        >
          <SignOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}

// Header Component
function Header({
  onMenuClick,
  sidebarOpen,
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onRefresh,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Data Aset", path: "/aset" },
    { label: "Peta", path: "/peta" },
    { label: "Riwayat", path: "/riwayat" },
    { label: "Backup", path: "/backup" },
  ];

  // Get icon based on notification category
  const getNotifIcon = (kategori, tipe) => {
    if (kategori === "aset") return <Buildings size={18} />;
    if (kategori === "user" || kategori === "sistem") return <User size={18} />;
    if (tipe === "warning") return <WarningCircle size={18} />;
    if (tipe === "success") return <CheckCircle size={18} />;
    return <Info size={18} />;
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  // Mark all as read handler
  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead?.();
    setShowNotifDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setShowNotifDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
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
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-tertiary transition-all duration-200 mr-2"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <List size={24} />}
        </button>

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-gray-900 font-bold text-sm">
              S
            </span>
          </div>
          <div>
            <h1 className="font-bold text-text-primary text-lg leading-tight group-hover:text-text-secondary transition-colors">
              SIMASET
            </h1>
            <p className="text-[10px] text-text-muted -mt-0.5">
              Sistem Manajemen Aset
            </p>
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
                  ? "bg-accent text-white dark:bg-white dark:text-gray-900"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
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
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-tertiary transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} weight="bold" />
            ) : (
              <Moon size={20} weight="bold" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowProfileDropdown(false);
              }}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-tertiary transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                <div className="bg-accent text-white dark:text-gray-900 px-4 py-3 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="bg-white/20 hover:bg-white/30 text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-muted text-sm">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id_notifikasi}
                        className={`px-4 py-3 border-b border-border-light hover:bg-surface-tertiary cursor-pointer transition-colors ${
                          !notif.dibaca
                            ? "bg-blue-50/50 dark:bg-blue-900/20"
                            : ""
                        }`}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          navigate("/notifikasi");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-text-secondary mt-0.5">
                            {getNotifIcon(notif.kategori, notif.tipe)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-text-primary line-clamp-1">
                                {notif.judul}
                              </span>
                              {!notif.dibaca && (
                                <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">
                                  BARU
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-1">
                              {notif.pesan}
                            </p>
                            <span className="text-xs text-text-muted">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate("/notifikasi");
                  }}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-text-secondary hover:bg-surface-tertiary border-t border-border-light transition-colors"
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-tertiary transition-all duration-200"
            >
              <div className="w-8 h-8 bg-surface-tertiary rounded-full flex items-center justify-center">
                <UserCircle size={20} className="text-text-secondary" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {user?.nama_lengkap || "User"}
                </p>
                <p className="text-[10px] text-text-muted">
                  {user?.role || "Role"}
                </p>
              </div>
              <CaretDown size={16} className="text-text-muted" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-4 bg-surface-secondary border-b border-border-light">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-tertiary rounded-full flex items-center justify-center">
                      <UserCircle size={28} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {user?.nama_lengkap || "User"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {user?.email || "email@domain.com"}
                      </p>
                      <span className="inline-block mt-1 bg-accent text-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded">
                        {user?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/profil");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-surface-tertiary flex items-center gap-3 transition-colors"
                  >
                    <UserCircle size={18} /> Profil Saya
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/pengaturan");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-surface-tertiary flex items-center gap-3 transition-colors"
                  >
                    <Gear size={18} /> Pengaturan
                  </button>
                </div>
                <div className="border-t border-border-light">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 font-medium transition-colors"
                  >
                    <SignOut size={18} /> Keluar
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Halaman peta tidak perlu scroll wrapper
  const isMapPage = location.pathname === "/peta";

  // Fetch notifications (centralized)
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notifikasiService.getRecent(5);
      const data = response.data.data || [];
      setNotifications(data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notifikasiService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, []);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen bg-surface-secondary flex flex-col overflow-hidden">
      <Header
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        onRefresh={fetchNotifications}
      />
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Desktop Sidebar - fixed height, no scroll */}
        <div className="hidden lg:block">
          <Sidebar unreadNotifCount={unreadCount} />
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
              <Sidebar
                onNavigate={closeSidebar}
                unreadNotifCount={unreadCount}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 overflow-hidden ${
            isMapPage ? "" : "overflow-y-auto"
          }`}
        >
          {isMapPage ? (
            <Outlet />
          ) : (
            <div className="h-full overflow-y-auto pb-20 sm:pb-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

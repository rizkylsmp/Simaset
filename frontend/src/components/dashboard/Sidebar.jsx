import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  ChartBar,
  Folder,
  MapTrifold,
  ClockCounterClockwise,
  Bell,
  FloppyDisk,
  Gear,
  User,
  SignOut,
  CaretRight,
  CaretDown,
  Scales,
  Ruler,
  FileText,
  GlobeHemisphereWest,
  Database,
} from "@phosphor-icons/react";

export default function Sidebar({ onNavigate, unreadNotifCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // Auto-expand "Kelola Aset" if on an aset sub-route
  const [expandedMenus, setExpandedMenus] = useState(() =>
    location.pathname.startsWith("/aset") ? ["kelola-aset"] : [],
  );

  const menuItems = [
    { icon: ChartBar, label: "Dashboard", path: "/dashboard" },
    {
      id: "kelola-aset",
      icon: Folder,
      label: "Kelola Aset",
      children: [
        { icon: Database, label: "Pusat Data", path: "/aset" },
        { icon: Scales, label: "Data Legal", path: "/aset/legal" },
        { icon: Ruler, label: "Data Fisik", path: "/aset/fisik" },
        {
          icon: FileText,
          label: "Data Administratif",
          path: "/aset/administratif",
        },
        {
          icon: GlobeHemisphereWest,
          label: "Data Spasial",
          path: "/aset/spasial",
        },
      ],
    },
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

  const toggleExpanded = (menuId) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const isActivePath = (path) => location.pathname === path;

  const isParentActive = (children) =>
    children?.some((child) => location.pathname === child.path);

  const isExpanded = (menuId) => expandedMenus.includes(menuId);

  return (
    <aside className="bg-surface w-68 flex flex-col border-r border-border h-full overflow-hidden">
      {/* Menu Title */}
      <div className="px-5 py-4 border-b border-border">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          Menu Utama
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const parentActive = hasChildren && isParentActive(item.children);
          const expanded = hasChildren && isExpanded(item.id);
          const isActive = !hasChildren && isActivePath(item.path);

          return (
            <div key={item.label}>
              {/* Main menu button */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpanded(item.id);
                  } else {
                    handleMenuClick(item.path);
                  }
                }}
                className={`group w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  isActive || parentActive
                    ? "bg-linear-to-r from-accent to-accent/90 text-surface shadow-lg shadow-accent/20"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive || parentActive
                      ? "bg-surface/20"
                      : "bg-surface-tertiary group-hover:bg-surface-secondary"
                  }`}
                >
                  <item.icon
                    size={18}
                    weight={isActive || parentActive ? "fill" : "bold"}
                  />
                </div>
                <span className="font-medium flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-surface/20 text-surface"
                        : "bg-red-500 text-surface"
                    }`}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
                {hasChildren ? (
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${
                      expanded ? "rotate-180" : ""
                    } ${parentActive ? "" : "opacity-60"}`}
                  />
                ) : (
                  isActive && (
                    <CaretRight
                      size={14}
                      weight="bold"
                      className="opacity-60"
                    />
                  )
                )}
              </button>

              {/* Sub-menu items (dropdown) */}
              {hasChildren && (
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    expanded ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-4 pl-4 border-l-2 border-border space-y-0.5 py-0.5">
                    {item.children.map((child) => {
                      const isChildActive = isActivePath(child.path);
                      return (
                        <button
                          key={child.path}
                          onClick={() => handleMenuClick(child.path)}
                          className={`group w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-lg transition-all duration-200 ${
                            isChildActive
                              ? "bg-linear-to-r from-accent to-accent/90 text-surface shadow-md shadow-accent/20 font-semibold"
                              : "text-text-muted hover:bg-surface-secondary hover:text-text-primary"
                          }`}
                        >
                          <child.icon
                            size={16}
                            weight={isChildActive ? "fill" : "regular"}
                          />
                          <span className="flex-1">{child.label}</span>
                          {isChildActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-surface" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1 bg-surface-secondary/50 mt-auto">
        <button
          onClick={() => handleMenuClick("/profil")}
          className="group w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary rounded-xl flex items-center gap-3 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User size={16} weight="bold" className="text-surface" />
          </div>
          <span className="font-medium">Profil Saya</span>
        </button>
        <button
          onClick={handleLogout}
          className="group w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl flex items-center gap-3 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-tertiary group-hover:bg-red-100 dark:group-hover:bg-red-900/30 flex items-center justify-center transition-colors">
            <SignOut
              size={16}
              weight="bold"
              className="group-hover:text-red-600"
            />
          </div>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}

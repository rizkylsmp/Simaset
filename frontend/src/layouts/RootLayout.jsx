import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SessionExpiredDialog from "../components/ui/SessionExpiredDialog";
import { notifikasiService, authService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";

// Main Root Layout
export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const logoutAuth = useAuthStore((s) => s.logout);
  const setToken = useAuthStore((s) => s.setToken);
  const showExtendDialog = useSessionStore((s) => s.showExtendDialog);
  const resumeSession = useSessionStore((s) => s.resumeSession);
  const extendSession = useSessionStore((s) => s.extendSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const dismissExtendDialog = useSessionStore((s) => s.dismissExtendDialog);

  // Resume session countdown on mount
  useEffect(() => {
    resumeSession();
  }, []);

  // Handle extend session
  const handleExtendSession = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const { token, sessionDuration } = response.data;
      setToken(token);
      extendSession(sessionDuration);
    } catch (error) {
      console.error("Error extending session:", error);
      handleSessionLogout();
    }
  }, [setToken, extendSession]);

  // Handle session logout
  const handleSessionLogout = useCallback(() => {
    dismissExtendDialog();
    clearSession();
    logoutAuth();
    navigate("/login");
  }, [dismissExtendDialog, clearSession, logoutAuth, navigate]);

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

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (notifId, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await notifikasiService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notifikasi === notifId ? { ...n, dibaca: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
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
      {/* Session Expired Dialog */}
      {showExtendDialog && (
        <SessionExpiredDialog
          onExtend={handleExtendSession}
          onLogout={handleSessionLogout}
        />
      )}

      <Header
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onRefresh={fetchNotifications}
      />
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Desktop Sidebar - fixed height, no scroll */}
        <div
          className={`hidden lg:block transition-all duration-300 ease-in-out relative z-30 ${
            sidebarCollapsed ? "w-[72px]" : "w-68"
          }`}
        >
          <Sidebar
            unreadNotifCount={unreadCount}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar with Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-accent/50 z-40 lg:hidden"
              onClick={closeSidebar}
              role="presentation"
              aria-hidden="true"
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
            <Outlet context={{ refreshNotifications: fetchNotifications }} />
          ) : (
            <div className="h-full overflow-y-auto pb-20 sm:pb-6">
              <Outlet context={{ refreshNotifications: fetchNotifications }} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

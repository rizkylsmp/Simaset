import { createHashRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import RootLayout from "../layouts/RootLayout";

// Pages - Auth (eagerly loaded — entry point)
import LoginPage from "../pages/auth/LoginPage";

// Lazy-loaded pages (code-split per route)
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const MapPage = lazy(() => import("../pages/MapPage"));
const RiwayatPage = lazy(() => import("../pages/RiwayatPage"));
const NotifikasiPage = lazy(() => import("../pages/NotifikasiPage"));
const BackupPage = lazy(() => import("../pages/BackupPage"));
const ProfilPage = lazy(() => import("../pages/ProfilPage"));
const PengaturanPage = lazy(() => import("../pages/PengaturanPage"));
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"));
const AssetPage = lazy(() => import("../pages/aset/AssetPage"));
const DataLegalPage = lazy(() => import("../pages/aset/DataLegalPage"));
const DataFisikPage = lazy(() => import("../pages/aset/DataFisikPage"));
const DataAdministratifPage = lazy(() => import("../pages/aset/DataAdministratifPage"));
const DataSpasialPage = lazy(() => import("../pages/aset/DataSpasialPage"));
const SewaAsetPage = lazy(() => import("../pages/aset/SewaAsetPage"));
const PenilaianAsetPage = lazy(() => import("../pages/aset/PenilaianAsetPage"));

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

// Suspense wrapper for lazy routes
function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// Router configuration using createHashRouter
const router = createHashRouter([
  // Public routes - Login page with map background
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Protected routes with Root Layout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <LazyPage><DashboardPage /></LazyPage>,
      },
      // Kelola Aset - Overview & Substansi
      {
        path: "aset",
        element: <LazyPage><AssetPage /></LazyPage>,
      },
      {
        path: "aset/legal",
        element: <LazyPage><DataLegalPage /></LazyPage>,
      },
      {
        path: "aset/fisik",
        element: <LazyPage><DataFisikPage /></LazyPage>,
      },
      {
        path: "aset/administratif",
        element: <LazyPage><DataAdministratifPage /></LazyPage>,
      },
      {
        path: "aset/spasial",
        element: <LazyPage><DataSpasialPage /></LazyPage>,
      },
      {
        path: "sewa-aset",
        element: (
          <RoleGuard menuId="sewa">
            <LazyPage><SewaAsetPage /></LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "penilaian-aset",
        element: (
          <RoleGuard menuId="penilaian">
            <LazyPage><PenilaianAsetPage /></LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "peta",
        element: <LazyPage><MapPage /></LazyPage>,
      },
      {
        path: "riwayat",
        element: (
          <RoleGuard menuId="riwayat">
            <LazyPage><RiwayatPage /></LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "notifikasi",
        element: <LazyPage><NotifikasiPage /></LazyPage>,
      },
      {
        path: "backup",
        element: (
          <RoleGuard menuId="backup">
            <LazyPage><BackupPage /></LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "profil",
        element: <LazyPage><ProfilPage /></LazyPage>,
      },
      {
        path: "pengaturan",
        element: (
          <RoleGuard menuId="pengaturan">
            <LazyPage><PengaturanPage /></LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard menuId="user">
            <LazyPage><UserManagementPage /></LazyPage>
          </RoleGuard>
        ),
      },
    ],
  },

  // Catch all - redirect to dashboard
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;

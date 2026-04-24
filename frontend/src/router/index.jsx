import { createHashRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import RootLayout from "../layouts/RootLayout";

// Pages - Auth (eagerly loaded — entry point)
import LoginPage from "../pages/auth/LoginPage";

// Pages - Public
import LandingPage from "../pages/LandingPage";

// Helper for dynamic import errors (e.g. chunk not found after new deployment)
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem("page-has-been-force-refreshed") || "false",
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // We assume the user is on an older version of the app and a chunk is missing
        window.localStorage.setItem("page-has-been-force-refreshed", "true");
        window.location.reload();
        // Return a dummy promise that never resolves while reloading
        return new Promise(() => {});
      }
      throw error;
    }
  });

// Lazy-loaded pages (code-split per route)
const DashboardPage = lazyWithRetry(() => import("../pages/DashboardPage"));
const EkasmatPage = lazyWithRetry(() => import("../pages/EkasmatPage"));
const MapPage = lazyWithRetry(() => import("../pages/MapPage"));
const RiwayatPage = lazyWithRetry(() => import("../pages/RiwayatPage"));
const NotifikasiPage = lazyWithRetry(() => import("../pages/NotifikasiPage"));
const BackupPage = lazyWithRetry(() => import("../pages/BackupPage"));
const ProfilPage = lazyWithRetry(() => import("../pages/ProfilPage"));
const PengaturanPage = lazyWithRetry(() => import("../pages/PengaturanPage"));
const UserManagementPage = lazyWithRetry(() => import("../pages/UserManagementPage"));
const AssetPage = lazyWithRetry(() => import("../pages/aset/AssetPage"));
const DataLegalPage = lazyWithRetry(() => import("../pages/aset/DataLegalPage"));
const DataFisikPage = lazyWithRetry(() => import("../pages/aset/DataFisikPage"));
const DataAdministratifPage = lazyWithRetry(
  () => import("../pages/aset/DataAdministratifPage"),
);
const DataSpasialPage = lazyWithRetry(() => import("../pages/aset/DataSpasialPage"));
const PusatDataPage = lazyWithRetry(() => import("../pages/PusatDataPage"));
const PenyewaanPage = lazyWithRetry(() => import("../pages/sewa/PenyewaanPage"));
const SewaDetailPage = lazyWithRetry(() => import("../pages/sewa/SewaDetailPage"));
const PermintaanPage = lazyWithRetry(() => import("../pages/sewa/PermintaanPage"));

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
  // Public routes
  {
    path: "/sewa-tersedia",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/ekasmat",
    element: (
      <LazyPage>
        <EkasmatPage />
      </LazyPage>
    ),
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
        element: (
          <LazyPage>
            <DashboardPage />
          </LazyPage>
        ),
      },
      // Kelola Aset - Overview & Substansi
      {
        path: "aset",
        element: (
          <LazyPage>
            <AssetPage />
          </LazyPage>
        ),
      },
      {
        path: "aset/legal",
        element: (
          <LazyPage>
            <DataLegalPage />
          </LazyPage>
        ),
      },
      {
        path: "aset/fisik",
        element: (
          <LazyPage>
            <DataFisikPage />
          </LazyPage>
        ),
      },
      {
        path: "aset/administratif",
        element: (
          <LazyPage>
            <DataAdministratifPage />
          </LazyPage>
        ),
      },
      {
        path: "aset/spasial",
        element: (
          <LazyPage>
            <DataSpasialPage />
          </LazyPage>
        ),
      },
      // Sewa Aset
      {
        path: "sewa/penyewaan",
        element: (
          <RoleGuard menuId="sewa-aset">
            <LazyPage>
              <PenyewaanPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "sewa/penyewaan/:id",
        element: (
          <RoleGuard menuId="sewa-aset">
            <LazyPage>
              <SewaDetailPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "sewa/permintaan",
        element: (
          <RoleGuard menuId="sewa-aset">
            <LazyPage>
              <PermintaanPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "pusat-data",
        element: (
          <RoleGuard menuId="pusatData">
            <LazyPage>
              <PusatDataPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "peta",
        element: (
          <LazyPage>
            <MapPage />
          </LazyPage>
        ),
      },
      {
        path: "riwayat",
        element: (
          <RoleGuard menuId="riwayat">
            <LazyPage>
              <RiwayatPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "notifikasi",
        element: (
          <LazyPage>
            <NotifikasiPage />
          </LazyPage>
        ),
      },
      {
        path: "backup",
        element: (
          <RoleGuard menuId="backup">
            <LazyPage>
              <BackupPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "profil",
        element: (
          <LazyPage>
            <ProfilPage />
          </LazyPage>
        ),
      },
      {
        path: "pengaturan",
        element: (
          <RoleGuard menuId="pengaturan">
            <LazyPage>
              <PengaturanPage />
            </LazyPage>
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard menuId="user">
            <LazyPage>
              <UserManagementPage />
            </LazyPage>
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

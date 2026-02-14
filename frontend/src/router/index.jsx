import { createHashRouter, Navigate } from "react-router-dom";

// Layouts
import RootLayout from "../layouts/RootLayout";

// Pages - Auth
import LoginPage from "../pages/auth/LoginPage";

// Pages - Dashboard & General
import DashboardPage from "../pages/DashboardPage";
import MapPage from "../pages/MapPage";
import RiwayatPage from "../pages/RiwayatPage";
import NotifikasiPage from "../pages/NotifikasiPage";
import BackupPage from "../pages/BackupPage";
import ProfilPage from "../pages/ProfilPage";
import PengaturanPage from "../pages/PengaturanPage";
import UserManagementPage from "../pages/UserManagementPage";

// Pages - Aset
import AssetPage from "../pages/aset/AssetPage";
import DataLegalPage from "../pages/aset/DataLegalPage";
import DataFisikPage from "../pages/aset/DataFisikPage";
import DataAdministratifPage from "../pages/aset/DataAdministratifPage";
import DataSpasialPage from "../pages/aset/DataSpasialPage";
import SewaAsetPage from "../pages/aset/SewaAsetPage";
import PenilaianAsetPage from "../pages/aset/PenilaianAsetPage";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

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
        element: <DashboardPage />,
      },
      // Kelola Aset - Overview & Substansi
      {
        path: "aset",
        element: <AssetPage />,
      },
      {
        path: "aset/legal",
        element: <DataLegalPage />,
      },
      {
        path: "aset/fisik",
        element: <DataFisikPage />,
      },
      {
        path: "aset/administratif",
        element: <DataAdministratifPage />,
      },
      {
        path: "aset/spasial",
        element: <DataSpasialPage />,
      },
      {
        path: "sewa-aset",
        element: (
          <RoleGuard menuId="sewa">
            <SewaAsetPage />
          </RoleGuard>
        ),
      },
      {
        path: "penilaian-aset",
        element: (
          <RoleGuard menuId="penilaian">
            <PenilaianAsetPage />
          </RoleGuard>
        ),
      },
      {
        path: "peta",
        element: <MapPage />,
      },
      {
        path: "riwayat",
        element: (
          <RoleGuard menuId="riwayat">
            <RiwayatPage />
          </RoleGuard>
        ),
      },
      {
        path: "notifikasi",
        element: <NotifikasiPage />,
      },
      {
        path: "backup",
        element: (
          <RoleGuard menuId="backup">
            <BackupPage />
          </RoleGuard>
        ),
      },
      {
        path: "profil",
        element: <ProfilPage />,
      },
      {
        path: "pengaturan",
        element: (
          <RoleGuard menuId="pengaturan">
            <PengaturanPage />
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard menuId="user">
            <UserManagementPage />
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

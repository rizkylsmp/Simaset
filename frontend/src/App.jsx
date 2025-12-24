import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetPage from "./pages/AssetPage";
import MapPage from "./pages/MapPage";
// import DetailAsetPage from "./pages/DetailAsetPage";
// import RiwayatPage from "./pages/RiwayatPage";
// import NotifikasiPage from "./pages/NotifikasiPage";
// import ProfilPage from "./pages/ProfilPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aset"
          element={
            <ProtectedRoute>
              <AssetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peta"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/aset/:id" element={<ProtectedRoute><DetailAsetPage /></ProtectedRoute>} />
        <Route path="/riwayat" element={<ProtectedRoute><RiwayatPage /></ProtectedRoute>} />
        <Route path="/notifikasi" element={<ProtectedRoute><NotifikasiPage /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} /> */}

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;

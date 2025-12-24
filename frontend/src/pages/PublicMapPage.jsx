import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapDisplay from "../components/map/MapDisplay";
import GuestAssetPanel from "../components/map/GuestAssetPanel";
import MapLegend from "../components/map/MapLegend";

export default function PublicMapPage() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedLayers, setSelectedLayers] = useState({
    aktif: true,
    berperkara: true,
    tidak_aktif: true,
    dijual: true,
  });

  // Sample assets - same data as MapPage
  const allAssets = [
    {
      id: 1,
      kode_aset: "AST-001",
      nama_aset: "Tanah Alun-Alun Kota Pasuruan",
      lokasi: "Jl. Alun-Alun No. 1, Kota Pasuruan",
      status: "aktif",
      luas: "500.00",
      tahun: "2020",
      latitude: -7.6457,
      longitude: 112.9061,
    },
    {
      id: 2,
      kode_aset: "AST-002",
      nama_aset: "Gedung Kantor Pemkot Pasuruan",
      lokasi: "Jl. Pahlawan No. 5, Kota Pasuruan",
      status: "aktif",
      luas: "1200.00",
      tahun: "2018",
      latitude: -7.6485,
      longitude: 112.9095,
    },
    {
      id: 3,
      kode_aset: "AST-003",
      nama_aset: "Tanah Pelabuhan Pasuruan",
      lokasi: "Jl. Pelabuhan, Kota Pasuruan",
      status: "berperkara",
      luas: "850.00",
      tahun: "2015",
      latitude: -7.6350,
      longitude: 112.9020,
    },
    {
      id: 4,
      kode_aset: "AST-004",
      nama_aset: "Lapangan Untung Suropati",
      lokasi: "Jl. Untung Suropati, Kota Pasuruan",
      status: "aktif",
      luas: "3200.00",
      tahun: "2019",
      latitude: -7.6520,
      longitude: 112.9150,
    },
    {
      id: 5,
      kode_aset: "AST-005",
      nama_aset: "Taman Kota Pasuruan",
      lokasi: "Jl. Veteran, Kota Pasuruan",
      status: "dijual",
      luas: "6500.00",
      tahun: "2008",
      latitude: -7.6400,
      longitude: 112.9130,
    },
  ];

  // Filter assets by selected layers
  const filteredAssets = allAssets.filter(
    (asset) => selectedLayers[asset.status]
  );

  const handleLayerToggle = (layerId) => {
    setSelectedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const handleMarkerClick = (asset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="h-screen w-screen bg-surface relative overflow-hidden">
      {/* Map Display */}
      <MapDisplay 
        assets={filteredAssets} 
        onMarkerClick={handleMarkerClick} 
      />

      {/* Top Bar - Login CTA */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => navigate("/login")}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </button>
      </div>

      {/* Info Banner */}
      <div className="absolute top-4 left-4 right-20 z-10">
        <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🗺️</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-text-primary">Peta Aset Tanah Publik</h1>
              <p className="text-xs text-text-tertiary mt-0.5">
                Klik marker untuk melihat info. Login untuk akses detail lengkap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        <MapLegend 
          selectedLayers={selectedLayers} 
          onLayerToggle={handleLayerToggle}
        />
      </div>

      {/* Guest Asset Panel */}
      {selectedAsset && (
        <GuestAssetPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}

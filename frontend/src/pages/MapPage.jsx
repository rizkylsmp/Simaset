import { useState } from "react";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import MapFilter from "../components/map/MapFilter";
import MapDisplay from "../components/map/MapDisplay";
import AssetDetailPanel from "../components/map/AssetDetailPanel";
import MapLegend from "../components/map/MapLegend";

export default function MapPage() {
  const [selectedLayers, setSelectedLayers] = useState({
    rencana_tata: true,
    potensi_berperkara: false,
    sebaran_perkara: false,
    umum_publik: true,
  });

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    lokasi: "",
    tahun: "",
    jenis: "",
  });

  // Sample assets with coordinates
  const allAssets = [
    {
      id: 1,
      kode_aset: "AST-001",
      nama_aset: "Tanah Jl. Malioboro",
      lokasi: "Jl. Malioboro No. 12, Yogyakarta",
      status: "aktif",
      luas: "500.00",
      tahun: "2020",
      latitude: -7.797068,
      longitude: 110.370529,
    },
    {
      id: 2,
      kode_aset: "AST-002",
      nama_aset: "Gedung Kantor Pemkot",
      lokasi: "Jl. Kenari No 5, Yogyakarta",
      status: "aktif",
      luas: "1200.00",
      tahun: "2018",
      latitude: -7.8,
      longitude: 110.375,
    },
    {
      id: 3,
      kode_aset: "AST-003",
      nama_aset: "Tanah Tugu Pal Putih",
      lokasi: "Jl. Tugu, Yogyakarta",
      status: "berperkara",
      luas: "850.00",
      tahun: "2015",
      latitude: -7.795,
      longitude: 110.365,
    },
    {
      id: 4,
      kode_aset: "AST-004",
      nama_aset: "Lapangan Parkir Kridosono",
      lokasi: "Jl. Kridosono, Yogyakarta",
      status: "aktif",
      luas: "3200.00",
      tahun: "2019",
      latitude: -7.79,
      longitude: 110.38,
    },
    {
      id: 5,
      kode_aset: "AST-005",
      nama_aset: "Taman Pintar",
      lokasi: "Jl. Panembahan Senopati, Yogyakarta",
      status: "dijual",
      luas: "6500.00",
      tahun: "2008",
      latitude: -7.805,
      longitude: 110.36,
    },
  ];

  const handleLayerToggle = (layerId) => {
    setSelectedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleMarkerClick = (asset) => {
    setSelectedAsset(asset);
  };

  const handleCloseDetail = () => {
    setSelectedAsset(null);
  };

  // Filter assets based on search and filters
  const filteredAssets = allAssets.filter((asset) => {
    const matchSearch =
      !searchTerm ||
      asset.nama_aset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.kode_aset.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = !filters.status || asset.status === filters.status;
    const matchTahun = !filters.tahun || asset.tahun === filters.tahun;

    return matchSearch && matchStatus && matchTahun;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Map Filter */}
          <MapFilter
            selectedLayers={selectedLayers}
            onLayerToggle={handleLayerToggle}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          {/* Map Display */}
          <div className="flex-1 relative">
            <MapDisplay
              assets={filteredAssets}
              onMarkerClick={handleMarkerClick}
            />

            {/* Legend */}
            <MapLegend />

            {/* Asset Detail Panel */}
            {selectedAsset && (
              <AssetDetailPanel
                asset={selectedAsset}
                onClose={handleCloseDetail}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

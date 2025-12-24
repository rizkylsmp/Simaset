import { useState } from "react";
import MapFilter from "../components/map/MapFilter";
import MapDisplay from "../components/map/MapDisplay";
import AssetDetailPanel from "../components/map/AssetDetailPanel";
import AssetDetailSlidePanel from "../components/map/AssetDetailSlidePanel";
import MapLegend from "../components/map/MapLegend";

export default function MapPage() {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState({
    rencana_tata: true,
    potensi_berperkara: false,
    sebaran_perkara: false,
    umum_publik: true,
  });

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
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

  const handleViewDetail = (asset) => {
    setDetailAsset(asset);
  };

  const handleCloseSlidePanel = () => {
    setDetailAsset(null);
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Mobile Filter Overlay */}
      {showMobileFilter && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Filter Peta</h2>
                <p className="text-xs text-gray-500 mt-1">Atur tampilan layer peta</p>
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MapFilter
                selectedLayers={selectedLayers}
                onLayerToggle={handleLayerToggle}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </>
      )}

      {/* Map Filter - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:flex-col w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">Filter Peta</h2>
          <p className="text-xs text-gray-500 mt-1">Atur tampilan layer peta</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MapFilter
            selectedLayers={selectedLayers}
            onLayerToggle={handleLayerToggle}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Map Display */}
      <div className="flex-1 relative">
        <MapDisplay
          assets={filteredAssets}
          onMarkerClick={handleMarkerClick}
        />

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden absolute top-4 left-4 bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-2.5 flex items-center gap-2 z-10 hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filter</span>
        </button>

        {/* Legend */}
        <div className="absolute bottom-4 left-4">
          <MapLegend />
        </div>

        {/* Asset Detail Panel */}
        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            onClose={handleCloseDetail}
            onViewDetail={handleViewDetail}
          />
        )}
      </div>

      {/* Asset Detail Slide Panel */}
      {detailAsset && (
        <AssetDetailSlidePanel
          asset={detailAsset}
          onClose={handleCloseSlidePanel}
        />
      )}
    </div>
  );
}

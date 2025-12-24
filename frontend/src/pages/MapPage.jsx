import { useState } from "react";
import MapFilter from "../components/map/MapFilter";
import MapDisplay from "../components/map/MapDisplay";
import AssetDetailPanel from "../components/map/AssetDetailPanel";
import AssetDetailSlidePanel from "../components/map/AssetDetailSlidePanel";
import MapLegend from "../components/map/MapLegend";

export default function MapPage() {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showDesktopFilter, setShowDesktopFilter] = useState(true);
  // Status filter untuk menampilkan/menyembunyikan marker berdasarkan status
  const [selectedLayers, setSelectedLayers] = useState({
    aktif: true,
    berperkara: true,
    tidak_aktif: true,
    dijual: true,
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

  // Sample assets with coordinates - Kota Pasuruan, Jawa Timur
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

  // Filter assets based on search, filters, and selected layers (status checkboxes)
  const filteredAssets = allAssets.filter((asset) => {
    // Filter berdasarkan checkbox status layer
    const matchLayer = selectedLayers[asset.status] !== false;

    const matchSearch =
      !searchTerm ||
      asset.nama_aset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.kode_aset.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = !filters.status || asset.status === filters.status;
    const matchTahun = !filters.tahun || asset.tahun === filters.tahun;

    return matchLayer && matchSearch && matchStatus && matchTahun;
  });

  return (
    <div className="flex h-full overflow-hidden bg-surface-secondary">
      {/* Mobile Filter Overlay */}
      {showMobileFilter && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-surface z-50 lg:hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-border-light shrink-0 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-text-primary">Filter Peta</h2>
                <p className="text-xs text-text-muted mt-1">Atur tampilan layer peta</p>
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-tertiary rounded-lg transition-colors text-text-secondary"
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

      {/* Map Display - Full width */}
      <div className="flex-1 relative h-full overflow-hidden">
        <MapDisplay
          assets={filteredAssets}
          onMarkerClick={handleMarkerClick}
        />

        {/* Desktop Filter Sidebar - Overlay */}
        <div className={`hidden lg:flex lg:flex-col absolute top-0 left-0 h-full bg-surface border-r border-border shadow-xl z-20 transition-transform duration-300 ${showDesktopFilter ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '320px' }}>
          <div className="p-4 border-b border-border-light shrink-0 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Filter Peta</h2>
              <p className="text-xs text-text-muted mt-1">Atur tampilan layer peta</p>
            </div>
            <button
              onClick={() => setShowDesktopFilter(false)}
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-tertiary rounded-lg transition-colors text-text-secondary"
              title="Sembunyikan Filter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
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

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden absolute top-4 left-4 bg-surface rounded-xl border border-border shadow-lg px-4 py-2.5 flex items-center gap-2 z-10 hover:bg-surface-secondary transition-all"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-text-secondary">Filter</span>
        </button>

        {/* Desktop Toggle Filter Button - Show when sidebar is hidden */}
        {!showDesktopFilter && (
          <button
            onClick={() => setShowDesktopFilter(true)}
            className="hidden lg:flex absolute top-4 left-4 bg-surface rounded-xl border border-border shadow-lg px-4 py-2.5 items-center gap-2 z-10 hover:bg-surface-secondary transition-all"
            title="Tampilkan Filter"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-text-secondary">Filter</span>
          </button>
        )}

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

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MapFilter from "../components/map/MapFilter";
import MapDisplay from "../components/map/MapDisplay";
import AssetDetailPanel from "../components/map/AssetDetailPanel";
import AssetViewModal from "../components/asset/AssetViewModal";
import AssetFormModal from "../components/asset/AssetFormModal";
import MapLegend from "../components/map/MapLegend";
import { petaService, asetService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import {
  FunnelIcon,
  XIcon,
  MapTrifoldIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

export default function MapPage() {
  const location = useLocation();
  const highlightAssetId = location.state?.highlightAssetId || null;
  const filterStatus = location.state?.filterStatus || null;
  const hasHighlighted = useRef(false);
  const hasAppliedFilter = useRef(false);

  // Auth & Permissions
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const canUpdate = hasPermission(userRole, "aset", "update");

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showDesktopFilter, setShowDesktopFilter] = useState(true);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status filter untuk menampilkan/menyembunyikan marker berdasarkan status
  const [selectedLayers, setSelectedLayers] = useState({
    aktif: true,
    berperkara: true,
    tidak_aktif: true,
    indikasi_berperkara: true,
  });

  // Layer visibility toggles
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showKecamatanLayer, setShowKecamatanLayer] = useState(false);
  const [showKelurahanLayer, setShowKelurahanLayer] = useState(false);
  const [showSewaLayer, setShowSewaLayer] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    lokasi: "",
    tahun: "",
    jenis: "",
  });

  // Fetch markers from API
  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await petaService.getMarkers();
      const markers = response.data.data || [];

      // Transform to consistent format
      const transformedAssets = markers.map((marker) => ({
        id: marker.id,
        kode_aset: marker.kode,
        nama_aset: marker.nama,
        lokasi: marker.lokasi,
        status: marker.status?.toLowerCase().replace(/\s+/g, "_") || "aktif",
        luas: marker.luas?.toString() || "0",
        tahun: marker.tahun?.toString() || "-",
        jenis_aset: marker.jenis,
        latitude: marker.lat,
        longitude: marker.lng,
        polygon: marker.polygon || null,
      }));

      setAssets(transformedAssets);
    } catch (error) {
      console.error("Error fetching markers:", error);
      toast.error("Gagal memuat data peta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  // Auto-highlight asset when navigated from Pusat Data
  useEffect(() => {
    if (highlightAssetId && assets.length > 0 && !hasHighlighted.current) {
      const target = assets.find(
        (a) => String(a.id) === String(highlightAssetId),
      );
      if (target) {
        hasHighlighted.current = true;
        setSelectedAsset(target);
      }
    }
  }, [highlightAssetId, assets]);

  // Auto-apply status filter when navigated from Dashboard chart
  useEffect(() => {
    if (filterStatus && !hasAppliedFilter.current) {
      hasAppliedFilter.current = true;
      // Map status names to selectedLayers keys
      const statusMap = {
        aktif: "aktif",
        berperkara: "berperkara",
        indikasi_berperkara: "indikasi_berperkara",
        tidak_aktif: "tidak_aktif",
      };
      const targetKey = statusMap[filterStatus];
      if (targetKey) {
        // Only show the selected status layer
        setSelectedLayers({
          aktif: targetKey === "aktif",
          berperkara: targetKey === "berperkara",
          tidak_aktif: targetKey === "tidak_aktif",
          indikasi_berperkara: targetKey === "indikasi_berperkara",
        });
        // Also show kecamatan layer so user sees which kecamatan have that status
        setShowKecamatanLayer(true);
      }
    }
  }, [filterStatus]);

  // Fetch full asset detail
  const fetchAssetDetail = async (assetId) => {
    try {
      const response = await asetService.getById(assetId);
      if (response.data.success) {
        setDetailAsset(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching asset detail:", error);
      toast.error("Gagal memuat detail aset");
    }
  };

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
    fetchAssetDetail(asset.id);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setDetailAsset(null);
  };

  const handleEditFromModal = async (assetId) => {
    try {
      const response = await asetService.getById(assetId);
      setEditingAsset(response.data.data);
      setIsViewModalOpen(false);
      setDetailAsset(null);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Gagal memuat data aset untuk diedit");
    }
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingAsset(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingAsset?.id_aset) {
        await asetService.update(editingAsset.id_aset, formData);
        toast.success("Aset berhasil diperbarui");
      }
      handleCloseForm();
      fetchMarkers(); // Refresh map markers
    } catch (error) {
      console.error("Error saving asset:", error);
      const errorMsg = error.response?.data?.error || "Gagal menyimpan aset";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter assets based on search, filters, and selected layers (status checkboxes)
  const filteredAssets = assets.filter((asset) => {
    // Filter berdasarkan checkbox status layer
    const normalizedStatus = asset.status?.toLowerCase().replace(/\s+/g, "_");
    const matchLayer = selectedLayers[normalizedStatus] !== false;

    const matchSearch =
      !searchTerm ||
      asset.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = !filters.status || normalizedStatus === filters.status;
    const matchTahun = !filters.tahun || asset.tahun === filters.tahun;
    const matchJenis = !filters.jenis || asset.jenis_aset === filters.jenis;

    return matchLayer && matchSearch && matchStatus && matchTahun && matchJenis;
  });

  return (
    <div className="flex h-full overflow-hidden bg-surface-secondary">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-surface rounded-2xl border border-border shadow-xl">
            <div className="relative">
              <div className="animate-spin w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"></div>
              <MapTrifoldIcon
                size={24}
                weight="fill"
                className="text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <span className="text-sm font-medium text-text-secondary">
              Memuat peta...
            </span>
          </div>
        </div>
      )}

      {/* Mobile Filter Overlay */}
      {showMobileFilter && (
        <>
          <div
            className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-surface z-50 lg:hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border shrink-0 flex items-center justify-between bg-surface-secondary">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                  <FunnelIcon size={18} weight="fill" className="text-accent" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Filter Peta</h2>
                  <p className="text-xs text-text-muted">Atur tampilan layer</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-surface-tertiary rounded-xl transition-colors text-text-secondary"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MapFilter
                selectedLayers={selectedLayers}
                onLayerToggle={handleLayerToggle}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                assets={assets}
                showKecamatanLayer={showKecamatanLayer}
                showKelurahanLayer={showKelurahanLayer}
                onToggleKecamatan={() =>
                  setShowKecamatanLayer(!showKecamatanLayer)
                }
                onToggleKelurahan={() =>
                  setShowKelurahanLayer(!showKelurahanLayer)
                }
                showSewaLayer={showSewaLayer}
                onToggleSewa={() => setShowSewaLayer(!showSewaLayer)}
              />
            </div>
          </div>
        </>
      )}

      {/* Map Display - Full width */}
      <div
        id="map-fullscreen-container"
        className="flex-1 relative h-full overflow-hidden"
      >
        <MapDisplay
          assets={filteredAssets}
          onMarkerClick={handleMarkerClick}
          showMarkers={showMarkers}
          showPolygons={showPolygons}
          highlightAssetId={highlightAssetId}
          showKecamatanLayer={showKecamatanLayer}
          showKelurahanLayer={showKelurahanLayer}
        />

        {/* Desktop Filter Sidebar - Overlay */}
        <div
          className={`hidden lg:flex lg:flex-col absolute top-0 left-0 h-full bg-surface/95 backdrop-blur-md border-r border-border shadow-2xl z-20 transition-all duration-300 ${
            showDesktopFilter
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
          style={{ width: "340px" }}
        >
          <div className="p-4 border-b border-border shrink-0 flex items-center justify-between bg-surface-secondary/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <FunnelIcon size={20} weight="fill" className="text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-text-primary">Filter Peta</h2>
                <p className="text-xs text-text-muted">
                  Atur tampilan layer peta
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDesktopFilter(false)}
              className="w-9 h-9 flex items-center justify-center hover:bg-surface-tertiary rounded-xl transition-colors text-text-secondary"
              title="Sembunyikan Filter"
            >
              <CaretLeftIcon size={20} weight="bold" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MapFilter
              selectedLayers={selectedLayers}
              onLayerToggle={handleLayerToggle}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              assets={assets}
              showKecamatanLayer={showKecamatanLayer}
              showKelurahanLayer={showKelurahanLayer}
              onToggleKecamatan={() =>
                setShowKecamatanLayer(!showKecamatanLayer)
              }
              onToggleKelurahan={() =>
                setShowKelurahanLayer(!showKelurahanLayer)
              }
              showSewaLayer={showSewaLayer}
              onToggleSewa={() => setShowSewaLayer(!showSewaLayer)}
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden absolute top-4 left-4 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl px-4 py-3 flex items-center gap-2 z-10 hover:bg-surface transition-all"
        >
          <FunnelIcon size={18} weight="bold" className="text-accent" />
          <span className="text-sm font-medium text-text-primary">Filter</span>
          {Object.values(selectedLayers).some((v) => v === false) && (
            <span className="w-2 h-2 rounded-full bg-accent"></span>
          )}
        </button>

        {/* Desktop Toggle Filter Button - Show when sidebar is hidden */}
        {!showDesktopFilter && (
          <button
            onClick={() => setShowDesktopFilter(true)}
            className="hidden lg:flex absolute top-4 left-4 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl px-4 py-3 items-center gap-2 z-10 hover:bg-surface transition-all group"
            title="Tampilkan Filter"
          >
            <FunnelIcon size={18} weight="bold" className="text-accent" />
            <span className="text-sm font-medium text-text-primary">
              Filter
            </span>
            <CaretRightIcon
              size={16}
              weight="bold"
              className="text-text-muted group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        )}

        {/* Layer Controls */}
        <div className="absolute top-4 right-4 z-10">
          <MapLegend
            showMarkers={showMarkers}
            showPolygons={showPolygons}
            onToggleMarkers={() => setShowMarkers(!showMarkers)}
            onTogglePolygons={() => setShowPolygons(!showPolygons)}
          />
        </div>

        {/* Asset Count Badge */}
        <div className="absolute bottom-16 sm:bottom-4 left-4 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl px-4 py-2.5 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-sm font-medium text-text-primary">
              {filteredAssets.length}
            </span>
            <span className="text-xs text-text-muted">aset ditemukan</span>
          </div>
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

      {/* Asset View Modal */}
      <AssetViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        asset={detailAsset}
        onEdit={canUpdate ? handleEditFromModal : null}
        canEdit={canUpdate}
      />

      {/* Asset Edit Form Modal */}
      <AssetFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        assetData={editingAsset}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

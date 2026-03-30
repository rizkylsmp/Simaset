import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MapDisplayBPN from "../components/map/bpn/MapDisplayBPN";
import AssetViewModal from "../components/asset/AssetViewModal";
import AssetFormModal from "../components/asset/AssetFormModal";
import { petaService, asetService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import { MapTrifoldIcon } from "@phosphor-icons/react";

export default function MapPage() {
  const location = useLocation();
  const highlightAssetId = location.state?.highlightAssetId || null;
  const filterStatus = location.state?.filterStatus || null;
  const hasAppliedFilter = useRef(false);
  const highlightRequestKey = `${location.key || "default"}-${highlightAssetId || "none"}`;

  // Auth & Permissions
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const isBPNRole = userRole === "bpn" || userRole === "admin_bpn";
  const isBPKADRole = userRole === "bpkad" || userRole === "admin_bpkad";
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
    bermasalah: true,
    diblokir: true,
    indikasi_bermasalah: true,
  });

  // Layer visibility toggles
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showKecamatanLayer, setShowKecamatanLayer] = useState(false);
  const [showKelurahanLayer, setShowKelurahanLayer] = useState(false);
  const [showSewaLayer, setShowSewaLayer] = useState(false);

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
        status_sertifikat: marker.status_sertifikat || null,
        jenis_masalah: marker.jenis_masalah || null,
        luas: marker.luas?.toString() || "0",
        tahun: marker.tahun?.toString() || "-",
        jenis_aset: marker.jenis,
        keterangan: marker.keterangan || null,
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

  // Auto-apply status filter when navigated from Dashboard chart
  useEffect(() => {
    if (filterStatus && !hasAppliedFilter.current) {
      hasAppliedFilter.current = true;
      // Map status names to selectedLayers keys
      const statusMap = {
        aktif: "aktif",
        bermasalah: "bermasalah",
        indikasi_bermasalah: "indikasi_bermasalah",
        diblokir: "diblokir",
      };
      const targetKey = statusMap[filterStatus];
      if (targetKey) {
        // Only show the selected status layer
        setSelectedLayers({
          aktif: targetKey === "aktif",
          bermasalah: targetKey === "bermasalah",
          diblokir: targetKey === "diblokir",
          indikasi_bermasalah: targetKey === "indikasi_bermasalah",
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
    const matchLayer = isBPNRole
      ? selectedLayers[normalizedStatus] !== false
      : true;

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

      {/* Map Display - Full width */}
      <div
        id="map-fullscreen-container"
        className="flex-1 relative h-full overflow-hidden"
      >
        {/* WebGIS map with role-based mode */}
        <MapDisplayBPN
          assets={filteredAssets}
          mode={isBPKADRole ? "bpkad" : "bpn"}
          highlightAssetId={highlightAssetId}
          highlightRequestKey={highlightRequestKey}
        />

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
        isBPKADMode={isBPKADRole}
      />
    </div>
  );
}

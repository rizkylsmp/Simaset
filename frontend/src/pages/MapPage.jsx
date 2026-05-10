import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MapDisplayBPN from "../components/map/bpn/MapDisplayBPN";
import MapFilter from "../components/map/bpn/MapFilter";
import BPNLayerControl from "../components/map/bpn/BPNLayerControl";
import AssetViewModal from "../components/asset/AssetViewModal";
import AssetFormModal from "../components/asset/AssetFormModal";
import AssetDetailPanel from "../components/map/shared/AssetDetailPanel";
import { petaService, asetService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import { MapTrifoldIcon, FunnelIcon, XIcon } from "@phosphor-icons/react";

const MAP_SEARCH_FIELDS = [
  "nama_aset",
  "kode_aset",
  "nib",
  "nibar",
  "nomor_sertifikat",
  "opd_pengguna",
  "lokasi",
  "kecamatan",
  "desa_kelurahan",
];

function normalizeSearchText(value) {
  return value ? String(value).toLowerCase().trim() : "";
}

function normalizeSearchDigits(value) {
  return value ? String(value).replace(/\D/g, "") : "";
}

function matchesSearchValue(value, query, queryDigits) {
  const text = normalizeSearchText(value);
  if (text.includes(query)) return true;

  const digits = normalizeSearchDigits(value);
  return queryDigits.length >= 2 && digits.includes(queryDigits);
}

function parseMapPolygon(raw) {
  if (!raw) return null;
  if (Array.isArray(raw) || typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hasCoordinatePair(latitude, longitude) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function hasPolygonCoordinates(value) {
  if (!value) return false;

  if (typeof value === "string") {
    try {
      return hasPolygonCoordinates(JSON.parse(value));
    } catch {
      return false;
    }
  }

  if (Array.isArray(value)) {
    const [first, second] = value;
    if (hasCoordinatePair(first, second)) return true;
    return value.some((item) => hasPolygonCoordinates(item));
  }

  if (typeof value === "object") {
    if (hasCoordinatePair(value.lat, value.lng)) return true;
    if (hasCoordinatePair(value.latitude, value.longitude)) return true;
    return ["coordinates", "geometry", "features"].some((key) =>
      hasPolygonCoordinates(value[key]),
    );
  }

  return false;
}

function hasMapGeometry(asset) {
  return (
    hasCoordinatePair(asset?.latitude, asset?.longitude) ||
    hasPolygonCoordinates(asset?.polygon)
  );
}

export default function MapPage() {
  const location = useLocation();
  const navHighlightAssetId = location.state?.highlightAssetId || null;
  const filterStatus = location.state?.filterStatus || null;
  const hasAppliedFilter = useRef(false);
  const navHighlightRequestKey = `${location.key || "default"}-${navHighlightAssetId || "none"}`;

  // Search-triggered flyTo
  const [focusAssetId, setFocusAssetId] = useState(null);
  const [focusKey, setFocusKey] = useState(0);
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isMapSearchLoading, setIsMapSearchLoading] = useState(false);

  // Merge: search focus takes priority over navigation highlight
  const effectiveHighlightId = focusAssetId || navHighlightAssetId;
  const effectiveHighlightKey = focusAssetId
    ? `search-${focusKey}`
    : navHighlightRequestKey;

  // Auth & Permissions
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const isBPNRole = userRole === "bpn" || userRole === "admin_bpn";
  const isBPKARole = userRole === "bpka" || userRole === "admin_bpka";
  const canUpdate = hasPermission(userRole, "aset", "update");

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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

  // Sewa filter untuk BPKA — off by default; active only after a status is selected.
  const [selectedSewaLayers, setSelectedSewaLayers] = useState({
    tersedia: false,
    tersewa: false,
  });

  // Layer visibility toggles
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showKecamatanLayer, setShowKecamatanLayer] = useState(false);
  const [showKelurahanLayer, setShowKelurahanLayer] = useState(false);
  const [showSewaLayer, setShowSewaLayer] = useState(false);

  const [detailAsset, setDetailAsset] = useState(null);
  const [selectedPanelAsset, setSelectedPanelAsset] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Map control state (lifted from MapDisplayBPN for side panel)
  const [activeLayer, setActiveLayer] = useState("bidang");
  const [mapMode, setMapMode] = useState("2d");
  const [showKelurahan, setShowKelurahan] = useState(true);
  const [showKecamatan, setShowKecamatan] = useState(true);
  const [showSudahSertifikat, setShowSudahSertifikat] = useState(true);
  const [showBelumSertifikat, setShowBelumSertifikat] = useState(true);

  // Fetch markers from API
  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await petaService.getMarkers({
        mode: isBPKARole ? "bpka" : "bpn",
      });
      const markers = response.data.data || [];

      // Transform to consistent format
      const transformedAssets = markers.map((marker) => ({
        id: marker.id,
        kode_aset: marker.kode,
        nib: marker.nib || null,
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
        polygon: parseMapPolygon(marker.polygon),
        nomor_sertifikat: marker.nomor_sertifikat || null,
        jenis_hak: marker.jenis_hak || null,
        kecamatan: marker.kecamatan || null,
        desa_kelurahan: marker.desa_kelurahan || null,
        penggunaan_saat_ini: marker.penggunaan_saat_ini || null,
        luas_lapangan: marker.luas_lapangan?.toString() || null,
        opd_pengguna: marker.opd_pengguna || null,
        atas_nama: marker.atas_nama || null,
        status_hukum: marker.status_hukum || null,
        nibar: marker.nibar || null,
        kw: marker.kw || null,
        status_sewa: marker.status_sewa || "Tidak Disewakan",
        penyewa_aktif: marker.penyewa_aktif || null,
      }));

      setAssets(transformedAssets);
    } catch (error) {
      console.error("Error fetching markers:", error);
      toast.error("Gagal memuat data peta");
    } finally {
      setLoading(false);
    }
  }, [isBPKARole]);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  useEffect(() => {
    const term = searchFilter.trim();

    if (term.length < 2) {
      setMapSearchResults([]);
      setIsMapSearchLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setIsMapSearchLoading(true);
      try {
        const response = await asetService.getAll({
          search: term,
          limit: 8,
          page: 1,
        });
        const results = response.data.data || [];
        setMapSearchResults(
          results.map((asset) => ({
            id: asset.id_aset,
            kode_aset: asset.kode_aset,
            nib: asset.nib || null,
            nama_aset: asset.nama_aset,
            lokasi: asset.lokasi,
            status: asset.status?.toLowerCase().replace(/\s+/g, "_") || "aktif",
            status_sertifikat: asset.status_sertifikat || null,
            jenis_masalah: asset.jenis_masalah || null,
            luas: asset.luas?.toString() || "0",
            tahun: asset.tahun_perolehan?.toString() || "-",
            jenis_aset: asset.jenis_aset,
            keterangan: asset.keterangan || null,
            latitude: asset.koordinat_lat ? Number(asset.koordinat_lat) : null,
            longitude: asset.koordinat_long ? Number(asset.koordinat_long) : null,
            polygon: parseMapPolygon(asset.polygon_bidang),
            nomor_sertifikat: asset.nomor_sertifikat || null,
            jenis_hak: asset.jenis_hak || null,
            kecamatan: asset.kecamatan || null,
            desa_kelurahan: asset.desa_kelurahan || null,
            penggunaan_saat_ini: asset.penggunaan_saat_ini || null,
            luas_lapangan: asset.luas_lapangan?.toString() || null,
            opd_pengguna: asset.opd_pengguna || null,
            atas_nama: asset.atas_nama || null,
            status_hukum: asset.status_hukum || null,
            nibar: asset.nibar || null,
            kw: asset.kw || null,
            status_sewa: asset.status_sewa || "Tidak Disewakan",
            penyewa_aktif: asset.penyewa_aktif || null,
          })),
        );
      } catch (error) {
        console.error("Error searching map assets:", error);
        setMapSearchResults([]);
      } finally {
        setIsMapSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchFilter]);

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

  const handleSewaLayerToggle = (layerId) => {
    setSelectedSewaLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const handleSearch = (term) => {
    setSearchFilter(term || "");
    // Search is handled internally by MapFilter dropdown — no map-level filter needed
  };

  const handleSelectSearchAsset = (asset) => {
    const fullAsset =
      assets.find((item) => String(item.id) === String(asset.id)) || asset;
    const normalizedStatus = fullAsset.status
      ?.toLowerCase()
      .replace(/\s+/g, "_");

    if (isBPNRole && normalizedStatus && selectedLayers[normalizedStatus] === false) {
      setSelectedLayers((prev) => ({
        ...prev,
        [normalizedStatus]: true,
      }));
    }

    if (isBPKARole && fullAsset.status_sewa) {
      if (fullAsset.status_sewa === "Tersedia" && !selectedSewaLayers.tersedia) {
        setSelectedSewaLayers((prev) => ({ ...prev, tersedia: true }));
      }
      if (fullAsset.status_sewa === "Tersewa" && !selectedSewaLayers.tersewa) {
        setSelectedSewaLayers((prev) => ({ ...prev, tersewa: true }));
      }
    }

    setActiveLayer("bidang");
    setFocusAssetId(asset.id);
    setFocusKey((prev) => prev + 1);
  };

  const handleViewDetail = (asset) => {
    // Set partial data immediately so modal renders at once (no invisible flash)
    setDetailAsset({
      ...asset,
      id_aset: asset.id, // modal edit button uses id_aset
      tahun_perolehan: asset.tahun, // remap tahun → tahun_perolehan
    });
    setIsViewModalOpen(true);
    setSelectedPanelAsset(null);
    // Enrich with full data from backend in background
    fetchAssetDetail(asset.id);
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

  // Filter assets based on search and visible layer toggles.
  // NOTE: Search is NOT applied here — it only powers the dropdown/flyTo in MapFilter.
  const filteredAssets = assets.filter((asset) => {
    const query = normalizeSearchText(searchFilter);
    const queryDigits = normalizeSearchDigits(searchFilter);
    const matchSearch =
      !query ||
      MAP_SEARCH_FIELDS.some((field) =>
        matchesSearchValue(asset[field], query, queryDigits),
      );

    // Filter berdasarkan checkbox status layer
    const normalizedStatus = asset.status?.toLowerCase().replace(/\s+/g, "_");
    const matchLayer = isBPNRole
      ? selectedLayers[normalizedStatus] !== false
      : true;

    // Filter berdasarkan sewa layer (BPKA only).
    // When all sewa filters are off, show all Aset Pemkot instead of filtering
    // everything out.
    const isSewaFilterActive = Object.values(selectedSewaLayers).some(Boolean);
    const matchSewaLayer = isBPKARole
      ? !isSewaFilterActive ||
        (asset.status_sewa === "Tersedia" && selectedSewaLayers.tersedia) ||
        (asset.status_sewa === "Tersewa" && selectedSewaLayers.tersewa)
      : true;

    return matchSearch && matchLayer && matchSewaLayer;
  });

  const mapLookupAssets = useMemo(() => {
    const assetById = new Map();

    [...assets, ...mapSearchResults].forEach((asset) => {
      if (asset?.id === null || asset?.id === undefined) return;
      assetById.set(String(asset.id), asset);
    });

    return Array.from(assetById.values());
  }, [assets, mapSearchResults]);

  const displayedMapAssets = useMemo(() => {
    const assetById = new Map();

    filteredAssets.forEach((asset) => {
      if (asset?.id === null || asset?.id === undefined) return;
      assetById.set(String(asset.id), asset);
    });

    mapSearchResults.forEach((asset) => {
      if (asset?.id === null || asset?.id === undefined) return;
      if (!hasMapGeometry(asset)) return;
      assetById.set(String(asset.id), asset);
    });

    return Array.from(assetById.values());
  }, [filteredAssets, mapSearchResults]);

  return (
    <div className="flex h-full overflow-hidden bg-surface-secondary relative">
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
        <MapDisplayBPN
          assets={displayedMapAssets}
          allAssets={mapLookupAssets}
          mode={isBPKARole ? "bpka" : "bpn"}
          highlightAssetId={effectiveHighlightId}
          highlightRequestKey={effectiveHighlightKey}
          onFeatureClick={(asset) => setSelectedPanelAsset(asset)}
          onOtherLayerClick={() => setSelectedPanelAsset(null)}
          showControls={false}
          activeLayer={activeLayer}
          mapMode={mapMode}
          showKelurahan={showKelurahan}
          showKecamatan={showKecamatan}
          showSudahSertifikat={showSudahSertifikat}
          showBelumSertifikat={showBelumSertifikat}
        />

        {/* Filter Toggle Button — top-left */}
        {!showFilterPanel && (
          <button
            onClick={() => setShowFilterPanel(true)}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-surface/95 backdrop-blur-sm border border-border rounded-xl px-3.5 py-2.5 shadow-lg hover:bg-surface hover:shadow-xl transition-all group"
          >
            <FunnelIcon size={16} weight="bold" className="text-accent" />
            <span className="text-xs font-bold text-text-primary">Panel</span>
            {(searchFilter ||
              (isBPNRole &&
                Object.values(selectedLayers).some((v) => v === false)) ||
              (isBPKARole &&
                Object.values(selectedSewaLayers).some(Boolean))) && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>
        )}

        {/* Dot / 2D / 3D Mode Toggle — bottom-right */}
        <div className="absolute bottom-6 right-4 z-10">
          <div className="flex items-center bg-surface/95 dark:bg-surface-secondary/95 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-lg">
            {["dot", "2d", "3d"].map((m) => (
              <button
                key={m}
                onClick={() => setMapMode(m)}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  mapMode === m
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:bg-surface-secondary dark:hover:bg-surface hover:text-text-primary"
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={m === "dot" ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  {m === "dot" ? (
                    <circle cx="12" cy="12" r="5" />
                  ) : m === "2d" ? (
                    <>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 12h18" />
                      <path d="M12 3v18" />
                    </>
                  ) : (
                    <>
                      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                      <path d="M12 12l8-4.5" />
                      <path d="M12 12v9" />
                      <path d="M12 12L4 7.5" />
                    </>
                  )}
                </svg>
                <span>{m === "dot" ? "Dot" : m.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Asset Detail Panel */}
        {selectedPanelAsset && (
          <AssetDetailPanel
            asset={selectedPanelAsset}
            onClose={() => setSelectedPanelAsset(null)}
            onViewDetail={handleViewDetail}
          />
        )}
      </div>

      {/* Side Panel — slides in from left */}
      <div
        className={`absolute top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          showFilterPanel ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full w-80 bg-surface border-r border-border shadow-2xl flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <FunnelIcon size={16} weight="fill" className="text-accent" />
              <span className="text-sm font-bold text-text-primary">
                Kontrol Peta
              </span>
            </div>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text-primary transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>

          {/* Panel Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Asset count */}
            <div className="bg-surface-secondary rounded-xl border border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span className="text-xs font-semibold text-text-primary">
                  {filteredAssets.length}
                </span>
                <span className="text-[10px] text-text-muted">
                  aset ditemukan
                </span>
              </div>
            </div>

            {/* Layer Control */}
            <BPNLayerControl
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayer}
              panelTitle={
                isBPKARole ? "Kontrol Layer BPKA" : "Kontrol Layer BPN"
              }
              bidangLabel={
                isBPKARole ? "Aset Pemkot (BPKA)" : "Bidang Tanah (BPN)"
              }
              showKelurahan={showKelurahan}
              setShowKelurahan={setShowKelurahan}
              showKecamatan={showKecamatan}
              setShowKecamatan={setShowKecamatan}
              isBPKAMode={isBPKARole}
              showSudahSertifikat={showSudahSertifikat}
              setShowSudahSertifikat={setShowSudahSertifikat}
              showBelumSertifikat={showBelumSertifikat}
              setShowBelumSertifikat={setShowBelumSertifikat}
            />

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Filter & Statistics */}
            <MapFilter
              selectedLayers={selectedLayers}
              onLayerToggle={handleLayerToggle}
              selectedSewaLayers={selectedSewaLayers}
              onSewaLayerToggle={handleSewaLayerToggle}
              onSearch={handleSearch}
              onSelectAsset={handleSelectSearchAsset}
              assets={assets}
              searchResults={searchFilter.trim().length >= 2 ? mapSearchResults : null}
              searchLoading={isMapSearchLoading}
              isBPKAMode={isBPKARole}
            />
          </div>
        </div>
      </div>

      {/* Backdrop when panel is open on mobile */}
      {showFilterPanel && (
        <div
          className="absolute inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setShowFilterPanel(false)}
        />
      )}

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
        isBPKAMode={isBPKARole}
      />
    </div>
  );
}

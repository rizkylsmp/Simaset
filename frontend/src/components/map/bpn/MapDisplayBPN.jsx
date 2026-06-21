import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPinIcon, PolygonIcon, StackIcon } from "@phosphor-icons/react";
import BPNLayerControl from "./BPNLayerControl";
import "./mapLibreStyles.css";

const BPN_BIDANG_SOURCE = "/data/bidang_tanah.geojson";
const BPKA_BIDANG_SOURCE = "/data/bidang_tanah1.geojson";
const CERTIFIED_STATUS = "Telah Bersertifikat";
const UNCERTIFIED_STATUS = "Belum Bersertifikat";
const SELECTED_BIDANG_SOURCE_ID = "selected-bidang";
const SELECTED_BIDANG_FILL_LAYER_ID = "selected-bidang-fill";
const SELECTED_BIDANG_LINE_LAYER_ID = "selected-bidang-line";
const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
};
const MAPLIBRE_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAPLIBRE_BASEMAP_ID = "maplibre";
const BASEMAP_RASTER_SOURCE_ID = "selected-basemap-raster";
const BASEMAP_RASTER_LAYER_ID = "selected-basemap-raster-layer";
const CUSTOM_OVERLAY_SOURCE_IDS = new Set([
  "batas_wilayah",
  "batas_kecamatan",
  "bidang_tanah",
  "rdtr",
  "znt",
  "asset-dots",
  SELECTED_BIDANG_SOURCE_ID,
  "local-buildings",
  BASEMAP_RASTER_SOURCE_ID,
]);
const BASEMAP_OPTIONS = [
  { id: MAPLIBRE_BASEMAP_ID, label: "MapLibre" },
  {
    id: "osm",
    label: "OpenStreetMap",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 19,
    attribution: "OpenStreetMap contributors",
  },
  {
    id: "esri_satellite",
    label: "ESRI Satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution:
      "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
];

const toUpper = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const normalizeCertificateStatus = (status, certificateNumber) => {
  const statusText = toUpper(status);
  if (statusText.includes("BELUM")) return UNCERTIFIED_STATUS;
  if (statusText.includes("TELAH") || statusText.includes("SUDAH")) {
    return CERTIFIED_STATUS;
  }

  const certificateText = String(certificateNumber || "").trim();
  return certificateText.length > 10 ? CERTIFIED_STATUS : UNCERTIFIED_STATUS;
};

const getPolygonPoints = (rawPolygon, coordinateOrder = "latLng") => {
  if (!rawPolygon) return [];

  if (typeof rawPolygon === "string") {
    try {
      return getPolygonPoints(JSON.parse(rawPolygon), coordinateOrder);
    } catch {
      return [];
    }
  }

  if (Array.isArray(rawPolygon)) {
    const [first, second] = rawPolygon;
    const firstNumber = Number(first);
    const secondNumber = Number(second);

    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
      return coordinateOrder === "lngLat"
        ? [[secondNumber, firstNumber]]
        : [[firstNumber, secondNumber]];
    }

    return rawPolygon.flatMap((item) =>
      getPolygonPoints(item, coordinateOrder),
    );
  }

  if (typeof rawPolygon === "object") {
    const lat = Number(rawPolygon.lat ?? rawPolygon.latitude);
    const lng = Number(rawPolygon.lng ?? rawPolygon.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [[lat, lng]];
    }

    if (rawPolygon.coordinates) {
      return getPolygonPoints(rawPolygon.coordinates, "lngLat");
    }

    if (rawPolygon.geometry) {
      return getPolygonPoints(rawPolygon.geometry, coordinateOrder);
    }

    if (rawPolygon.features) {
      return getPolygonPoints(rawPolygon.features, coordinateOrder);
    }
  }

  return [];
};

const normalizePolygonRing = (rawPolygon) => {
  const ring = getPolygonPoints(rawPolygon).map(([lat, lng]) => [lng, lat]);

  if (ring.length < 3) {
    return null;
  }

  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }

  return ring;
};

const parseCoordinateValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const isValidLngLat = (lng, lat) => {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90 &&
    !(lng === 0 && lat === 0)
  );
};

const getAssetPointLngLat = (asset) => {
  const lat = parseCoordinateValue(asset?.latitude ?? asset?.lat);
  const lng = parseCoordinateValue(asset?.longitude ?? asset?.lng);
  if (isValidLngLat(lng, lat)) {
    return [lng, lat];
  }

  const ring = normalizePolygonRing(
    asset?.polygon || asset?.polygon_bidang || asset?.polygon_sewa,
  );
  if (!ring || ring.length < 3) return null;

  const points =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;

  const lngSum = points.reduce((sum, point) => sum + point[0], 0);
  const latSum = points.reduce((sum, point) => sum + point[1], 0);
  return [lngSum / points.length, latSum / points.length];
};

const getAssetFeatureId = (asset) => {
  const id = asset?.id ?? asset?.id_aset;
  return id === null || id === undefined ? null : String(id);
};

const getFeatureId = (feature, index) => {
  const props = feature?.properties || {};
  const id =
    feature?.id ??
    props.id ??
    props.id_aset ??
    props.KODE_ASET ??
    props.NIB ??
    props["NOMOR HAK"] ??
    `static-bidang-${index}`;
  return String(id);
};

const getFeaturePointLngLat = (feature) => {
  const points = getPolygonPoints(feature?.geometry, "lngLat")
    .map(([lat, lng]) => [lng, lat])
    .filter(([lng, lat]) => isValidLngLat(Number(lng), Number(lat)));

  if (!points.length) return null;

  const uniquePoints =
    points.length > 1 &&
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1]
      ? points.slice(0, -1)
      : points;

  return [
    uniquePoints.reduce((sum, point) => sum + point[0], 0) /
      uniquePoints.length,
    uniquePoints.reduce((sum, point) => sum + point[1], 0) /
      uniquePoints.length,
  ];
};

const buildDotGeoJsonFromFeatures = (features = []) => ({
  type: "FeatureCollection",
  features: features
    .map((feature, index) => {
      const coordinates = getFeaturePointLngLat(feature);
      if (!coordinates) return null;

      return {
        id: getFeatureId(feature, index),
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates,
        },
        properties: {
          ...(feature.properties || {}),
          MARKER_NUMBER: index + 1,
        },
      };
    })
    .filter(Boolean),
});

const hasVisibleDotCoordinates = (featureCollection) =>
  Boolean(
    featureCollection?.features?.some((feature) => {
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return false;
      const [lng, lat] = coordinates.map(Number);
      return isValidLngLat(lng, lat);
    }),
  );

const normalizeMarkerIdentity = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (
    !normalized ||
    normalized === "-" ||
    normalized === "NULL" ||
    normalized === "UNDEFINED"
  ) {
    return "";
  }
  return normalized;
};

const getMarkerIdentityKeys = (feature, lng, lat) => {
  const props = feature?.properties || {};
  const candidates = [
    ["feature", feature?.id],
    ["asset", props.id_aset ?? props.ID_ASET],
    ["kode", props.KODE_ASET ?? props.kode_aset],
    ["nib", props.NIB ?? props.nib],
    ["hak", props["NOMOR HAK"] ?? props.nomor_sertifikat],
  ];

  const keys = candidates
    .map(([prefix, value]) => {
      const normalized = normalizeMarkerIdentity(value);
      return normalized ? `${prefix}:${normalized}` : null;
    })
    .filter(Boolean);

  keys.push(`coord:${lng.toFixed(6)},${lat.toFixed(6)}`);
  return [...new Set(keys)];
};

const mergeDotGeoJson = (...collections) => {
  const seen = new Set();
  const features = [];

  collections.forEach((collection) => {
    collection?.features?.forEach((feature) => {
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return;

      const [lng, lat] = coordinates.map(Number);
      if (!isValidLngLat(lng, lat)) return;

      const identityKeys = getMarkerIdentityKeys(feature, lng, lat);
      if (identityKeys.some((key) => seen.has(key))) return;

      const id =
        feature.id ??
        feature.properties?.KODE_ASET ??
        feature.properties?.NIB ??
        `${lng.toFixed(7)},${lat.toFixed(7)}`;

      identityKeys.forEach((key) => seen.add(key));
      features.push({
        ...feature,
        id,
        properties: {
          ...(feature.properties || {}),
          MARKER_NUMBER: features.length + 1,
        },
      });
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

const buildSelectedBidangFeature = (asset, isBPKAMode) => {
  const ring = normalizePolygonRing(asset?.polygon);
  if (!ring) return null;

  return {
    id: getAssetFeatureId(asset),
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
    properties: buildBidangPopupFromAsset(asset, isBPKAMode),
  };
};

const getPopupTitle = (layerId, isBPKAMode) => {
  if (layerId === "bidang_tanah_fill") {
    return isBPKAMode ? "Info Objek: BIDANG TANAH" : "Info Objek: BIDANG TANAH";
  }
  if (layerId === "rdtr_fill") {
    return "Info Objek: RDTR (POLA RUANG)";
  }
  if (layerId === "znt_fill") {
    return "Info Objek: ZNT (NILAI TANAH)";
  }
  return "Info Objek";
};

const getPreferredPopupKeys = (layerId, isBPKAMode) => {
  if (layerId === "bidang_tanah_fill") {
    return isBPKAMode
      ? [
          "KODE_ASET",
          "NAMA_ASET",
          "NIB",
          "TIPE HAK",
          "LUAS",
          "PENGGUNAAN",
          "KELURAHAN",
          "KECAMATAN",
          "ATAS_NAMA",
          "OPD_PENGGUNA",
          "KW",
          "KETERANGAN",
        ]
      : [
          "KODE_ASET",
          "NAMA_ASET",
          "STATUS SERTIFIKAT",
          "STATUS",
          "JENIS_MASALAH",
          "NIB",
          "NOMOR HAK",
          "TIPE HAK",
          "LUAS",
          "PENGGUNAAN",
          "KW",
          "PRODUK",
          "KELURAHAN",
          "KECAMATAN",
          "LOKASI",
          "KETERANGAN",
        ];
  }

  if (layerId === "rdtr_fill") {
    return ["RPR", "SUB_RPR", "KETERANGAN"];
  }

  if (layerId === "znt_fill") {
    return ["NILBULAT", "ZONA", "KELAS", "KETERANGAN"];
  }

  return [];
};

const buildBidangPopupFromAsset = (asset, isBPKAMode) => {
  const certificateStatus = normalizeCertificateStatus(
    asset?.status_sertifikat,
    asset?.nomor_sertifikat,
  );

  if (isBPKAMode) {
    return {
      KODE_ASET: asset?.kode_aset || "-",
      NAMA_ASET: asset?.nama_aset || "-",
      NIB: asset?.nib || "-",
      "TIPE HAK": asset?.jenis_hak || "-",
      LUAS: asset?.luas_lapangan || asset?.luas || null,
      PENGGUNAAN: asset?.penggunaan_saat_ini || "-",
      KELURAHAN: asset?.desa_kelurahan || "-",
      KECAMATAN: asset?.kecamatan || "-",
      ATAS_NAMA: asset?.atas_nama || "-",
      OPD_PENGGUNA: asset?.opd_pengguna || "-",
      KW: asset?.kw || "-",
      "STATUS SERTIFIKAT": certificateStatus,
      STATUS_SEWA: asset?.status_sewa || "Tidak Disewakan",
      KETERANGAN: asset?.keterangan || "-",
    };
  }

  return {
    KODE_ASET: asset?.kode_aset || "-",
    NAMA_ASET: asset?.nama_aset || "-",
    "STATUS SERTIFIKAT": certificateStatus,
    STATUS: asset?.status || "-",
    JENIS_MASALAH: asset?.jenis_masalah || "-",
    NIB: asset?.nib || "-",
    "NOMOR HAK": asset?.nomor_sertifikat || "-",
    "TIPE HAK": asset?.jenis_hak || "-",
    LUAS: asset?.luas || null,
    PENGGUNAAN: asset?.penggunaan_saat_ini || "-",
    KW: asset?.kw || "-",
    KELURAHAN: asset?.desa_kelurahan || "-",
    KECAMATAN: asset?.kecamatan || "-",
    LOKASI: asset?.lokasi || "-",
    KETERANGAN: asset?.keterangan || "-",
  };
};

const MapDisplayBPN = ({
  assets = [],
  allAssets = null,
  mode = "bpn",
  highlightAssetId = null,
  highlightRequestKey = null,
  onFeatureClick = null,
  onOtherLayerClick = null,
  clearSelectionKey = null,
  // External control props (used when showControls=false)
  activeLayer: activeLayerProp,
  mapMode: mapModeProp,
  showKelurahan: showKelurahanProp,
  showKecamatan: showKecamatanProp,
  showSudahSertifikat: showSudahSertifikatProp,
  showBelumSertifikat: showBelumSertifikatProp,
  showMarkers: showMarkersProp,
  setShowMarkers: setShowMarkersProp,
  showPolygons: showPolygonsProp,
  setShowPolygons: setShowPolygonsProp,
  showControls = true,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const lastHandledHighlightRef = useRef(null);
  const lastClearSelectionKeyRef = useRef(clearSelectionKey);
  const hoveredBidangId = useRef(null);
  const selectedBidangId = useRef(null);
  const baseLayerVisibilityRef = useRef(new Map());
  const isBPKAMode = mode === "bpka";

  // Internal state (used when showControls=true, i.e. DashboardPage)
  const [activeLayerInternal, setActiveLayerInternal] = useState("bidang");
  const [showKelurahanInternal, setShowKelurahanInternal] = useState(true);
  const [showKecamatanInternal, setShowKecamatanInternal] = useState(true);
  const [mapModeInternal, setMapModeInternal] = useState("2d");
  const [showMarkersInternal, setShowMarkersInternal] = useState(false);
  const [showPolygonsInternal, setShowPolygonsInternal] = useState(true);
  const [showSudahSertifikatInternal, setShowSudahSertifikatInternal] =
    useState(true);
  const [showBelumSertifikatInternal, setShowBelumSertifikatInternal] =
    useState(true);
  const [activeBasemap, setActiveBasemap] = useState(MAPLIBRE_BASEMAP_ID);
  const [basemapError, setBasemapError] = useState("");
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [staticDotGeoJson, setStaticDotGeoJson] = useState(
    EMPTY_FEATURE_COLLECTION,
  );

  // Resolve: use external props when showControls=false, internal state otherwise
  const activeLayer = showControls
    ? activeLayerInternal
    : (activeLayerProp ?? "bidang");
  const mapMode = showControls ? mapModeInternal : (mapModeProp ?? "2d");
  const showMarkers = showControls
    ? showMarkersInternal
    : (showMarkersProp ?? true);
  const showPolygons = showControls
    ? showPolygonsInternal
    : (showPolygonsProp ?? false);
  const setShowMarkersResolved = showControls
    ? setShowMarkersInternal
    : (setShowMarkersProp ?? (() => {}));
  const setShowPolygonsResolved = showControls
    ? setShowPolygonsInternal
    : (setShowPolygonsProp ?? (() => {}));
  const showKelurahan = showControls
    ? showKelurahanInternal
    : (showKelurahanProp ?? true);
  const showKecamatan = showControls
    ? showKecamatanInternal
    : (showKecamatanProp ?? true);
  const showSudahSertifikat = showControls
    ? showSudahSertifikatInternal
    : (showSudahSertifikatProp ?? true);
  const showBelumSertifikat = showControls
    ? showBelumSertifikatInternal
    : (showBelumSertifikatProp ?? true);

  // Refs untuk menghindari stale closure di map event handler yang didaftarkan sekali
  const roleAssetsRef = useRef([]);
  const onFeatureClickRef = useRef(onFeatureClick);
  const onOtherLayerClickRef = useRef(onOtherLayerClick);
  const isBPKAModeRef = useRef(isBPKAMode);

  const roleAssets = useMemo(() => {
    return assets || [];
  }, [assets]);

  // Full asset list for highlight/flyTo lookups (falls back to filtered list)
  const allAssetsResolved = useMemo(
    () => allAssets || assets || [],
    [allAssets, assets],
  );

  const bidangTanahGeoJson = useMemo(() => {
    const features = roleAssets
      .map((asset, index) => {
        const ring = normalizePolygonRing(asset?.polygon);
        if (!ring) {
          return null;
        }

        return {
          id: getAssetFeatureId(asset),
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ring],
          },
          properties: {
            ...buildBidangPopupFromAsset(asset, isBPKAMode),
            MARKER_NUMBER: index + 1,
          },
        };
      })
      .filter(Boolean);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [roleAssets, isBPKAMode]);

  const hasDynamicBidangData = bidangTanahGeoJson.features.length > 0;

  // Dot GeoJSON from asset coordinates, with polygon centroid as fallback.
  const dotGeoJson = useMemo(() => {
    const features = roleAssets
      .map((asset, index) => {
        const coordinates = getAssetPointLngLat(asset);
        if (!coordinates) return null;
        return {
          id: getAssetFeatureId(asset) ?? `asset-dot-${index}`,
          type: "Feature",
          geometry: { type: "Point", coordinates },
          properties: {
            ...buildBidangPopupFromAsset(asset, isBPKAMode),
            MARKER_NUMBER: index + 1,
          },
        };
      })
      .filter(Boolean);
    return { type: "FeatureCollection", features };
  }, [roleAssets, isBPKAMode]);

  const visibleDotGeoJson = useMemo(() => {
    const merged = mergeDotGeoJson(dotGeoJson, staticDotGeoJson);
    return hasVisibleDotCoordinates(merged) ? merged : EMPTY_FEATURE_COLLECTION;
  }, [dotGeoJson, staticDotGeoJson]);

  // Sync refs setiap kali nilai berubah supaya handler peta selalu punya data terbaru
  useEffect(() => {
    roleAssetsRef.current = roleAssets;
  }, [roleAssets]);

  useEffect(() => {
    let isCancelled = false;
    const sourceUrl = isBPKAMode ? BPKA_BIDANG_SOURCE : BPN_BIDANG_SOURCE;

    fetch(sourceUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${sourceUrl}`);
        return response.json();
      })
      .then((geojson) => {
        if (isCancelled) return;
        setStaticDotGeoJson(
          buildDotGeoJsonFromFeatures(geojson?.features || []),
        );
      })
      .catch((error) => {
        if (!isCancelled) {
          console.warn("Could not build static map markers:", error);
          setStaticDotGeoJson(EMPTY_FEATURE_COLLECTION);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isBPKAMode]);

  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
    onOtherLayerClickRef.current = onOtherLayerClick;
    isBPKAModeRef.current = isBPKAMode;
  }, [onFeatureClick, onOtherLayerClick, isBPKAMode]);

  const is3D = mapMode === "3d";
  const effectiveShowMarkers = showMarkers || (!showMarkers && !showPolygons);
  const effectiveShowPolygons = showPolygons;
  const currentThematic = activeLayer; // "rdtr" | "znt" | lainnya = tidak tampil

  const zntCachedData = useRef(null);
  const bangunanCachedData = useRef(null);

  const getBidangSource = () =>
    hasDynamicBidangData
      ? bidangTanahGeoJson
      : isBPKAMode
        ? BPKA_BIDANG_SOURCE
        : BPN_BIDANG_SOURCE;

  const getBidangLineColor = () => {
    return [
      "match",
      ["get", "STATUS SERTIFIKAT"],
      UNCERTIFIED_STATUS,
      "#dc2626",
      CERTIFIED_STATUS,
      "#0369a1",
      "#6b7280",
    ];
  };

  const getBidangLineWidth = () => {
    return [
      "case",
      [
        "any",
        ["boolean", ["feature-state", "hover"], false],
        ["boolean", ["feature-state", "selected"], false],
      ],
      1.8,
      1,
    ];
  };

  const getCertificateLayerFilter = () => {
    if (showSudahSertifikat && showBelumSertifikat) return null;
    if (!showSudahSertifikat && !showBelumSertifikat) {
      return ["==", ["get", "STATUS SERTIFIKAT"], "__hidden__"];
    }

    return [
      "==",
      ["get", "STATUS SERTIFIKAT"],
      showSudahSertifikat ? CERTIFIED_STATUS : UNCERTIFIED_STATUS,
    ];
  };

  const applyCertificateLayerFilter = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const filter = getCertificateLayerFilter();
    [
      "bidang_tanah_fill",
      "bidang_tanah_line",
      "asset-dots-circle",
      "asset-dots-label",
    ].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.setFilter(layerId, filter);
      }
    });
  };

  const formatPopupValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const upKey = String(key).toUpperCase();
    const asNumber = Number(value);
    const isNumericValue = Number.isFinite(asNumber);

    if (isNumericValue) {
      if (
        upKey.includes("NILAI") ||
        upKey.includes("HARGA") ||
        upKey.includes("NILBULAT")
      ) {
        return `Rp ${asNumber.toLocaleString("id-ID")}`;
      }
      if (upKey.includes("LUAS") || upKey.includes("AREA")) {
        return `${asNumber.toLocaleString("id-ID")} m2`;
      }
    }

    return String(value);
  };

  const buildWebgisPopupHtml = (properties = {}, layerId = "") => {
    const ignored = new Set([
      "layer",
      "source",
      "_NILBULAT_NUM",
      "_calculated_height",
    ]);
    const preferredKeys = getPreferredPopupKeys(layerId, isBPKAMode);
    const availableKeys = Object.keys(properties || {}).filter(
      (key) => !ignored.has(key),
    );

    const orderedKeys = [
      ...preferredKeys.filter((key) => availableKeys.includes(key)),
      ...availableKeys.filter((key) => !preferredKeys.includes(key)),
    ];

    const tbody = orderedKeys
      .map((key) => {
        const label = key.replace(/_/g, " ");
        const formattedValue = formatPopupValue(key, properties[key]);
        return `<tr><td>${label}</td><td>${formattedValue}</td></tr>`;
      })
      .join("");

    const popupTitle = getPopupTitle(layerId, isBPKAMode);

    return `
      <div class="maplibre-popup-content">
        <div class="popup-header">${popupTitle}</div>
        <div class="popup-body">
          <table class="popup-table">
            <tbody>${tbody || "<tr><td>Info</td><td>-</td></tr>"}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  const openWebgisPopup = (lngLat, properties, layerId = "") => {
    if (!map.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    const popup = new maplibregl.Popup({
      maxWidth: "360px",
      className: "maplibre-custom-popup",
    })
      .setLngLat(lngLat)
      .setHTML(buildWebgisPopupHtml(properties, layerId))
      .addTo(map.current);

    popup.on("close", () => {
      try {
        if (popupRef.current === popup) {
          popupRef.current = null;
        }
        clearSelectedBidangState();
      } catch (error) {
        // Silently ignore errors when map is being destroyed
      }
    });

    popupRef.current = popup;
  };

  const setSourceFeatureState = (source, id, state) => {
    if (!map.current || id === null || id === undefined) return;
    if (!map.current.getSource(source)) return;

    try {
      map.current.setFeatureState({ source, id }, state);
    } catch (error) {
      console.warn(`Could not set ${source} feature state:`, error);
    }
  };

  const clearSelectedBidangState = () => {
    if (!map.current) {
      selectedBidangId.current = null;
      return;
    }

    if (selectedBidangId.current !== null) {
      setSourceFeatureState("bidang_tanah", selectedBidangId.current, {
        selected: false,
      });
      setSourceFeatureState("asset-dots", selectedBidangId.current, {
        selected: false,
      });
    }
    selectedBidangId.current = null;

    const selectedSource = map.current?.getSource(SELECTED_BIDANG_SOURCE_ID);
    if (selectedSource) {
      selectedSource.setData(EMPTY_FEATURE_COLLECTION);
    }
  };

  const setSelectedBidangOverlay = (feature) => {
    const selectedSource = map.current?.getSource(SELECTED_BIDANG_SOURCE_ID);
    if (!selectedSource) return;

    selectedSource.setData(
      feature
        ? {
            type: "FeatureCollection",
            features: [
              {
                ...feature,
                properties: feature.properties || {},
              },
            ],
          }
        : EMPTY_FEATURE_COLLECTION,
    );
  };

  const selectBidangAsset = (asset) => {
    const id = getAssetFeatureId(asset);
    clearSelectedBidangState();
    setSelectedBidangOverlay(buildSelectedBidangFeature(asset, isBPKAMode));
    if (id === null) return;

    selectedBidangId.current = id;
    setSourceFeatureState("bidang_tanah", id, { selected: true });
    setSourceFeatureState("asset-dots", id, { selected: true });
  };

  const selectBidangFeature = (feature) => {
    if (feature?.id === null || feature?.id === undefined) return;

    clearSelectedBidangState();
    setSelectedBidangOverlay({
      id: feature.id,
      type: "Feature",
      geometry: feature.geometry,
      properties: feature.properties || {},
    });
    selectedBidangId.current = feature.id;
    setSourceFeatureState("bidang_tanah", feature.id, { selected: true });
  };

  const closeWebgisPopup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  useEffect(() => {
    if (lastClearSelectionKeyRef.current === clearSelectionKey) return;

    lastClearSelectionKeyRef.current = clearSelectionKey;
    clearSelectedBidangState();
    closeWebgisPopup();
  }, [clearSelectionKey]);

  const getHighlightCoords = (asset) => {
    const lat = Number(asset?.latitude);
    const lng = Number(asset?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lng, lat];
    }

    const validPoints = getPolygonPoints(asset?.polygon);
    if (validPoints.length > 0) {
      const sum = validPoints.reduce(
        (acc, [pLat, pLng]) => [acc[0] + pLat, acc[1] + pLng],
        [0, 0],
      );
      return [sum[1] / validPoints.length, sum[0] / validPoints.length];
    }

    return null;
  };

  const fitToHighlightedAsset = (asset, lngLat) => {
    if (!map.current) return;

    const ring = normalizePolygonRing(asset?.polygon);
    if (ring?.length >= 3) {
      const bounds = new maplibregl.LngLatBounds();
      ring.forEach(([lng, lat]) => bounds.extend([lng, lat]));

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 36, right: 36, bottom: 36, left: 36 },
          maxZoom: 18,
          duration: 1200,
        });
        return;
      }
    }

    map.current.flyTo({
      center: lngLat,
      zoom: Math.max(map.current.getZoom(), 17),
      duration: 1200,
    });
  };

  const isBaseStyleLayer = (layer) => {
    if (!layer?.source) return false;
    if (layer.id === BASEMAP_RASTER_LAYER_ID) return false;
    return !CUSTOM_OVERLAY_SOURCE_IDS.has(layer.source);
  };

  const captureBaseLayerVisibility = () => {
    if (!map.current?.isStyleLoaded()) return;

    const style = map.current.getStyle();
    style?.layers?.forEach((layer) => {
      if (!isBaseStyleLayer(layer)) return;
      if (!baseLayerVisibilityRef.current.has(layer.id)) {
        baseLayerVisibilityRef.current.set(
          layer.id,
          layer.layout?.visibility || "visible",
        );
      }
    });
  };

  const hideBaseStyleLabels = () => {
    if (!map.current?.isStyleLoaded()) return;

    try {
      const style = map.current.getStyle();
      style?.layers?.forEach((layer) => {
        if (layer.type !== "symbol" || !isBaseStyleLayer(layer)) return;
        map.current.setPaintProperty(layer.id, "text-opacity", 0);
        map.current.setPaintProperty(layer.id, "icon-opacity", 0);
      });
    } catch (error) {
      console.warn("Could not hide base map labels:", error);
    }
  };

  const setBaseStyleVisibility = (visible) => {
    if (!map.current?.isStyleLoaded()) return;

    captureBaseLayerVisibility();

    const style = map.current.getStyle();
    style?.layers?.forEach((layer) => {
      if (!isBaseStyleLayer(layer) || !map.current.getLayer(layer.id)) return;
      const originalVisibility =
        baseLayerVisibilityRef.current.get(layer.id) || "visible";
      map.current.setLayoutProperty(
        layer.id,
        "visibility",
        visible ? originalVisibility : "none",
      );
    });

    if (visible) {
      hideBaseStyleLabels();
    }
  };

  const removeBasemapRaster = () => {
    if (!map.current?.isStyleLoaded()) return;

    if (map.current.getLayer(BASEMAP_RASTER_LAYER_ID)) {
      map.current.removeLayer(BASEMAP_RASTER_LAYER_ID);
    }
    if (map.current.getSource(BASEMAP_RASTER_SOURCE_ID)) {
      map.current.removeSource(BASEMAP_RASTER_SOURCE_ID);
    }
  };

  const applyBasemap = async (basemapId) => {
    if (!map.current?.isStyleLoaded()) return;

    const option =
      BASEMAP_OPTIONS.find((item) => item.id === basemapId) ||
      BASEMAP_OPTIONS[0];
    setBasemapError("");

    if (option.id === MAPLIBRE_BASEMAP_ID) {
      removeBasemapRaster();
      setBaseStyleVisibility(true);
      setActiveBasemap(option.id);
      return;
    }

    try {
      const tiles = option.tiles;

      if (!tiles?.length || !map.current?.isStyleLoaded()) {
        setBasemapError("Basemap belum bisa dimuat.");
        return;
      }

      removeBasemapRaster();
      setBaseStyleVisibility(false);

      map.current.addSource(BASEMAP_RASTER_SOURCE_ID, {
        type: "raster",
        tiles,
        tileSize: option.tileSize || 256,
        maxzoom: option.maxzoom || 22,
        attribution: option.attribution,
      });

      const beforeLayerId = [
        "batas_kecamatan_fill",
        "batas_wilayah_fill",
        "rdtr_fill",
        "znt_fill",
        "bidang_tanah_fill",
        "asset-dots-circle",
        "3d-buildings-layer",
      ].find((layerId) => map.current.getLayer(layerId));

      map.current.addLayer(
        {
          id: BASEMAP_RASTER_LAYER_ID,
          type: "raster",
          source: BASEMAP_RASTER_SOURCE_ID,
          paint: { "raster-opacity": 1 },
        },
        beforeLayerId,
      );
      setActiveBasemap(option.id);
    } catch (error) {
      console.warn("Could not switch basemap:", error);
      setBasemapError("Basemap belum bisa dimuat.");
    }
  };

  const addCustomLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Batas Kelurahan
    // Batas Kecamatan (added FIRST = bottom layer, so kelurahan gets hover priority)
    if (!map.current.getSource("batas_kecamatan")) {
      map.current.addSource("batas_kecamatan", {
        type: "geojson",
        data: "/data/batas_kecamatan.geojson",
        generateId: true,
      });
      const kecFilter = [
        "in",
        "WADMKC",
        "PURWOREJO",
        "GADINGREJO",
        "BUGUL KIDUL",
      ];
      map.current.addLayer({
        id: "batas_kecamatan_fill",
        type: "fill",
        source: "batas_kecamatan",
        filter: kecFilter,
        paint: {
          "fill-color": "#8b5cf6",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.12,
            0.02,
          ],
        },
      });
      map.current.addLayer({
        id: "batas_kecamatan_line",
        type: "line",
        source: "batas_kecamatan",
        filter: kecFilter,
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#7c3aed",
            "#6d28d9",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            3.5,
            2.5,
          ],
          "line-dasharray": [4, 3],
          "line-opacity": 0.8,
        },
      });
      map.current.addLayer({
        id: "batas_kecamatan_label",
        type: "symbol",
        source: "batas_kecamatan",
        filter: kecFilter,
        layout: {
          "text-field": ["get", "WADMKC"],
          "text-size": 14,
          "text-font": ["Open Sans Bold"],
          "text-transform": "uppercase",
          "text-letter-spacing": 0.05,
          visibility: "visible",
        },
        paint: {
          "text-color": "#5b21b6",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-opacity": 0.85,
        },
      });

      // Hover tooltip for kecamatan
      let hoveredKecId = null;
      const kecTooltip = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "boundary-tooltip",
        offset: 15,
      });
      map.current._kecTooltip = kecTooltip;
      map.current.on("mousemove", "batas_kecamatan_fill", (e) => {
        if (e.features.length > 0) {
          // If cursor is also over a kelurahan feature, let kelurahan tooltip take priority
          const kelFeatures = map.current.queryRenderedFeatures(e.point, {
            layers: ["batas_wilayah_fill"],
          });
          if (kelFeatures.length > 0) {
            kecTooltip.remove();
            return;
          }
          if (hoveredKecId !== null) {
            map.current.setFeatureState(
              { source: "batas_kecamatan", id: hoveredKecId },
              { hover: false },
            );
          }
          hoveredKecId = e.features[0].id;
          map.current.setFeatureState(
            { source: "batas_kecamatan", id: hoveredKecId },
            { hover: true },
          );
          map.current.getCanvas().style.cursor = "pointer";
          if (map.current._kelTooltip) map.current._kelTooltip.remove();
          const props = e.features[0].properties;
          kecTooltip
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:system-ui;padding:2px 4px">` +
                `<div style="font-weight:700;font-size:14px;color:#5b21b6;text-transform:uppercase;letter-spacing:0.5px">${props.WADMKC || "-"}</div>` +
                `</div>`,
            )
            .addTo(map.current);
        }
      });
      map.current.on("mouseleave", "batas_kecamatan_fill", () => {
        if (hoveredKecId !== null) {
          map.current.setFeatureState(
            { source: "batas_kecamatan", id: hoveredKecId },
            { hover: false },
          );
        }
        hoveredKecId = null;
        map.current.getCanvas().style.cursor = "";
        kecTooltip.remove();
      });
    }

    // Batas Kelurahan (added AFTER kecamatan = on top, gets hover priority)
    if (!map.current.getSource("batas_wilayah")) {
      map.current.addSource("batas_wilayah", {
        type: "geojson",
        data: "/data/batas_wilayah.geojson",
        generateId: true,
      });
      const kelKecFilter = [
        "in",
        "WADMKC",
        "PURWOREJO",
        "GADINGREJO",
        "BUGUL KIDUL",
      ];
      map.current.addLayer({
        id: "batas_wilayah_fill",
        type: "fill",
        source: "batas_wilayah",
        filter: kelKecFilter,
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.15,
            0.04,
          ],
        },
      });
      map.current.addLayer({
        id: "batas_wilayah_line",
        type: "line",
        source: "batas_wilayah",
        filter: kelKecFilter,
        paint: {
          "line-color": "#10b981",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2,
            1,
          ],
          "line-opacity": 0.7,
        },
      });
      map.current.addLayer({
        id: "batas_wilayah_label",
        type: "symbol",
        source: "batas_wilayah",
        filter: kelKecFilter,
        layout: {
          "text-field": ["get", "NAMOBJ"],
          "text-size": 12,
          "text-font": ["Open Sans Semibold"],
          visibility: "visible",
        },
        paint: {
          "text-color": "#047857",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
          "text-opacity": 0.7,
        },
      });

      // Hover tooltip for kelurahan
      let hoveredKelId = null;
      const kelTooltip = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "boundary-tooltip",
        offset: 15,
      });
      map.current._kelTooltip = kelTooltip;
      map.current.on("mousemove", "batas_wilayah_fill", (e) => {
        if (e.features.length > 0) {
          if (hoveredKelId !== null) {
            map.current.setFeatureState(
              { source: "batas_wilayah", id: hoveredKelId },
              { hover: false },
            );
          }
          hoveredKelId = e.features[0].id;
          map.current.setFeatureState(
            { source: "batas_wilayah", id: hoveredKelId },
            { hover: true },
          );
          map.current.getCanvas().style.cursor = "pointer";
          if (map.current._kecTooltip) map.current._kecTooltip.remove();
          const props = e.features[0].properties;
          kelTooltip
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:system-ui;padding:2px 4px">` +
                `<div style="font-weight:700;font-size:13px;color:#047857">${props.NAMOBJ || "-"}</div>` +
                `<div style="font-size:11px;color:#64748b">Kec. ${props.WADMKC || "-"}</div>` +
                `</div>`,
            )
            .addTo(map.current);
        }
      });
      map.current.on("mouseleave", "batas_wilayah_fill", () => {
        if (hoveredKelId !== null) {
          map.current.setFeatureState(
            { source: "batas_wilayah", id: hoveredKelId },
            { hover: false },
          );
        }
        hoveredKelId = null;
        map.current.getCanvas().style.cursor = "";
        kelTooltip.remove();
      });
    }

    if (!map.current.getSource("rdtr")) {
      map.current.addSource("rdtr", {
        type: "geojson",
        data: "/data/rdtr.geojson",
      });
      map.current.addLayer({
        id: "rdtr_fill",
        type: "fill",
        source: "rdtr",
        layout: { visibility: activeLayer === "rdtr" ? "visible" : "none" },
        paint: {
          "fill-color": [
            "match",
            ["get", "RPR"],
            "Kawasan Perumahan",
            "#facc15",
            "Kawasan Perdagangan dan Jasa",
            "#ef4444",
            "Kawasan Peruntukkan Industri",
            "#78716c",
            [
              "Ruang Terbuka Hijau Kota",
              "Kawasan Ekosistem Mangrove",
              "Kawasan Perkebunan",
              "Kawasan Tanaman Pangan",
              "KP2B",
              "Hutan",
              "RTH",
            ],
            "#22c55e",
            [
              "Sungai",
              "Kawasan Sumber Daya Air",
              "Sempadan Sungai",
              "Sempadan Pantai",
            ],
            "#3b82f6",
            [
              "Kawasan Perkantoran",
              "Kawasan Pendidikan",
              "Kawasan Kesehatan",
              "Kawasan Peribadatan",
              "Kawasan Pelayanan Umum",
              "Kawasan Pariwisata",
              "Kawasan Olahraga",
            ],
            "#a855f7",
            "#94a3b8",
          ],
          "fill-opacity": 0.6,
        },
      });
    }

    if (!map.current.getSource("znt") && zntCachedData.current) {
      map.current.addSource("znt", {
        type: "geojson",
        data: zntCachedData.current,
      });
      map.current.addLayer({
        id: "znt_fill",
        type: "fill",
        source: "znt",
        layout: { visibility: activeLayer === "znt" ? "visible" : "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "_NILBULAT_NUM"],
            0,
            "#fef08a",
            1000000,
            "#f97316",
            5000000,
            "#ef4444",
            10000000,
            "#a855f7",
            50000000,
            "#4c1d95",
          ],
          "fill-opacity": 0.7,
        },
      });
    }

    if (!map.current.getSource("bidang_tanah")) {
      map.current.addSource("bidang_tanah", {
        type: "geojson",
        data: getBidangSource(),
        generateId: true,
      });

      map.current.addLayer({
        id: "bidang_tanah_fill",
        type: "fill",
        source: "bidang_tanah",
        layout: { visibility: effectiveShowPolygons ? "visible" : "none" },
        paint: {
          "fill-color": [
            "match",
            ["get", "STATUS SERTIFIKAT"],
            CERTIFIED_STATUS,
            "#0ea5e9",
            UNCERTIFIED_STATUS,
            "#ef4444",
            "#9ca3af",
          ],
          "fill-opacity": [
            "case",
            [
              "any",
              ["boolean", ["feature-state", "hover"], false],
              ["boolean", ["feature-state", "selected"], false],
            ],
            0.45,
            0.15,
          ],
        },
      });

      map.current.addLayer({
        id: "bidang_tanah_line",
        type: "line",
        source: "bidang_tanah",
        layout: { visibility: effectiveShowPolygons ? "visible" : "none" },
        paint: {
          "line-color": getBidangLineColor(),
          "line-width": getBidangLineWidth(),
        },
      });
    }

    if (!map.current.getSource(SELECTED_BIDANG_SOURCE_ID)) {
      map.current.addSource(SELECTED_BIDANG_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });

      map.current.addLayer({
        id: SELECTED_BIDANG_FILL_LAYER_ID,
        type: "fill",
        source: SELECTED_BIDANG_SOURCE_ID,
        layout: { visibility: effectiveShowPolygons ? "visible" : "none" },
        paint: {
          "fill-color": "#facc15",
          "fill-opacity": 0.36,
        },
      });

      map.current.addLayer({
        id: SELECTED_BIDANG_LINE_LAYER_ID,
        type: "line",
        source: SELECTED_BIDANG_SOURCE_ID,
        layout: { visibility: effectiveShowPolygons ? "visible" : "none" },
        paint: {
          "line-color": "#eab308",
          "line-width": 2,
        },
      });
    }

    // Dot layer for asset centroids
    if (!map.current.getSource("asset-dots")) {
      map.current.addSource("asset-dots", {
        type: "geojson",
        data: visibleDotGeoJson,
      });

      map.current.addLayer({
        id: "asset-dots-circle",
        type: "circle",
        source: "asset-dots",
        layout: {
          visibility: effectiveShowMarkers ? "visible" : "none",
        },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            5,
            15,
            7,
            18,
            9,
          ],
          "circle-color": [
            "match",
            ["get", "STATUS SERTIFIKAT"],
            CERTIFIED_STATUS,
            "#0ea5e9",
            UNCERTIFIED_STATUS,
            "#ef4444",
            "#9ca3af",
          ],
          "circle-stroke-color": [
            "match",
            ["get", "STATUS SERTIFIKAT"],
            CERTIFIED_STATUS,
            "#0369a1",
            UNCERTIFIED_STATUS,
            "#b91c1c",
            "#6b7280",
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            4,
            1.5,
          ],
          "circle-opacity": 0.85,
        },
      });

      map.current.addLayer({
        id: "asset-dots-label",
        type: "symbol",
        source: "asset-dots",
        layout: {
          visibility: effectiveShowMarkers ? "visible" : "none",
          "text-field": ["to-string", ["get", "MARKER_NUMBER"]],
          "text-size": ["interpolate", ["linear"], ["zoom"], 15, 8, 18, 9],
          "text-font": ["Open Sans Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(15, 23, 42, 0.35)",
          "text-halo-width": 0.35,
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14.6,
            0,
            15.2,
            1,
          ],
        },
      });
    }

    applyCertificateLayerFilter();

    // 3D Buildings (bangunan.geojson with area-based height)
    if (
      !map.current.getSource("local-buildings") &&
      bangunanCachedData.current
    ) {
      map.current.addSource("local-buildings", {
        type: "geojson",
        data: bangunanCachedData.current,
      });

      map.current.addLayer({
        id: "3d-buildings-layer",
        type: "fill-extrusion",
        source: "local-buildings",
        layout: { visibility: is3D ? "visible" : "none" },
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "_calculated_height"], 5],
            3,
            "#e2e8f0",
            8,
            "#cbd5e1",
            15,
            "#94a3b8",
            25,
            "#64748b",
          ],
          "fill-extrusion-height": [
            "max",
            ["coalesce", ["get", "_calculated_height"], 5],
            2,
          ],
          "fill-extrusion-base": 0,
          "fill-extrusion-vertical-gradient": true,
          "fill-extrusion-opacity": 1,
        },
      });
    }

    ["asset-dots-circle", "asset-dots-label"].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.moveLayer(layerId);
      }
    });
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAPLIBRE_STYLE_URL,
      center: [112.9063, -7.6453],
      zoom: 14.5,
      pitch: mapMode === "3d" ? 60 : 0,
      bearing: 0,
      antialias: true,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(
      new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }),
      "bottom-left",
    );

    fetch("/data/znt.geojson")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((feature) => {
          if (!feature.properties) feature.properties = {};
          feature.properties._NILBULAT_NUM = 0;
          if (feature.properties.NILBULAT) {
            const cleanStr = String(feature.properties.NILBULAT).replace(
              /[^0-9]/g,
              "",
            );
            if (cleanStr) {
              feature.properties._NILBULAT_NUM = Number(cleanStr);
            }
          }
        });

        zntCachedData.current = data;
        if (map.current?.isStyleLoaded()) {
          addCustomLayers();
        }
      })
      .catch((error) => console.warn("Could not load ZNT:", error));

    // Pre-fetch bangunan.geojson, process heights
    fetch("/data/bangunan.geojson")
      .then((res) => res.json())
      .then((data) => {
        const flattenCoords = (coords) => {
          if (coords && coords.length > 0 && typeof coords[0] === "number") {
            return [coords[0], coords[1]];
          }
          return coords.map(flattenCoords);
        };

        const enforceCounterClockwise = (ring) => {
          if (!ring || ring.length < 3) return 0;
          let area = 0;
          for (let i = 0; i < ring.length - 1; i++) {
            area +=
              (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
          }
          if (area > 0) ring.reverse();
          return area;
        };

        const calcRingArea = (ring) => {
          if (!ring || ring.length < 3) return 50;
          let calcArea = 0;
          for (let i = 0; i < ring.length - 1; i++) {
            const x1 =
              ring[i][0] * 111320 * Math.cos((ring[i][1] * Math.PI) / 180);
            const y1 = ring[i][1] * 110574;
            const x2 =
              ring[i + 1][0] *
              111320 *
              Math.cos((ring[i + 1][1] * Math.PI) / 180);
            const y2 = ring[i + 1][1] * 110574;
            calcArea += x1 * y2 - x2 * y1;
          }
          return Math.abs(calcArea) / 2;
        };

        data.features.forEach((f) => {
          if (!f.properties) f.properties = {};
          if (f.geometry?.coordinates) {
            f.geometry.coordinates = flattenCoords(f.geometry.coordinates);
          }

          let area = 50;
          if (f.geometry?.type === "Polygon") {
            const ring = f.geometry.coordinates[0];
            enforceCounterClockwise(ring);
            area = calcRingArea(ring);
          } else if (f.geometry?.type === "MultiPolygon") {
            f.geometry.coordinates.forEach((poly) => {
              if (poly?.[0]) enforceCounterClockwise(poly[0]);
            });
            area = calcRingArea(f.geometry.coordinates[0]?.[0]);
          }

          let height = 3;
          if (area < 30) height = 2.5 + Math.random();
          else if (area < 100) height = 3.5 + Math.random() * 2;
          else if (area < 300) height = 6 + Math.random() * 3;
          else if (area < 1000) height = 9 + Math.random() * 4;
          else height = 14 + Math.random() * 4;

          f.properties._calculated_height = height;
        });

        bangunanCachedData.current = data;
        if (map.current?.isStyleLoaded()) {
          addCustomLayers();
        }
      })
      .catch((error) => console.warn("Could not load bangunan:", error));

    map.current.on("load", () => {
      captureBaseLayerVisibility();
      addCustomLayers();
      hideBaseStyleLabels();
      setIsMapReady(true);

      if (map.current?.setLight) {
        map.current.setLight({
          anchor: "viewport",
          color: "white",
          intensity: 0.45,
          position: [1.15, 210, 30],
        });
      }
    });

    map.current.on("click", handleMapClick);
    map.current.on("mousemove", handleMouseMove);

    return () => {
      // Remove popup FIRST before map to prevent race condition
      if (popupRef.current) {
        popupRef.current.off("close"); // Detach close listener to avoid calling it during destruction
        popupRef.current.remove();
        popupRef.current = null;
      }

      if (map.current) {
        map.current.off("click", handleMapClick);
        map.current.off("mousemove", handleMouseMove);
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !map.current || !map.current.isStyleLoaded()) return;

    const bidangSource = map.current.getSource("bidang_tanah");
    if (bidangSource) {
      bidangSource.setData(getBidangSource());
      if (selectedBidangId.current !== null) {
        setSourceFeatureState("bidang_tanah", selectedBidangId.current, {
          selected: true,
        });
      }
    }

    // Bidang polygon and marker layers are controlled independently.
    const showPolygon = effectiveShowPolygons;
    if (map.current.getLayer("bidang_tanah_fill")) {
      map.current.setLayoutProperty(
        "bidang_tanah_fill",
        "visibility",
        showPolygon ? "visible" : "none",
      );
    }

    if (map.current.getLayer("bidang_tanah_line")) {
      map.current.setLayoutProperty(
        "bidang_tanah_line",
        "visibility",
        showPolygon ? "visible" : "none",
      );
      map.current.setPaintProperty(
        "bidang_tanah_line",
        "line-color",
        getBidangLineColor(),
      );
      map.current.setPaintProperty(
        "bidang_tanah_line",
        "line-width",
        getBidangLineWidth(),
      );
    }

    [SELECTED_BIDANG_FILL_LAYER_ID, SELECTED_BIDANG_LINE_LAYER_ID].forEach(
      (layerId) => {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(
            layerId,
            "visibility",
            showPolygon ? "visible" : "none",
          );
        }
      },
    );

    if (map.current.getLayer("rdtr_fill")) {
      map.current.setLayoutProperty(
        "rdtr_fill",
        "visibility",
        activeLayer === "rdtr" ? "visible" : "none",
      );
    }

    if (map.current.getLayer("znt_fill")) {
      map.current.setLayoutProperty(
        "znt_fill",
        "visibility",
        activeLayer === "znt" ? "visible" : "none",
      );
    }
    // Dot layer: visible when marker display is enabled for bidang layer.
    ["asset-dots-circle", "asset-dots-label"].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          "visibility",
          effectiveShowMarkers ? "visible" : "none",
        );
      }
    });

    // Update dot data
    const dotSource = map.current.getSource("asset-dots");
    if (dotSource) {
      dotSource.setData(visibleDotGeoJson);
      if (selectedBidangId.current !== null) {
        setSourceFeatureState("asset-dots", selectedBidangId.current, {
          selected: true,
        });
      }
    }

    ["asset-dots-circle", "asset-dots-label"].forEach((layerId) => {
      if (map.current.getLayer(layerId)) {
        map.current.moveLayer(layerId);
      }
    });

    // 3D buildings: visible only in 3d mode
    if (map.current.getLayer("3d-buildings-layer")) {
      map.current.setLayoutProperty(
        "3d-buildings-layer",
        "visibility",
        is3D ? "visible" : "none",
      );
    }

    // Boundary layer visibility
    const kelVis = showKelurahan ? "visible" : "none";
    if (map.current.getLayer("batas_wilayah_fill"))
      map.current.setLayoutProperty("batas_wilayah_fill", "visibility", kelVis);
    if (map.current.getLayer("batas_wilayah_line"))
      map.current.setLayoutProperty("batas_wilayah_line", "visibility", kelVis);
    if (map.current.getLayer("batas_wilayah_label"))
      map.current.setLayoutProperty(
        "batas_wilayah_label",
        "visibility",
        kelVis,
      );

    const kecVis = showKecamatan ? "visible" : "none";
    if (map.current.getLayer("batas_kecamatan_fill"))
      map.current.setLayoutProperty(
        "batas_kecamatan_fill",
        "visibility",
        kecVis,
      );
    if (map.current.getLayer("batas_kecamatan_line"))
      map.current.setLayoutProperty(
        "batas_kecamatan_line",
        "visibility",
        kecVis,
      );
    if (map.current.getLayer("batas_kecamatan_label"))
      map.current.setLayoutProperty(
        "batas_kecamatan_label",
        "visibility",
        kecVis,
      );

    // Camera: tilt for 3D, top-down for 2D/Dot
    map.current.easeTo({
      pitch: is3D ? 60 : 0,
      bearing: is3D ? 30 : 0,
      duration: 1500,
    });
  }, [
    activeLayer,
    isBPKAMode,
    hasDynamicBidangData,
    bidangTanahGeoJson,
    mapMode,
    effectiveShowMarkers,
    effectiveShowPolygons,
    is3D,
    visibleDotGeoJson,
    showKelurahan,
    showKecamatan,
    isMapReady,
  ]);

  // Sertifikat filter
  useEffect(() => {
    applyCertificateLayerFilter();
  }, [showSudahSertifikat, showBelumSertifikat, isBPKAMode]);

  useEffect(() => {
    if (!highlightAssetId || !map.current || !allAssetsResolved.length) {
      return;
    }

    const targetAsset = allAssetsResolved.find(
      (asset) => String(asset?.id) === String(highlightAssetId),
    );
    if (!targetAsset) {
      return;
    }

    const requestToken = `${highlightRequestKey || "default"}:${highlightAssetId}`;
    if (lastHandledHighlightRef.current === requestToken) {
      return;
    }

    const lngLat = getHighlightCoords(targetAsset);
    if (!lngLat) {
      return;
    }

    const openHighlightedPopup = () => {
      if (!map.current || !map.current.isStyleLoaded()) return;

      selectBidangAsset(targetAsset);
      fitToHighlightedAsset(targetAsset, lngLat);

      if (onFeatureClick) {
        onFeatureClick(targetAsset);
      } else {
        openWebgisPopup(
          lngLat,
          buildBidangPopupFromAsset(targetAsset, isBPKAMode),
          "bidang_tanah_fill",
        );
      }
      lastHandledHighlightRef.current = requestToken;
    };

    const timeoutId = setTimeout(openHighlightedPopup, 250);
    return () => clearTimeout(timeoutId);
  }, [
    allAssetsResolved,
    highlightAssetId,
    highlightRequestKey,
    isBPKAMode,
    onFeatureClick,
  ]);

  const handleMapClick = (event) => {
    if (!map.current) return;

    const layersToQuery = [
      "asset-dots-circle",
      "asset-dots-label",
      "bidang_tanah_fill",
      "rdtr_fill",
      "znt_fill",
    ].filter(
      (layer) =>
        map.current.getLayer(layer) &&
        map.current.getLayoutProperty(layer, "visibility") !== "none",
    );

    const bbox = [
      [event.point.x - 3, event.point.y - 3],
      [event.point.x + 3, event.point.y + 3],
    ];

    const features = map.current.queryRenderedFeatures(bbox, {
      layers: layersToQuery,
    });

    if (!features.length) return;

    const feature = features[0];
    const layerId = feature.layer?.id || "";

    // For bidang tanah layer: try to resolve to a system asset and use custom panel.
    // Matching dilakukan via NIB (field yang ada di GeoJSON dan di kolom nib DB).
    // Fallback ke kode_aset untuk backward compat jika NIB tidak ada.
    // Gunakan refs agar selalu punya data terbaru (avoid stale closure)
    const currentOnFeatureClick = onFeatureClickRef.current;
    const currentOnOtherLayerClick = onOtherLayerClickRef.current;
    const currentRoleAssets = roleAssetsRef.current;

    if (
      (layerId === "bidang_tanah_fill" ||
        layerId === "asset-dots-circle" ||
        layerId === "asset-dots-label") &&
      currentOnFeatureClick
    ) {
      const nibFromFeature = String(feature.properties?.NIB || "").trim();
      const kodeFromFeature = feature.properties?.KODE_ASET;

      const matched = currentRoleAssets.find((a) => {
        if (nibFromFeature && a.nib) {
          return String(a.nib).trim() === nibFromFeature;
        }
        // fallback: kode_aset untuk polygon yang diinput manual
        if (kodeFromFeature && a.kode_aset) {
          return a.kode_aset === kodeFromFeature;
        }
        return false;
      });

      if (matched) {
        // Bidang aset memakai panel custom dari MapPage; popup WebGIS bawaan
        // ditutup agar tidak muncul ganda.
        closeWebgisPopup();
        selectBidangAsset(matched);
        currentOnFeatureClick(matched);
        return;
      }
    }

    // Fallback: RDTR / ZNT / unmatched bidang → plain MapLibre popup.
    // Keep the clicked bidang highlighted so the popup source polygon is clear.
    if (layerId === "bidang_tanah_fill") {
      selectBidangFeature(feature);
    } else {
      clearSelectedBidangState();
    }
    if (currentOnOtherLayerClick) currentOnOtherLayerClick();
    openWebgisPopup(event.lngLat, feature.properties || {}, layerId);
  };

  const handleMouseMove = (event) => {
    if (!map.current) return;

    const layers = [
      "asset-dots-circle",
      "asset-dots-label",
      "bidang_tanah_fill",
      "rdtr_fill",
      "znt_fill",
    ].filter(
      (layer) =>
        map.current.getLayer(layer) &&
        map.current.getLayoutProperty(layer, "visibility") !== "none",
    );
    const features = map.current.queryRenderedFeatures(event.point, { layers });
    map.current.getCanvas().style.cursor = features.length ? "pointer" : "";

    // Hover highlight for bidang tanah
    if (hoveredBidangId.current !== null) {
      map.current.setFeatureState(
        { source: "bidang_tanah", id: hoveredBidangId.current },
        { hover: false },
      );
      hoveredBidangId.current = null;
    }

    const bidangFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["bidang_tanah_fill"].filter((l) => map.current.getLayer(l)),
    });
    if (bidangFeatures.length > 0 && bidangFeatures[0].id !== undefined) {
      hoveredBidangId.current = bidangFeatures[0].id;
      map.current.setFeatureState(
        { source: "bidang_tanah", id: hoveredBidangId.current },
        { hover: true },
      );
    }
  };

  const basemapSwitcher = (
    <div className="absolute top-4 right-16 z-20">
      <button
        type="button"
        onClick={() => setIsBasemapMenuOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-slate-50"
        title="Layer peta"
        aria-label="Layer peta"
      >
        <StackIcon size={19} weight="fill" />
      </button>

      {isBasemapMenuOpen && (
        <div className="mt-2 w-60 rounded-xl border border-slate-300 bg-white/95 p-3 shadow-xl backdrop-blur-sm">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Pilih Layer Map
            </p>
            <div className="space-y-1.5">
              {BASEMAP_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  title={option.label}
                >
                  <input
                    type="radio"
                    name="maplibre-basemap"
                    className="h-3.5 w-3.5 accent-accent"
                    checked={activeBasemap === option.id}
                    onChange={() => applyBasemap(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {basemapError && (
              <div className="mt-2 text-[11px] font-medium text-red-600">
                {basemapError}
              </div>
            )}
          </div>

          <div className="my-3 border-t border-slate-200" />

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Tampilan Layer
            </p>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(event) =>
                    setShowMarkersResolved(event.target.checked)
                  }
                  className="h-3.5 w-3.5 accent-accent"
                />
                <MapPinIcon
                  size={14}
                  weight="fill"
                  className="shrink-0 text-sky-600"
                />
                <span>Tampilkan marker</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={showPolygons}
                  onChange={(event) =>
                    setShowPolygonsResolved(event.target.checked)
                  }
                  className="h-3.5 w-3.5 accent-accent"
                />
                <PolygonIcon
                  size={14}
                  weight="fill"
                  className="shrink-0 text-sky-600"
                />
                <span>Tampilkan polygon</span>
              </label>
              {!showMarkers && !showPolygons && (
                <p className="px-2 pt-1 text-[10px] text-slate-500">
                  Default menampilkan marker.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full relative bg-gray-100">
      <div ref={mapContainer} className="w-full h-full" />
      {basemapSwitcher}

      {/* Internal controls – rendered only when showControls=true (e.g. DashboardPage) */}
      {showControls && (
        <>
          <div className="absolute top-4 left-4 z-20 w-60">
            <BPNLayerControl
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayerInternal}
              panelTitle={isBPKAMode ? "Kontrol Layer" : "Kontrol Layer"}
              bidangLabel={isBPKAMode ? "Bidang Tanah" : "Bidang Tanah"}
              showKelurahan={showKelurahan}
              setShowKelurahan={setShowKelurahanInternal}
              showKecamatan={showKecamatan}
              setShowKecamatan={setShowKecamatanInternal}
              isBPKAMode={isBPKAMode}
              showSudahSertifikat={showSudahSertifikat}
              setShowSudahSertifikat={setShowSudahSertifikatInternal}
              showBelumSertifikat={showBelumSertifikat}
              setShowBelumSertifikat={setShowBelumSertifikatInternal}
            />
          </div>

          <button
            onClick={() =>
              setMapModeInternal((prev) => (prev === "3d" ? "2d" : "3d"))
            }
            className={`absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-md transition-colors ${
              mapMode === "3d"
                ? "border-accent bg-accent text-surface"
                : "border-border bg-surface/95 text-text-muted hover:bg-surface-secondary hover:text-text-primary"
            }`}
            title="Tampilan 3D"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M12 12l8-4.5" />
              <path d="M12 12v9" />
              <path d="M12 12L4 7.5" />
            </svg>
            <span>3D</span>
          </button>
        </>
      )}
    </div>
  );
};

export default MapDisplayBPN;

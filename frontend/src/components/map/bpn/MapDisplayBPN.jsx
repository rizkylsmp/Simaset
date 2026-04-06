import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import BPNLayerControl from "./BPNLayerControl";
import "./mapLibreStyles.css";

const BPN_BIDANG_SOURCE = "/data/bidang_tanah.geojson";
const BPKA_BIDANG_SOURCE = "/data/bidang_tanah1.geojson";

const toUpper = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const isBPKAAsset = (asset = {}) => {
  const code = toUpper(asset?.kode_aset);
  const jenisAset = toUpper(asset?.jenis_aset);
  const opd = toUpper(asset?.opd_pengguna);
  const atasNama = toUpper(asset?.atas_nama);

  return (
    code.startsWith("BPKA-") ||
    jenisAset.includes("BPKA") ||
    opd.includes("BPKA")
  );
};

const normalizePolygonRing = (rawPolygon) => {
  if (!Array.isArray(rawPolygon) || rawPolygon.length < 3) {
    return null;
  }

  const ring = rawPolygon
    .map((point) => {
      if (Array.isArray(point) && point.length >= 2) {
        const lat = Number(point[0]);
        const lng = Number(point[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return [lng, lat];
        }
      }

      if (point && typeof point === "object") {
        const lat = Number(point.lat);
        const lng = Number(point.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return [lng, lat];
        }
      }

      return null;
    })
    .filter(Boolean);

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

const getPopupTitle = (layerId, isBPKAMode) => {
  if (layerId === "bidang_tanah_fill") {
    return isBPKAMode
      ? "Info Objek: ASET PEMKOT (BPKA)"
      : "Info Objek: BIDANG TANAH (BPN)";
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
      KETERANGAN: asset?.keterangan || "-",
    };
  }

  return {
    KODE_ASET: asset?.kode_aset || "-",
    NAMA_ASET: asset?.nama_aset || "-",
    "STATUS SERTIFIKAT": asset?.status_sertifikat || "-",
    STATUS: asset?.status || "-",
    JENIS_MASALAH: asset?.jenis_masalah || "-",
    NIB: asset?.nib || "-",
    "NOMOR HAK": asset?.nomor_sertifikat || "-",
    "TIPE HAK": asset?.jenis_hak || "-",
    LUAS: asset?.luas || null,
    PENGGUNAAN: asset?.penggunaan_saat_ini || "-",
    KELURAHAN: asset?.desa_kelurahan || "-",
    KECAMATAN: asset?.kecamatan || "-",
    LOKASI: asset?.lokasi || "-",
    KETERANGAN: asset?.keterangan || "-",
  };
};

const MapDisplayBPN = ({
  assets = [],
  mode = "bpn",
  highlightAssetId = null,
  highlightRequestKey = null,
  onFeatureClick = null,
  onOtherLayerClick = null,
  // External control props (used when showControls=false)
  activeLayer: activeLayerProp,
  mapMode: mapModeProp,
  showKelurahan: showKelurahanProp,
  showKecamatan: showKecamatanProp,
  showControls = true,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const lastHandledHighlightRef = useRef(null);
  const hoveredBidangId = useRef(null);
  const isBPKAMode = mode === "bpka";

  // Internal state (used when showControls=true, i.e. DashboardPage)
  const [activeLayerInternal, setActiveLayerInternal] = useState("bidang");
  const [showKelurahanInternal, setShowKelurahanInternal] = useState(true);
  const [showKecamatanInternal, setShowKecamatanInternal] = useState(true);
  const [mapModeInternal, setMapModeInternal] = useState("2d");

  // Resolve: use external props when showControls=false, internal state otherwise
  const activeLayer = showControls
    ? activeLayerInternal
    : (activeLayerProp ?? "bidang");
  const mapMode = showControls ? mapModeInternal : (mapModeProp ?? "2d");
  const showKelurahan = showControls
    ? showKelurahanInternal
    : (showKelurahanProp ?? true);
  const showKecamatan = showControls
    ? showKecamatanInternal
    : (showKecamatanProp ?? true);

  // Refs untuk menghindari stale closure di map event handler yang didaftarkan sekali
  const roleAssetsRef = useRef([]);
  const onFeatureClickRef = useRef(onFeatureClick);
  const onOtherLayerClickRef = useRef(onOtherLayerClick);
  const isBPKAModeRef = useRef(isBPKAMode);

  const roleAssets = useMemo(() => {
    return (assets || []).filter((asset) =>
      isBPKAMode ? isBPKAAsset(asset) : !isBPKAAsset(asset),
    );
  }, [assets, isBPKAMode]);

  const bidangTanahGeoJson = useMemo(() => {
    const features = roleAssets
      .map((asset) => {
        const ring = normalizePolygonRing(asset?.polygon);
        if (!ring) {
          return null;
        }

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ring],
          },
          properties: buildBidangPopupFromAsset(asset, isBPKAMode),
        };
      })
      .filter(Boolean);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [roleAssets, isBPKAMode]);

  const hasDynamicBidangData = bidangTanahGeoJson.features.length > 0;

  // Dot (centroid) GeoJSON from polygon assets
  const dotGeoJson = useMemo(() => {
    const features = roleAssets
      .map((asset) => {
        const ring = normalizePolygonRing(asset?.polygon);
        if (!ring || ring.length < 3) return null;
        // Compute centroid (average of all points except closing point)
        const pts =
          ring[0] === ring[ring.length - 1] ? ring.slice(0, -1) : ring;
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [cx, cy] },
          properties: buildBidangPopupFromAsset(asset, isBPKAMode),
        };
      })
      .filter(Boolean);
    return { type: "FeatureCollection", features };
  }, [roleAssets, isBPKAMode]);

  // Sync refs setiap kali nilai berubah supaya handler peta selalu punya data terbaru
  useEffect(() => {
    roleAssetsRef.current = roleAssets;
  }, [roleAssets]);

  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
    onOtherLayerClickRef.current = onOtherLayerClick;
    isBPKAModeRef.current = isBPKAMode;
  }, [onFeatureClick, onOtherLayerClick, isBPKAMode]);

  const is3D = mapMode === "3d";
  const isDot = mapMode === "dot";

  const showBidangTanah = activeLayer === "bidang";
  const currentThematic = activeLayer; // "rdtr" | "znt" | lainnya = tidak tampil

  const zntCachedData = useRef(null);
  const bangunanCachedData = useRef(null);

  const legendItems = useMemo(() => {
    const items = [];

    if (activeLayer === "rdtr") {
      items.push(
        { type: "fill", label: "Perumahan", color: "#facc15" },
        { type: "fill", label: "Perdagangan & Jasa", color: "#ef4444" },
        { type: "fill", label: "RTH / Pertanian", color: "#22c55e" },
        { type: "fill", label: "Industri", color: "#78716c" },
        { type: "fill", label: "Perairan / Sempadan", color: "#3b82f6" },
        { type: "fill", label: "Fasilitas Umum", color: "#a855f7" },
      );
    }

    if (activeLayer === "znt") {
      items.push(
        { type: "fill", label: "< 1 Jt", color: "#fef08a" },
        { type: "fill", label: "1 - 5 Jt", color: "#f97316" },
        { type: "fill", label: "5 - 10 Jt", color: "#ef4444" },
        { type: "fill", label: "10 - 50 Jt", color: "#a855f7" },
        { type: "fill", label: "> 50 Jt", color: "#4c1d95" },
      );
    }

    if (activeLayer === "bidang" && !isBPKAMode) {
      items.push(
        {
          type: "line",
          label: "Belum Bersertifikat",
          color: "#dc2626",
          thickness: 2,
        },
        {
          type: "line",
          label: "Sudah Bersertifikat",
          color: "#64748b",
          thickness: 1,
        },
      );
    }

    return items;
  }, [activeLayer, isBPKAMode]);

  const getBidangSource = () =>
    hasDynamicBidangData
      ? bidangTanahGeoJson
      : isBPKAMode
        ? BPKA_BIDANG_SOURCE
        : BPN_BIDANG_SOURCE;

  const getBidangLineColor = () => {
    return isBPKAMode
      ? "#d97706"
      : [
          "match",
          ["get", "STATUS SERTIFIKAT"],
          "Belum Bersertifikat",
          "#dc2626",
          "Sudah Bersertifikat",
          "#64748b",
          "#64748b",
        ];
  };

  const getBidangLineWidth = () => {
    return isBPKAMode
      ? 1.5
      : ["match", ["get", "STATUS SERTIFIKAT"], "Belum Bersertifikat", 2, 1];
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

    popupRef.current = new maplibregl.Popup({
      maxWidth: "360px",
      className: "maplibre-custom-popup",
    })
      .setLngLat(lngLat)
      .setHTML(buildWebgisPopupHtml(properties, layerId))
      .addTo(map.current);
  };

  const getHighlightCoords = (asset) => {
    const lat = Number(asset?.latitude);
    const lng = Number(asset?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lng, lat];
    }

    if (Array.isArray(asset?.polygon) && asset.polygon.length > 0) {
      const validPoints = asset.polygon
        .map((point) => {
          if (Array.isArray(point) && point.length >= 2) {
            const pLat = Number(point[0]);
            const pLng = Number(point[1]);
            if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
              return [pLat, pLng];
            }
          }

          if (point && typeof point === "object") {
            const pLat = Number(point.lat);
            const pLng = Number(point.lng);
            if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
              return [pLat, pLng];
            }
          }

          return null;
        })
        .filter(Boolean);

      if (validPoints.length > 0) {
        const sum = validPoints.reduce(
          (acc, [pLat, pLng]) => [acc[0] + pLat, acc[1] + pLng],
          [0, 0],
        );
        return [sum[1] / validPoints.length, sum[0] / validPoints.length];
      }
    }

    return null;
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
        layout: { visibility: activeLayer === "bidang" ? "visible" : "none" },
        paint: {
          "fill-color": isBPKAMode ? "#f59e0b" : "#0ea5e9",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            isBPKAMode ? 0.45 : 0.35,
            isBPKAMode ? 0.2 : 0.1,
          ],
        },
      });

      map.current.addLayer({
        id: "bidang_tanah_line",
        type: "line",
        source: "bidang_tanah",
        layout: { visibility: activeLayer === "bidang" ? "visible" : "none" },
        paint: {
          "line-color": getBidangLineColor(),
          "line-width": getBidangLineWidth(),
        },
      });
    }

    // Dot layer for asset centroids
    if (!map.current.getSource("asset-dots")) {
      map.current.addSource("asset-dots", {
        type: "geojson",
        data: dotGeoJson,
      });

      map.current.addLayer({
        id: "asset-dots-circle",
        type: "circle",
        source: "asset-dots",
        layout: {
          visibility: isDot && activeLayer === "bidang" ? "visible" : "none",
        },
        paint: {
          "circle-radius": 7,
          "circle-color": isBPKAMode ? "#f59e0b" : "#0ea5e9",
          "circle-stroke-color": isBPKAMode ? "#b45309" : "#0369a1",
          "circle-stroke-width": 2,
          "circle-opacity": 0.85,
        },
      });
    }

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
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [112.9063, -7.6453],
      zoom: 14.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );
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
      addCustomLayers();

      // Hide base map text labels (keep our custom layers)
      try {
        const style = map.current.getStyle();
        const customSources = new Set([
          "batas_wilayah",
          "batas_kecamatan",
          "bidang_tanah",
          "rdtr",
          "znt",
          "bangunan",
        ]);
        if (style?.layers) {
          style.layers.forEach((layer) => {
            if (layer.type === "symbol" && !customSources.has(layer.source)) {
              map.current.setPaintProperty(layer.id, "text-opacity", 0);
              map.current.setPaintProperty(layer.id, "icon-opacity", 0);
            }
          });
        }
      } catch (e) {
        console.warn("Could not hide base map labels:", e);
      }

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
      if (map.current) {
        map.current.off("click", handleMapClick);
        map.current.off("mousemove", handleMouseMove);
        map.current.remove();
        map.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const bidangSource = map.current.getSource("bidang_tanah");
    if (bidangSource) {
      bidangSource.setData(getBidangSource());
    }

    // Bidang polygon layers: visible only in 2d/3d mode when activeLayer=bidang
    const showPolygon = activeLayer === "bidang" && !isDot;
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
    // Dot layer: visible only in dot mode when activeLayer=bidang
    if (map.current.getLayer("asset-dots-circle")) {
      map.current.setLayoutProperty(
        "asset-dots-circle",
        "visibility",
        activeLayer === "bidang" && isDot ? "visible" : "none",
      );
    }

    // Update dot data
    const dotSource = map.current.getSource("asset-dots");
    if (dotSource) {
      dotSource.setData(dotGeoJson);
    }

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
    isDot,
    is3D,
    dotGeoJson,
    showKelurahan,
    showKecamatan,
  ]);

  useEffect(() => {
    if (!highlightAssetId || !map.current || !roleAssets.length) {
      return;
    }

    const targetAsset = roleAssets.find(
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

      map.current.flyTo({
        center: lngLat,
        zoom: Math.max(map.current.getZoom(), 16),
        duration: 1200,
      });

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
  }, [roleAssets, highlightAssetId, highlightRequestKey, isBPKAMode]);

  const handleMapClick = (event) => {
    if (!map.current) return;

    const layersToQuery = [
      "asset-dots-circle",
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
      (layerId === "bidang_tanah_fill" || layerId === "asset-dots-circle") &&
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
        // Tutup MapLibre popup jika ada
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        currentOnFeatureClick(matched);
        return;
      }
    }

    // Fallback: RDTR / ZNT / unmatched bidang → plain MapLibre popup
    if (currentOnOtherLayerClick) currentOnOtherLayerClick();
    openWebgisPopup(event.lngLat, feature.properties || {}, layerId);
  };

  const handleMouseMove = (event) => {
    if (!map.current) return;

    const layers = [
      "asset-dots-circle",
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

  return (
    <div className="w-full h-full relative bg-gray-100">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Internal controls – rendered only when showControls=true (e.g. DashboardPage) */}
      {showControls && (
        <>
          <div className="absolute top-4 left-4 z-20 w-60">
            <BPNLayerControl
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayerInternal}
              panelTitle={
                isBPKAMode ? "Kontrol Layer BPKA" : "Kontrol Layer BPN"
              }
              bidangLabel={
                isBPKAMode ? "Aset Pemkot (BPKA)" : "Bidang Tanah (BPN)"
              }
              showLegend={legendItems.length > 0}
              legendTitle="Legenda Layer"
              legendItems={legendItems}
              showKelurahan={showKelurahan}
              setShowKelurahan={setShowKelurahanInternal}
              showKecamatan={showKecamatan}
              setShowKecamatan={setShowKecamatanInternal}
              isBPKAMode={isBPKAMode}
            />
          </div>

          <div className="absolute bottom-4 right-4 z-20 flex items-center bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden">
            {["dot", "2d", "3d"].map((m) => (
              <button
                key={m}
                onClick={() => setMapModeInternal(m)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  mapMode === m
                    ? "bg-accent text-white"
                    : "text-text-muted hover:bg-surface-secondary hover:text-text-primary"
                }`}
                title={
                  m === "dot"
                    ? "Tampilan Titik"
                    : m === "2d"
                      ? "Tampilan 2D"
                      : "Tampilan 3D"
                }
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
        </>
      )}
    </div>
  );
};

export default MapDisplayBPN;

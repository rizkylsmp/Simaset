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
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const lastHandledHighlightRef = useRef(null);
  const hoveredBidangId = useRef(null);
  const isBPKAMode = mode === "bpka";

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

  // Sync refs setiap kali nilai berubah supaya handler peta selalu punya data terbaru
  useEffect(() => {
    roleAssetsRef.current = roleAssets;
  }, [roleAssets]);

  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
    onOtherLayerClickRef.current = onOtherLayerClick;
    isBPKAModeRef.current = isBPKAMode;
  }, [onFeatureClick, onOtherLayerClick, isBPKAMode]);

  // activeLayer: "bidang" | "rdtr" | "znt"
  const [activeLayer, setActiveLayer] = useState("bidang");
  const [is3D, setIs3D] = useState(false);

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
      ? "#0ea5e9"
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
      ? 1
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
          "fill-color": "#0ea5e9",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.35,
            0.1,
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

    if (map.current.getLayer("bidang_tanah_fill")) {
      map.current.setLayoutProperty(
        "bidang_tanah_fill",
        "visibility",
        activeLayer === "bidang" ? "visible" : "none",
      );
    }

    if (map.current.getLayer("bidang_tanah_line")) {
      map.current.setLayoutProperty(
        "bidang_tanah_line",
        "visibility",
        activeLayer === "bidang" ? "visible" : "none",
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
  }, [activeLayer, isBPKAMode, hasDynamicBidangData, bidangTanahGeoJson]);

  // Toggle 3D buildings visibility + camera pitch
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getLayer("3d-buildings-layer")) {
      map.current.setLayoutProperty(
        "3d-buildings-layer",
        "visibility",
        is3D ? "visible" : "none",
      );
    }

    map.current.easeTo({
      pitch: is3D ? 60 : 0,
      bearing: is3D ? 30 : 0,
      duration: 1500,
    });
  }, [is3D]);

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

    const layersToQuery = ["bidang_tanah_fill", "rdtr_fill", "znt_fill"].filter(
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

    if (layerId === "bidang_tanah_fill" && currentOnFeatureClick) {
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

    const layers = ["bidang_tanah_fill", "rdtr_fill", "znt_fill"].filter(
      (layer) => map.current.getLayer(layer),
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

      <BPNLayerControl
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        panelTitle={isBPKAMode ? "Kontrol Layer BPKA" : "Kontrol Layer BPN"}
        bidangLabel={isBPKAMode ? "Aset Pemkot (BPKA)" : "Bidang Tanah (BPN)"}
        showLegend={legendItems.length > 0}
        legendTitle="Legenda Layer"
        legendItems={legendItems}
      />

      {/* 2D / 3D Toggle */}
      <button
        onClick={() => setIs3D((v) => !v)}
        className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-surface/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg hover:bg-surface transition-colors cursor-pointer"
        title={is3D ? "Beralih ke 2D" : "Beralih ke 3D"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 ${is3D ? "text-accent" : "text-text-muted"}`}
        >
          {is3D ? (
            <>
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M12 12l8-4.5" />
              <path d="M12 12v9" />
              <path d="M12 12L4 7.5" />
            </>
          ) : (
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 12h18" />
              <path d="M12 3v18" />
            </>
          )}
        </svg>
        <span className="text-xs font-bold text-text-primary">
          {is3D ? "3D" : "2D"}
        </span>
      </button>
    </div>
  );
};

export default MapDisplayBPN;

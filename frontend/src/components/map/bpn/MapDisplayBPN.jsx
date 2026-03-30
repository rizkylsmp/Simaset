import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import BPNLayerControl from "./BPNLayerControl";
import "./mapLibreStyles.css";

const MapDisplayBPN = ({
  assets = [],
  mode = "bpn",
  highlightAssetId = null,
  highlightRequestKey = null,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const lastHandledHighlightRef = useRef(null);
  const isBPKADMode = mode === "bpkad";

  const bidangTanahGeoJson = useMemo(() => {
    const features = (assets || [])
      .map((asset) => {
        const rawPolygon = asset?.polygon;
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

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ring],
          },
          properties: {
            "STATUS SERTIFIKAT": asset?.status_sertifikat || null,
            STATUS: asset?.status || null,
            NAMA_ASET: asset?.nama_aset || null,
            KODE_ASET: asset?.kode_aset || null,
            LOKASI: asset?.lokasi || null,
            LUAS: asset?.luas || null,
            JENIS_ASET: asset?.jenis_aset || null,
            KETERANGAN: asset?.keterangan || null,
          },
        };
      })
      .filter(Boolean);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [assets]);

  const hasDynamicBidangData = bidangTanahGeoJson.features.length > 0;

  // Layer visibility states
  const [showBidangTanah, setShowBidangTanah] = useState(true);
  const [showBatasWilayah, setShowBatasWilayah] = useState(true);
  const [showBangunan, setShowBangunan] = useState(false);
  const [currentThematic, setCurrentThematic] = useState("none");
  const [is3D, setIs3D] = useState(false);

  // Cached data
  const zntCachedData = useRef(null);

  const formatPopupValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const upKey = String(key).toUpperCase();
    const asNumber = Number(value);
    const isNumericValue = Number.isFinite(asNumber);

    if (isNumericValue) {
      if (upKey.includes("NILAI") || upKey.includes("HARGA")) {
        return `Rp ${asNumber.toLocaleString("id-ID")}`;
      }
      if (upKey.includes("LUAS") || upKey.includes("AREA")) {
        return `${asNumber.toLocaleString("id-ID")} m²`;
      }
    }

    return String(value);
  };

  const buildWebgisPopupHtml = (properties = {}) => {
    let tbody = "";

    for (const key of Object.keys(properties)) {
      if (key === "layer" || key === "source" || key === "_calculated_height") {
        continue;
      }

      const formattedValue = formatPopupValue(key, properties[key]);
      tbody += `<tr><td><strong>${key}</strong></td><td>${formattedValue}</td></tr>`;
    }

    return `
      <div class="maplibre-popup-content">
        <div class="popup-header">Info Objek</div>
        <div class="popup-body">
          <table class="popup-table">
            <tbody>${tbody}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  const openWebgisPopup = (lngLat, properties) => {
    if (!map.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    popupRef.current = new maplibregl.Popup({
      maxWidth: "350px",
      className: "maplibre-custom-popup",
    })
      .setLngLat(lngLat)
      .setHTML(buildWebgisPopupHtml(properties))
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
          (acc, [pLat, pLng]) => {
            return [acc[0] + pLat, acc[1] + pLng];
          },
          [0, 0],
        );
        return [sum[1] / validPoints.length, sum[0] / validPoints.length];
      }
    }

    return null;
  };

  const buildPopupPropertiesFromAsset = (asset) => {
    return {
      KODE_ASET: asset?.kode_aset || "-",
      NAMA_ASET: asset?.nama_aset || "-",
      STATUS: asset?.status || "-",
      "STATUS SERTIFIKAT": asset?.status_sertifikat || "-",
      LOKASI: asset?.lokasi || "-",
      LUAS: asset?.luas || 0,
      JENIS_ASET: asset?.jenis_aset || "-",
      KETERANGAN: asset?.keterangan || "-",
    };
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Prevent duplicate initialization

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [112.9063, -7.6453], // Pasuruan, Jawa Timur
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
      new maplibregl.ScaleControl({ maxWidth: 150, unit: "metric" }),
      "bottom-left",
    );

    // Pre-fetch ZNT data to handle number casting
    fetch("/data/znt.geojson")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((f) => {
          if (!f.properties) f.properties = {};
          f.properties._NILBULAT_NUM = 0;
          if (f.properties.NILBULAT) {
            let cleanStr = String(f.properties.NILBULAT).replace(/[^0-9]/g, "");
            if (cleanStr) {
              f.properties._NILBULAT_NUM = Number(cleanStr);
            }
          }
        });
        zntCachedData.current = data;
        if (map.current.isStyleLoaded()) {
          addCustomLayers();
        }
      })
      .catch((e) => console.warn("Could not load ZNT:", e));

    // Setup lighting for 3D
    map.current.on("load", () => {
      addCustomLayers();
      if (map.current.setLight) {
        map.current.setLight({
          anchor: "viewport",
          color: "white",
          intensity: 0.45,
          position: [1.15, 210, 30],
        });
      }
    });

    // Popup on click
    map.current.on("click", handleMapClick);

    // Cursor on hover
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

  // Add all custom layers
  const addCustomLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // 1. Batas Wilayah
    if (!map.current.getSource("batas_wilayah")) {
      map.current.addSource("batas_wilayah", {
        type: "geojson",
        data: "/data/batas_wilayah.geojson",
      });
      map.current.addLayer({
        id: "batas_wilayah_line",
        type: "line",
        source: "batas_wilayah",
        layout: { visibility: showBatasWilayah ? "visible" : "none" },
        paint: {
          "line-color": "#475569",
          "line-width": 2,
          "line-dasharray": [4, 2],
        },
      });
    }

    // 2. RDTR (Pola Ruang)
    if (!map.current.getSource("rdtr")) {
      map.current.addSource("rdtr", {
        type: "geojson",
        data: "/data/rdtr.geojson",
      });
      map.current.addLayer({
        id: "rdtr_fill",
        type: "fill",
        source: "rdtr",
        layout: { visibility: currentThematic === "rdtr" ? "visible" : "none" },
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
            "#22c55e", // Default green for others
          ],
          "fill-opacity": 0.6,
        },
      });
    }

    // 3. ZNT Tracker
    if (!map.current.getSource("znt") && zntCachedData.current) {
      map.current.addSource("znt", {
        type: "geojson",
        data: zntCachedData.current,
      });
      map.current.addLayer({
        id: "znt_fill",
        type: "fill",
        source: "znt",
        layout: { visibility: currentThematic === "znt" ? "visible" : "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "_NILBULAT_NUM"],
            0,
            "#fef08a", // Yellow
            1000000,
            "#f97316", // Orange
            5000000,
            "#ef4444", // Red
            10000000,
            "#a855f7", // Purple
            50000000,
            "#4c1d95", // Dark purple
          ],
          "fill-opacity": 0.7,
        },
      });
    }

    // 4. Bidang Tanah (dynamic mode)
    if (!map.current.getSource("bidang_tanah")) {
      map.current.addSource("bidang_tanah", {
        type: "geojson",
        data: hasDynamicBidangData
          ? bidangTanahGeoJson
          : isBPKADMode
            ? "/data/bidang_tanah1.geojson"
            : "/data/bidang_tanah.geojson",
      });

      map.current.addLayer({
        id: "bidang_tanah_fill",
        type: "fill",
        source: "bidang_tanah",
        layout: { visibility: showBidangTanah ? "visible" : "none" },
        paint: {
          "fill-color": "#0ea5e9",
          "fill-opacity": 0.1,
        },
      });

      map.current.addLayer({
        id: "bidang_tanah_line",
        type: "line",
        source: "bidang_tanah",
        layout: { visibility: showBidangTanah ? "visible" : "none" },
        paint: {
          "line-color": isBPKADMode
            ? "#0ea5e9"
            : [
                "match",
                ["get", "STATUS SERTIFIKAT"],
                "Belum Bersertifikat",
                "#dc2626",
                "Sudah Bersertifikat",
                "#64748b",
                "#64748b",
              ],
          "line-width": isBPKADMode
            ? 1
            : [
                "match",
                ["get", "STATUS SERTIFIKAT"],
                "Belum Bersertifikat",
                2,
                1,
              ],
        },
      });
    }

    // 5. 3D Buildings
    if (!map.current.getSource("local-buildings")) {
      fetch("/data/bangunan.geojson")
        .then((res) => res.json())
        .then((data) => {
          const flattenCoords = (coords) => {
            if (coords && coords.length > 0 && typeof coords[0] === "number") {
              return [coords[0], coords[1]];
            }
            return coords.map(flattenCoords);
          };

          data.features.forEach((f) => {
            if (!f.properties) f.properties = {};

            if (f.geometry && f.geometry.coordinates) {
              f.geometry.coordinates = flattenCoords(f.geometry.coordinates);
            }

            // Calculate area-based height
            let area = 50;
            if (f.geometry && f.geometry.type === "Polygon") {
              let ring = f.geometry.coordinates[0];
              if (ring && ring.length > 2) {
                let calcArea = 0;
                for (let i = 0; i < ring.length - 1; i++) {
                  let x1 =
                    ring[i][0] *
                    111320 *
                    Math.cos((ring[i][1] * Math.PI) / 180);
                  let y1 = ring[i][1] * 110574;
                  let x2 =
                    ring[i + 1][0] *
                    111320 *
                    Math.cos((ring[i + 1][1] * Math.PI) / 180);
                  let y2 = ring[i + 1][1] * 110574;
                  calcArea += x1 * y2 - x2 * y1;
                }
                area = Math.abs(calcArea) / 2;
              }
            }

            // Assign height based on area
            let height = 3;
            if (area < 30) {
              height = 2.5 + Math.random();
            } else if (area < 100) {
              height = 3.5 + Math.random() * 2;
            } else if (area < 300) {
              height = 6 + Math.random() * 3;
            } else if (area < 1000) {
              height = 9 + Math.random() * 4;
            } else {
              height = 14 + Math.random() * 4;
            }

            f.properties._calculated_height = height;
          });

          map.current.addSource("local-buildings", {
            type: "geojson",
            data: data,
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
                "#f8fafc",
                8,
                "#e2e8f0",
                15,
                "#cbd5e1",
                25,
                "#94a3b8",
              ],
              "fill-extrusion-height": [
                "max",
                ["coalesce", ["get", "_calculated_height"], 5],
                2,
              ],
              "fill-extrusion-base": 0,
              "fill-extrusion-vertical-gradient": true,
              "fill-extrusion-opacity": 1.0,
            },
          });
        })
        .catch((e) => console.error("Error loading bangunan.geojson:", e));
    }
  };

  // Update layer visibility when state changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getSource("bidang_tanah") && hasDynamicBidangData) {
      map.current.getSource("bidang_tanah").setData(bidangTanahGeoJson);
    }

    // Update Batas Wilayah
    if (map.current.getLayer("batas_wilayah_line")) {
      map.current.setLayoutProperty(
        "batas_wilayah_line",
        "visibility",
        showBatasWilayah ? "visible" : "none",
      );
    }

    // Update Bidang Tanah
    if (map.current.getLayer("bidang_tanah_fill")) {
      map.current.setLayoutProperty(
        "bidang_tanah_fill",
        "visibility",
        showBidangTanah ? "visible" : "none",
      );
    }
    if (map.current.getLayer("bidang_tanah_line")) {
      map.current.setLayoutProperty(
        "bidang_tanah_line",
        "visibility",
        showBidangTanah ? "visible" : "none",
      );
    }

    // Update 3D Buildings
    if (map.current.getLayer("3d-buildings-layer")) {
      map.current.setLayoutProperty(
        "3d-buildings-layer",
        "visibility",
        is3D ? "visible" : "none",
      );
      if (is3D) {
        map.current.easeTo({ pitch: 60, bearing: 30, duration: 1500 });
      } else {
        map.current.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
      }
    }

    // Update Thematic Layers
    if (map.current.getLayer("rdtr_fill")) {
      map.current.setLayoutProperty(
        "rdtr_fill",
        "visibility",
        currentThematic === "rdtr" ? "visible" : "none",
      );
    }
    if (map.current.getLayer("znt_fill")) {
      map.current.setLayoutProperty(
        "znt_fill",
        "visibility",
        currentThematic === "znt" ? "visible" : "none",
      );
    }
  }, [
    showBatasWilayah,
    showBidangTanah,
    showBangunan,
    is3D,
    currentThematic,
    mode,
    hasDynamicBidangData,
    bidangTanahGeoJson,
  ]);

  useEffect(() => {
    if (!highlightAssetId || !map.current || !assets.length) {
      return;
    }

    const targetAsset = assets.find(
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

      openWebgisPopup(lngLat, buildPopupPropertiesFromAsset(targetAsset));
      lastHandledHighlightRef.current = requestToken;
    };

    const timeoutId = setTimeout(openHighlightedPopup, 250);
    return () => clearTimeout(timeoutId);
  }, [assets, highlightAssetId, highlightRequestKey]);

  const handleMapClick = (e) => {
    const layersToQuery = ["bidang_tanah_fill", "rdtr_fill", "znt_fill"].filter(
      (l) =>
        map.current.getLayer(l) &&
        map.current.getLayoutProperty(l, "visibility") !== "none",
    );

    const bbox = [
      [e.point.x - 3, e.point.y - 3],
      [e.point.x + 3, e.point.y + 3],
    ];
    const features = map.current.queryRenderedFeatures(bbox, {
      layers: layersToQuery,
    });

    if (!features.length) return;

    const feature = features[0];
    openWebgisPopup(e.lngLat, feature.properties || {});
  };

  const handleMouseMove = (e) => {
    const layers = ["bidang_tanah_fill", "rdtr_fill", "znt_fill"].filter((l) =>
      map.current.getLayer(l),
    );
    const features = map.current.queryRenderedFeatures(e.point, { layers });
    map.current.getCanvas().style.cursor = features.length ? "pointer" : "";
  };

  return (
    <div className="w-full h-full relative bg-gray-100">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer Control Panel */}
      <BPNLayerControl
        showBidangTanah={showBidangTanah}
        setShowBidangTanah={setShowBidangTanah}
        showBatasWilayah={showBatasWilayah}
        setShowBatasWilayah={setShowBatasWilayah}
        showBangunan={showBangunan}
        setShowBangunan={setShowBangunan}
        currentThematic={currentThematic}
        setCurrentThematic={setCurrentThematic}
        is3D={is3D}
        setIs3D={setIs3D}
        panelTitle={isBPKADMode ? "Kontrol Layer BPKAD" : "Kontrol Layer BPN"}
        bidangLabel={isBPKADMode ? "Aset Pemkot (BPKAD)" : "Bidang Tanah (BPN)"}
      />
    </div>
  );
};

export default MapDisplayBPN;

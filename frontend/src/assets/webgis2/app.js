// Initialize Map
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [112.9063, -7.6453],
    zoom: 14.5,
    pitch: 0,
    bearing: 0,
    antialias: true // Crucial for smooth 3D rendering preventing edge flickering
});

// MapLibre Controls
map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
map.addControl(new maplibregl.ScaleControl({ maxWidth: 150, unit: 'metric' }), 'bottom-left');

// State Variables
let currentMode = 'bpn'; // 'bpn' or 'bpkad'
let is3D = false;
let currentThematic = 'none'; // tracks active thematic layer

// Define the Data URLs
const FILE_BPN = 'data/bidang_tanah.geojson';
const FILE_BPKAD = 'data/bidang_tanah1.geojson';

// Pre-fetch ZNT data to handle maplibre expression string-num casting natively in JS
let zntCachedData = null;
fetch('data/znt.geojson')
    .then(res => res.json())
    .then(data => {
        data.features.forEach(f => {
            if (!f.properties) f.properties = {};
            f.properties._NILBULAT_NUM = 0; // Default fallback to avoid mapbox crash
            if (f.properties.NILBULAT) {
                let cleanStr = String(f.properties.NILBULAT).replace(/[^0-9]/g, '');
                if (cleanStr) {
                    f.properties._NILBULAT_NUM = Number(cleanStr);
                }
            }
        });
        zntCachedData = data;

        // Refresh custom layers if map style already loaded before fetch finish
        if (map.isStyleLoaded()) {
            addCustomLayers();
        }
    })
    .catch(e => console.warn("Could not load ZNT:", e));

function addCustomLayers() {
    // 1. Batas Wilayah (Kecamatan dan Kelurahan)
    if (!map.getSource('batas_wilayah')) {
        map.addSource('batas_wilayah', { type: 'geojson', data: 'data/batas_wilayah.geojson' });
        map.addLayer({
            id: 'batas_wilayah_line', // Batas Kelurahan
            type: 'line',
            source: 'batas_wilayah',
            paint: { 'line-color': '#94a3b8', 'line-width': 1 }
        });
        map.addLayer({
            id: 'batas_wilayah_label',
            type: 'symbol',
            source: 'batas_wilayah',
            layout: {
                'text-field': ['get', 'NAMOBJ'],
                'text-size': 11,
                'visibility': document.getElementById('layer-batas-kelurahan').checked ? 'visible' : 'none'
            },
            paint: {
                'text-color': '#64748b',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5
            }
        });

        // Batas Kecamatan yang telah di-dissolve dari WADMKC
        map.addSource('batas_kecamatan', { type: 'geojson', data: 'data/batas_kecamatan.geojson' });
        map.addLayer({
            id: 'batas_kecamatan_line',
            type: 'line',
            source: 'batas_kecamatan',
            paint: { 'line-color': '#334155', 'line-width': 2.5, 'line-dasharray': [4, 3] }
        });
        map.addLayer({
            id: 'batas_kecamatan_label',
            type: 'symbol',
            source: 'batas_kecamatan',
            layout: {
                'text-field': ['get', 'WADMKC'],
                'text-size': 14,
                'text-transform': 'uppercase',
                'visibility': document.getElementById('layer-batas-kecamatan').checked ? 'visible' : 'none'
            },
            paint: {
                'text-color': '#1e293b',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
            }
        });
    }

    // 2. Pola Ruang (Uses RDTR Data)
    if (!map.getSource('rdtr')) {
        map.addSource('rdtr', { type: 'geojson', data: 'data/rdtr.geojson' });
        map.addLayer({
            id: 'rdtr_fill',
            type: 'fill',
            source: 'rdtr',
            layout: { visibility: currentThematic === 'rdtr' ? 'visible' : 'none' },
            paint: {
                'fill-color': [
                    'match',
                    ['get', 'RPR'],
                    'Kawasan Perumahan', '#facc15',
                    'Kawasan Perdagangan dan Jasa', '#ef4444',
                    'Kawasan Peruntukkan Industri', '#78716c',
                    ['Ruang Terbuka Hijau Kota', 'Kawasan Ekosistem Mangrove', 'Kawasan Perkebunan', 'Kawasan Tanaman Pangan', 'KP2B', 'Hutan', 'RTH'], '#22c55e',
                    ['Sungai', 'Kawasan Sumber Daya Air', 'Sempadan Sungai', 'Sempadan Pantai'], '#3b82f6',
                    ['Kawasan Perkantoran', 'Kawasan Pendidikan', 'Kawasan Kesehatan', 'Kawasan Peribadatan', 'Kawasan Pelayanan Umum', 'Kawasan Pariwisata', 'Kawasan Olahraga'], '#a855f7',
                    '#94a3b8' // fallback
                ],
                'fill-opacity': 0.6
            }
        });
    }

    // 3. ZNT Tracker (using Cached Data)
    if (!map.getSource('znt') && zntCachedData) {
        map.addSource('znt', { type: 'geojson', data: zntCachedData });
        map.addLayer({
            id: 'znt_fill',
            type: 'fill',
            source: 'znt',
            layout: { visibility: currentThematic === 'znt' ? 'visible' : 'none' },
            paint: {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', '_NILBULAT_NUM'],
                    0, '#fef08a',         // Yellow (low)
                    1000000, '#f97316',   // Orange
                    5000000, '#ef4444',   // Red
                    10000000, '#a855f7',  // Purple
                    50000000, '#4c1d95'   // Dark Purple (high)
                ],
                'fill-opacity': 0.7
            }
        });

        if (currentThematic === 'znt' && document.getElementById('legend-section').style.display !== 'none') {
            buildLegend('znt');
        }
    }

    // 4. Bidang Tanah (Dynamic Mode)
    const sourceFile = (currentMode === 'bpn') ? FILE_BPN : FILE_BPKAD;
    if (!map.getSource('bidang_tanah')) {
        map.addSource('bidang_tanah', { type: 'geojson', data: sourceFile });

        let bidangVis = document.getElementById('layer-bidang').checked ? 'visible' : 'none';

        map.addLayer({
            id: 'bidang_tanah_fill',
            type: 'fill',
            source: 'bidang_tanah',
            layout: { visibility: bidangVis },
            paint: {
                'fill-color': '#0ea5e9',
                'fill-opacity': 0.1
            }
        });

        map.addLayer({
            id: 'bidang_tanah_line',
            type: 'line',
            source: 'bidang_tanah',
            layout: { visibility: bidangVis },
            paint: {
                'line-color': [
                    'match',
                    ['get', 'STATUS SERTIFIKAT'],
                    'Belum Bersertifikat', '#dc2626', // Red
                    'Sudah Bersertifikat', '#64748b', // Grey
                    '#64748b' // Fallback
                ],
                'line-width': [
                    'match',
                    ['get', 'STATUS SERTIFIKAT'],
                    'Belum Bersertifikat', 2,
                    1 // standard width
                ]
            }
        });
    }

    // 5. 3D Buildings (Using Local 'bangunan.geojson' with Area-Based Height)
    if (!map.getSource('local-buildings')) {
        fetch('data/bangunan.geojson')
            .then(res => res.json())
            .then(data => {

                // Helper for removing Z-coordinates that break MapLibre WebGL Earcut tessellation
                const flattenCoords = (coords) => {
                    if (coords && coords.length > 0 && typeof coords[0] === 'number') {
                        return [coords[0], coords[1]]; // Keep only X, Y
                    }
                    return coords.map(flattenCoords);
                };

                // Calculate Area, Fix Winding Order, and Assign Height
                data.features.forEach(f => {
                    if (!f.properties) f.properties = {};

                    if (f.geometry && f.geometry.coordinates) {
                        // Strip out Z=0.0 from [x, y, z] because it crashes fill-extrusion
                        f.geometry.coordinates = flattenCoords(f.geometry.coordinates);
                    }

                    // Helper: Fix winding order (Exterior rings MUST be counter-clockwise)
                    const enforceCounterClockwise = (ring) => {
                        if (!ring || ring.length < 3) return 0;
                        let MathArea = 0;
                        for (let i = 0; i < ring.length - 1; i++) {
                            MathArea += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
                        }
                        if (MathArea > 0) { // If > 0, it's clockwise. Needs to be reversed!
                            ring.reverse();
                        }
                        return MathArea;
                    };

                    let area = 50; // default footprint
                    if (f.geometry && f.geometry.type === 'Polygon') {
                        let ring = f.geometry.coordinates[0];
                        enforceCounterClockwise(ring);

                        let calcArea = 0;
                        if (ring && ring.length > 2) {
                            for (let i = 0; i < ring.length - 1; i++) {
                                let x1 = ring[i][0] * 111320 * Math.cos(ring[i][1] * Math.PI / 180);
                                let y1 = ring[i][1] * 110574;
                                let x2 = ring[i + 1][0] * 111320 * Math.cos(ring[i + 1][1] * Math.PI / 180);
                                let y2 = ring[i + 1][1] * 110574;
                                calcArea += (x1 * y2) - (x2 * y1);
                            }
                            area = Math.abs(calcArea) / 2;
                        }
                    } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
                        let calcArea = 0;
                        f.geometry.coordinates.forEach(poly => {
                            if (poly && poly[0]) enforceCounterClockwise(poly[0]);
                        });

                        // Rough approx for the first polygon in multi
                        let ring = f.geometry.coordinates[0][0];
                        if (ring && ring.length > 2) {
                            for (let i = 0; i < ring.length - 1; i++) {
                                let x1 = ring[i][0] * 111320 * Math.cos(ring[i][1] * Math.PI / 180);
                                let y1 = ring[i][1] * 110574;
                                let x2 = ring[i + 1][0] * 111320 * Math.cos(ring[i + 1][1] * Math.PI / 180);
                                let y2 = ring[i + 1][1] * 110574;
                                calcArea += (x1 * y2) - (x2 * y1);
                            }
                            area = Math.abs(calcArea) / 2;
                        }
                    }

                    // Logic Realistic Height based on footprint Area
                    let height = 3;
                    if (area < 30) {
                        height = 2.5 + Math.random(); // gubuk / bangunan kecil
                    } else if (area < 100) {
                        height = 3.5 + (Math.random() * 2); // rumah 1 lantai
                    } else if (area < 300) {
                        height = 6 + (Math.random() * 3); // rumah besar 2 lantai
                    } else if (area < 1000) {
                        height = 9 + (Math.random() * 4); // gedung menengah 3-4 lantai
                    } else {
                        height = 14 + (Math.random() * 4); // gedung besar up to 18m
                    }

                    // Add some variance logic to make it look organic
                    f.properties._calculated_height = height;
                });

                map.addSource('local-buildings', { type: 'geojson', data: data });

                // Find symbol layer to put buildings underneath
                let layers = map.getStyle().layers;
                let labelLayerId;
                if (layers) {
                    for (let i = 0; i < layers.length; i++) {
                        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                            labelLayerId = layers[i].id;
                            break;
                        }
                    }
                }// Append Extrusion Layer
                if (!map.getLayer('3d-buildings-layer')) {
                    map.addLayer({
                        id: '3d-buildings-layer',
                        type: 'fill-extrusion',
                        source: 'local-buildings',

                        layout: {
                            visibility: is3D ? 'visible' : 'none'
                        },

                        paint: {

                            // Color based on height
                            'fill-extrusion-color': [
                                'interpolate',
                                ['linear'],
                                ['coalesce', ['get', '_calculated_height'], 5],

                                3, '#f8fafc',
                                8, '#e2e8f0',
                                15, '#cbd5e1',
                                25, '#94a3b8'
                            ],

                            // Height (with safety fallback)
                            'fill-extrusion-height': [
                                'max',
                                ['coalesce', ['get', '_calculated_height'], 5],
                                2
                            ],

                            // Ground base (IMPORTANT FIX)
                            'fill-extrusion-base': 0,

                            // Better shading
                            'fill-extrusion-vertical-gradient': true,

                            // Keep solid for correct depth sorting
                            'fill-extrusion-opacity': 1.0
                        }
                    }, labelLayerId);
                }
            })
            .catch(e => console.error("Error loading bangunan.geojson:", e));
    }
}

// Ensure custom layers execute and setup 3D Lighting
map.on('load', () => {
    addCustomLayers();
    // Dynamic Lighting for 3D buildings realism
    if (map.setLight) {
        map.setLight({
            anchor: 'viewport',
            color: 'white',
            intensity: 0.45,
            position: [1.15, 210, 30] // [radial, azimuthal, polar]
        });
    }
});

// =======================
// UI Interaction Events
// =======================

// 1. Mode Switcher (BPN vs BPKAD)
document.querySelectorAll('input[name="sys-mode"]').forEach((el) => {
    el.addEventListener('change', (e) => {
        currentMode = e.target.value;
        const sourceFile = (currentMode === 'bpn') ? FILE_BPN : FILE_BPKAD;
        
        const labelEl = document.getElementById('label-bidang');
        if (labelEl) {
            labelEl.textContent = currentMode === 'bpn' ? 'Bidang Tanah (BPN)' : 'Aset Pemkot (BPKAD)';
        }

        if (map.getSource('bidang_tanah')) {
            map.getSource('bidang_tanah').setData(sourceFile);
            
            if (currentMode === 'bpkad') {
                map.setPaintProperty('bidang_tanah_line', 'line-color', '#0ea5e9'); // match generic style
                map.setPaintProperty('bidang_tanah_line', 'line-width', 1);
            } else {
                map.setPaintProperty('bidang_tanah_line', 'line-color', [
                    'match',
                    ['get', 'STATUS SERTIFIKAT'],
                    'Belum Bersertifikat', '#dc2626', // Red
                    'Sudah Bersertifikat', '#64748b', // Grey
                    '#64748b' // Fallback
                ]);
                map.setPaintProperty('bidang_tanah_line', 'line-width', [
                    'match',
                    ['get', 'STATUS SERTIFIKAT'],
                    'Belum Bersertifikat', 2,
                    1 // standard width
                ]);
            }
        }
        
        // Rebuild legend to handle symbolization toggle
        if (currentThematic !== 'none' || document.getElementById('layer-bidang').checked) {
            buildLegend(currentThematic);
        }
    });
});

// 2. Base Layers Management
document.getElementById('layer-bidang').addEventListener('change', (e) => {
    const vis = e.target.checked ? 'visible' : 'none';
    if (map.getLayer('bidang_tanah_fill')) map.setLayoutProperty('bidang_tanah_fill', 'visibility', vis);
    if (map.getLayer('bidang_tanah_line')) map.setLayoutProperty('bidang_tanah_line', 'visibility', vis);
});

document.getElementById('layer-batas-kelurahan').addEventListener('change', (e) => {
    const vis = e.target.checked ? 'visible' : 'none';
    if (map.getLayer('batas_wilayah_line')) map.setLayoutProperty('batas_wilayah_line', 'visibility', vis);
    if (map.getLayer('batas_wilayah_label')) map.setLayoutProperty('batas_wilayah_label', 'visibility', vis);
});

document.getElementById('layer-batas-kecamatan').addEventListener('change', (e) => {
    const vis = e.target.checked ? 'visible' : 'none';
    if (map.getLayer('batas_kecamatan_line')) map.setLayoutProperty('batas_kecamatan_line', 'visibility', vis);
    if (map.getLayer('batas_kecamatan_label')) map.setLayoutProperty('batas_kecamatan_label', 'visibility', vis);
});


// 3. Mutual Exclusive Thematic Layers
document.querySelectorAll('input[name="thematic-layer"]').forEach((el) => {
    el.addEventListener('change', (e) => {
        currentThematic = e.target.value;

        // Hide all thematic layers
        if (map.getLayer('rdtr_fill')) map.setLayoutProperty('rdtr_fill', 'visibility', 'none');
        if (map.getLayer('znt_fill')) map.setLayoutProperty('znt_fill', 'visibility', 'none');

        // Show selected layer
        if (currentThematic !== 'none') {
            if (map.getLayer(`${currentThematic}_fill`)) {
                map.setLayoutProperty(`${currentThematic}_fill`, 'visibility', 'visible');
            }
            buildLegend(currentThematic);
        } else {
            document.getElementById('legend-section').style.display = 'none';
        }
    });
});

// 4. 2D/3D Toggle
document.getElementById('btn-3d').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (!is3D) {
        map.easeTo({ pitch: 60, bearing: 30, duration: 1500 });
        btn.classList.add('active');
        is3D = true;
        if (map.getLayer('3d-buildings-layer')) {
            map.setLayoutProperty('3d-buildings-layer', 'visibility', 'visible');
        }
    } else {
        map.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
        btn.classList.remove('active');
        is3D = false;
        if (map.getLayer('3d-buildings-layer')) {
            map.setLayoutProperty('3d-buildings-layer', 'visibility', 'none');
        }
    }
});

// 6. Popup Logic for Clean Tables
map.on('click', (e) => {
    const layersToQuery = [
        'bidang_tanah_fill',
        'rdtr_fill',
        'znt_fill'
    ].filter(l => map.getLayer(l) && map.getLayoutProperty(l, 'visibility') !== 'none');

    const bbox = [
        [e.point.x - 3, e.point.y - 3],
        [e.point.x + 3, e.point.y + 3]
    ];
    const features = map.queryRenderedFeatures(bbox, { layers: layersToQuery });

    if (!features.length) return;

    const feature = features[0];
    const props = feature.properties;

    let tbody = '';
    for (let key in props) {
        if (key === 'layer' || key === 'source' || key === '_NILBULAT_NUM') continue;

        let val = props[key];
        const upKey = key.toUpperCase();

        if (!isNaN(val) && val !== null && val !== '') {
            // Apply smart formatting based on Column Name
            if (upKey.includes('NILAI') || upKey.includes('HARGA') || upKey.includes('NILBULAT')) {
                val = "Rp " + Number(val).toLocaleString('id-ID');
            } else if (upKey.includes('LUAS') || upKey.includes('AREA')) {
                val = Number(val).toLocaleString('id-ID') + " m²";
            } else if (upKey.includes('TAHUN') || upKey.includes('YEAR')) {
                val = String(val); // Do not format years
            }
        }
        tbody += `<tr><td>${key}</td><td>${val}</td></tr>`;
    }

    let layerTitle = feature.layer.id.replace('_fill', '').toUpperCase();
    if (layerTitle === 'BIDANG_TANAH') {
        layerTitle = currentMode === 'bpn' ? 'BIDANG TANAH (BPN)' : 'ASET PEMKOT (BPKAD)';
    }

    const popupHtml = `
        <div class="popup-header">Info Objek: ${layerTitle}</div>
        <div class="popup-body">
            <table class="custom-table">
                <tbody>${tbody}</tbody>
            </table>
        </div>
    `;

    new maplibregl.Popup({ maxWidth: '300px', className: 'custom-popup' })
        .setLngLat(e.lngLat)
        .setHTML(popupHtml)
        .addTo(map);
});

// Change cursor on hover
map.on('mousemove', (e) => {
    const layers = ['bidang_tanah_fill', 'rdtr_fill', 'znt_fill']
        .filter(l => map.getLayer(l));
    const features = map.queryRenderedFeatures(e.point, { layers: layers });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});

// Legend Content Builder
function buildLegend(layerVal) {
    const container = document.getElementById('legend-section');
    const content = document.getElementById('legend-content');

    let html = '';
    if (layerVal === 'rdtr') {
        html += `
            <div class="legend-item"><div class="legend-color" style="background:#facc15"></div>Perumahan</div>
            <div class="legend-item"><div class="legend-color" style="background:#ef4444"></div>Perdagangan & Jasa</div>
            <div class="legend-item"><div class="legend-color" style="background:#22c55e"></div>RTH / Pertanian</div>
            <div class="legend-item"><div class="legend-color" style="background:#78716c"></div>Industri</div>
            <div class="legend-item"><div class="legend-color" style="background:#3b82f6"></div>Perairan / Sempadan</div>
            <div class="legend-item"><div class="legend-color" style="background:#a855f7"></div>Fasilitas Umum / Perkantoran</div>
            <div class="legend-item"><div class="legend-color" style="background:#94a3b8"></div>Lainnya</div>
        `;
    } else if (layerVal === 'znt') {
        html += `
            <div class="legend-item"><div class="legend-color" style="background:#fef08a"></div>&lt; 1 Jt</div>
            <div class="legend-item"><div class="legend-color" style="background:#f97316"></div>1 - 5 Jt</div>
            <div class="legend-item"><div class="legend-color" style="background:#ef4444"></div>5 - 10 Jt</div>
            <div class="legend-item"><div class="legend-color" style="background:#a855f7"></div>10 - 50 Jt</div>
            <div class="legend-item"><div class="legend-color" style="background:#4c1d95"></div>&gt; 50 Jt</div>
        `;
    }

    if (document.getElementById('layer-bidang').checked && currentMode === 'bpn') {
        html += `
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid var(--border-color);">
            <div style="font-size:0.8rem; font-weight:600; margin-bottom:6px;">Status Sertifikat</div>
            <div class="legend-item"><div class="legend-line" style="background:#dc2626; height:2px;"></div>Belum Bersertifikat</div>
            <div class="legend-item"><div class="legend-line" style="background:#64748b; height:1px;"></div>Sudah Bersertifikat</div>
        `;
    }

    content.innerHTML = html;
    container.style.display = 'block';
}
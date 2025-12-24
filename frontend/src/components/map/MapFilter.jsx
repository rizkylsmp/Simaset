import { useState } from "react";

export default function MapFilter({
  selectedLayers,
  onLayerToggle,
  onSearch,
  onFilterChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");

  const layers = [
    { id: "rencana_tata", label: "Layer Rencana Tata Ruang", color: "#22c55e" },
    {
      id: "potensi_berperkara",
      label: "Layer Potensi Berperkara",
      color: "#ef4444",
    },
    { id: "sebaran_perkara", label: "Layer Sebaran Perkara", color: "#f59e0b" },
    { id: "umum_publik", label: "Layer Umum (Publik)", color: "#3b82f6" },
  ];

  const handleLayerToggle = (layerId) => {
    onLayerToggle(layerId);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    onFilterChange({
      status,
      lokasi: lokasiFilter,
      tahun: tahunFilter,
      jenis: jenisFilter,
    });
  };

  const handleLokasiChange = (e) => {
    const lokasi = e.target.value;
    setLokasiFilter(lokasi);
    onFilterChange({
      status: statusFilter,
      lokasi,
      tahun: tahunFilter,
      jenis: jenisFilter,
    });
  };

  const handleTahunChange = (e) => {
    const tahun = e.target.value;
    setTahunFilter(tahun);
    onFilterChange({
      status: statusFilter,
      lokasi: lokasiFilter,
      tahun,
      jenis: jenisFilter,
    });
  };

  const handleJenisChange = (e) => {
    const jenis = e.target.value;
    setJenisFilter(jenis);
    onFilterChange({
      status: statusFilter,
      lokasi: lokasiFilter,
      tahun: tahunFilter,
      jenis,
    });
  };

  return (
    <aside className="w-64 bg-white border-r-2 border-black overflow-y-auto">
      {/* Layer Control */}
      <div className="border-2 border-black m-4 p-4">
        <h3 className="font-bold text-sm mb-4">KONTROL LAYER & FILTER</h3>

        {/* Layer Peta */}
        <div className="border-2 border-black p-3 mb-4">
          <h4 className="font-bold text-sm mb-3">LAYER PETA</h4>
          <div className="space-y-2">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2"
              >
                <input
                  type="checkbox"
                  checked={selectedLayers[layer.id] || false}
                  onChange={() => handleLayerToggle(layer.id)}
                  className="mr-3 w-4 h-4 cursor-pointer"
                />
                <span
                  className="w-4 h-4 mr-2 border border-gray-400"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-xs">{layer.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="border-2 border-black p-3 mb-4">
          <h4 className="font-bold text-sm mb-3">PENCARIAN</h4>
          <div className="flex items-center border-2 border-gray-800">
            <span className="px-2 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari aset by nama/kode..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 px-2 py-2 text-xs outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="border-2 border-black p-3">
          <h4 className="font-bold text-sm mb-3">FILTER</h4>
          <div className="space-y-2">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full border-2 border-gray-800 px-2 py-2 text-xs cursor-pointer"
            >
              <option value="">[Filter] Status Aset ▼</option>
              <option value="aktif">Aktif</option>
              <option value="berperkara">Berperkara</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>

            <select
              value={lokasiFilter}
              onChange={handleLokasiChange}
              className="w-full border-2 border-gray-800 px-2 py-2 text-xs cursor-pointer"
            >
              <option value="">[Filter] Lokasi/Wilayah ▼</option>
              <option value="yogyakarta">Yogyakarta</option>
              <option value="jakarta">Jakarta</option>
              <option value="surabaya">Surabaya</option>
            </select>

            <select
              value={tahunFilter}
              onChange={handleTahunChange}
              className="w-full border-2 border-gray-800 px-2 py-2 text-xs cursor-pointer"
            >
              <option value="">[Filter] Tahun ▼</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
            </select>

            <select
              value={jenisFilter}
              onChange={handleJenisChange}
              className="w-full border-2 border-gray-800 px-2 py-2 text-xs cursor-pointer"
            >
              <option value="">[Filter] Jenis Aset ▼</option>
              <option value="tanah">Tanah</option>
              <option value="bangunan">Bangunan</option>
              <option value="kendaraan">Kendaraan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="border-2 border-black m-4 p-4">
        <h4 className="font-bold text-sm">STATISTIK</h4>
        <p className="text-xs text-gray-600 mt-4">
          (Statistik akan ditampilkan nanti)
        </p>
      </div>
    </aside>
  );
}

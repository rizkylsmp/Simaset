import { useState } from "react";
import ActionButtons from "./ActionButtons";

export default function AssetTable({ onEditClick }) {
  const [sortBy, setSortBy] = useState("kode_aset");
  const [sortOrder, setSortOrder] = useState("asc");

  const assets = [
    {
      id: 1,
      kode_aset: "AST-001",
      nama_aset: "Tanah Jl. Malioboro",
      lokasi: "Jl. Malioboro No. 12, Yogyakarta",
      status: "Aktif",
      luas: "500.00",
      tahun: "2020",
    },
    {
      id: 2,
      kode_aset: "AST-002",
      nama_aset: "Gedung Kantor Pemkot",
      lokasi: "Jl. Kenari No 5, Yogyakarta",
      status: "Aktif",
      luas: "1200.00",
      tahun: "2018",
    },
    {
      id: 3,
      kode_aset: "AST-003",
      nama_aset: "Tanah Tugu Pal Putih",
      lokasi: "Jl. Tugu, Yogyakarta",
      status: "Berperkara",
      luas: "850.00",
      tahun: "2015",
    },
    {
      id: 4,
      kode_aset: "AST-004",
      nama_aset: "Lapangan Parkir Kridosono",
      lokasi: "Jl. Kridosono, Yogyakarta",
      status: "Aktif",
      luas: "3200.00",
      tahun: "2019",
    },
    {
      id: 5,
      kode_aset: "AST-005",
      nama_aset: "Taman Pintar",
      lokasi: "Jl. Panembahan Senopati, Yogyakarta",
      status: "Aktif",
      luas: "6500.00",
      tahun: "2008",
    },
  ];

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleEdit = (id) => {
    console.log("Edit asset:", id);
    onEditClick(id);
  };

  const handleView = (id) => {
    console.log("View asset:", id);
    alert(`View asset ${id}`);
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus aset ini?")) {
      console.log("Delete asset:", id);
      alert(`Delete asset ${id}`);
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return " ↓";
    return sortOrder === "asc" ? " ↓" : " ↑";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
              No
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("kode_aset")}
            >
              Kode Aset <SortIcon column="kode_aset" />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("nama_aset")}
            >
              Nama Aset <SortIcon column="nama_aset" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Lokasi
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("status")}
            >
              Status <SortIcon column="status" />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("luas")}
            >
              Luas (m²) <SortIcon column="luas" />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("tahun")}
            >
              Tahun <SortIcon column="tahun" />
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assets.map((asset, idx) => (
            <tr
              key={asset.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-600">
                {idx + 1}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {asset.kode_aset}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {asset.nama_aset}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {asset.lokasi}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                  asset.status === "Aktif" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {asset.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700 font-medium">
                {asset.luas}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-600">
                {asset.tahun}
              </td>
              <td className="px-4 py-3">
                <ActionButtons
                  assetId={asset.id}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

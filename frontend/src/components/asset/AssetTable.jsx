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
    <div className="border-2 border-black bg-white overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black text-white border-b-2 border-black">
            <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold w-12">
              No
            </th>
            <th
              className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort("kode_aset")}
            >
              Kode Aset <SortIcon column="kode_aset" />
            </th>
            <th
              className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort("nama_aset")}
            >
              Nama Aset <SortIcon column="nama_aset" />
            </th>
            <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold">
              Lokasi
            </th>
            <th
              className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort("status")}
            >
              Status <SortIcon column="status" />
            </th>
            <th
              className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort("luas")}
            >
              Luas (m²) <SortIcon column="luas" />
            </th>
            <th
              className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort("tahun")}
            >
              Tahun <SortIcon column="tahun" />
            </th>
            <th className="px-4 py-3 text-center text-sm font-bold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, idx) => (
            <tr
              key={asset.id}
              className="border-b-2 border-black hover:bg-gray-50"
            >
              <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                {idx + 1}
              </td>
              <td className="border-r-2 border-black px-4 py-3 text-sm text-black font-medium">
                {asset.kode_aset}
              </td>
              <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                {asset.nama_aset}
              </td>
              <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                {asset.lokasi}
              </td>
              <td
                className={`border-r-2 border-black px-4 py-3 text-sm font-medium ${
                  asset.status === "Aktif" ? "text-green-700" : "text-red-700"
                }`}
              >
                {asset.status}
              </td>
              <td className="border-r-2 border-black px-4 py-3 text-sm text-right text-orange-600 font-medium">
                {asset.luas}
              </td>
              <td className="border-r-2 border-black px-4 py-3 text-sm text-center text-orange-600 font-medium">
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

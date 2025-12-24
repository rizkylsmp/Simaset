import { useState } from "react";
import FormInput from "../form/FormInput";
import FormSelect from "../form/FormSelect";
import FormTextarea from "../form/FormTextarea";
import FormFileUpload from "../form/FormFileUpload";

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  assetData = null,
}) {
  const [formData, setFormData] = useState(
    assetData || {
      kode_aset: "",
      nama_aset: "",
      lokasi_alamat: "",
      koordinat_latitude: "",
      koordinat_longitude: "",
      luas: "",
      status: "",
      jenis_aset: "",
      tahun_perolehan: new Date().getFullYear().toString(),
      nomor_sertifikat: "",
      status_sertifikat: "",
      nilai_aset: "",
      foto_aset: null,
      dokumen_pendukung: null,
      keterangan: "",
    }
  );

  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "berperkara", label: "Berperkara" },
    { value: "tidak_aktif", label: "Tidak Aktif" },
  ];

  const jenisAsetOptions = [
    { value: "tanah", label: "Tanah" },
    { value: "bangunan", label: "Bangunan" },
    { value: "kendaraan", label: "Kendaraan" },
    { value: "peralatan", label: "Peralatan" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const statusSertifikatOptions = [
    { value: "shm", label: "SHM (Sertifikat Hak Milik)" },
    { value: "hgb", label: "HGB (Hak Guna Bangunan)" },
    { value: "hgu", label: "HGU (Hak Guna Usaha)" },
    { value: "sppt", label: "SPPT (Pajak)" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultipleFiles = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBatal = () => {
    setFormData(
      assetData || {
        kode_aset: "",
        nama_aset: "",
        lokasi_alamat: "",
        koordinat_latitude: "",
        koordinat_longitude: "",
        luas: "",
        status: "",
        jenis_aset: "",
        tahun_perolehan: new Date().getFullYear().toString(),
        nomor_sertifikat: "",
        status_sertifikat: "",
        nilai_aset: "",
        foto_aset: null,
        dokumen_pendukung: null,
        keterangan: "",
      }
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-2 border-black shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black bg-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold">
              {assetData ? "FORM EDIT ASET" : "FORM TAMBAH ASET TANAH"}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold hover:bg-gray-200 rounded px-2 py-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Kode & Nama */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Kode Aset"
                name="kode_aset"
                placeholder="AST-XXX"
                value={formData.kode_aset}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Nama Aset"
                name="nama_aset"
                placeholder="Nama Aset"
                value={formData.nama_aset}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Row 2: Lokasi */}
            <FormTextarea
              label="Lokasi/Alamat"
              name="lokasi_alamat"
              placeholder="Alamat lengkap"
              value={formData.lokasi_alamat}
              onChange={handleInputChange}
              required
              rows={3}
            />

            {/* Row 3: Koordinat */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Koordinat Latitude"
                name="koordinat_latitude"
                type="number"
                placeholder="-7.797068"
                value={formData.koordinat_latitude}
                onChange={handleInputChange}
                step="0.000001"
              />
              <FormInput
                label="Koordinat Longitude"
                name="koordinat_longitude"
                type="number"
                placeholder="110.370529"
                value={formData.koordinat_longitude}
                onChange={handleInputChange}
                step="0.000001"
              />
            </div>

            {/* Row 4: Luas & Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Luas (m²)"
                name="luas"
                type="number"
                placeholder="0.00"
                value={formData.luas}
                onChange={handleInputChange}
                required
                step="0.01"
              />
              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
                placeholder="Pilih Status"
                required
              />
            </div>

            {/* Row 5: Jenis & Tahun */}
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Jenis Aset"
                name="jenis_aset"
                value={formData.jenis_aset}
                onChange={handleInputChange}
                options={jenisAsetOptions}
                placeholder="Pilih Jenis"
              />
              <FormInput
                label="Tahun Perolehan"
                name="tahun_perolehan"
                type="number"
                placeholder="2025"
                value={formData.tahun_perolehan}
                onChange={handleInputChange}
              />
            </div>

            {/* Row 6: Sertifikat */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Nomor Sertifikat"
                name="nomor_sertifikat"
                placeholder="No. Sertifikat"
                value={formData.nomor_sertifikat}
                onChange={handleInputChange}
              />
              <FormSelect
                label="Status Sertifikat"
                name="status_sertifikat"
                value={formData.status_sertifikat}
                onChange={handleInputChange}
                options={statusSertifikatOptions}
                placeholder="SHM/HGB"
              />
            </div>

            {/* Row 7: Nilai Aset */}
            <FormInput
              label="Nilai Aset (Rp)"
              name="nilai_aset"
              type="number"
              placeholder="0.00"
              value={formData.nilai_aset}
              onChange={handleInputChange}
              step="0.01"
            />

            {/* Row 8: Foto */}
            <FormFileUpload
              label="Foto Aset"
              name="foto_aset"
              onChange={handleInputChange}
              accept="image/*"
            />

            {/* Row 9: Dokumen */}
            <FormFileUpload
              label="Dokumen Pendukung"
              name="dokumen_pendukung"
              onChange={(e) => handleMultipleFiles(e)}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
            />

            {/* Row 10: Keterangan */}
            <FormTextarea
              label="Keterangan"
              name="keterangan"
              placeholder="Keterangan tambahan"
              value={formData.keterangan}
              onChange={handleInputChange}
              rows={3}
            />

            {/* Buttons */}
            <div className="flex gap-4 justify-center pt-6 border-t-2 border-black">
              <button
                type="button"
                onClick={handleBatal}
                className="border-2 border-black px-8 py-2 text-sm font-bold hover:bg-gray-100 transition"
              >
                [Button] Batal
              </button>
              <button
                type="submit"
                className="bg-black text-white border-2 border-black px-8 py-2 text-sm font-bold hover:bg-gray-900 transition"
              >
                [Button] Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

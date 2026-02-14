import { useState, useEffect } from "react";
import FormInput from "../form/FormInput";
import FormSelect from "../form/FormSelect";
import FormTextarea from "../form/FormTextarea";
import FormFileUpload from "../form/FormFileUpload";
import MapCoordinatePicker from "../map/MapCoordinatePicker";
import MapPolygonDrawer from "../map/MapPolygonDrawer";
import {
  ClipboardTextIcon,
  ScalesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  FolderOpenIcon,
  XIcon,
  FloppyDiskIcon,
  CircleNotchIcon,
  BuildingsIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";

const initialFormData = {
  kode_aset: "",
  nama_aset: "",
  lokasi: "",
  koordinat_lat: "",
  koordinat_long: "",
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
  // Data Legal
  jenis_hak: "",
  atas_nama: "",
  tanggal_sertifikat: "",
  riwayat_perolehan: "",
  status_hukum: "",
  // Data Fisik
  desa_kelurahan: "",
  luas_lapangan: "",
  batas_utara: "",
  batas_selatan: "",
  batas_timur: "",
  batas_barat: "",
  penggunaan_saat_ini: "",
  // Data Administratif
  kode_bmd: "",
  nilai_buku: "",
  nilai_njop: "",
  sk_penetapan: "",
  opd_pengguna: "",
  // Data Spasial
  polygon_bidang: null,
};

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  assetData = null,
  isSubmitting = false,
  activeSubstansi = null,
}) {
  const [formData, setFormData] = useState(initialFormData);

  // Update form when assetData changes (for edit mode)
  useEffect(() => {
    if (assetData) {
      setFormData({
        kode_aset: assetData.kode_aset || "",
        nama_aset: assetData.nama_aset || "",
        lokasi: assetData.lokasi || "",
        koordinat_lat: assetData.koordinat_lat || "",
        koordinat_long: assetData.koordinat_long || "",
        luas: assetData.luas || "",
        status: assetData.status || "",
        jenis_aset: assetData.jenis_aset || "",
        tahun_perolehan:
          assetData.tahun_perolehan || new Date().getFullYear().toString(),
        nomor_sertifikat: assetData.nomor_sertifikat || "",
        status_sertifikat: assetData.status_sertifikat || "",
        nilai_aset: assetData.nilai_aset || "",
        foto_aset: null,
        dokumen_pendukung: null,
        keterangan: assetData.keterangan || "",
        // Data Legal
        jenis_hak: assetData.jenis_hak || "",
        atas_nama: assetData.atas_nama || "",
        tanggal_sertifikat: assetData.tanggal_sertifikat || "",
        riwayat_perolehan: assetData.riwayat_perolehan || "",
        status_hukum: assetData.status_hukum || "",
        // Data Fisik
        desa_kelurahan: assetData.desa_kelurahan || "",
        luas_lapangan: assetData.luas_lapangan || "",
        batas_utara: assetData.batas_utara || "",
        batas_selatan: assetData.batas_selatan || "",
        batas_timur: assetData.batas_timur || "",
        batas_barat: assetData.batas_barat || "",
        penggunaan_saat_ini: assetData.penggunaan_saat_ini || "",
        // Data Administratif
        kode_bmd: assetData.kode_bmd || "",
        nilai_buku: assetData.nilai_buku || "",
        nilai_njop: assetData.nilai_njop || "",
        sk_penetapan: assetData.sk_penetapan || "",
        opd_pengguna: assetData.opd_pengguna || "",
        // Data Spasial
        polygon_bidang: assetData.polygon_bidang || null,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [assetData, isOpen]);

  const statusOptions = [
    { value: "Aktif", label: "Aktif" },
    { value: "Berperkara", label: "Berperkara" },
    { value: "Indikasi Berperkara", label: "Indikasi Berperkara" },
    { value: "Tidak Aktif", label: "Tidak Aktif" },
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

  const jenisHakOptions = [
    { value: "HM", label: "Hak Milik (HM)" },
    { value: "HPL", label: "Hak Pengelolaan (HPL)" },
    { value: "HP", label: "Hak Pakai (HP)" },
    { value: "HGB", label: "Hak Guna Bangunan (HGB)" },
    { value: "Tanah Negara", label: "Tanah Negara" },
    { value: "Belum Bersertifikat", label: "Belum Bersertifikat" },
  ];

  const riwayatPerolehanOptions = [
    { value: "Hibah", label: "Hibah" },
    { value: "Pembelian", label: "Pembelian" },
    { value: "Tukar Menukar", label: "Tukar Menukar" },
    { value: "Penyerahan PSU", label: "Penyerahan PSU" },
    { value: "Lainnya", label: "Lainnya" },
  ];

  const statusHukumOptions = [
    { value: "Aman", label: "Aman" },
    { value: "Sengketa", label: "Sengketa" },
    { value: "Dalam Proses Sertipikasi", label: "Dalam Proses Sertipikasi" },
    { value: "Diblokir", label: "Diblokir / Catatan BPN" },
  ];

  const penggunaanOptions = [
    { value: "Kantor", label: "Kantor" },
    { value: "Sekolah", label: "Sekolah" },
    { value: "Puskesmas", label: "Puskesmas" },
    { value: "Lahan Kosong", label: "Lahan Kosong" },
    { value: "Disewa Pihak Ketiga", label: "Disewa Pihak Ketiga" },
    { value: "Lainnya", label: "Lainnya" },
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
    // Prepare data for API
    const submitData = {
      ...formData,
      luas: parseFloat(formData.luas) || 0,
      luas_lapangan: parseFloat(formData.luas_lapangan) || null,
      nilai_aset: parseFloat(formData.nilai_aset) || 0,
      nilai_buku: parseFloat(formData.nilai_buku) || null,
      nilai_njop: parseFloat(formData.nilai_njop) || null,
      tahun_perolehan:
        parseInt(formData.tahun_perolehan) || new Date().getFullYear(),
    };

    // Convert empty strings to null for optional fields (prevents DB cast errors)
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === "") {
        submitData[key] = null;
      }
    });

    // Don't send file fields if user didn't upload new files (preserve existing)
    if (submitData.foto_aset === null) delete submitData.foto_aset;
    if (submitData.dokumen_pendukung === null)
      delete submitData.dokumen_pendukung;

    onSubmit(submitData);
  };

  const handleBatal = () => {
    setFormData(initialFormData);
    onClose();
  };

  // Substansi mode configuration
  const isFullForm = !activeSubstansi;
  const isCreateMode = isFullForm && !assetData;
  const isEditMode = isFullForm && !!assetData;
  const substansiConfig = {
    legal: {
      title: "Edit Data Legal",
      subtitle: "Perbarui informasi sertifikat dan status hukum aset",
      icon: ScalesIcon,
    },
    fisik: {
      title: "Edit Data Fisik",
      subtitle: "Perbarui informasi lokasi dan kondisi fisik aset",
      icon: MapPinIcon,
    },
    administratif: {
      title: "Edit Data Administratif",
      subtitle: "Perbarui informasi keuangan dan administrasi aset",
      icon: CurrencyDollarIcon,
    },
    spasial: {
      title: "Edit Data Spasial",
      subtitle: "Perbarui koordinat dan informasi geospasial aset",
      icon: MapPinIcon,
    },
  };
  const currentSubstansi = activeSubstansi
    ? substansiConfig[activeSubstansi]
    : null;
  const HeaderIcon = currentSubstansi ? currentSubstansi.icon : BuildingsIcon;

  if (!isOpen) return null;

  // Section Header component
  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-border">
      <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
        <Icon size={18} weight="duotone" className="text-accent" />
      </div>
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-accent/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="relative bg-surface border border-border shadow-2xl w-full max-w-5xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-accent to-accent/90 px-6 py-5 text-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface/20 rounded-xl flex items-center justify-center">
                  <HeaderIcon size={24} weight="fill" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {currentSubstansi
                      ? currentSubstansi.title
                      : assetData
                        ? "Edit Data Aset"
                        : "Daftarkan Aset Baru"}
                  </h2>
                  <p className="text-sm opacity-80 mt-0.5">
                    {currentSubstansi
                      ? currentSubstansi.subtitle
                      : assetData
                        ? "Perbarui informasi aset yang sudah ada"
                        : "Masukkan data inti aset — data substansi diisi melalui menu masing-masing"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-surface/20 rounded-lg transition-colors"
              >
                <XIcon size={22} weight="bold" />
              </button>
            </div>
          </div>

          {/* Form Content - scrollable */}
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Identity info bar - shown in substansi mode */}
              {activeSubstansi && assetData && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <BuildingsIcon
                      size={20}
                      weight="duotone"
                      className="text-accent"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {assetData.nama_aset}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {assetData.kode_aset} &bull;{" "}
                      {assetData.jenis_aset || "Aset"} &bull;{" "}
                      {assetData.lokasi || "Lokasi belum diisi"}
                    </p>
                  </div>
                </div>
              )}

              {/* ========== IDENTITAS ASET ========== */}
              {isFullForm && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={ClipboardTextIcon} title="Identitas Aset" />

                  {/* Row 1: Kode, Nama, Jenis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Kode Aset"
                      name="kode_aset"
                      placeholder="AST-XXX"
                      value={formData.kode_aset}
                      onChange={handleInputChange}
                      required
                      size="lg"
                    />
                    <FormInput
                      label="Nama Aset"
                      name="nama_aset"
                      placeholder="Nama Aset"
                      value={formData.nama_aset}
                      onChange={handleInputChange}
                      required
                      size="lg"
                    />
                    <FormSelect
                      label="Jenis Aset"
                      name="jenis_aset"
                      value={formData.jenis_aset}
                      onChange={handleInputChange}
                      options={jenisAsetOptions}
                      placeholder="Pilih Jenis"
                      size="lg"
                    />
                  </div>

                  {/* Row 2: Status + conditionally Kode BMD, OPD */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormSelect
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={statusOptions}
                      placeholder="Pilih Status"
                      required
                      size="lg"
                    />
                    {isEditMode && (
                      <>
                        <FormInput
                          label="Kode BMD"
                          name="kode_bmd"
                          placeholder="Kodefikasi Barang Milik Daerah"
                          value={formData.kode_bmd}
                          onChange={handleInputChange}
                          size="lg"
                        />
                        <FormInput
                          label="OPD Pengguna"
                          name="opd_pengguna"
                          placeholder="Nama OPD/Instansi pengguna"
                          value={formData.opd_pengguna}
                          onChange={handleInputChange}
                          size="lg"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ========== DATA LEGAL ========== */}
              {(isEditMode || activeSubstansi === "legal") && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={ScalesIcon} title="Data Legal" />

                  {/* Row 1: Nomor Sertifikat, Status Sertifikat, Jenis Hak */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Nomor Sertifikat"
                      name="nomor_sertifikat"
                      placeholder="No. Sertifikat / Belum Bersertifikat"
                      value={formData.nomor_sertifikat}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormSelect
                      label="Status Sertifikat"
                      name="status_sertifikat"
                      value={formData.status_sertifikat}
                      onChange={handleInputChange}
                      options={statusSertifikatOptions}
                      placeholder="Pilih Status Sertifikat"
                      size="lg"
                    />
                    <FormSelect
                      label="Jenis Hak"
                      name="jenis_hak"
                      value={formData.jenis_hak}
                      onChange={handleInputChange}
                      options={jenisHakOptions}
                      placeholder="Pilih Jenis Hak"
                      size="lg"
                    />
                  </div>

                  {/* Row 2: Atas Nama, Tanggal Sertifikat, Tahun Perolehan */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Atas Nama"
                      name="atas_nama"
                      placeholder="Pemda / Instansi"
                      value={formData.atas_nama}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormInput
                      label="Tanggal Terbit Sertifikat"
                      name="tanggal_sertifikat"
                      type="date"
                      value={formData.tanggal_sertifikat}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormInput
                      label="Tahun Perolehan"
                      name="tahun_perolehan"
                      type="number"
                      placeholder="2025"
                      value={formData.tahun_perolehan}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </div>

                  {/* Row 3: Riwayat Perolehan, Status Hukum, SK Penetapan */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormSelect
                      label="Riwayat Perolehan"
                      name="riwayat_perolehan"
                      value={formData.riwayat_perolehan}
                      onChange={handleInputChange}
                      options={riwayatPerolehanOptions}
                      placeholder="Pilih Riwayat"
                      size="lg"
                    />
                    <FormSelect
                      label="Status Hukum"
                      name="status_hukum"
                      value={formData.status_hukum}
                      onChange={handleInputChange}
                      options={statusHukumOptions}
                      placeholder="Pilih Status Hukum"
                      size="lg"
                    />
                    <FormInput
                      label="SK Penetapan Status Penggunaan"
                      name="sk_penetapan"
                      placeholder="Nomor SK Penetapan"
                      value={formData.sk_penetapan}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </div>
                </div>
              )}

              {/* ========== DATA FISIK ========== */}
              {(isEditMode || activeSubstansi === "fisik") && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={MapPinIcon} title="Data Fisik & Lokasi" />

                  {/* Lokasi */}
                  <FormTextarea
                    label="Lokasi/Alamat Lengkap"
                    name="lokasi"
                    placeholder="Alamat lengkap aset"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    size="lg"
                  />

                  {/* Desa/Kelurahan, Penggunaan, Luas Sertifikat */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Desa/Kelurahan"
                      name="desa_kelurahan"
                      placeholder="Nama Desa/Kelurahan"
                      value={formData.desa_kelurahan}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormSelect
                      label="Penggunaan Saat Ini"
                      name="penggunaan_saat_ini"
                      value={formData.penggunaan_saat_ini}
                      onChange={handleInputChange}
                      options={penggunaanOptions}
                      placeholder="Pilih Penggunaan"
                      size="lg"
                    />
                    <FormInput
                      label="Luas Sesuai Sertifikat (m²)"
                      name="luas"
                      type="number"
                      placeholder="0.00"
                      value={formData.luas}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      size="lg"
                    />
                  </div>

                  {/* Luas Lapangan + Batas Tanah */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <FormInput
                      label="Luas Kondisi Lapangan (m²)"
                      name="luas_lapangan"
                      type="number"
                      placeholder="0.00"
                      value={formData.luas_lapangan}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                  </div>

                  {/* Batas Tanah - Card Style */}
                  <div className="bg-surface rounded-xl p-4 border border-border">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
                      Batas-Batas Tanah
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormInput
                        label="Batas Utara"
                        name="batas_utara"
                        placeholder="Berbatasan dengan..."
                        value={formData.batas_utara}
                        onChange={handleInputChange}
                        size="lg"
                      />
                      <FormInput
                        label="Batas Selatan"
                        name="batas_selatan"
                        placeholder="Berbatasan dengan..."
                        value={formData.batas_selatan}
                        onChange={handleInputChange}
                        size="lg"
                      />
                      <FormInput
                        label="Batas Timur"
                        name="batas_timur"
                        placeholder="Berbatasan dengan..."
                        value={formData.batas_timur}
                        onChange={handleInputChange}
                        size="lg"
                      />
                      <FormInput
                        label="Batas Barat"
                        name="batas_barat"
                        placeholder="Berbatasan dengan..."
                        value={formData.batas_barat}
                        onChange={handleInputChange}
                        size="lg"
                      />
                    </div>
                  </div>

                  {/* Koordinat dengan Map Picker - only in full form */}
                  {isFullForm && (
                    <MapCoordinatePicker
                      latitude={formData.koordinat_lat}
                      longitude={formData.koordinat_long}
                      onCoordinateChange={(lat, lng) => {
                        setFormData((prev) => ({
                          ...prev,
                          koordinat_lat: lat,
                          koordinat_long: lng,
                        }));
                      }}
                      label="Koordinat Lokasi"
                    />
                  )}

                  {/* Polygon Drawer - only in full form */}
                  {isFullForm && (
                    <MapPolygonDrawer
                      polygonData={formData.polygon_bidang}
                      onPolygonChange={(polygon) => {
                        setFormData((prev) => ({
                          ...prev,
                          polygon_bidang: polygon,
                        }));
                      }}
                      centerLat={formData.koordinat_lat}
                      centerLng={formData.koordinat_long}
                      label="Gambar Polygon Bidang Tanah"
                    />
                  )}
                </div>
              )}

              {/* ========== DATA SPASIAL (substansi mode) ========== */}
              {activeSubstansi === "spasial" && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={MapPinIcon} title="Data Spasial" />

                  <FormTextarea
                    label="Lokasi/Alamat Lengkap"
                    name="lokasi"
                    placeholder="Alamat lengkap aset"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    rows={2}
                    size="lg"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Luas Sesuai Sertifikat (m²)"
                      name="luas"
                      type="number"
                      placeholder="0.00"
                      value={formData.luas}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                  </div>

                  <MapCoordinatePicker
                    latitude={formData.koordinat_lat}
                    longitude={formData.koordinat_long}
                    onCoordinateChange={(lat, lng) => {
                      setFormData((prev) => ({
                        ...prev,
                        koordinat_lat: lat,
                        koordinat_long: lng,
                      }));
                    }}
                    label="Koordinat Lokasi"
                  />

                  <MapPolygonDrawer
                    polygonData={formData.polygon_bidang}
                    onPolygonChange={(polygon) => {
                      setFormData((prev) => ({
                        ...prev,
                        polygon_bidang: polygon,
                      }));
                    }}
                    centerLat={formData.koordinat_lat}
                    centerLng={formData.koordinat_long}
                    label="Gambar Polygon Bidang Tanah"
                  />
                </div>
              )}

              {/* ========== DATA KEUANGAN ========== */}
              {isEditMode && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={CurrencyDollarIcon} title="Data Keuangan" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Nilai Perolehan (Rp)"
                      name="nilai_aset"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_aset}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                    <FormInput
                      label="Nilai Buku (Rp)"
                      name="nilai_buku"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_buku}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                    <FormInput
                      label="Nilai NJOP (Rp)"
                      name="nilai_njop"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_njop}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                  </div>
                </div>
              )}

              {/* ========== DATA ADMINISTRATIF (substansi mode) ========== */}
              {activeSubstansi === "administratif" && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader
                    icon={CurrencyDollarIcon}
                    title="Data Administratif"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Kode BMD"
                      name="kode_bmd"
                      placeholder="Kodefikasi Barang Milik Daerah"
                      value={formData.kode_bmd}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormInput
                      label="OPD Pengguna"
                      name="opd_pengguna"
                      placeholder="Nama OPD/Instansi pengguna"
                      value={formData.opd_pengguna}
                      onChange={handleInputChange}
                      size="lg"
                    />
                    <FormInput
                      label="Tahun Perolehan"
                      name="tahun_perolehan"
                      type="number"
                      placeholder="2025"
                      value={formData.tahun_perolehan}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                      label="Nilai Perolehan (Rp)"
                      name="nilai_aset"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_aset}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                    <FormInput
                      label="Nilai Buku (Rp)"
                      name="nilai_buku"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_buku}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                    <FormInput
                      label="Nilai NJOP (Rp)"
                      name="nilai_njop"
                      type="number"
                      placeholder="0"
                      value={formData.nilai_njop}
                      onChange={handleInputChange}
                      step="0.01"
                      size="lg"
                    />
                  </div>

                  <FormInput
                    label="SK Penetapan Status Penggunaan"
                    name="sk_penetapan"
                    placeholder="Nomor SK Penetapan"
                    value={formData.sk_penetapan}
                    onChange={handleInputChange}
                    size="lg"
                  />
                </div>
              )}

              {/* ========== LOKASI DASAR (create mode only) ========== */}
              {isCreateMode && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={MapPinIcon} title="Lokasi Aset" />

                  <FormTextarea
                    label="Lokasi/Alamat Lengkap"
                    name="lokasi"
                    placeholder="Alamat lengkap aset"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    size="lg"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Luas (m²)"
                      name="luas"
                      type="number"
                      placeholder="0.00"
                      value={formData.luas}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      size="lg"
                    />
                    <FormInput
                      label="Tahun Perolehan"
                      name="tahun_perolehan"
                      type="number"
                      placeholder="2025"
                      value={formData.tahun_perolehan}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </div>

                  <MapCoordinatePicker
                    latitude={formData.koordinat_lat}
                    longitude={formData.koordinat_long}
                    onCoordinateChange={(lat, lng) => {
                      setFormData((prev) => ({
                        ...prev,
                        koordinat_lat: lat,
                        koordinat_long: lng,
                      }));
                    }}
                    label="Koordinat Lokasi"
                  />
                </div>
              )}

              {/* ========== DOKUMENTASI ========== */}
              {isFullForm && (
                <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-5">
                  <SectionHeader icon={FolderOpenIcon} title="Dokumentasi" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Foto */}
                    <FormFileUpload
                      label="Foto Kondisi Eksisting"
                      name="foto_aset"
                      onChange={handleInputChange}
                      accept="image/*"
                      size="lg"
                    />

                    {/* Dokumen */}
                    <FormFileUpload
                      label="Dokumen Pendukung (Sertifikat, BAST, Surat Hibah, dll)"
                      name="dokumen_pendukung"
                      onChange={(e) => handleMultipleFiles(e)}
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      size="lg"
                    />
                  </div>

                  {/* Keterangan */}
                  <FormTextarea
                    label="Keterangan"
                    name="keterangan"
                    placeholder="Keterangan tambahan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    rows={3}
                    size="lg"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleBatal}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 border-2 border-border text-text-primary px-6 py-3 text-sm font-bold hover:bg-surface-secondary rounded-xl transition disabled:opacity-50"
                >
                  <ArrowLeftIcon size={18} weight="bold" />
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-surface px-8 py-3 text-sm font-bold hover:opacity-90 rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/25"
                >
                  {isSubmitting ? (
                    <>
                      <CircleNotchIcon size={18} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FloppyDiskIcon size={18} weight="bold" />
                      Simpan Data
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

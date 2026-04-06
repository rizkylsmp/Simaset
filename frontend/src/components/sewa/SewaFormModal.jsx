import { useState, useEffect, useRef, useCallback } from "react";
import {
  XIcon,
  FloppyDiskIcon,
  MagnifyingGlassIcon,
  CaretDownIcon,
  BuildingsIcon,
  PlusIcon,
  TrashIcon,
  FileIcon,
  UploadIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { asetService, uploadService } from "../../services/api";

const PERIODE_OPTIONS = ["Bulanan", "Tahunan", "Sekali Bayar"];
const STATUS_OPTIONS = [
  "Aktif",
  "Akan Berakhir",
  "Berakhir",
  "Dikembalikan",
  "Dibatalkan",
];

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors";

export default function SewaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    id_aset: "",
    nama_aset: "",
    lokasi_aset: "",
    nama_penyewa: "",
    nik_penyewa: "",
    instansi_penyewa: "",
    alamat_penyewa: "",
    telepon_penyewa: "",
    email_penyewa: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    nilai_sewa: "",
    periode_bayar: "Tahunan",
    nomor_kontrak: "",
    status: "Aktif",
    catatan: "",
  });

  // Asset picker state
  const [asetList, setAsetList] = useState([]);
  const [asetSearch, setAsetSearch] = useState("");
  const [showAsetDropdown, setShowAsetDropdown] = useState(false);
  const [loadingAset, setLoadingAset] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch assets for picker
  const fetchAsetList = useCallback(async (search = "") => {
    setLoadingAset(true);
    try {
      const res = await asetService.getAll({
        limit: 50,
        ...(search && { search }),
        sort: "kode_aset",
        order: "ASC",
      });
      setAsetList(res.data?.data || []);
    } catch {
      setAsetList([]);
    } finally {
      setLoadingAset(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isEdit) {
      fetchAsetList();
    }
  }, [isOpen, isEdit, fetchAsetList]);

  // Debounced search for assets
  useEffect(() => {
    if (!showAsetDropdown) return;
    const timer = setTimeout(() => {
      fetchAsetList(asetSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [asetSearch, showAsetDropdown, fetchAsetList]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAsetDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAset = (aset) => {
    setForm((prev) => ({
      ...prev,
      id_aset: aset.id_aset,
      nama_aset: aset.nama_aset || aset.kode_aset || "",
      lokasi_aset: aset.lokasi || "",
    }));
    setAsetSearch("");
    setShowAsetDropdown(false);
  };

  // Document upload state
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  const [dokumenFiles, setDokumenFiles] = useState([]); // { file, name, error? } for new files
  const [existingDokumen, setExistingDokumen] = useState([]); // URLs from initialData
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const fileInputRefs = useRef([]);

  const addFileSlot = () => {
    setDokumenFiles((prev) => [...prev, { file: null, name: "" }]);
  };

  const removeFileSlot = (index) => {
    setDokumenFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (index) => {
    setExistingDokumen((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setDokumenFiles((prev) =>
        prev.map((item, i) =>
          i === index
            ? { file: null, name: file.name, error: "Ukuran file melebihi 1MB" }
            : item,
        ),
      );
      return;
    }

    setDokumenFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { file, name: file.name, error: null } : item,
      ),
    );
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        id_aset: initialData.id_aset || "",
        nama_aset: initialData.nama_aset || "",
        lokasi_aset: initialData.lokasi_aset || "",
        nama_penyewa: initialData.nama_penyewa || "",
        nik_penyewa: initialData.nik_penyewa || "",
        instansi_penyewa: initialData.instansi_penyewa || "",
        alamat_penyewa: initialData.alamat_penyewa || "",
        telepon_penyewa: initialData.telepon_penyewa || "",
        email_penyewa: initialData.email_penyewa || "",
        tanggal_mulai: initialData.tanggal_mulai || "",
        tanggal_berakhir: initialData.tanggal_berakhir || "",
        nilai_sewa: initialData.nilai_sewa || "",
        periode_bayar: initialData.periode_bayar || "Tahunan",
        nomor_kontrak: initialData.nomor_kontrak || "",
        status: initialData.status || "Aktif",
        catatan: initialData.catatan || "",
      });
      setExistingDokumen(
        Array.isArray(initialData.dokumen_pendukung)
          ? initialData.dokumen_pendukung
          : [],
      );
    } else {
      setForm({
        id_aset: "",
        nama_aset: "",
        lokasi_aset: "",
        nama_penyewa: "",
        nik_penyewa: "",
        instansi_penyewa: "",
        alamat_penyewa: "",
        telepon_penyewa: "",
        email_penyewa: "",
        tanggal_mulai: "",
        tanggal_berakhir: "",
        nilai_sewa: "",
        periode_bayar: "Tahunan",
        nomor_kontrak: "",
        status: "Aktif",
        catatan: "",
      });
      setExistingDokumen([]);
    }
    setDokumenFiles([]);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for file errors
    if (dokumenFiles.some((d) => d.error)) return;

    // Upload new files
    let uploadedUrls = [];
    const filesToUpload = dokumenFiles.filter((d) => d.file);

    if (filesToUpload.length > 0) {
      setUploadingDocs(true);
      try {
        for (const item of filesToUpload) {
          const res = await uploadService.single(item.file, "sewa-dokumen");
          if (res.data?.url) {
            uploadedUrls.push(res.data.url);
          }
        }
      } catch {
        setUploadingDocs(false);
        return;
      }
      setUploadingDocs(false);
    }

    const allDokumen = [...existingDokumen, ...uploadedUrls];

    onSubmit({
      ...form,
      id_aset: form.id_aset || null,
      nilai_sewa: form.nilai_sewa ? Number(form.nilai_sewa) : 0,
      dokumen_pendukung: allDokumen.length > 0 ? allDokumen : null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-text-primary">
            {isEdit ? "Edit Penyewaan" : "Tambah Penyewaan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informasi Aset */}
          <fieldset className="border border-border rounded-xl p-4">
            <legend className="text-sm font-medium text-text-secondary px-2">
              Informasi Aset
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Asset Picker */}
              <div className="md:col-span-2" ref={dropdownRef}>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Pilih Aset <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAsetDropdown(!showAsetDropdown)}
                    className={`${inputClass} text-left flex items-center justify-between gap-2 cursor-pointer`}
                  >
                    {form.id_aset ? (
                      <span className="truncate">
                        <span className="font-mono font-semibold text-accent">
                          {form.nama_aset}
                        </span>
                        {form.lokasi_aset && (
                          <span className="text-text-muted ml-2 text-xs">
                            — {form.lokasi_aset}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-text-muted">
                        Cari dan pilih aset...
                      </span>
                    )}
                    <CaretDownIcon
                      size={14}
                      className="text-text-muted shrink-0"
                    />
                  </button>

                  {showAsetDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <MagnifyingGlassIcon
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                          />
                          <input
                            type="text"
                            value={asetSearch}
                            onChange={(e) => setAsetSearch(e.target.value)}
                            placeholder="Cari kode, nama, atau lokasi..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Options list */}
                      <div className="max-h-52 overflow-y-auto">
                        {loadingAset ? (
                          <div className="px-4 py-6 text-center text-sm text-text-muted">
                            Memuat data aset...
                          </div>
                        ) : asetList.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-text-muted">
                            Tidak ada aset ditemukan
                          </div>
                        ) : (
                          asetList.map((aset) => (
                            <button
                              key={aset.id_aset}
                              type="button"
                              onClick={() => handleSelectAset(aset)}
                              className={`w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-surface-secondary transition-colors border-b border-border/50 last:border-0 ${
                                form.id_aset === aset.id_aset
                                  ? "bg-accent/5"
                                  : ""
                              }`}
                            >
                              <BuildingsIcon
                                size={16}
                                weight="duotone"
                                className="text-text-muted mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                    {aset.kode_aset}
                                  </span>
                                  <span className="text-sm font-medium text-text-primary truncate">
                                    {aset.nama_aset}
                                  </span>
                                </div>
                                {aset.lokasi && (
                                  <p className="text-xs text-text-muted mt-0.5 truncate">
                                    {aset.lokasi}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {form.id_aset && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        id_aset: "",
                        nama_aset: "",
                        lokasi_aset: "",
                      }))
                    }
                    className="text-xs text-text-muted hover:text-red-500 mt-1 transition-colors"
                  >
                    Hapus pilihan
                  </button>
                )}
              </div>
            </div>
          </fieldset>

          {/* Informasi Penyewa */}
          <fieldset className="border border-border rounded-xl p-4">
            <legend className="text-sm font-medium text-text-secondary px-2">
              Informasi Penyewa
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nama Penyewa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_penyewa"
                  value={form.nama_penyewa}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nama lengkap penyewa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  NIK
                </label>
                <input
                  type="text"
                  name="nik_penyewa"
                  value={form.nik_penyewa}
                  onChange={handleChange}
                  maxLength={16}
                  className={inputClass}
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Instansi / Perusahaan
                </label>
                <input
                  type="text"
                  name="instansi_penyewa"
                  value={form.instansi_penyewa}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Nama instansi / perusahaan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Telepon
                </label>
                <input
                  type="text"
                  name="telepon_penyewa"
                  value={form.telepon_penyewa}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email_penyewa"
                  value={form.email_penyewa}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Alamat Penyewa
                </label>
                <input
                  type="text"
                  name="alamat_penyewa"
                  value={form.alamat_penyewa}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Alamat penyewa"
                />
              </div>
            </div>
          </fieldset>

          {/* Periode & Nilai */}
          <fieldset className="border border-border rounded-xl p-4">
            <legend className="text-sm font-medium text-text-secondary px-2">
              Periode & Nilai Sewa
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  value={form.tanggal_mulai}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Tanggal Berakhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_berakhir"
                  value={form.tanggal_berakhir}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nilai Sewa (Rp)
                </label>
                <input
                  type="number"
                  name="nilai_sewa"
                  value={form.nilai_sewa}
                  onChange={handleChange}
                  min={0}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Periode Bayar
                </label>
                <select
                  name="periode_bayar"
                  value={form.periode_bayar}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {PERIODE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nomor Kontrak
                </label>
                <input
                  type="text"
                  name="nomor_kontrak"
                  value={form.nomor_kontrak}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="No. kontrak / perjanjian"
                />
              </div>
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </fieldset>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Catatan
            </label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
          {/* Dokumen Pendukung */}
          <fieldset className="border border-border rounded-xl p-4">
            <legend className="text-sm font-medium text-text-secondary px-2">
              Dokumen Pendukung
            </legend>
            <p className="text-xs text-text-muted mb-3">
              Upload dokumen pendukung (maks. 1MB per file). Format: PDF, DOC,
              DOCX, JPG, PNG.
            </p>

            {/* Existing documents (edit mode) */}
            {existingDokumen.length > 0 && (
              <div className="space-y-2 mb-3">
                {existingDokumen.map((url, idx) => {
                  const fileName = url.split("/").pop() || `Dokumen ${idx + 1}`;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-lg border border-border"
                    >
                      <FileIcon
                        size={16}
                        weight="duotone"
                        className="text-accent shrink-0"
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline truncate flex-1"
                      >
                        {fileName}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingDoc(idx)}
                        className="p-1 text-text-muted hover:text-red-500 transition-colors"
                        title="Hapus dokumen"
                      >
                        <TrashIcon size={14} weight="bold" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New file upload slots */}
            {dokumenFiles.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <div className="flex-1 relative">
                  <input
                    ref={(el) => (fileInputRefs.current[idx] = el)}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => handleFileChange(idx, e)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className={`${inputClass} text-left flex items-center gap-2 cursor-pointer ${item.error ? "border-red-400 focus:ring-red-200" : ""}`}
                  >
                    <UploadIcon
                      size={15}
                      className="text-text-muted shrink-0"
                    />
                    <span
                      className={`truncate ${item.name ? (item.error ? "text-red-500" : "text-text-primary") : "text-text-muted"}`}
                    >
                      {item.name || "Pilih file..."}
                    </span>
                  </button>
                  {item.error && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                      <WarningIcon size={12} weight="fill" />
                      {item.error}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFileSlot(idx)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <TrashIcon size={16} weight="bold" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addFileSlot}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
            >
              <PlusIcon size={14} weight="bold" />
              Tambah Dokumen
            </button>
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-secondary hover:bg-surface-tertiary rounded-xl transition-colors border border-border"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingDocs}
              className="px-5 py-2.5 text-sm font-medium text-surface bg-linear-to-r from-accent to-accent/90 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2"
            >
              <FloppyDiskIcon size={16} />
              {uploadingDocs
                ? "Mengupload dokumen..."
                : isLoading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

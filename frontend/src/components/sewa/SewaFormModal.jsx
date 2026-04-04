import { useState, useEffect } from "react";
import { XIcon, FloppyDiskIcon } from "@phosphor-icons/react";

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

  useEffect(() => {
    if (initialData) {
      setForm({
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
    } else {
      setForm({
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
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      nilai_sewa: form.nilai_sewa ? Number(form.nilai_sewa) : 0,
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
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nama Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_aset"
                  value={form.nama_aset}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Masukkan nama aset"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Lokasi Aset
                </label>
                <input
                  type="text"
                  name="lokasi_aset"
                  value={form.lokasi_aset}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Alamat / lokasi aset"
                />
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
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-surface bg-linear-to-r from-accent to-accent/90 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2"
            >
              <FloppyDiskIcon size={16} />
              {isLoading
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

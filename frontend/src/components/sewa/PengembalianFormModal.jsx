import { useState } from "react";
import { XIcon, FloppyDiskIcon } from "@phosphor-icons/react";

const KONDISI_OPTIONS = ["Baik", "Rusak Ringan", "Rusak Berat"];

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors";

export default function PengembalianFormModal({
  isOpen,
  onClose,
  onSubmit,
  sewaData,
  isLoading = false,
}) {
  const [form, setForm] = useState({
    tanggal_pengembalian: new Date().toISOString().split("T")[0],
    kondisi_pengembalian: "Baik",
    catatan_pengembalian: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen || !sewaData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Proses Pengembalian
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Sewa Info */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-surface-secondary rounded-xl border border-border p-3 space-y-1">
            <div className="text-sm">
              <span className="text-text-muted">Aset: </span>
              <span className="font-medium text-text-primary">
                {sewaData.nama_aset}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-text-muted">Penyewa: </span>
              <span className="font-medium text-text-primary">
                {sewaData.nama_penyewa}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-text-muted">No. Kontrak: </span>
              <span className="font-medium text-text-primary">
                {sewaData.nomor_kontrak || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Tanggal Pengembalian <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_pengembalian"
              value={form.tanggal_pengembalian}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Kondisi Aset <span className="text-red-500">*</span>
            </label>
            <select
              name="kondisi_pengembalian"
              value={form.kondisi_pengembalian}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {KONDISI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Catatan Pengembalian
            </label>
            <textarea
              name="catatan_pengembalian"
              value={form.catatan_pengembalian}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Catatan terkait kondisi / pengembalian aset"
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
              {isLoading ? "Memproses..." : "Proses Pengembalian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

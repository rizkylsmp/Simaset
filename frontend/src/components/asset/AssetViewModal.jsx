import {
  XIcon,
  ClipboardTextIcon,
  ScalesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  FolderOpenIcon,
  BuildingsIcon,
  CalendarIcon,
  RulerIcon,
  CheckCircleIcon,
  WarningIcon,
  LightningIcon,
  MinusCircleIcon,
  ShieldCheckIcon,
  GavelIcon,
  HourglassHighIcon,
  ProhibitIcon,
  PencilSimpleIcon,
  PrinterIcon,
  DownloadSimpleIcon,
  MapTrifoldIcon,
  ImageIcon,
  FileTextIcon,
} from "@phosphor-icons/react";

export default function AssetViewModal({
  isOpen,
  onClose,
  asset,
  onEdit,
  canEdit = true,
}) {
  if (!isOpen || !asset) return null;

  const formatCurrency = (num) => {
    if (!num) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Status badge config
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    const configs = {
      aktif: {
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: CheckCircleIcon,
      },
      berperkara: {
        bg: "bg-red-100 dark:bg-red-500/20",
        text: "text-red-700 dark:text-red-400",
        icon: WarningIcon,
      },
      "indikasi berperkara": {
        bg: "bg-amber-100 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        icon: LightningIcon,
      },
      "tidak aktif": {
        bg: "bg-gray-100 dark:bg-gray-500/20",
        text: "text-gray-600 dark:text-gray-400",
        icon: MinusCircleIcon,
      },
    };
    return configs[statusLower] || configs["tidak aktif"];
  };

  const getStatusHukumConfig = (statusHukum) => {
    const configs = {
      Aman: {
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: ShieldCheckIcon,
      },
      Sengketa: {
        bg: "bg-red-100 dark:bg-red-500/20",
        text: "text-red-700 dark:text-red-400",
        icon: GavelIcon,
      },
      "Dalam Proses Sertipikasi": {
        bg: "bg-blue-100 dark:bg-blue-500/20",
        text: "text-blue-700 dark:text-blue-400",
        icon: HourglassHighIcon,
      },
      Diblokir: {
        bg: "bg-amber-100 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        icon: ProhibitIcon,
      },
    };
    return configs[statusHukum] || null;
  };

  const statusConfig = getStatusConfig(asset.status);
  const statusHukumConfig = getStatusHukumConfig(asset.status_hukum);
  const StatusIcon = statusConfig.icon;

  // Info item component
  const InfoItem = ({ label, value, icon: Icon, highlight = false }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p
        className={`text-sm ${highlight ? "font-semibold text-text-primary" : "text-text-secondary"}`}
      >
        {value || "-"}
      </p>
    </div>
  );

  // Section component
  const Section = ({ title, icon: Icon, children, columns = 2 }) => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2 pb-2 border-b border-border">
        <Icon size={18} weight="duotone" className="text-accent" />
        {title}
      </h3>
      <div
        className={`grid grid-cols-1 md:grid-cols-${columns} gap-x-8 gap-y-4`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-accent/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-surface border border-border shadow-2xl w-full max-w-5xl max-h-[calc(100vh-32px)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-accent to-accent/90 px-6 py-5 text-surface shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-surface/20 rounded-xl flex items-center justify-center">
                <BuildingsIcon size={28} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-medium opacity-80 mb-1">
                  {asset.kode_aset}
                </p>
                <h2 className="text-xl font-bold">{asset.nama_aset}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    <StatusIcon size={14} weight="fill" />
                    {asset.status}
                  </span>
                  {statusHukumConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusHukumConfig.bg} ${statusHukumConfig.text}`}
                    >
                      <statusHukumConfig.icon size={14} weight="fill" />
                      {asset.status_hukum}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(asset.id_aset);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-surface/20 hover:bg-surface/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <PencilSimpleIcon size={16} weight="bold" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface/20 rounded-lg transition-colors"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identitas Aset */}
              <Section title="Identitas Aset" icon={ClipboardTextIcon} columns={3}>
                <InfoItem label="Kode Aset" value={asset.kode_aset} highlight />
                <InfoItem label="Nama Aset" value={asset.nama_aset} highlight />
                <InfoItem label="Jenis Aset" value={asset.jenis_aset} />
                <InfoItem label="Kode BMD" value={asset.kode_bmd} />
                <InfoItem label="OPD Pengguna" value={asset.opd_pengguna} />
                <InfoItem
                  label="Tahun Perolehan"
                  value={asset.tahun_perolehan}
                  icon={CalendarIcon}
                />
              </Section>

              {/* Data Legal */}
              <Section title="Data Legal" icon={ScalesIcon} columns={3}>
                <InfoItem label="Jenis Hak" value={asset.jenis_hak} />
                <InfoItem
                  label="Nomor Sertifikat"
                  value={asset.nomor_sertifikat}
                />
                <InfoItem
                  label="Status Sertifikat"
                  value={asset.status_sertifikat}
                />
                <InfoItem label="Atas Nama" value={asset.atas_nama} />
                <InfoItem
                  label="Tanggal Sertifikat"
                  value={formatDate(asset.tanggal_sertifikat)}
                />
                <InfoItem
                  label="Riwayat Perolehan"
                  value={asset.riwayat_perolehan}
                />
                <InfoItem label="Status Hukum" value={asset.status_hukum} />
                <InfoItem label="SK Penetapan" value={asset.sk_penetapan} />
              </Section>

              {/* Data Fisik */}
              <Section title="Data Fisik" icon={MapPinIcon} columns={2}>
                <div className="md:col-span-2">
                  <InfoItem
                    label="Lokasi / Alamat"
                    value={asset.lokasi}
                    icon={MapPinIcon}
                    highlight
                  />
                </div>
                <InfoItem label="Desa/Kelurahan" value={asset.desa_kelurahan} />
                <InfoItem
                  label="Penggunaan Saat Ini"
                  value={asset.penggunaan_saat_ini}
                />
                <InfoItem
                  label="Luas Sertifikat"
                  value={`${formatNumber(asset.luas)} m²`}
                  icon={RulerIcon}
                  highlight
                />
                <InfoItem
                  label="Luas Lapangan"
                  value={
                    asset.luas_lapangan
                      ? `${formatNumber(asset.luas_lapangan)} m²`
                      : "-"
                  }
                  icon={RulerIcon}
                />
              </Section>

              {/* Batas Tanah */}
              <div className="bg-surface-secondary rounded-xl p-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
                  Batas-Batas Tanah
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-surface rounded-lg border border-border">
                    <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                      Utara
                    </p>
                    <p className="text-text-secondary">
                      {asset.batas_utara || "-"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-surface rounded-lg border border-border">
                    <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                      Selatan
                    </p>
                    <p className="text-text-secondary">
                      {asset.batas_selatan || "-"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-surface rounded-lg border border-border">
                    <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                      Timur
                    </p>
                    <p className="text-text-secondary">
                      {asset.batas_timur || "-"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-surface rounded-lg border border-border">
                    <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                      Barat
                    </p>
                    <p className="text-text-secondary">
                      {asset.batas_barat || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Foto Kondisi Eksisting */}
              {asset.foto_aset && (
                <div className="bg-surface-secondary rounded-xl p-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide flex items-center gap-2 mb-3">
                    <ImageIcon size={14} />
                    Foto Kondisi Eksisting
                  </h4>
                  <a
                    href={asset.foto_aset}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-border hover:border-accent transition-colors"
                  >
                    <img
                      src={asset.foto_aset}
                      alt="Foto kondisi eksisting"
                      className="w-full max-h-64 object-cover"
                    />
                  </a>
                </div>
              )}

              {/* Data Spasial */}
              {asset.koordinat_lat && asset.koordinat_long && (
                <div className="bg-surface-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide flex items-center gap-2">
                      <MapTrifoldIcon size={14} />
                      Data Spasial — Koordinat GPS
                    </h4>
                    <a
                      href={`https://www.google.com/maps?q=${asset.koordinat_lat},${asset.koordinat_long}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Buka di Google Maps →
                    </a>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 p-3 bg-surface rounded-lg border border-border">
                      <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                        Latitude
                      </p>
                      <p className="font-mono text-text-primary">
                        {asset.koordinat_lat}
                      </p>
                    </div>
                    <div className="flex-1 p-3 bg-surface rounded-lg border border-border">
                      <p className="text-[10px] font-medium text-text-muted uppercase mb-1">
                        Longitude
                      </p>
                      <p className="font-mono text-text-primary">
                        {asset.koordinat_long}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Nilai Aset Card */}
              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-surface">
                <div className="flex items-center gap-2 mb-3">
                  <CurrencyDollarIcon size={20} weight="bold" />
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    Nilai Aset
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide opacity-70">
                      Nilai Perolehan
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(asset.nilai_aset)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-surface/20 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide opacity-70">
                        Nilai Buku
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(asset.nilai_buku)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide opacity-70">
                        Nilai NJOP
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(asset.nilai_njop)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-surface-secondary rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  Ringkasan
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Luas Total</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {formatNumber(asset.luas)} m²
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Jenis Hak</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {asset.jenis_hak || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Tahun</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {asset.tahun_perolehan || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dokumentasi */}
              <div className="bg-surface-secondary rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide flex items-center gap-2">
                  <FolderOpenIcon size={14} />
                  Dokumentasi
                </h4>
                <div className="space-y-2">
                  {asset.foto_aset ? (
                    <a
                      href={asset.foto_aset}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-accent transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ImageIcon
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          Foto Aset
                        </p>
                        <p className="text-xs text-text-muted">
                          Klik untuk melihat
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 bg-surface border border-dashed border-border rounded-lg text-center">
                      <ImageIcon
                        size={24}
                        className="text-text-muted mx-auto mb-1"
                      />
                      <p className="text-xs text-text-muted">Belum ada foto</p>
                    </div>
                  )}
                  {asset.dokumen_pendukung ? (
                    <a
                      href={asset.dokumen_pendukung}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-accent transition-colors"
                    >
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <FileTextIcon
                          size={20}
                          className="text-amber-600 dark:text-amber-400"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          Dokumen
                        </p>
                        <p className="text-xs text-text-muted">
                          Klik untuk unduh
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 bg-surface border border-dashed border-border rounded-lg text-center">
                      <FileTextIcon
                        size={24}
                        className="text-text-muted mx-auto mb-1"
                      />
                      <p className="text-xs text-text-muted">
                        Belum ada dokumen
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Keterangan */}
              {asset.keterangan && (
                <div className="bg-surface-secondary rounded-xl p-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">
                    Keterangan
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {asset.keterangan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-secondary border-t border-border flex items-center justify-between shrink-0">
          <p className="text-xs text-text-muted">
            ID: {asset.id_aset} • Terakhir diperbarui:{" "}
            {formatDate(asset.updated_at || asset.created_at)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

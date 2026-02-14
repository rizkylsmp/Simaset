import SubstansiAssetPage from "../../components/asset/SubstansiAssetPage";
import {
  FileTextIcon,
  BuildingsIcon,
  CurrencyDollarIcon,
  NotebookIcon,
} from "@phosphor-icons/react";

const formatCurrencyShort = (num) => {
  if (!num) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const columns = [
  {
    key: "kode_bmd",
    label: "Kode BMD",
    sortable: true,
    type: "badge",
  },
  {
    key: "opd_pengguna",
    label: "OPD Pengguna",
    sortable: true,
    minWidth: "160px",
    render: (value) => {
      if (!value) return <span className="text-text-muted text-xs">-</span>;
      return (
        <div className="flex items-center gap-2">
          <BuildingsIcon size={14} className="text-text-muted shrink-0" />
          <span
            className="text-sm text-text-secondary line-clamp-1"
            title={value}
          >
            {value}
          </span>
        </div>
      );
    },
  },
  {
    key: "tahun_perolehan",
    label: "Tahun Perolehan",
    sortable: true,
    align: "center",
  },
  {
    key: "nilai_aset",
    label: "Nilai Perolehan",
    type: "currency",
    sortable: true,
    align: "right",
  },
  {
    key: "nilai_buku",
    label: "Nilai Buku",
    type: "currency",
    sortable: true,
    align: "right",
  },
  {
    key: "nilai_njop",
    label: "Nilai NJOP",
    type: "currency",
    sortable: true,
    align: "right",
  },
  {
    key: "sk_penetapan",
    label: "SK Penetapan",
    sortable: true,
  },
];

const statsCards = (assets, totalItems) => {
  const totalNilai = assets.reduce(
    (sum, a) => sum + (parseFloat(a.nilai_aset) || 0),
    0,
  );
  const totalNJOP = assets.reduce(
    (sum, a) => sum + (parseFloat(a.nilai_njop) || 0),
    0,
  );

  return [
    {
      label: "Total Aset",
      value: totalItems,
      icon: FileTextIcon,
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Total Nilai Perolehan",
      value: formatCurrencyShort(totalNilai),
      icon: CurrencyDollarIcon,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total NJOP",
      value: formatCurrencyShort(totalNJOP),
      icon: NotebookIcon,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Memiliki OPD",
      value: assets.filter((a) => a.opd_pengguna).length,
      icon: BuildingsIcon,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];
};

export default function DataAdministratifPage() {
  return (
    <SubstansiAssetPage
      title="Data Administratif"
      subtitle="Kodefikasi BMD, nilai aset, OPD pengguna, dan dokumen penetapan"
      icon={FileTextIcon}
      iconColor="from-violet-500 to-violet-600"
      columns={columns}
      statsCards={statsCards}
      substansi="administratif"
    />
  );
}

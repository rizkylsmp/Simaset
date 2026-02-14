import SubstansiAssetPage from "../../components/asset/SubstansiAssetPage";
import {
  GlobeHemisphereWestIcon,
  MapPinIcon,
  PolygonIcon,
  NavigationArrowIcon,
} from "@phosphor-icons/react";

const columns = [
  {
    key: "lokasi",
    label: "Lokasi",
    type: "location",
    minWidth: "200px",
  },
  {
    key: "koordinat_lat",
    label: "Latitude",
    type: "coordinate",
    sortable: true,
  },
  {
    key: "koordinat_long",
    label: "Longitude",
    type: "coordinate",
    sortable: true,
  },
  {
    key: "luas",
    label: "Luas (m²)",
    type: "area",
    sortable: true,
    align: "right",
  },
  {
    key: "polygon_bidang",
    label: "Polygon",
    render: (value) => {
      const hasPolygon = value && value !== "null" && value !== "";
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
            hasPolygon
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
              : "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/30"
          }`}
        >
          <PolygonIcon size={14} weight={hasPolygon ? "fill" : "regular"} />
          {hasPolygon ? "Tersedia" : "Belum ada"}
        </span>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    type: "status",
    sortable: true,
  },
];

const statsCards = (assets, totalItems) => [
  {
    label: "Total Aset",
    value: totalItems,
    icon: GlobeHemisphereWestIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    label: "Memiliki Koordinat",
    value: assets.filter((a) => a.koordinat_lat && a.koordinat_long).length,
    icon: NavigationArrowIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Memiliki Polygon",
    value: assets.filter((a) => a.polygon_bidang && a.polygon_bidang !== "null")
      .length,
    icon: PolygonIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Tanpa Koordinat",
    value: assets.filter((a) => !a.koordinat_lat || !a.koordinat_long).length,
    icon: MapPinIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export default function DataSpasialPage() {
  return (
    <SubstansiAssetPage
      title="Data Spasial"
      subtitle="Koordinat, polygon bidang, dan informasi geospasial aset"
      icon={GlobeHemisphereWestIcon}
      iconColor="from-cyan-500 to-cyan-600"
      columns={columns}
      statsCards={statsCards}
      substansi="spasial"
    />
  );
}

import * as React from "react";
import { cn } from "../utils/cn";
import {
  MagnifyingGlass,
  Package,
  FileX,
  WifiSlash,
} from "@phosphor-icons/react";

const presets = {
  noData: {
    icon: Package,
    title: "Tidak Ada Data",
    description: "Belum ada data yang tersedia saat ini.",
  },
  noResults: {
    icon: MagnifyingGlass,
    title: "Tidak Ditemukan",
    description: "Tidak ada hasil yang cocok dengan pencarian Anda.",
  },
  error: {
    icon: FileX,
    title: "Terjadi Kesalahan",
    description: "Gagal memuat data. Silakan coba lagi.",
  },
  offline: {
    icon: WifiSlash,
    title: "Tidak Ada Koneksi",
    description: "Periksa koneksi internet Anda dan coba lagi.",
  },
};

const EmptyState = React.forwardRef(
  (
    {
      className,
      preset,
      icon: CustomIcon,
      title,
      description,
      action,
      compact = false,
      ...props
    },
    ref,
  ) => {
    const config = preset ? presets[preset] : {};
    const Icon = CustomIcon || config.icon || Package;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "py-8 px-4" : "py-16 px-6",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "rounded-2xl bg-surface-secondary flex items-center justify-center mb-4",
            compact ? "w-14 h-14" : "w-20 h-20",
          )}
        >
          <Icon
            size={compact ? 28 : 40}
            weight="duotone"
            className="text-text-muted"
          />
        </div>

        {displayTitle && (
          <h3
            className={cn(
              "font-semibold text-text-primary mb-1",
              compact ? "text-base" : "text-lg",
            )}
          >
            {displayTitle}
          </h3>
        )}

        {displayDescription && (
          <p
            className={cn(
              "text-text-tertiary max-w-sm",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {displayDescription}
          </p>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";

export { EmptyState };

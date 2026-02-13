import { useNavigate } from "react-router-dom";
import {
  ClipboardText,
  User,
  Clock,
  CaretRight,
  Plus,
  Eye,
  FloppyDisk,
  SignIn,
  PencilSimple,
} from "@phosphor-icons/react";

export default function ActivityTable() {
  const navigate = useNavigate();

  const activities = [
    {
      id: 1,
      waktu: "2025-01-15 10:30",
      user: "dinas_aset01",
      aktivitas: "Create",
      deskripsi: "Menambah aset tanah baru AST-001",
    },
    {
      id: 2,
      waktu: "2025-01-15 10:25",
      user: "bpn_user01",
      aktivitas: "View",
      deskripsi: "Melihat detail aset AST-045",
    },
    {
      id: 3,
      waktu: "2025-01-15 10:20",
      user: "admin01",
      aktivitas: "Backup",
      deskripsi: "Melakukan backup database",
    },
    {
      id: 4,
      waktu: "2025-01-15 10:15",
      user: "tataruang01",
      aktivitas: "Login",
      deskripsi: "Login ke sistem",
    },
    {
      id: 5,
      waktu: "2025-01-15 10:10",
      user: "dinas_aset01",
      aktivitas: "Update",
      deskripsi: "Mengupdate status aset AST-032",
    },
  ];

  const getActivityConfig = (type) => {
    const config = {
      Create: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: <Plus size={12} weight="bold" />,
      },
      View: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: <Eye size={12} weight="bold" />,
      },
      Backup: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: <FloppyDisk size={12} weight="bold" />,
      },
      Login: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        icon: <SignIn size={12} weight="bold" />,
      },
      Update: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: <PencilSimple size={12} weight="bold" />,
      },
    };
    return (
      config[type] || {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        icon: null,
      }
    );
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-linear-to-r from-surface to-surface-secondary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ClipboardText size={20} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Aktivitas Terbaru
            </h3>
            <p className="text-xs text-text-tertiary">5 aktivitas terakhir</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/riwayat")}
          className="group px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-tertiary hover:bg-surface-secondary rounded-lg transition-all duration-200 flex items-center gap-1.5"
        >
          Lihat Semua
          <CaretRight
            size={14}
            weight="bold"
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border">
        {activities.map((activity, idx) => {
          const config = getActivityConfig(activity.aktivitas);
          return (
            <div
              key={activity.id}
              className="group px-5 py-4 hover:bg-surface-secondary/50 transition-all duration-200 cursor-pointer"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Activity Icon */}
                <div
                  className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center shrink-0 ${config.text} group-hover:scale-105 transition-transform`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md ${config.bg} ${config.text}`}
                    >
                      {activity.aktivitas}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={12} />
                      {activity.waktu}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-medium truncate">
                    {activity.deskripsi}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-5 h-5 bg-linear-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <User size={10} weight="bold" className="text-white" />
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {activity.user}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <CaretRight
                  size={16}
                  className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

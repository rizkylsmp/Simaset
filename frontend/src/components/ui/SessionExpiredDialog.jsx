import { useEffect, useRef, useState } from "react";
import { Timer, ArrowClockwise, SignOut, Warning } from "@phosphor-icons/react";

export default function SessionExpiredDialog({ onExtend, onLogout }) {
  const [extending, setExtending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const dialogRef = useRef(null);

  // Countdown 60 seconds then auto logout
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout]);

  const handleExtend = async () => {
    setExtending(true);
    try {
      await onExtend();
    } catch {
      setExtending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md mx-4 bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Header with warning gradient */}
        <div className="bg-linear-to-br from-amber-500 to-orange-500 px-6 py-5 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Timer size={32} weight="fill" className="text-white" />
          </div>
          <h3 className="text-white font-bold text-lg">Sesi Telah Berakhir</h3>
          <p className="text-white/80 text-sm mt-1">
            Waktu sesi Anda telah habis
          </p>
          {/* Countdown badge */}
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <span className="text-white/90 text-xs font-medium">Logout otomatis dalam</span>
            <span className={`text-white font-bold text-sm font-mono ${countdown <= 10 ? "animate-pulse" : ""}`}>
              {countdown}s
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
            <Warning
              size={20}
              weight="fill"
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Sesi login Anda telah berakhir. Anda dapat memperpanjang sesi atau
              keluar dari aplikasi.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleExtend}
              disabled={extending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-accent to-accent/90 text-surface font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all duration-200 disabled:opacity-50"
            >
              {extending ? (
                <ArrowClockwise
                  size={18}
                  weight="bold"
                  className="animate-spin"
                />
              ) : (
                <ArrowClockwise size={18} weight="bold" />
              )}
              {extending ? "Memperpanjang..." : "Perpanjang Sesi"}
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border text-text-secondary font-medium rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
            >
              <SignOut size={18} weight="bold" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

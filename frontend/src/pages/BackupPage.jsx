import { useState } from "react";

export default function BackupPage() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("harian");
  const [backupTime, setBackupTime] = useState("02:00");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Database info
  const dbInfo = {
    backupTerakhir: "15/01/2025 02:15",
    ukuranDatabase: "156.8 MB",
    totalRecord: "125,430",
    statusSistem: "Normal",
  };

  // Backup history
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      namaFile: "backup_20250115_021500.sql",
      ukuran: "156.8 MB",
      tanggal: "15/01/2025 02:15",
      status: "Success",
      dilakukanOleh: "admin01",
    },
    {
      id: 2,
      namaFile: "backup_20250114_021500.sql",
      ukuran: "155.2 MB",
      tanggal: "14/01/2025 02:15",
      status: "Success",
      dilakukanOleh: "admin01",
    },
    {
      id: 3,
      namaFile: "backup_20250113_021500.sql",
      ukuran: "154.9 MB",
      tanggal: "13/01/2025 02:15",
      status: "Success",
      dilakukanOleh: "admin01",
    },
    {
      id: 4,
      namaFile: "backup_manual_20250110.sql",
      ukuran: "153.1 MB",
      tanggal: "10/01/2025 15:30",
      status: "Success",
      dilakukanOleh: "admin01",
    },
    {
      id: 5,
      namaFile: "backup_20250109_021500.sql",
      ukuran: "-",
      tanggal: "09/01/2025 02:15",
      status: "Failed",
      dilakukanOleh: "admin01",
    },
  ]);

  const handleBackupNow = () => {
    alert("Memulai proses backup database...");
  };

  const handleDownloadBackup = (filename) => {
    alert(`Downloading: ${filename}`);
  };

  const handleSaveSchedule = () => {
    alert(`Jadwal backup disimpan: ${backupSchedule} pada ${backupTime} WIB`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRestore = () => {
    if (!uploadedFile) {
      alert("Pilih file backup terlebih dahulu!");
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin melakukan restore dari file "${uploadedFile.name}"? Proses ini akan mengganti SEMUA data saat ini.`)) {
      alert("Memulai proses restore...");
    }
  };

  const handleDeleteBackup = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus backup ini?")) {
      setBackupHistory((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola backup dan restore database sistem</p>
        </div>
        <button
          onClick={handleBackupNow}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl text-sm font-medium"
        >
          <span>💾</span>
          Backup Sekarang
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">Peringatan Penting</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Proses backup akan membuat salinan lengkap dari seluruh database sistem</li>
            <li>• Proses restore akan mengganti SEMUA data saat ini dengan data dari file backup</li>
            <li>• Pastikan tidak ada user lain yang sedang menggunakan sistem saat melakukan restore</li>
          </ul>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{dbInfo.backupTerakhir}</div>
              <div className="text-xs text-gray-500">Backup Terakhir</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">💽</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{dbInfo.ukuranDatabase}</div>
              <div className="text-xs text-gray-500">Ukuran Database</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{dbInfo.totalRecord}</div>
              <div className="text-xs text-gray-500">Total Record</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-green-600">{dbInfo.statusSistem}</div>
              <div className="text-xs text-gray-500">Status Sistem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span>⏰</span>
            <h3 className="font-semibold text-gray-900">Jadwal Backup Otomatis</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔄</span>
                <span className="font-medium text-gray-900">Backup Otomatis</span>
              </div>
              <button
                onClick={() => setAutoBackup(!autoBackup)}
                className={`w-12 h-6 rounded-full transition-colors ${autoBackup ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoBackup ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Frekuensi Backup</label>
              <select
                value={backupSchedule}
                onChange={(e) => setBackupSchedule(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Backup</label>
              <input
                type="time"
                value={backupTime}
                onChange={(e) => setBackupTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
            </div>

            <button
              onClick={handleSaveSchedule}
              className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
            >
              Simpan Jadwal
            </button>
          </div>
        </div>

        {/* Restore Database */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span>🔄</span>
            <h3 className="font-semibold text-gray-900">Restore Database</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="backup-file"
                accept=".sql,.gz"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="backup-file" className="cursor-pointer">
                <div className="text-4xl mb-3">📁</div>
                {uploadedFile ? (
                  <div>
                    <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                    <div className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-gray-900">Pilih File Backup</div>
                    <div className="text-sm text-gray-500">Klik atau drag file .sql/.gz</div>
                  </div>
                )}
              </label>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <span>⚠️</span>
                <span className="font-medium">Restore akan mengganti semua data saat ini!</span>
              </div>
            </div>

            <button
              onClick={handleRestore}
              disabled={!uploadedFile}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                uploadedFile
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Mulai Restore
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <h3 className="font-semibold text-gray-900">Riwayat Backup</h3>
          </div>
          <span className="text-sm text-gray-500">{backupHistory.length} backup tersimpan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama File</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ukuran</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Oleh</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>💾</span>
                      <span className="text-sm font-medium text-gray-900">{backup.namaFile}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.ukuran}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      backup.status === "Success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{backup.dilakukanOleh}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {backup.status === "Success" && (
                        <button
                          onClick={() => handleDownloadBackup(backup.namaFile)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          ↓ Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        × Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

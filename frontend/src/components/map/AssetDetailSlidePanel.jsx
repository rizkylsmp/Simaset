import { useState } from "react";

export default function AssetDetailSlidePanel({ asset, onClose }) {
  const [activeTab, setActiveTab] = useState("keterangan");

  if (!asset) return null;

  // Extended asset data (in real app, this would come from API)
  const assetDetail = {
    ...asset,
    lokasi_alamat: "Jl. Malioboro No. 12, Kelurahan Sosromenduran, Kecamatan Gedongtengen, Kota Yogyakarta, DIY 55271",
    koordinat_gps: `${asset.latitude}, ${asset.longitude}`,
    jenis_aset: "Tanah Kosong",
    nilai_aset: "Rp 5.000.000.000,-",
    // Informasi Legal
    nomor_sertifikat: "SHM No. 12345/Gedongtengen",
    jenis_sertifikat: "Sertifikat Hak Milik (SHM)",
    atas_nama: "Pemerintah Kota Yogyakarta",
    tanggal_terbit: "15 Maret 2020",
    masa_berlaku: "Selamanya",
    status_verifikasi_bpn: true,
    // Dokumen
    dokumen: [
      { id: 1, nama: "Sertifikat_SHM.pdf", ukuran: "2.1 MB" },
      { id: 2, nama: "Surat_Hibah.pdf", ukuran: "1.8 MB" },
      { id: 3, nama: "IMB_Dokumen.pdf", ukuran: "3.2 MB" },
      { id: 4, nama: "Denah_Lokasi.jpg", ukuran: "1.5 MB" },
    ],
    // Riwayat Perubahan
    riwayat: [
      { tanggal: "15 Jan 2025, 10:30", aksi: "Update Status", detail: "Dokumen IMB ditambahkan oleh dinas_aset01", user: "dinas_aset01" },
      { tanggal: "10 Jan 2025, 14:20", aksi: "Verifikasi", detail: "Data aset diverifikasi oleh BPN (bpn_user01)", user: "bpn_user01" },
      { tanggal: "06 Jan 2025, 09:15", aksi: "Update Foto", detail: "Foto aset diperbarui oleh dinas_aset01", user: "dinas_aset01" },
      { tanggal: "20 Mar 2020, 11:00", aksi: "Data Dibuat", detail: "Aset didaftarkan oleh admin01", user: "admin01" },
    ],
    // Metadata
    dibuat_oleh: "admin01",
    tanggal_dibuat: "20 Mar 2020, 11:00",
    terakhir_diupdate: "15 Jan 2025, 10:30",
    diupdate_oleh: "dinas_aset01",
    total_views: "2,345",
    // Keterangan
    keterangan: `Aset ini merupakan tanah strategis yang terletak di pusat Kota Yogyakarta, tepatnya di Jalan Malioboro yang merupakan kawasan wisata dan perdagangan utama. Tanah ini diperoleh melalui hibah dari Keraton Yogyakarta pada tahun 2020 untuk kepentingan publik.

Saat ini tanah digunakan sebagai taman kota dan ruang terbuka hijau untuk masyarakat. Terdapat rencana pengembangan untuk menambah fasilitas publik seperti wifi corner dan area duduk yang lebih nyaman.

Status: Tidak ada sengketa atau perkara hukum.`,
    // Foto
    foto_utama: null,
    foto_gallery: [null, null, null, null],
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "aktif": return "bg-green-100 text-green-700";
      case "berperkara": return "bg-red-100 text-red-700";
      case "tidak_aktif": return "bg-yellow-100 text-yellow-700";
      case "dijual": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div className="fixed top-0 right-0 h-full w-[900px] max-w-full bg-gray-50 shadow-2xl z-50 flex flex-col animate-slide-in overflow-hidden">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 text-xs flex items-center gap-2">
          <span className="text-gray-400">Data Aset</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-400">Detail</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-gray-900">{assetDetail.kode_aset}</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white">📍</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg text-gray-900">{assetDetail.kode_aset}</h2>
                <span className={`${getStatusStyle(assetDetail.status)} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                  {getStatusText(assetDetail.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{assetDetail.nama_aset}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1.5">
              <span>✏️</span> Edit
            </button>
            <button className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1.5">
              <span>🖨️</span> Cetak
            </button>
            <button className="px-3 py-2 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-all flex items-center gap-1.5">
              <span>📄</span> Export PDF
            </button>
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="col-span-2 space-y-6">
              {/* Foto & Dokumentasi */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                  <span>📷</span>
                  <h3 className="font-semibold text-sm text-gray-900">Foto & Dokumentasi</h3>
                </div>
                <div className="p-5">
                  {/* Main Image */}
                  <div className="rounded-lg border border-gray-200 h-48 flex items-center justify-center bg-gray-50 mb-4">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm font-medium">Foto Utama Aset</div>
                      <div className="text-xs text-gray-400">Klik untuk upload</div>
                    </div>
                  </div>
                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg border border-gray-200 h-16 flex items-center justify-center bg-gray-50 text-xs text-gray-400 hover:border-gray-300 hover:bg-gray-100 transition-all cursor-pointer">
                        {i === 4 ? "+3" : `📷`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informasi Dasar */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                  <span>📋</span>
                  <h3 className="font-semibold text-sm text-gray-900">Informasi Dasar</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="text-xs text-gray-500">Kode Aset</label>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{assetDetail.kode_aset}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Nama Aset</label>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{assetDetail.nama_aset}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Lokasi/Alamat</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.lokasi_alamat}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Koordinat GPS</label>
                      <p className="text-sm text-blue-600 mt-0.5 font-mono">{assetDetail.koordinat_gps}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Luas Tanah</label>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{assetDetail.luas} m²</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Status Aset</label>
                      <p className="mt-1">
                        <span className={`${getStatusStyle(assetDetail.status)} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                          {getStatusText(assetDetail.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Jenis Aset</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.jenis_aset}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Tahun Perolehan</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.tahun}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Nilai Aset</label>
                      <p className="text-sm font-semibold text-green-600 mt-0.5">{assetDetail.nilai_aset}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Legal */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                  <span>⚖️</span>
                  <h3 className="font-semibold text-sm text-gray-900">Informasi Legal</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="text-xs text-gray-500">Nomor Sertifikat</label>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{assetDetail.nomor_sertifikat}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Jenis Sertifikat</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.jenis_sertifikat}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Atas Nama</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.atas_nama}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Tanggal Terbit</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.tanggal_terbit}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Masa Berlaku</label>
                      <p className="text-sm text-gray-900 mt-0.5">{assetDetail.masa_berlaku}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Status Verifikasi BPN</label>
                      <p className="mt-1">
                        {assetDetail.status_verifikasi_bpn ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <span>✓</span> Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            <span>✗</span> Belum Terverifikasi
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs: Keterangan, Dokumen, Riwayat */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("keterangan")}
                    className={`flex-1 px-5 py-3 text-sm font-medium transition-all ${activeTab === "keterangan" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Keterangan
                  </button>
                  <button
                    onClick={() => setActiveTab("dokumen")}
                    className={`flex-1 px-5 py-3 text-sm font-medium border-l border-gray-200 transition-all ${activeTab === "dokumen" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Dokumen
                  </button>
                  <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`flex-1 px-5 py-3 text-sm font-medium border-l border-gray-200 transition-all ${activeTab === "riwayat" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    Riwayat
                  </button>
                </div>
                <div className="p-5 min-h-[150px]">
                  {activeTab === "keterangan" && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{assetDetail.keterangan}</p>
                  )}
                  {activeTab === "dokumen" && (
                    <div className="space-y-2">
                      {assetDetail.dokumen.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">📄</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{doc.nama}</span>
                              <p className="text-xs text-gray-500">{doc.ukuran}</p>
                            </div>
                          </div>
                          <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-white transition-all">
                            ⬇ Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "riwayat" && (
                    <div className="space-y-4">
                      {assetDetail.riwayat.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                          <div>
                            <p className="text-xs text-gray-500">{item.tanggal}</p>
                            <p className="text-sm font-medium text-gray-900">{item.aksi}</p>
                            <p className="text-xs text-gray-600">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Lokasi Peta */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <span>🗺️</span>
                  <h3 className="font-semibold text-sm text-gray-900">Lokasi Peta</h3>
                </div>
                <div className="p-4">
                  <div className="rounded-lg border border-gray-200 h-32 flex items-center justify-center bg-gray-50 mb-3">
                    <div className="text-center text-gray-400">
                      <div className="text-2xl mb-1">🗺️</div>
                      <div className="text-xs font-medium">Map Preview</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Latitude</span>
                      <span className="font-mono text-gray-700">{assetDetail.latitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longitude</span>
                      <span className="font-mono text-gray-700">{assetDetail.longitude}</span>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-full bg-gray-900 text-white px-3 py-2.5 text-xs font-medium rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Lihat di Peta Interaktif
                  </button>
                </div>
              </div>

              {/* Dokumen Pendukung */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <span>📁</span>
                  <h3 className="font-semibold text-sm text-gray-900">Dokumen Pendukung</h3>
                </div>
                <div className="p-4 space-y-2">
                  {assetDetail.dokumen.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        <span className="text-gray-700 hover:text-gray-900 cursor-pointer">{doc.nama}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">⬇</button>
                    </div>
                  ))}
                  <button className="w-full border border-dashed border-gray-300 px-3 py-2.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg mt-2 transition-all">
                    + Upload Dokumen
                  </button>
                </div>
              </div>

              {/* Riwayat Perubahan */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <span>📜</span>
                  <h3 className="font-semibold text-sm text-gray-900">Riwayat Perubahan</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {assetDetail.riwayat.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-blue-400 pl-3 py-1">
                        <div className="text-xs text-blue-600 font-medium">{item.tanggal}</div>
                        <div className="text-xs font-semibold text-gray-900">{item.aksi}</div>
                        <div className="text-xs text-gray-500">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full text-xs font-medium text-gray-600 hover:text-gray-900 py-2.5 hover:bg-gray-50 rounded-lg mt-3 transition-all">
                    Lihat Semua Riwayat →
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <span>ℹ️</span>
                  <h3 className="font-semibold text-sm text-gray-900">Metadata</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibuat Oleh</span>
                      <span className="text-blue-600 font-medium">{assetDetail.dibuat_oleh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal Dibuat</span>
                      <span className="text-gray-700">{assetDetail.tanggal_dibuat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Terakhir Update</span>
                      <span className="text-gray-700">{assetDetail.terakhir_diupdate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Diupdate Oleh</span>
                      <span className="text-blue-600 font-medium">{assetDetail.diupdate_oleh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Views</span>
                      <span className="text-gray-700">{assetDetail.total_views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

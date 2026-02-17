import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Aset = sequelize.define(
  "Aset",
  {
    id_aset: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_aset: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    nama_aset: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    lokasi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    koordinat_lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    koordinat_long: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    luas: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "Aktif",
        "Berperkara",
        "Indikasi Berperkara",
        "Tidak Aktif",
      ),
      defaultValue: "Aktif",
    },
    jenis_aset: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nilai_aset: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
    },
    tahun_perolehan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nomor_sertifikat: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status_sertifikat: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    foto_aset: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dokumen_pendukung: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ========== DATA LEGAL ==========
    jenis_hak: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Jenis Hak: HM, HPL, HP, Tanah Negara",
    },
    atas_nama: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "Atas Nama: Pemda / Instansi",
    },
    tanggal_sertifikat: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Tanggal Terbit Sertifikat",
    },
    riwayat_perolehan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Hibah, Pembelian, Tukar Menukar, Penyerahan PSU",
    },
    status_hukum: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Aman, Sengketa, Dalam Proses Sertipikasi, Diblokir",
    },

    // ========== DATA FISIK ==========
    kecamatan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Kecamatan",
    },
    desa_kelurahan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Desa/Kelurahan",
    },
    luas_lapangan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Luas kondisi lapangan (m²)",
    },
    batas_utara: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    batas_selatan: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    batas_timur: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    batas_barat: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    penggunaan_saat_ini: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Kantor, Sekolah, Lahan Kosong, Disewa Pihak Ketiga, dll",
    },

    // ========== DATA ADMINISTRATIF / KEUANGAN ==========
    kode_bmd: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Kodefikasi Barang Milik Daerah",
    },
    nilai_buku: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
    },
    nilai_njop: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
    },
    sk_penetapan: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "SK Penetapan Status Penggunaan",
    },
    opd_pengguna: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "OPD Pengguna aset",
    },

    // ========== DATA SPASIAL ==========
    polygon_bidang: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Polygon bidang tanah dalam format GeoJSON",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id_user",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "aset",
    timestamps: false,
  },
);

export default Aset;

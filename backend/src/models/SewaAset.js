import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SewaAset = sequelize.define(
  "SewaAset",
  {
    id_sewa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Linked asset
    id_aset: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "aset", key: "id_aset" },
    },
    nama_aset: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    lokasi_aset: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Penyewa
    nama_penyewa: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    nik_penyewa: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    instansi_penyewa: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    alamat_penyewa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telepon_penyewa: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email_penyewa: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Periode
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_berakhir: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Nilai
    nilai_sewa: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    },
    periode_bayar: {
      type: DataTypes.ENUM("Bulanan", "Tahunan", "Sekali Bayar"),
      defaultValue: "Tahunan",
    },

    // Kontrak
    nomor_kontrak: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_kontrak: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Status
    status: {
      type: DataTypes.ENUM(
        "Aktif",
        "Akan Berakhir",
        "Berakhir",
        "Dikembalikan",
        "Dibatalkan",
      ),
      defaultValue: "Aktif",
    },

    // Pengembalian
    tanggal_pengembalian: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    kondisi_pengembalian: {
      type: DataTypes.ENUM("Baik", "Rusak Ringan", "Rusak Berat"),
      allowNull: true,
    },
    catatan_pengembalian: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Audit
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id_user" },
    },
  },
  {
    tableName: "sewa_aset",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SewaAset;

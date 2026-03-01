import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PusatData = sequelize.define(
  "PusatData",
  {
    id_pusat_data: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_barang: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nama_barang: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    nibar: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Nomor Identifikasi Barang",
    },
    luas: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Luas dalam meter persegi",
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nilai_perolehan: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: "Nilai perolehan dalam Rupiah",
    },
    no_sertifikat: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nomor sertifikat",
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Tanggal perolehan/pencatatan",
    },
    opd: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "Organisasi Perangkat Daerah",
    },
    pemegang: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "Nama pemegang aset",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "pusat_data",
    timestamps: false,
  },
);

export default PusatData;

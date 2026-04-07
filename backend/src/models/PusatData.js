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
    kode_aset: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Kode aset BPN",
    },
    nama_aset: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "Nama aset",
    },
    nib: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Nomor Identifikasi Bidang",
    },
    nomor_hak: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nomor Hak / Nomor Sertifikat",
    },
    jenis_hak: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Hak Pakai, Hak Milik, HGB, dll",
    },
    luas: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Luas dalam meter persegi",
    },
    luas_lapangan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Luas lapangan dalam meter persegi",
    },
    penggunaan: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "Penggunaan saat ini",
    },
    kecamatan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    kelurahan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_sertifikat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Sudah/Belum Sertifikat",
    },
    surat_ukur: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pemilik_pertama: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    pemilik_akhir: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    atas_nama: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "Atas Nama pemegang hak",
    },
    produk: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Produk sertifikat (Elektronik/Analog)",
    },
    kw: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Kantor Wilayah",
    },
    opd: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "Organisasi Perangkat Daerah",
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
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

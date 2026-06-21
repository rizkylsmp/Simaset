import sequelize from "../config/database.js";
import User from "./User.js";
import Aset from "./Aset.js";
import Riwayat from "./Riwayat.js";
import Notifikasi from "./Notifikasi.js";
import PusatData from "./PusatData.js";
import SewaAset from "./SewaAset.js";
import PermintaanSewa from "./PermintaanSewa.js";
import EkasmatResponse from "./EkasmatResponse.js";
import ChatMessage from "./ChatMessage.js";

// Define associations here to avoid circular dependencies
// User has many Aset (created_by)
User.hasMany(Aset, {
  foreignKey: "created_by",
  as: "assets",
});

// Aset belongs to User (creator)
Aset.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

// User has many Riwayat
User.hasMany(Riwayat, {
  foreignKey: "user_id",
  as: "activities",
});

// Riwayat belongs to User
Riwayat.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User has many Notifikasi
User.hasMany(Notifikasi, {
  foreignKey: "user_id",
  as: "notifications",
});

// Notifikasi belongs to User
Notifikasi.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User has many PusatData (created_by)
User.hasMany(PusatData, {
  foreignKey: "created_by",
  as: "pusatData",
});

// PusatData belongs to User (creator)
PusatData.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

// SewaAset belongs to Aset
SewaAset.belongsTo(Aset, {
  foreignKey: "id_aset",
  as: "aset",
});

Aset.hasMany(SewaAset, {
  foreignKey: "id_aset",
  as: "sewas",
});

// SewaAset belongs to User (creator)
SewaAset.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

User.hasMany(SewaAset, {
  foreignKey: "created_by",
  as: "sewaAsets",
});

// PermintaanSewa belongs to SewaAset
PermintaanSewa.belongsTo(SewaAset, {
  foreignKey: "id_sewa",
  as: "sewa",
});

SewaAset.hasMany(PermintaanSewa, {
  foreignKey: "id_sewa",
  as: "permintaan",
});

// User has many ChatMessages
User.hasMany(ChatMessage, {
  foreignKey: "user_id",
  as: "chatMessages",
});

// ChatMessage belongs to User
ChatMessage.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export {
  sequelize,
  User,
  Aset,
  Riwayat,
  Notifikasi,
  PusatData,
  SewaAset,
  PermintaanSewa,
  EkasmatResponse,
  ChatMessage,
};

import { Op } from "sequelize";
import { PermintaanSewa, SewaAset } from "../models/index.js";

// ================================
// PUBLIC - Submit a rental request (no auth)
// ================================
export const submitRequest = async (req, res) => {
  try {
    const {
      id_sewa,
      nama_aset,
      nama_pemohon,
      nik,
      no_telepon,
      email,
      alamat,
      tujuan_sewa,
    } = req.body;

    if (!nama_aset || !nama_pemohon || !no_telepon || !tujuan_sewa) {
      return res.status(400).json({
        error:
          "Nama aset, nama pemohon, nomor telepon, dan tujuan sewa wajib diisi",
      });
    }

    const permintaan = await PermintaanSewa.create({
      id_sewa: id_sewa || null,
      nama_aset,
      nama_pemohon,
      nik: nik || null,
      no_telepon,
      email: email || null,
      alamat: alamat || null,
      tujuan_sewa,
    });

    res.status(201).json({ success: true, data: permintaan });
  } catch (error) {
    console.error("Submit request error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// GET ALL - List permintaan with pagination (authenticated)
// ================================
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { nama_aset: { [Op.iLike]: `%${search}%` } },
        { nama_pemohon: { [Op.iLike]: `%${search}%` } },
        { no_telepon: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;

    const { rows: data, count: total } = await PermintaanSewa.findAndCountAll({
      where,
      include: [
        {
          model: SewaAset,
          as: "sewa",
          attributes: ["id_sewa", "nama_aset", "no_lot", "status"],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Permintaan getAll error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// UPDATE STATUS (authenticated)
// ================================
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin, dokumen_respon } = req.body;

    const permintaan = await PermintaanSewa.findByPk(id);
    if (!permintaan) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }

    const updateData = { status };
    if (catatan_admin !== undefined) updateData.catatan_admin = catatan_admin;
    if (dokumen_respon !== undefined)
      updateData.dokumen_respon = dokumen_respon;

    await permintaan.update(updateData);

    res.json({ success: true, data: permintaan });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// DELETE (authenticated)
// ================================
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const permintaan = await PermintaanSewa.findByPk(id);
    if (!permintaan) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }
    await permintaan.destroy();
    res.json({ success: true, message: "Permintaan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

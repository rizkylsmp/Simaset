import { Op } from "sequelize";
import { SewaAset, Aset, User } from "../models/index.js";

// ================================
// GET ALL - Penyewaan list with pagination, search, filters
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
        { nama_penyewa: { [Op.iLike]: `%${search}%` } },
        { nama_aset: { [Op.iLike]: `%${search}%` } },
        { nomor_kontrak: { [Op.iLike]: `%${search}%` } },
        { instansi_penyewa: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const { rows: data, count: total } = await SewaAset.findAndCountAll({
      where,
      include: [
        {
          model: Aset,
          as: "aset",
          attributes: ["id_aset", "kode_aset", "nama_aset", "lokasi"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
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
    console.error("SewaAset getAll error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// GET BY ID
// ================================
export const getById = async (req, res) => {
  try {
    const sewa = await SewaAset.findByPk(req.params.id, {
      include: [
        {
          model: Aset,
          as: "aset",
          attributes: ["id_aset", "kode_aset", "nama_aset", "lokasi"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
      ],
    });

    if (!sewa) {
      return res.status(404).json({ error: "Data sewa tidak ditemukan" });
    }

    res.json({ success: true, data: sewa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// GET STATS
// ================================
export const getStats = async (req, res) => {
  try {
    const total = await SewaAset.count();
    const aktif = await SewaAset.count({ where: { status: "Aktif" } });
    const akanBerakhir = await SewaAset.count({
      where: { status: "Akan Berakhir" },
    });
    const berakhir = await SewaAset.count({ where: { status: "Berakhir" } });
    const dikembalikan = await SewaAset.count({
      where: { status: "Dikembalikan" },
    });

    res.json({
      success: true,
      data: { total, aktif, akanBerakhir, berakhir, dikembalikan },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// GET PENGEMBALIAN - Only returned/ended rentals
// ================================
export const getPengembalian = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      kondisi,
      sortBy = "tanggal_pengembalian",
      sortOrder = "desc",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const where = {
      status: { [Op.in]: ["Dikembalikan", "Berakhir"] },
    };

    if (search) {
      where[Op.or] = [
        { nama_penyewa: { [Op.iLike]: `%${search}%` } },
        { nama_aset: { [Op.iLike]: `%${search}%` } },
        { nomor_kontrak: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (kondisi) {
      where.kondisi_pengembalian = kondisi;
    }

    const { rows: data, count: total } = await SewaAset.findAndCountAll({
      where,
      include: [
        {
          model: Aset,
          as: "aset",
          attributes: ["id_aset", "kode_aset", "nama_aset", "lokasi"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
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
    res.status(500).json({ error: error.message });
  }
};

// ================================
// CREATE - New rental
// ================================
export const create = async (req, res) => {
  try {
    const {
      id_aset,
      nama_aset,
      lokasi_aset,
      nama_penyewa,
      nik_penyewa,
      instansi_penyewa,
      alamat_penyewa,
      telepon_penyewa,
      email_penyewa,
      tanggal_mulai,
      tanggal_berakhir,
      nilai_sewa,
      periode_bayar,
      nomor_kontrak,
      file_kontrak,
      catatan,
    } = req.body;

    if (!nama_aset || !nama_penyewa || !tanggal_mulai || !tanggal_berakhir) {
      return res.status(400).json({
        error:
          "Nama aset, nama penyewa, tanggal mulai, dan tanggal berakhir wajib diisi",
      });
    }

    if (new Date(tanggal_berakhir) <= new Date(tanggal_mulai)) {
      return res.status(400).json({
        error: "Tanggal berakhir harus setelah tanggal mulai",
      });
    }

    const newSewa = await SewaAset.create({
      id_aset,
      nama_aset,
      lokasi_aset,
      nama_penyewa,
      nik_penyewa,
      instansi_penyewa,
      alamat_penyewa,
      telepon_penyewa,
      email_penyewa,
      tanggal_mulai,
      tanggal_berakhir,
      nilai_sewa: nilai_sewa || 0,
      periode_bayar: periode_bayar || "Tahunan",
      nomor_kontrak,
      file_kontrak,
      status: "Aktif",
      catatan,
      created_by: req.user.id_user,
    });

    res.status(201).json({ success: true, data: newSewa });
  } catch (error) {
    console.error("SewaAset create error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// UPDATE - Edit rental
// ================================
export const update = async (req, res) => {
  try {
    const sewa = await SewaAset.findByPk(req.params.id);
    if (!sewa) {
      return res.status(404).json({ error: "Data sewa tidak ditemukan" });
    }

    const {
      id_aset,
      nama_aset,
      lokasi_aset,
      nama_penyewa,
      nik_penyewa,
      instansi_penyewa,
      alamat_penyewa,
      telepon_penyewa,
      email_penyewa,
      tanggal_mulai,
      tanggal_berakhir,
      nilai_sewa,
      periode_bayar,
      nomor_kontrak,
      file_kontrak,
      status,
      catatan,
    } = req.body;

    await sewa.update({
      id_aset,
      nama_aset,
      lokasi_aset,
      nama_penyewa,
      nik_penyewa,
      instansi_penyewa,
      alamat_penyewa,
      telepon_penyewa,
      email_penyewa,
      tanggal_mulai,
      tanggal_berakhir,
      nilai_sewa,
      periode_bayar,
      nomor_kontrak,
      file_kontrak,
      status,
      catatan,
    });

    res.json({ success: true, data: sewa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// PROSES PENGEMBALIAN - Return asset
// ================================
export const prosesPengembalian = async (req, res) => {
  try {
    const sewa = await SewaAset.findByPk(req.params.id);
    if (!sewa) {
      return res.status(404).json({ error: "Data sewa tidak ditemukan" });
    }

    if (sewa.status === "Dikembalikan") {
      return res
        .status(400)
        .json({ error: "Aset sudah dikembalikan sebelumnya" });
    }

    const { tanggal_pengembalian, kondisi_pengembalian, catatan_pengembalian } =
      req.body;

    if (!tanggal_pengembalian || !kondisi_pengembalian) {
      return res.status(400).json({
        error: "Tanggal pengembalian dan kondisi pengembalian wajib diisi",
      });
    }

    await sewa.update({
      status: "Dikembalikan",
      tanggal_pengembalian,
      kondisi_pengembalian,
      catatan_pengembalian,
    });

    res.json({ success: true, data: sewa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// DELETE
// ================================
export const remove = async (req, res) => {
  try {
    const sewa = await SewaAset.findByPk(req.params.id);
    if (!sewa) {
      return res.status(404).json({ error: "Data sewa tidak ditemukan" });
    }

    await sewa.destroy();

    res.json({ success: true, message: "Data sewa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

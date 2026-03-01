import { PusatData, User } from "../models/index.js";
import { Op } from "sequelize";

// Get all pusat data with pagination, search, and filtering
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "created_at",
      sortOrder = "DESC",
      opd = "",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where[Op.or] = [
        { kode_barang: { [Op.iLike]: `%${search}%` } },
        { nama_barang: { [Op.iLike]: `%${search}%` } },
        { nibar: { [Op.iLike]: `%${search}%` } },
        { alamat: { [Op.iLike]: `%${search}%` } },
        { no_sertifikat: { [Op.iLike]: `%${search}%` } },
        { opd: { [Op.iLike]: `%${search}%` } },
        { pemegang: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (opd) {
      where.opd = { [Op.iLike]: `%${opd}%` };
    }

    const { count, rows } = await PusatData.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting pusat data:", error);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

// Get pusat data stats
export const getStats = async (req, res) => {
  try {
    const total = await PusatData.count();
    const totalNilai = await PusatData.sum("nilai_perolehan");
    const totalLuas = await PusatData.sum("luas");

    // Count by OPD
    const opdStats = await PusatData.findAll({
      attributes: [
        "opd",
        [
          PusatData.sequelize.fn(
            "COUNT",
            PusatData.sequelize.col("id_pusat_data"),
          ),
          "count",
        ],
        [
          PusatData.sequelize.fn(
            "SUM",
            PusatData.sequelize.col("nilai_perolehan"),
          ),
          "total_nilai",
        ],
      ],
      group: ["opd"],
      order: [
        [
          PusatData.sequelize.fn(
            "COUNT",
            PusatData.sequelize.col("id_pusat_data"),
          ),
          "DESC",
        ],
      ],
    });

    res.json({
      total,
      totalNilai: totalNilai || 0,
      totalLuas: totalLuas || 0,
      opdStats,
    });
  } catch (error) {
    console.error("Error getting pusat data stats:", error);
    res.status(500).json({ error: "Gagal mengambil statistik" });
  }
};

// Get single pusat data by ID
export const getById = async (req, res) => {
  try {
    const data = await PusatData.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    res.json({ data });
  } catch (error) {
    console.error("Error getting pusat data by id:", error);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

// Create new pusat data
export const create = async (req, res) => {
  try {
    const {
      kode_barang,
      nama_barang,
      nibar,
      luas,
      alamat,
      nilai_perolehan,
      no_sertifikat,
      tanggal,
      opd,
      pemegang,
    } = req.body;

    if (!kode_barang || !nama_barang) {
      return res
        .status(400)
        .json({ error: "Kode barang dan nama barang wajib diisi" });
    }

    const data = await PusatData.create({
      kode_barang,
      nama_barang,
      nibar,
      luas,
      alamat,
      nilai_perolehan,
      no_sertifikat,
      tanggal,
      opd,
      pemegang,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      message: "Data berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error("Error creating pusat data:", error);
    res.status(500).json({ error: "Gagal menambahkan data" });
  }
};

// Update pusat data
export const update = async (req, res) => {
  try {
    const data = await PusatData.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const {
      kode_barang,
      nama_barang,
      nibar,
      luas,
      alamat,
      nilai_perolehan,
      no_sertifikat,
      tanggal,
      opd,
      pemegang,
    } = req.body;

    await data.update({
      kode_barang: kode_barang ?? data.kode_barang,
      nama_barang: nama_barang ?? data.nama_barang,
      nibar: nibar ?? data.nibar,
      luas: luas ?? data.luas,
      alamat: alamat ?? data.alamat,
      nilai_perolehan: nilai_perolehan ?? data.nilai_perolehan,
      no_sertifikat: no_sertifikat ?? data.no_sertifikat,
      tanggal: tanggal ?? data.tanggal,
      opd: opd ?? data.opd,
      pemegang: pemegang ?? data.pemegang,
      updated_at: new Date(),
    });

    res.json({
      message: "Data berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("Error updating pusat data:", error);
    res.status(500).json({ error: "Gagal memperbarui data" });
  }
};

// Delete pusat data
export const remove = async (req, res) => {
  try {
    const data = await PusatData.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    await data.destroy();

    res.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting pusat data:", error);
    res.status(500).json({ error: "Gagal menghapus data" });
  }
};

const PusatDataController = {
  getAll,
  getStats,
  getById,
  create,
  update,
  remove,
};
export default PusatDataController;

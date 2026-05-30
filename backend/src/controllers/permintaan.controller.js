import { Op } from "sequelize";
import { PermintaanSewa, SewaAset } from "../models/index.js";

const PERIODE_BAYAR_OPTIONS = new Set([
  "Bulanan",
  "Triwulan",
  "Semester",
  "Tahunan",
  "Sekali Bayar",
]);

const normalizePeriodeBayar = (periode) =>
  PERIODE_BAYAR_OPTIONS.has(periode) ? periode : "Tahunan";

const STATUS_OPTIONS = new Set(["Baru", "Diproses", "Disetujui", "Ditolak"]);

const ensureMasyarakatColumns = async () => {
  await PermintaanSewa.sequelize.query(`
    ALTER TABLE "permintaan_sewa"
      ADD COLUMN IF NOT EXISTS "pemohon_user_id" INTEGER REFERENCES "users" ("id_user"),
      ADD COLUMN IF NOT EXISTS "pemohon_username" VARCHAR(50);
  `);
};

const pickPermintaanUpdate = (body) => {
  const fields = [
    "id_sewa",
    "nama_aset",
    "nama_pemohon",
    "nik",
    "no_telepon",
    "email",
    "alamat",
    "tujuan_sewa",
    "status",
    "catatan_admin",
    "dokumen_respon",
  ];

  return fields.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});
};

// ================================
// PUBLIC - Submit a rental request (no auth)
// ================================
export const submitRequest = async (req, res) => {
  try {
    await ensureMasyarakatColumns();

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
      pemohon_user_id: req.user?.id_user || null,
      pemohon_username: req.user?.username || null,
      tujuan_sewa,
    });

    res.status(201).json({ success: true, data: permintaan });
  } catch (error) {
    console.error("Submit request error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// MASYARAKAT - Submit request using logged-in account
// ================================
export const submitForMasyarakat = async (req, res) => {
  req.body = {
    ...req.body,
    nama_pemohon: req.body.nama_pemohon || req.user?.username,
  };
  return submitRequest(req, res);
};

// ================================
// MASYARAKAT - List own requests
// ================================
export const getForMasyarakat = async (req, res) => {
  try {
    await ensureMasyarakatColumns();

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where = { pemohon_username: req.user.username };

    if (search) {
      where[Op.or] = [
        { nama_aset: { [Op.iLike]: `%${search}%` } },
        { no_telepon: { [Op.iLike]: `%${search}%` } },
        { tujuan_sewa: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;

    const allowedSortFields = new Set(["created_at", "updated_at", "status", "nama_aset"]);
    const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : "created_at";
    const safeSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { rows: data, count: total } = await PermintaanSewa.findAndCountAll({
      where,
      include: [
        {
          model: SewaAset,
          as: "sewa",
          attributes: ["id_sewa", "nama_aset", "no_lot", "status", "foto_sewa"],
        },
      ],
      order: [[safeSortBy, safeSortOrder]],
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
    console.error("Masyarakat permintaan error:", error);
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
    const {
      status,
      catatan_admin,
      dokumen_respon,
      tanggal_mulai,
      tanggal_berakhir,
      nilai_sewa,
      periode_bayar,
    } = req.body;

    const permintaan = await PermintaanSewa.findByPk(id);
    if (!permintaan) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }

    // Validation: approval requires dokumen & periode sewa
    if (status === "Disetujui") {
      if (!dokumen_respon || dokumen_respon.length === 0) {
        return res
          .status(400)
          .json({
            error: "Dokumen lampiran wajib diisi untuk menyetujui permintaan",
          });
      }
      if (!tanggal_mulai || !tanggal_berakhir) {
        return res
          .status(400)
          .json({
            error:
              "Tanggal mulai dan berakhir sewa wajib diisi untuk menyetujui permintaan",
          });
      }
    }

    const updateData = { status };
    if (catatan_admin !== undefined) updateData.catatan_admin = catatan_admin;
    if (dokumen_respon !== undefined)
      updateData.dokumen_respon = dokumen_respon;

    await permintaan.update(updateData);

    // When approved, update linked SewaAset → "Disewakan" + transfer data
    if (status === "Disetujui" && permintaan.id_sewa) {
      const sewa = await SewaAset.findByPk(permintaan.id_sewa);
      if (sewa) {
        const sewaUpdate = { status: "Disewakan" };
        // Set rental period
        if (tanggal_mulai) sewaUpdate.tanggal_mulai = tanggal_mulai;
        if (tanggal_berakhir) sewaUpdate.tanggal_berakhir = tanggal_berakhir;
        if (nilai_sewa !== undefined) sewaUpdate.nilai_sewa = nilai_sewa;
        if (periode_bayar !== undefined) {
          sewaUpdate.periode_bayar = normalizePeriodeBayar(periode_bayar);
        }
        // Transfer pemohon data to penyewa fields if not already filled
        if (!sewa.nama_penyewa && permintaan.nama_pemohon)
          sewaUpdate.nama_penyewa = permintaan.nama_pemohon;
        if (!sewa.nik_penyewa && permintaan.nik)
          sewaUpdate.nik_penyewa = permintaan.nik;
        if (!sewa.telepon_penyewa && permintaan.no_telepon)
          sewaUpdate.telepon_penyewa = permintaan.no_telepon;
        if (!sewa.email_penyewa && permintaan.email)
          sewaUpdate.email_penyewa = permintaan.email;
        if (!sewa.alamat_penyewa && permintaan.alamat)
          sewaUpdate.alamat_penyewa = permintaan.alamat;
        await sewa.update(sewaUpdate);
      }
    }

    res.json({ success: true, data: permintaan });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================================
// UPDATE - Edit permintaan data (authenticated)
// ================================
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const permintaan = await PermintaanSewa.findByPk(id);

    if (!permintaan) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }

    const updateData = pickPermintaanUpdate(req.body);

    if (updateData.status && !STATUS_OPTIONS.has(updateData.status)) {
      return res.status(400).json({ error: "Status permintaan tidak valid" });
    }

    if (updateData.nama_aset !== undefined && !updateData.nama_aset) {
      return res.status(400).json({ error: "Nama aset wajib diisi" });
    }

    if (updateData.nama_pemohon !== undefined && !updateData.nama_pemohon) {
      return res.status(400).json({ error: "Nama pemohon wajib diisi" });
    }

    if (updateData.no_telepon !== undefined && !updateData.no_telepon) {
      return res.status(400).json({ error: "Nomor telepon wajib diisi" });
    }

    if (updateData.tujuan_sewa !== undefined && !updateData.tujuan_sewa) {
      return res.status(400).json({ error: "Tujuan sewa wajib diisi" });
    }

    await permintaan.update(updateData);

    res.json({ success: true, data: permintaan });
  } catch (error) {
    console.error("Update permintaan error:", error);
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

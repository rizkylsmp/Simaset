import { Op, Sequelize } from "sequelize";
import { Aset, User, SewaAset } from "../models/index.js";
import AuditService from "../services/audit.service.js";
import NotificationService from "../services/notification.service.js";
import { access, readFile } from "fs/promises";
import path from "path";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getGeometryPoints = (geometry) => {
  if (!geometry?.type || !geometry?.coordinates) return [];

  if (geometry.type === "Point") {
    return [geometry.coordinates];
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates?.[0] || [];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates?.[0]?.[0] || [];
  }

  return [];
};

const getCentroidFromGeometry = (geometry) => {
  const points = getGeometryPoints(geometry);
  if (!points.length) return { lat: null, lng: null };

  let sumLng = 0;
  let sumLat = 0;
  let count = 0;

  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const lng = toNumber(point[0]);
    const lat = toNumber(point[1]);
    if (lng === null || lat === null) continue;
    sumLng += lng;
    sumLat += lat;
    count += 1;
  }

  if (!count) return { lat: null, lng: null };
  return {
    lat: sumLat / count,
    lng: sumLng / count,
  };
};

const getPolygonLatLng = (geometry) => {
  const points = getGeometryPoints(geometry);
  if (!points.length) return null;

  const polygon = points
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const lng = toNumber(point[0]);
      const lat = toNumber(point[1]);
      if (lng === null || lat === null) return null;
      return [lat, lng];
    })
    .filter(Boolean);

  return polygon.length >= 3 ? polygon : null;
};

const resolveBpkadGeojsonPath = async () => {
  const candidates = [
    path.resolve(
      process.cwd(),
      "../frontend/public/data/bidang_tanah1.geojson",
    ),
    path.resolve(process.cwd(), "frontend/public/data/bidang_tanah1.geojson"),
    path.resolve(process.cwd(), "src/data/webgis/bidang_tanah1.geojson"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next path
    }
  }

  throw new Error("File WebGIS BPKA (bidang_tanah1.geojson) tidak ditemukan");
};

const ACTIVE_SEWA_STATUSES = ["Disewakan", "Akan Berakhir", "Aktif"];

const isActiveSewaStatus = (status) => ACTIVE_SEWA_STATUSES.includes(status);

const buildActiveSewaExistsCondition = (negated = false) => {
  const statuses = ACTIVE_SEWA_STATUSES.map((status) =>
    Aset.sequelize.escape(status),
  ).join(", ");

  return Sequelize.literal(`
    ${negated ? "NOT " : ""}EXISTS (
      SELECT 1
      FROM sewa_aset active_sewa
      WHERE active_sewa.id_aset = "Aset"."id_aset"
        AND active_sewa.status::text IN (${statuses})
    )
  `);
};

/**
 * Get all assets with pagination
 * GET /api/aset
 */
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      jenis_aset,
      tahun,
      kecamatan,
      desa_kelurahan,
      has_location,
      has_nibar,
      jenis_hak,
      opd_pengguna,
      sort = "created_at",
      order = "DESC",
      status_sewa,
      is_certified,
    } = req.query;

    // Build where clause
    const where = {};
    
    // Auto filter by role
    const isBPKA = req.user?.role === "bpka" || req.user?.role === "admin_bpka";
    where.sumber = isBPKA ? "BPKA" : "BPN";


    if (search) {
      where[Op.or] = [
        { nama_aset: { [Op.iLike]: `%${search}%` } },
        { kode_aset: { [Op.iLike]: `%${search}%` } },
        { lokasi: { [Op.iLike]: `%${search}%` } },
        { nibar: { [Op.iLike]: `%${search}%` } },
        { nomor_sertifikat: { [Op.iLike]: `%${search}%` } },
        { opd_pengguna: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (jenis_aset) where.jenis_aset = jenis_aset;
    if (tahun) where.tahun_perolehan = tahun;
    if (kecamatan) where.kecamatan = kecamatan;
    if (desa_kelurahan) where.desa_kelurahan = desa_kelurahan;
    if (jenis_hak) where.jenis_hak = jenis_hak;
    if (opd_pengguna) where.opd_pengguna = { [Op.iLike]: `%${opd_pengguna}%` };

    if (is_certified === "true") {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        { nomor_sertifikat: { [Op.ne]: null } },
        Aset.sequelize.where(Aset.sequelize.fn('char_length', Aset.sequelize.col('nomor_sertifikat')), '>', 10)
      );
    } else if (is_certified === "false") {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        {
          [Op.or]: [
            { nomor_sertifikat: null },
            { nomor_sertifikat: "" },
            Aset.sequelize.where(Aset.sequelize.fn('char_length', Aset.sequelize.col('nomor_sertifikat')), '<=', 10)
          ]
        }
      );
    }

    // Location filter
    if (has_location === "true") {
      where.koordinat_lat = { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: 0 }] };
      where.koordinat_long = { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: 0 }] };
    } else if (has_location === "false") {
      where[Op.and] = [
        ...(where[Op.and] || []),
        Sequelize.literal(
          "(koordinat_lat IS NULL OR CAST(koordinat_lat AS FLOAT) = 0)",
        ),
      ];
    }

    // NIBAR filter
    if (has_nibar === "true") {
      where.nibar = { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] };
    } else if (has_nibar === "false") {
      where.nibar = { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: "" }] };
    }

    if (status_sewa === "tersewa" || status_sewa === "tidak") {
      where[Op.and] = [
        ...(where[Op.and] || []),
        buildActiveSewaExistsCondition(status_sewa === "tidak"),
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get assets with pagination
    const { count, rows: assets } = await Aset.findAndCountAll({
      where,
      distinct: true,
      limit: parseInt(limit),
      offset,
      order: [[sort, order.toUpperCase()]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
        {
          model: SewaAset,
          as: "sewas",
          attributes: ["id_sewa", "status", "nama_penyewa", "tanggal_berakhir"],
          required: false,
        },
      ],
    });

    // Compute status_sewa for each asset
    const assetsWithSewa = assets.map((a) => {
      const plain = a.toJSON();
      const activeSewa = plain.sewas?.find((s) =>
        isActiveSewaStatus(s.status),
      );
      plain.status_sewa = activeSewa ? "Tersewa" : "Tidak Tersewa";
      if (activeSewa) {
        plain.penyewa_aktif = activeSewa.nama_penyewa;
        plain.sewa_berakhir = activeSewa.tanggal_berakhir;
      }
      delete plain.sewas;
      return plain;
    });

    // Filter by status_sewa if requested
    let finalData = assetsWithSewa;
    if (status_sewa === "tersewa") {
      finalData = assetsWithSewa.filter((a) => a.status_sewa === "Tersewa");
    } else if (status_sewa === "tidak") {
      finalData = assetsWithSewa.filter(
        (a) => a.status_sewa === "Tidak Tersewa",
      );
    }

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: finalData,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get distinct filter options from actual data
 * GET /api/aset/filter-options
 */
export const getFilterOptions = async (req, res) => {
  try {
    const kelurahanRows = await Aset.findAll({
      attributes: [
        [
          Sequelize.fn("DISTINCT", Sequelize.col("desa_kelurahan")),
          "desa_kelurahan",
        ],
      ],
      where: {
        desa_kelurahan: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        sumber: req.user?.role === "bpka" || req.user?.role === "admin_bpka" ? "BPKA" : "BPN"
      },
      order: [[Sequelize.col("desa_kelurahan"), "ASC"]],
      raw: true,
    });

    const kecamatanRows = await Aset.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("kecamatan")), "kecamatan"],
      ],
      where: {
        kecamatan: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        sumber: req.user?.role === "bpka" || req.user?.role === "admin_bpka" ? "BPKA" : "BPN"
      },
      order: [[Sequelize.col("kecamatan"), "ASC"]],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        kelurahan: kelurahanRows.map((r) => r.desa_kelurahan),
        kecamatan: kecamatanRows.map((r) => r.kecamatan),
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get asset statistics
 * GET /api/aset/stats
 */
export const getStats = async (req, res) => {
  try {
    const fn = Aset.sequelize.fn;
    const col = Aset.sequelize.col;
    const literal = Aset.sequelize.literal;

    const isBPKA = req.user?.role === "bpka" || req.user?.role === "admin_bpka";
    const sumberFilter = isBPKA ? "BPKA" : "BPN";

    const groupCount = (field) =>
      Aset.findAll({
        attributes: [field, [fn("COUNT", col(field)), "count"]],
        where: { [field]: { [Op.not]: null }, sumber: sumberFilter },
        group: [field],
        raw: true,
      }).then((rows) =>
        rows.reduce((acc, r) => {
          if (r[field] && r[field] !== "") acc[r[field]] = parseInt(r.count);
          return acc;
        }, {}),
      );

    const [
      totalAset,
      totalLuas,
      totalNilai,
      totalSertifikat,
      byStatus,
      byJenis,
      byJenisHak,
      byStatusHukum,
      byKecamatan,
      byJenisMasalah,
      byOpdPengguna,
      byPlottingStatus,
    ] = await Promise.all([
      Aset.count({ where: { sumber: sumberFilter } }),
      Aset.sum("luas", { where: { sumber: sumberFilter } }).then((v) => parseFloat(v || 0)),
      Aset.sum("nilai_aset", { where: { sumber: sumberFilter } }).then((v) => parseFloat(v || 0)),
      Aset.count({
        where: {
          sumber: sumberFilter,
          nomor_sertifikat: { [Op.ne]: null },
          [Op.and]: [
            Aset.sequelize.where(Aset.sequelize.fn('char_length', Aset.sequelize.col('nomor_sertifikat')), '>', 10)
          ]
        },
      }),
      Aset.findAll({
        attributes: ["status", [fn("COUNT", col("status")), "count"]],
        where: { sumber: sumberFilter },
        group: ["status"],
        raw: true,
      }).then((rows) =>
        rows.reduce((acc, r) => {
          acc[r.status] = parseInt(r.count);
          return acc;
        }, {}),
      ),
      groupCount("jenis_aset"),
      groupCount("jenis_hak"),
      groupCount("status_hukum"),
      groupCount("kecamatan"),
      groupCount("jenis_masalah"),
      groupCount("opd_pengguna"),
      groupCount("plotting_status"),
    ]);

    res.json({
      success: true,
      data: {
        totalAset,
        totalLuas,
        totalNilai,
        totalSertifikat,
        byStatus,
        byJenis,
        byJenisHak,
        byStatusHukum,
        byKecamatan,
        byJenisMasalah,
        byOpdPengguna,
        byPlottingStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Reset and sync BPKA assets from WebGIS GeoJSON
 * POST /api/aset/sync-bpka-webgis
 */
export const syncBpkadFromWebgis = async (req, res) => {
  try {
    const geojsonPath = await resolveBpkadGeojsonPath();
    const raw = await readFile(geojsonPath, "utf8");
    const geojson = JSON.parse(raw);
    const features = Array.isArray(geojson?.features) ? geojson.features : [];

    if (!features.length) {
      return res.status(400).json({
        success: false,
        error: "Data WebGIS kosong, tidak ada fitur untuk disinkronkan",
      });
    }

    const userId = req.user?.id_user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User tidak valid untuk proses sinkronisasi",
      });
    }

    const tx = await Aset.sequelize.transaction();
    try {
      const deletedCount = await Aset.destroy({
        where: { sumber: "BPKA" },
        transaction: tx,
      });

      const usedCodes = new Set();
      const now = new Date();
      const rows = [];

      for (let i = 0; i < features.length; i += 1) {
        const feature = features[i] || {};
        const props = feature.properties || {};
        const geometry = feature.geometry || null;

        const nibRaw = String(props.NIB || "").trim();
        const nibClean = nibRaw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const baseCode = nibClean
          ? `BPKA-${nibClean}`
          : `BPKA-${String(i + 1).padStart(4, "0")}`;
        let kodeAset = baseCode;
        let suffix = 1;
        while (usedCodes.has(kodeAset)) {
          kodeAset = `${baseCode}-${suffix}`;
          suffix += 1;
        }
        usedCodes.add(kodeAset);

        const kecamatan = (props.KECAMATAN || "").toString().trim() || null;
        const kelurahan = (props.KELURAHAN || "").toString().trim() || null;
        const penggunaan = (props.PENGGUNAAN || "").toString().trim() || null;
        const tipeHak = (props["TIPE HAK"] || "").toString().trim() || null;
        const keterangan = (props.KETERANGAN || "").toString().trim() || null;
        const luas = toNumber(props.LUAS);
        const { lat, lng } = getCentroidFromGeometry(geometry);
        const polygon = getPolygonLatLng(geometry);

        const lokasi = [kelurahan, kecamatan, "Kota Pasuruan"]
          .filter(Boolean)
          .join(", ");

        rows.push({
          kode_aset: kodeAset,
          nama_aset: penggunaan ? `Aset ${penggunaan}` : `Aset Pemkot ${i + 1}`,
          lokasi: lokasi || "Kota Pasuruan",
          koordinat_lat: lat,
          koordinat_long: lng,
          luas,
          status: "Aktif",
          jenis_aset: "Aset Pemkot (BPKA)",
          keterangan,
          jenis_hak: tipeHak,
          kecamatan,
          desa_kelurahan: kelurahan,
          luas_lapangan: luas,
          penggunaan_saat_ini: penggunaan,
          opd_pengguna: "BPKA",
          atas_nama: "Pemerintah Kota Pasuruan",
          nomor_sertifikat: nibRaw || null,
          polygon_bidang: polygon,
          sumber: "BPKA",
          created_by: userId,
          created_at: now,
          updated_at: now,
        });
      }

      await Aset.bulkCreate(rows, { transaction: tx });
      await tx.commit();

      return res.json({
        success: true,
        message: "Sinkronisasi data BPKA dari WebGIS berhasil",
        data: {
          sourceFile: geojsonPath,
          deletedCount,
          importedCount: rows.length,
        },
      });
    } catch (innerError) {
      await tx.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error("Error syncing BPKA WebGIS data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get assets for map display
 * GET /api/aset/map
 */
export const getForMap = async (req, res) => {
  try {
    const { status } = req.query;

    const isBPKA = req.user?.role === "bpka" || req.user?.role === "admin_bpka";
    const where = {
      sumber: isBPKA ? "BPKA" : "BPN",
      koordinat_lat: { [Op.ne]: null },
      koordinat_long: { [Op.ne]: null },
    };

    if (status) where.status = status;

    const assets = await Aset.findAll({
      where,
      attributes: [
        "id_aset",
        "kode_aset",
        "nama_aset",
        "lokasi",
        "koordinat_lat",
        "koordinat_long",
        "status",
        "luas",
        "jenis_aset",
      ],
    });

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching map assets:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get asset by ID
 * GET /api/aset/:id
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Aset.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
      ],
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Aset tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create new asset
 * POST /api/aset
 */
export const create = async (req, res) => {
  try {
    const {
      kode_aset,
      nama_aset,
      lokasi,
      koordinat_lat,
      koordinat_long,
      luas,
      status,
      jenis_masalah,
      jenis_aset,
      nilai_aset,
      tahun_perolehan,
      nomor_sertifikat,
      status_sertifikat,
      foto_aset,
      dokumen_pendukung,
      keterangan,
      // Data Legal
      jenis_hak,
      atas_nama,
      tanggal_sertifikat,
      riwayat_perolehan,
      status_hukum,
      // Data Fisik
      kecamatan,
      desa_kelurahan,
      luas_lapangan,
      batas_utara,
      batas_selatan,
      batas_timur,
      batas_barat,
      penggunaan_saat_ini,
      // Data Administratif
      kode_bmd,
      nilai_buku,
      nilai_njop,
      sk_penetapan,
      opd_pengguna,
      // Data Spasial
      polygon_bidang,
    } = req.body;

    // Validasi required fields
    if (!kode_aset || !nama_aset || !lokasi) {
      return res.status(400).json({
        success: false,
        error: "Kode aset, nama aset, dan lokasi wajib diisi",
      });
    }

    // Check if kode_aset already exists
    const existingAset = await Aset.findOne({ where: { kode_aset } });
    if (existingAset) {
      return res.status(400).json({
        success: false,
        error: "Kode aset sudah digunakan",
      });
    }

    const newAset = await Aset.create({
      kode_aset,
      nama_aset,
      lokasi,
      koordinat_lat: koordinat_lat || null,
      koordinat_long: koordinat_long || null,
      luas: luas || null,
      status: status || "Aktif",
      jenis_masalah: jenis_masalah || null,
      jenis_aset: jenis_aset || null,
      nilai_aset: nilai_aset || null,
      tahun_perolehan: tahun_perolehan || null,
      nomor_sertifikat: nomor_sertifikat || null,
      status_sertifikat: status_sertifikat || null,
      foto_aset: foto_aset || null,
      dokumen_pendukung: dokumen_pendukung || null,
      keterangan: keterangan || null,
      // Data Legal
      jenis_hak: jenis_hak || null,
      atas_nama: atas_nama || null,
      tanggal_sertifikat: tanggal_sertifikat || null,
      riwayat_perolehan: riwayat_perolehan || null,
      status_hukum: status_hukum || null,
      // Data Fisik
      kecamatan: kecamatan || null,
      desa_kelurahan: desa_kelurahan || null,
      luas_lapangan: luas_lapangan || null,
      batas_utara: batas_utara || null,
      batas_selatan: batas_selatan || null,
      batas_timur: batas_timur || null,
      batas_barat: batas_barat || null,
      penggunaan_saat_ini: penggunaan_saat_ini || null,
      // Data Administratif
      kode_bmd: kode_bmd || null,
      nilai_buku: nilai_buku || null,
      nilai_njop: nilai_njop || null,
      sk_penetapan: sk_penetapan || null,
      opd_pengguna: opd_pengguna || null,
      // Data Spasial
      polygon_bidang: polygon_bidang || null,
      sumber: (req.user?.role === "bpka" || req.user?.role === "admin_bpka") ? "BPKA" : "BPN",
      created_by: req.user.id_user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Log audit
    await AuditService.logCreate({
      tabel: "aset",
      id_referensi: newAset.id_aset,
      data_baru: newAset.toJSON(),
      keterangan: `Menambahkan aset baru: ${newAset.nama_aset}`,
      user_id: req.user.id_user,
      req,
    });

    // Send notification
    const creator = await User.findByPk(req.user.id_user);
    await NotificationService.notifyAsetCreated(
      newAset.toJSON(),
      creator?.nama_lengkap || req.user.username,
    );

    res.status(201).json({
      success: true,
      message: "Aset berhasil ditambahkan",
      data: newAset,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update asset
 * PUT /api/aset/:id
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await Aset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Aset tidak ditemukan",
      });
    }

    // If kode_aset is being changed, check if new one already exists
    if (updateData.kode_aset && updateData.kode_aset !== asset.kode_aset) {
      const existingAset = await Aset.findOne({
        where: { kode_aset: updateData.kode_aset },
      });
      if (existingAset) {
        return res.status(400).json({
          success: false,
          error: "Kode aset sudah digunakan",
        });
      }
    }

    // Update timestamp
    updateData.updated_at = new Date();

    // Store old data for audit
    const oldData = asset.toJSON();

    await asset.update(updateData);

    // Fetch updated asset with creator info
    const updatedAsset = await Aset.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id_user", "nama_lengkap", "username"],
        },
      ],
    });

    // Log audit
    await AuditService.logUpdate({
      tabel: "aset",
      id_referensi: parseInt(id),
      data_lama: oldData,
      data_baru: updatedAsset.toJSON(),
      keterangan: `Memperbarui aset: ${updatedAsset.nama_aset}`,
      user_id: req.user.id_user,
      req,
    });

    // Send notification if status changed
    const updater = await User.findByPk(req.user.id_user);
    const updaterName = updater?.nama_lengkap || req.user.username;

    if (updateData.status && updateData.status !== oldData.status) {
      await NotificationService.notifyAsetStatusChanged(
        updatedAsset.toJSON(),
        oldData.status,
        updateData.status,
        updaterName,
      );
    } else {
      // General update notification - notify both admins
      for (const role of ["admin_bpka", "admin_bpn"]) {
        await NotificationService.sendToRole({
          role,
          judul: "Aset Diperbarui",
          pesan: `Aset "${updatedAsset.nama_aset}" (${updatedAsset.kode_aset}) telah diperbarui oleh ${updaterName}`,
          tipe: "info",
          kategori: "aset",
          referensi_id: updatedAsset.id_aset,
          referensi_tabel: "aset",
        });
      }
    }

    res.json({
      success: true,
      message: "Aset berhasil diperbarui",
      data: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete asset
 * DELETE /api/aset/:id
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Aset.findByPk(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Aset tidak ditemukan",
      });
    }

    // Store data for audit before delete
    const deletedData = asset.toJSON();

    await asset.destroy();

    // Log audit
    await AuditService.logDelete({
      tabel: "aset",
      id_referensi: parseInt(id),
      data_lama: deletedData,
      keterangan: `Menghapus aset: ${deletedData.nama_aset}`,
      user_id: req.user.id_user,
      req,
    });

    // Send notification
    const deleter = await User.findByPk(req.user.id_user);
    await NotificationService.notifyAsetDeleted(
      deletedData,
      deleter?.nama_lengkap || req.user.username,
    );

    res.json({
      success: true,
      message: "Aset berhasil dihapus",
      data: { id_aset: parseInt(id) },
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

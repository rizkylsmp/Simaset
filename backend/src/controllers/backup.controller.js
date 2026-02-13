import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import { Aset, User, Riwayat, sequelize } from "../models/index.js";
import AuditService from "../services/audit.service.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const BACKUP_DIR = path.join(__dirname, "../../backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get backup statistics
 * GET /api/backup/stats
 */
export const getStats = async (req, res) => {
  try {
    // Count records in each table
    const [asetCount, userCount, riwayatCount] = await Promise.all([
      Aset.count(),
      User.count(),
      Riwayat.count(),
    ]);

    // Get backup files info
    let backupFiles = [];
    if (fs.existsSync(BACKUP_DIR)) {
      backupFiles = fs
        .readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((f) => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            filename: f,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        });
    }

    res.json({
      success: true,
      data: {
        database: {
          totalAset: asetCount,
          totalUser: userCount,
          totalRiwayat: riwayatCount,
        },
        backups: {
          total: backupFiles.length,
          totalSize: backupFiles.reduce((acc, f) => acc + f.size, 0),
          lastBackup:
            backupFiles.length > 0
              ? backupFiles.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                )[0]
              : null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching backup stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * List all backups
 * GET /api/backup
 */
export const getAll = async (req, res) => {
  try {
    let backups = [];

    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs
        .readdirSync(BACKUP_DIR)
        .filter((f) => f.endsWith(".json"));

      backups = files
        .map((filename, index) => {
          const filePath = path.join(BACKUP_DIR, filename);
          const stats = fs.statSync(filePath);

          // Parse filename: backup_YYYY-MM-DD_HHmmss_username.json
          const parts = filename.replace(".json", "").split("_");
          const createdBy =
            parts.length > 3 ? parts.slice(3).join("_") : "unknown";

          return {
            id: index + 1,
            filename,
            size: formatFileSize(stats.size),
            sizeBytes: stats.size,
            createdAt: stats.birthtime,
            createdBy,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      data: backups,
    });
  } catch (error) {
    console.error("Error listing backups:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Export data to JSON
 * POST /api/backup/export
 */
export const exportData = async (req, res) => {
  try {
    const { tables = ["aset"] } = req.body;

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username,
      version: "1.0",
      tables: {},
    };

    // Export requested tables
    if (tables.includes("aset")) {
      exportData.tables.aset = await Aset.findAll({ raw: true });
    }
    if (tables.includes("user")) {
      // Exclude password for security
      exportData.tables.user = await User.findAll({
        attributes: { exclude: ["password"] },
        raw: true,
      });
    }
    if (tables.includes("riwayat")) {
      exportData.tables.riwayat = await Riwayat.findAll({ raw: true });
    }

    // Generate filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `backup_${timestamp}_${req.user.username}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

    // Log audit
    await AuditService.log({
      aksi: "CREATE",
      tabel: "backup",
      keterangan: `Export backup: ${filename}`,
      data_baru: { tables, filename },
      user_id: req.user.id_user,
      req,
    });

    res.json({
      success: true,
      message: "Backup berhasil dibuat",
      data: {
        filename,
        tables: Object.keys(exportData.tables),
        recordCounts: Object.fromEntries(
          Object.entries(exportData.tables).map(([k, v]) => [k, v.length]),
        ),
        createdAt: exportData.exportedAt,
        createdBy: req.user.username,
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Upload a backup file (raw JSON) to the server
 * POST /api/backup/upload
 */
export const upload = async (req, res) => {
  try {
    const { data, filename: customFilename } = req.body;

    if (!data || !data.tables || !data.version) {
      return res.status(400).json({
        success: false,
        error:
          "Format data backup tidak valid. Harus memiliki 'tables' dan 'version'.",
      });
    }

    // Generate filename or use custom one
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename =
      customFilename || `backup_${timestamp}_${req.user.username}.json`;

    // Sanitize filename
    const safeFilename = path.basename(filename);
    const filePath = path.join(BACKUP_DIR, safeFilename);

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: "File backup berhasil diupload",
      data: {
        filename: safeFilename,
        size: formatFileSize(fs.statSync(filePath).size),
      },
    });
  } catch (error) {
    console.error("Error uploading backup:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Import data from JSON
 * POST /api/backup/import
 */
export const importData = async (req, res) => {
  try {
    const { filename, options = {} } = req.body;
    const { overwrite = false, tables = ["aset"] } = options;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: "Filename diperlukan",
      });
    }

    const filePath = path.join(BACKUP_DIR, filename);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(BACKUP_DIR)) {
      return res.status(403).json({
        success: false,
        error: "Akses tidak diizinkan",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File backup tidak ditemukan",
      });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const importDataContent = JSON.parse(fileContent);

    const results = {
      imported: {},
      skipped: {},
      errors: [],
    };

    // Use transaction for data integrity
    const transaction = await sequelize.transaction();

    try {
      // Import aset data
      if (tables.includes("aset") && importDataContent.tables?.aset) {
        if (overwrite) {
          await Aset.destroy({ where: {}, transaction });
        }

        let imported = 0;
        let skipped = 0;

        for (const aset of importDataContent.tables.aset) {
          try {
            const { id_aset, ...asetData } = aset;

            if (!overwrite) {
              const existing = await Aset.findOne({
                where: { nama_aset: asetData.nama_aset },
                transaction,
              });
              if (existing) {
                skipped++;
                continue;
              }
            }

            await Aset.create(asetData, { transaction });
            imported++;
          } catch (err) {
            results.errors.push(`Aset: ${err.message}`);
          }
        }

        results.imported.aset = imported;
        results.skipped.aset = skipped;
      }

      // Import user data
      if (tables.includes("user") && importDataContent.tables?.user) {
        if (overwrite) {
          // Keep current admin user, delete the rest
          await User.destroy({
            where: { id_user: { [Op.ne]: req.user.id_user } },
            transaction,
          });
        }

        let imported = 0;
        let skipped = 0;

        for (const userData of importDataContent.tables.user) {
          try {
            const { id_user, password, ...safeUserData } = userData;

            // Skip current admin user
            if (userData.username === req.user.username) {
              skipped++;
              continue;
            }

            if (!overwrite) {
              const existing = await User.findOne({
                where: { username: safeUserData.username },
                transaction,
              });
              if (existing) {
                skipped++;
                continue;
              }
            }

            await User.create(safeUserData, { transaction });
            imported++;
          } catch (err) {
            results.errors.push(`User: ${err.message}`);
          }
        }

        results.imported.user = imported;
        results.skipped.user = skipped;
      }

      // Import riwayat data
      if (tables.includes("riwayat") && importDataContent.tables?.riwayat) {
        if (overwrite) {
          await Riwayat.destroy({ where: {}, transaction });
        }

        let imported = 0;
        let skipped = 0;

        for (const riwayat of importDataContent.tables.riwayat) {
          try {
            const { id_riwayat, ...riwayatData } = riwayat;

            await Riwayat.create(riwayatData, { transaction });
            imported++;
          } catch (err) {
            results.errors.push(`Riwayat: ${err.message}`);
          }
        }

        results.imported.riwayat = imported;
        results.skipped.riwayat = skipped;
      }

      await transaction.commit();

      // Log audit
      await AuditService.log({
        aksi: "CREATE",
        tabel: "backup",
        keterangan: `Import dari backup: ${filename}`,
        data_baru: { filename, options, results },
        user_id: req.user.id_user,
        req,
      });

      res.json({
        success: true,
        message: "Import berhasil",
        data: results,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error importing backup:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Download backup file
 * GET /api/backup/download/:filename
 */
export const download = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File backup tidak ditemukan",
      });
    }

    // Security check - prevent directory traversal
    if (!filePath.startsWith(BACKUP_DIR)) {
      return res.status(403).json({
        success: false,
        error: "Akses tidak diizinkan",
      });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error("Error downloading backup:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete backup file
 * DELETE /api/backup/:filename
 */
export const remove = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File backup tidak ditemukan",
      });
    }

    // Security check
    if (!filePath.startsWith(BACKUP_DIR)) {
      return res.status(403).json({
        success: false,
        error: "Akses tidak diizinkan",
      });
    }

    fs.unlinkSync(filePath);

    // Log audit
    await AuditService.log({
      aksi: "DELETE",
      tabel: "backup",
      keterangan: `Hapus backup: ${filename}`,
      data_lama: { filename },
      user_id: req.user.id_user,
      req,
    });

    res.json({
      success: true,
      message: "Backup berhasil dihapus",
      data: { filename },
    });
  } catch (error) {
    console.error("Error deleting backup:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Export aset to CSV
 * POST /api/backup/export-csv
 */
export const exportCsv = async (req, res) => {
  try {
    const asetList = await Aset.findAll({ raw: true });

    if (asetList.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tidak ada data aset untuk diexport",
      });
    }

    // Generate CSV
    const headers = Object.keys(asetList[0]);
    const csvRows = [
      headers.join(","),
      ...asetList.map((row) =>
        headers
          .map((h) => {
            let val = row[h];
            if (val === null || val === undefined) val = "";
            if (
              typeof val === "string" &&
              (val.includes(",") || val.includes('"') || val.includes("\n"))
            ) {
              val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(","),
      ),
    ];
    const csvContent = csvRows.join("\n");

    // Set headers for CSV download
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `aset_export_${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

import express from "express";
import { 
  authMiddleware, 
  permissionMiddleware,
  PERMISSIONS,
  canManageAset,
  canViewAset,
  canViewFullData
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Semua route memerlukan authentication
router.use(authMiddleware);

// ===========================================
// GET /api/aset - Get all assets
// Akses: Semua role yang terautentikasi
// Note: Response di-filter berdasarkan role
// ===========================================
router.get("/", canViewAset, async (req, res) => {
  try {
    // TODO: Implement dengan Sequelize
    // const assets = await Aset.findAll();
    
    // Filter data berdasarkan role
    // - masyarakat: hanya data publik (nama, lokasi umum)
    // - bpn, tata_ruang: data lengkap tapi read-only
    // - admin, dinas_aset: full data
    
    res.json({ 
      message: "Get all assets",
      role: req.user.role,
      permissions: req.user.permissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /api/aset/:id - Get asset by ID
// Akses: Semua role yang terautentikasi
// ===========================================
router.get("/:id", canViewAset, async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement
    
    res.json({ 
      message: `Get asset ${id}`,
      role: req.user.role 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /api/aset - Create new asset
// Akses: Admin, Dinas Aset only
// ===========================================
router.post("/", 
  permissionMiddleware(PERMISSIONS.ASET_CREATE),
  async (req, res) => {
    try {
      // TODO: Implement
      
      res.status(201).json({ 
        message: "Asset created",
        createdBy: req.user.username
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/aset/:id - Update asset
// Akses: Admin, Dinas Aset only
// ===========================================
router.put("/:id", 
  permissionMiddleware(PERMISSIONS.ASET_UPDATE),
  async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Implement
      
      res.json({ 
        message: `Asset ${id} updated`,
        updatedBy: req.user.username
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// DELETE /api/aset/:id - Delete asset
// Akses: Admin, Dinas Aset only
// ===========================================
router.delete("/:id", 
  permissionMiddleware(PERMISSIONS.ASET_DELETE),
  async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Implement
      
      res.json({ 
        message: `Asset ${id} deleted`,
        deletedBy: req.user.username
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

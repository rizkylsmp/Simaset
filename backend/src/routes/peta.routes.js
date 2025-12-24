import express from "express";
import { 
  authMiddleware, 
  permissionMiddleware,
  anyPermissionMiddleware,
  PERMISSIONS,
  hasPermission
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Semua route memerlukan authentication
router.use(authMiddleware);

// ===========================================
// GET /api/peta/layers - Get available layers for user
// Akses: Semua role (response berbeda per role)
// ===========================================
router.get("/layers", async (req, res) => {
  try {
    const { role } = req.user;
    
    // Build available layers based on role permissions
    const layers = [];
    
    // Layer Umum - semua role
    if (hasPermission(role, PERMISSIONS.LAYER_UMUM)) {
      layers.push({
        id: 'umum',
        name: 'Layer Umum',
        description: 'Peta dasar dengan lokasi aset',
        enabled: true
      });
    }
    
    // Layer Tata Ruang - admin, dinas_aset, bpn
    if (hasPermission(role, PERMISSIONS.LAYER_TATA_RUANG)) {
      layers.push({
        id: 'tata_ruang',
        name: 'Rencana Tata Ruang',
        description: 'Layer rencana tata ruang wilayah',
        enabled: true
      });
    }
    
    // Layer Potensi Berperkara - admin, dinas_aset, bpn, tata_ruang
    if (hasPermission(role, PERMISSIONS.LAYER_POTENSI_BERPERKARA)) {
      layers.push({
        id: 'potensi_berperkara',
        name: 'Potensi Aset Berperkara',
        description: 'Layer aset dengan potensi sengketa/perkara',
        enabled: true
      });
    }
    
    // Layer Sebaran Perkara - admin, tata_ruang
    if (hasPermission(role, PERMISSIONS.LAYER_SEBARAN_PERKARA)) {
      layers.push({
        id: 'sebaran_perkara',
        name: 'Sebaran Perkara',
        description: 'Layer sebaran kasus perkara tanah',
        enabled: true
      });
    }
    
    res.json({ 
      role,
      layers,
      totalLayers: layers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /api/peta/layer/:layerId - Get layer data
// Akses: Berdasarkan permission layer masing-masing
// ===========================================
router.get("/layer/umum", 
  permissionMiddleware(PERMISSIONS.LAYER_UMUM),
  async (req, res) => {
    try {
      // TODO: Return layer umum data
      res.json({ 
        layer: 'umum',
        data: [],
        message: 'Layer umum - semua aset dasar'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/layer/tata_ruang", 
  permissionMiddleware(PERMISSIONS.LAYER_TATA_RUANG),
  async (req, res) => {
    try {
      // TODO: Return layer tata ruang data
      res.json({ 
        layer: 'tata_ruang',
        data: [],
        message: 'Layer rencana tata ruang'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/layer/potensi_berperkara", 
  permissionMiddleware(PERMISSIONS.LAYER_POTENSI_BERPERKARA),
  async (req, res) => {
    try {
      // TODO: Return layer potensi berperkara
      res.json({ 
        layer: 'potensi_berperkara',
        data: [],
        message: 'Layer potensi aset berperkara'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/layer/sebaran_perkara", 
  permissionMiddleware(PERMISSIONS.LAYER_SEBARAN_PERKARA),
  async (req, res) => {
    try {
      // TODO: Return layer sebaran perkara
      res.json({ 
        layer: 'sebaran_perkara',
        data: [],
        message: 'Layer sebaran perkara'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// GET /api/peta/markers - Get map markers
// Akses: Semua role dengan PETA_VIEW permission
// ===========================================
router.get("/markers", 
  permissionMiddleware(PERMISSIONS.PETA_VIEW),
  async (req, res) => {
    try {
      // TODO: Return markers data
      res.json({ 
        markers: [],
        role: req.user.role
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

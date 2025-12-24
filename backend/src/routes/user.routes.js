import express from "express";
import User from "../models/User.js";
import { 
  authMiddleware, 
  permissionMiddleware,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissions
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Semua route memerlukan authentication
router.use(authMiddleware);

// ===========================================
// GET /api/users - Get all users
// Akses: Admin only
// ===========================================
router.get("/", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      
      res.json({ 
        message: "Get all users",
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// GET /api/users/roles - Get available roles with permissions
// Akses: Admin only
// ===========================================
router.get("/roles", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const roles = Object.keys(ROLE_PERMISSIONS).map(role => ({
        role,
        permissions: ROLE_PERMISSIONS[role],
        permissionCount: ROLE_PERMISSIONS[role].length
      }));
      
      res.json({ roles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// GET /api/users/:id - Get user by ID
// Akses: Admin only
// ===========================================
router.get("/:id", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      
      res.json({ 
        data: user,
        permissions: getPermissions(user.role)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// POST /api/users - Create new user
// Akses: Admin only
// ===========================================
router.post("/", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { username, password, nama_lengkap, email, role, instansi } = req.body;
      
      // Validate required fields
      if (!username || !password || !nama_lengkap || !role) {
        return res.status(400).json({ 
          error: "Username, password, nama lengkap, dan role wajib diisi" 
        });
      }
      
      // Check if username exists
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ error: "Username sudah digunakan" });
      }
      
      // Validate role
      if (!ROLE_PERMISSIONS[role]) {
        return res.status(400).json({ 
          error: "Role tidak valid",
          validRoles: Object.keys(ROLE_PERMISSIONS)
        });
      }
      
      const user = await User.create({
        username,
        password,
        nama_lengkap,
        email,
        role,
        instansi,
        status_aktif: true
      });
      
      res.status(201).json({ 
        message: "User berhasil dibuat",
        data: {
          id_user: user.id_user,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/users/:id - Update user
// Akses: Admin only
// ===========================================
router.put("/:id", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_lengkap, email, role, instansi, status_aktif } = req.body;
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      
      // Validate role if provided
      if (role && !ROLE_PERMISSIONS[role]) {
        return res.status(400).json({ 
          error: "Role tidak valid",
          validRoles: Object.keys(ROLE_PERMISSIONS)
        });
      }
      
      await user.update({
        nama_lengkap: nama_lengkap || user.nama_lengkap,
        email: email !== undefined ? email : user.email,
        role: role || user.role,
        instansi: instansi !== undefined ? instansi : user.instansi,
        status_aktif: status_aktif !== undefined ? status_aktif : user.status_aktif
      });
      
      res.json({ 
        message: "User berhasil diupdate",
        data: {
          id_user: user.id_user,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          email: user.email,
          status_aktif: user.status_aktif
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/users/:id/password - Reset user password
// Akses: Admin only
// ===========================================
router.put("/:id/password", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
          error: "Password minimal 6 karakter" 
        });
      }
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      
      user.password = newPassword;
      await user.save();
      
      res.json({ 
        message: "Password berhasil direset",
        userId: user.id_user
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// DELETE /api/users/:id - Delete user
// Akses: Admin only (cannot delete self)
// ===========================================
router.delete("/:id", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent self-deletion
      if (parseInt(id) === req.user.id_user) {
        return res.status(400).json({ 
          error: "Tidak dapat menghapus akun sendiri" 
        });
      }
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      
      await user.destroy();
      
      res.json({ 
        message: "User berhasil dihapus",
        deletedUserId: id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/users/:id/toggle-status - Toggle user active status
// Akses: Admin only
// ===========================================
router.put("/:id/toggle-status", 
  permissionMiddleware(PERMISSIONS.USER_MANAGE),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent self-deactivation
      if (parseInt(id) === req.user.id_user) {
        return res.status(400).json({ 
          error: "Tidak dapat menonaktifkan akun sendiri" 
        });
      }
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }
      
      user.status_aktif = !user.status_aktif;
      await user.save();
      
      res.json({ 
        message: `User berhasil ${user.status_aktif ? 'diaktifkan' : 'dinonaktifkan'}`,
        userId: user.id_user,
        status_aktif: user.status_aktif
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

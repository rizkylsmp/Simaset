import express from "express";
import { 
  authMiddleware, 
  permissionMiddleware,
  PERMISSIONS
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Semua route memerlukan authentication
router.use(authMiddleware);

// ===========================================
// GET /api/notifikasi - Get notifications for current user
// Akses: Semua role dengan NOTIFIKASI_VIEW permission
// ===========================================
router.get("/", 
  permissionMiddleware(PERMISSIONS.NOTIFIKASI_VIEW),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      // TODO: Implement dengan Sequelize
      // Filter notifications for current user
      
      res.json({ 
        message: "Get notifications",
        userId: req.user.id_user,
        pagination: { page, limit },
        data: []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// GET /api/notifikasi/unread-count - Get unread count
// Akses: Semua role dengan NOTIFIKASI_VIEW permission
// ===========================================
router.get("/unread-count", 
  permissionMiddleware(PERMISSIONS.NOTIFIKASI_VIEW),
  async (req, res) => {
    try {
      // TODO: Count unread notifications
      
      res.json({ 
        count: 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/notifikasi/:id/read - Mark as read
// Akses: Semua role dengan NOTIFIKASI_VIEW permission
// ===========================================
router.put("/:id/read", 
  permissionMiddleware(PERMISSIONS.NOTIFIKASI_VIEW),
  async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Mark notification as read
      
      res.json({ 
        message: `Notification ${id} marked as read`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// PUT /api/notifikasi/read-all - Mark all as read
// Akses: Semua role dengan NOTIFIKASI_VIEW permission
// ===========================================
router.put("/read-all", 
  permissionMiddleware(PERMISSIONS.NOTIFIKASI_VIEW),
  async (req, res) => {
    try {
      // TODO: Mark all notifications as read for current user
      
      res.json({ 
        message: "All notifications marked as read"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ===========================================
// DELETE /api/notifikasi/:id - Delete notification
// Akses: Semua role dengan NOTIFIKASI_VIEW permission
// ===========================================
router.delete("/:id", 
  permissionMiddleware(PERMISSIONS.NOTIFIKASI_VIEW),
  async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Delete notification (only if belongs to user)
      
      res.json({ 
        message: `Notification ${id} deleted`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

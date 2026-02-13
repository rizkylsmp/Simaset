import jwt from "jsonwebtoken";

// ===========================================
// ROLE PERMISSIONS berdasarkan Use Case Diagram
// ===========================================
//
// Admin Kantor Pertanahan (admin):
//   - Full access ke semua fitur
//   - Backup & restore data
//   - Mengelola user
//
// BPKAD (bpkad):
//   - Input aset baru (Pusat Data / CRUD)
//   - Sewa aset
//   - Penilaian aset
//   - Melihat peta
//   - Melihat riwayat
//
// Badan Pertanahan Nasional (bpn):
//   - Edit Data Legal
//   - Edit Data Fisik
//   - Edit Data Administratif / Keuangan
//   - Edit Data Spasial
//   - Melihat peta
//
// ===========================================

// Permission constants
export const PERMISSIONS = {
  // Aset Management
  ASET_CREATE: "aset:create",
  ASET_READ: "aset:read",
  ASET_READ_ALL: "aset:read_all",
  ASET_UPDATE: "aset:update",
  ASET_DELETE: "aset:delete",

  // Peta/Map Layers
  PETA_VIEW: "peta:view",
  LAYER_UMUM: "layer:umum",
  LAYER_TATA_RUANG: "layer:tata_ruang",
  LAYER_POTENSI_BERPERKARA: "layer:potensi_berperkara",
  LAYER_SEBARAN_PERKARA: "layer:sebaran_perkara",

  // System Features
  RIWAYAT_VIEW: "riwayat:view",
  NOTIFIKASI_VIEW: "notifikasi:view",
  BACKUP_MANAGE: "backup:manage",
  USER_MANAGE: "user:manage",

  // Dashboard
  DASHBOARD_FULL: "dashboard:full",
  DASHBOARD_LIMITED: "dashboard:limited",
};

// Role-Permission mapping berdasarkan Use Case
// Note: Masyarakat/Public tidak perlu login - akses via /peta-publik
export const ROLE_PERMISSIONS = {
  admin: [
    // Full access to everything
    PERMISSIONS.ASET_CREATE,
    PERMISSIONS.ASET_READ,
    PERMISSIONS.ASET_READ_ALL,
    PERMISSIONS.ASET_UPDATE,
    PERMISSIONS.ASET_DELETE,
    PERMISSIONS.PETA_VIEW,
    PERMISSIONS.LAYER_UMUM,
    PERMISSIONS.LAYER_TATA_RUANG,
    PERMISSIONS.LAYER_POTENSI_BERPERKARA,
    PERMISSIONS.LAYER_SEBARAN_PERKARA,
    PERMISSIONS.RIWAYAT_VIEW,
    PERMISSIONS.NOTIFIKASI_VIEW,
    PERMISSIONS.BACKUP_MANAGE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.DASHBOARD_FULL,
  ],

  bpkad: [
    // Input aset (CRUD), Sewa aset, Penilaian aset
    PERMISSIONS.ASET_CREATE,
    PERMISSIONS.ASET_READ,
    PERMISSIONS.ASET_READ_ALL,
    PERMISSIONS.ASET_UPDATE,
    PERMISSIONS.ASET_DELETE,
    // Melihat peta
    PERMISSIONS.PETA_VIEW,
    PERMISSIONS.LAYER_UMUM,
    PERMISSIONS.LAYER_TATA_RUANG,
    PERMISSIONS.LAYER_POTENSI_BERPERKARA,
    // Riwayat & notifikasi
    PERMISSIONS.RIWAYAT_VIEW,
    PERMISSIONS.NOTIFIKASI_VIEW,
    PERMISSIONS.DASHBOARD_FULL,
  ],

  bpn: [
    // Edit Data Legal, Fisik, Administratif, Spasial
    PERMISSIONS.ASET_READ,
    PERMISSIONS.ASET_READ_ALL,
    PERMISSIONS.ASET_UPDATE,
    // Melihat peta
    PERMISSIONS.PETA_VIEW,
    PERMISSIONS.LAYER_UMUM,
    PERMISSIONS.LAYER_TATA_RUANG,
    PERMISSIONS.LAYER_POTENSI_BERPERKARA,
    // Notifikasi
    PERMISSIONS.NOTIFIKASI_VIEW,
    PERMISSIONS.DASHBOARD_LIMITED,
  ],
};

// ===========================================
// MIDDLEWARE FUNCTIONS
// ===========================================

/**
 * Authentication middleware - verify JWT token
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Normalize role to lowercase for permission checking
    const normalizedRole = decoded.role?.toLowerCase();
    req.user.normalizedRole = normalizedRole;

    // Attach user permissions
    req.user.permissions = ROLE_PERMISSIONS[normalizedRole] || [];

    next();
  } catch (error) {
    res.status(401).json({ error: "Token tidak valid atau sudah expired" });
  }
};

/**
 * Allow expired tokens within a grace period (for refresh-token endpoint)
 * Accepts tokens expired up to 5 minutes ago
 */
export const expiredTokenMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token tidak ditemukan" });
    }

    // First try normal verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // If expired, decode ignoring expiration but check grace period
      if (err.name === "TokenExpiredError") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        // Allow up to 5 minutes after expiry
        const expiredAt = decoded.exp * 1000;
        const gracePeriod = 5 * 60 * 1000;
        if (Date.now() - expiredAt > gracePeriod) {
          return res.status(401).json({ error: "Token sudah expired terlalu lama" });
        }
        req.user = decoded;
      } else {
        throw err;
      }
    }

    const normalizedRole = req.user.role?.toLowerCase();
    req.user.normalizedRole = normalizedRole;
    req.user.permissions = ROLE_PERMISSIONS[normalizedRole] || [];

    next();
  } catch (error) {
    res.status(401).json({ error: "Token tidak valid" });
  }
};

/**
 * Role-based middleware - check if user has one of allowed roles
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use normalized role for comparison
    const userRole = req.user.normalizedRole || req.user.role?.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Akses ditolak",
        message: `Role '${req.user.role}' tidak memiliki akses ke resource ini`,
        requiredRoles: allowedRoles,
      });
    }
    next();
  };
};

/**
 * Permission-based middleware - check if user has required permission
 */
export const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.normalizedRole || req.user.role?.toLowerCase();
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: "Akses ditolak",
        message: "Anda tidak memiliki izin untuk melakukan aksi ini",
        requiredPermissions,
      });
    }
    next();
  };
};

/**
 * Check if user has ANY of the required permissions
 */
export const anyPermissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.normalizedRole || req.user.role?.toLowerCase();
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    const hasAnyPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        error: "Akses ditolak",
        message: "Anda tidak memiliki izin untuk melakukan aksi ini",
      });
    }
    next();
  };
};

/**
 * Helper to check permission in code (not middleware)
 */
export const hasPermission = (role, permission) => {
  const normalizedRole = role?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
};

/**
 * Helper to get all permissions for a role
 */
export const getPermissions = (role) => {
  const normalizedRole = role?.toLowerCase();
  return ROLE_PERMISSIONS[normalizedRole] || [];
};

// ===========================================
// PRESET MIDDLEWARE COMBINATIONS
// ===========================================

// Hanya Admin
export const adminOnly = roleMiddleware("admin");

// Admin dan BPKAD (yang bisa CRUD aset penuh)
export const canManageAset = roleMiddleware("admin", "bpkad");

// Admin, BPKAD, BPN bisa update aset (BPN untuk substansi)
export const canUpdateAset = roleMiddleware("admin", "bpkad", "bpn");

// Semua role yang login bisa melihat aset
export const canViewAset = roleMiddleware("admin", "bpkad", "bpn");

// Role yang bisa melihat data detail/lengkap
export const canViewFullData = roleMiddleware("admin", "bpkad", "bpn");

// Role yang bisa melihat riwayat
export const canViewRiwayat = roleMiddleware("admin", "bpkad");

// Role yang bisa backup/restore
export const canBackup = roleMiddleware("admin");

// Role yang bisa manage users
export const canManageUsers = roleMiddleware("admin");

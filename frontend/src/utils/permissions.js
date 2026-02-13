/**
 * Role-based permission utility
 * Centralized permission checking for UI/UX
 */

// Role constants
export const ROLES = {
  ADMIN: "admin",
  BPKAD: "bpkad",
  BPN: "bpn",
};

// Permission definitions per role
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // Full access to everything
    dashboard: { view: true, full: true },
    aset: { view: true, create: true, update: true, delete: true },
    asetSubstansi: { legal: true, fisik: true, administratif: true, spasial: true },
    sewa: { view: true, create: true, update: true, delete: true },
    penilaian: { view: true, create: true, update: true, delete: true },
    peta: { view: true, allLayers: true },
    riwayat: { view: true, full: true },
    notifikasi: { view: true },
    user: { view: true, create: true, update: true, delete: true },
    backup: { view: true, create: true, restore: true },
    pengaturan: { view: true, edit: true },
    profil: { view: true, edit: true },
  },
  [ROLES.BPKAD]: {
    // Input aset (CRUD), Sewa aset, Penilaian aset
    dashboard: { view: true, full: true },
    aset: { view: true, create: true, update: true, delete: true },
    asetSubstansi: { legal: false, fisik: false, administratif: false, spasial: false },
    sewa: { view: true, create: true, update: true, delete: true },
    penilaian: { view: true, create: true, update: true, delete: true },
    peta: { view: true, allLayers: true },
    riwayat: { view: true, full: false },
    notifikasi: { view: true },
    user: { view: false, create: false, update: false, delete: false },
    backup: { view: false, create: false, restore: false },
    pengaturan: { view: false, edit: false },
    profil: { view: true, edit: true },
  },
  [ROLES.BPN]: {
    // Edit Data Legal, Fisik, Administratif, Spasial
    dashboard: { view: true, full: false },
    aset: { view: true, create: false, update: true, delete: false },
    asetSubstansi: { legal: true, fisik: true, administratif: true, spasial: true },
    sewa: { view: false, create: false, update: false, delete: false },
    penilaian: { view: false, create: false, update: false, delete: false },
    peta: { view: true, allLayers: false, bpnLayers: true },
    riwayat: { view: true, full: false },
    notifikasi: { view: true },
    user: { view: false, create: false, update: false, delete: false },
    backup: { view: false, create: false, restore: false },
    pengaturan: { view: false, edit: false },
    profil: { view: true, edit: true },
  },
};

/**
 * Normalize role string to lowercase
 */
export const normalizeRole = (role) => {
  return role?.toLowerCase()?.trim() || ROLES.BPN;
};

/**
 * Get permissions for a specific role
 */
export const getPermissions = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS[ROLES.BPN];
};

/**
 * Check if user has specific permission
 * @param {string} role - User's role
 * @param {string} module - Module name (aset, user, backup, etc)
 * @param {string} action - Action (view, create, update, delete)
 */
export const hasPermission = (role, module, action = "view") => {
  const permissions = getPermissions(role);
  return permissions[module]?.[action] ?? false;
};

/**
 * Check if user can access a menu item
 */
export const canAccessMenu = (role, menuId) => {
  const permissions = getPermissions(role);

  switch (menuId) {
    case "dashboard":
      return permissions.dashboard?.view;
    case "aset":
      return permissions.aset?.view;
    case "sewa":
      return permissions.sewa?.view;
    case "penilaian":
      return permissions.penilaian?.view;
    case "peta":
      return permissions.peta?.view;
    case "riwayat":
      return permissions.riwayat?.view;
    case "notifikasi":
      return permissions.notifikasi?.view;
    case "user":
      return permissions.user?.view;
    case "pengaturan":
      return permissions.pengaturan?.view;
    case "backup":
      return permissions.backup?.view;
    case "profil":
      return permissions.profil?.view;
    default:
      return false;
  }
};

/**
 * Get filtered menu items based on role
 */
export const getFilteredMenuItems = (role, menuItems) => {
  return menuItems.filter((item) => canAccessMenu(role, item.id));
};

/**
 * Check if user is admin
 */
export const isAdmin = (role) => {
  return normalizeRole(role) === ROLES.ADMIN;
};

/**
 * Check if user can modify assets (create/update/delete)
 */
export const canModifyAset = (role) => {
  const permissions = getPermissions(role);
  return (
    permissions.aset?.create ||
    permissions.aset?.update ||
    permissions.aset?.delete
  );
};

/**
 * Check if role can access a specific substansi
 */
export const canAccessSubstansi = (role, substansi) => {
  const permissions = getPermissions(role);
  return permissions.asetSubstansi?.[substansi] ?? false;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const names = {
    [ROLES.ADMIN]: "Administrator",
    [ROLES.BPKAD]: "BPKAD",
    [ROLES.BPN]: "BPN",
  };
  return names[normalizeRole(role)] || role;
};

/**
 * Get role badge color classes
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    [ROLES.BPKAD]:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    [ROLES.BPN]:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  };
  return (
    colors[normalizeRole(role)] ||
    "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
  );
};

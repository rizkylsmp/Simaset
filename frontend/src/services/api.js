import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if session extend dialog is showing - let it handle logout instead
      const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
      const isSessionDialogActive =
        sessionExpiresAt && Date.now() >= parseInt(sessionExpiresAt);
      if (!isSessionDialogActive) {
        // Unexpected 401 (e.g. token tampered) - force logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sessionExpiresAt");
        window.location.hash = "#/login";
        toast.error("Sesi telah berakhir, silakan login kembali");
      }
      // If dialog is active, silently reject - dialog handles it
    }
    // 403 errors are handled silently - menu will be hidden based on role
    return Promise.reject(error);
  },
);

export const authService = {
  login: (username, password, otpChannel = "email") =>
    api.post("/auth/login", { username, password, otpChannel }),
  verifyLoginOtp: (otpToken, code) =>
    api.post("/auth/otp/verify", { otpToken, code }),
  logout: () => api.post("/auth/logout"),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  refreshToken: () => api.post("/auth/refresh-token"),
  // MFA
  setupMfa: () => api.post("/auth/mfa/setup"),
  verifyMfaSetup: (code) => api.post("/auth/mfa/verify-setup", { code }),
  verifyMfaLogin: (mfaToken, code) =>
    api.post("/auth/mfa/verify", { mfaToken, code }),
  disableMfa: (password) => api.post("/auth/mfa/disable", { password }),
};

export const asetService = {
  getAll: (params) => api.get("/aset", { params }),
  getById: (id) => api.get(`/aset/${id}`),
  create: (data) => api.post("/aset", data),
  update: (id, data) => api.put(`/aset/${id}`, data),
  delete: (id) => api.delete(`/aset/${id}`),
  getStats: () => api.get("/aset/stats"),
  getFilterOptions: () => api.get("/aset/filter-options"),
  syncBpkadWebgis: () => api.post("/aset/sync-bpka-webgis"),
};

export const petaService = {
  getLayers: () => api.get("/peta/layers"),
  getMarkers: (params) => api.get("/peta/markers", { params }),
  getPublicMarkers: () => api.get("/peta/public-markers"),
};

export const riwayatService = {
  getAll: (params) => api.get("/riwayat", { params }),
  getStats: () => api.get("/riwayat/stats"),
};

export const notifikasiService = {
  getAll: (params) => api.get("/notifikasi", { params }),
  getRecent: (limit = 5) =>
    api.get("/notifikasi/recent", { params: { limit } }),
  markAsRead: (id) => api.put(`/notifikasi/${id}/read`),
  markAllAsRead: () => api.put("/notifikasi/read-all"),
  getUnreadCount: () => api.get("/notifikasi/unread-count"),
  delete: (id) => api.delete(`/notifikasi/${id}`),
  clearAll: () => api.delete("/notifikasi/clear-all"),
};

export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get("/users/stats"),
};

export const backupService = {
  getAll: () => api.get("/backup"),
  getStats: () => api.get("/backup/stats"),
  exportData: (tables = ["aset", "user", "riwayat"]) =>
    api.post("/backup/export", { tables }),
  upload: (data, filename) => api.post("/backup/upload", { data, filename }),
  importData: (filename, options = {}) =>
    api.post("/backup/import", { filename, options }),
  download: (filename) =>
    api.get(`/backup/download/${filename}`, { responseType: "blob" }),
  remove: (filename) => api.delete(`/backup/${encodeURIComponent(filename)}`),
  exportCsv: () => api.post("/backup/export-csv", {}, { responseType: "blob" }),
};

export const pusatDataService = {
  getAll: (params) => api.get("/pusat-data", { params }),
  getById: (id) => api.get(`/pusat-data/${id}`),
  create: (data) => api.post("/pusat-data", data),
  update: (id, data) => api.put(`/pusat-data/${id}`, data),
  delete: (id) => api.delete(`/pusat-data/${id}`),
  getStats: () => api.get("/pusat-data/stats"),
};

export const uploadService = {
  single: (file, folder = "uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  multiple: (files, folder = "uploads") => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("folder", folder);
    return api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (filename) => api.delete("/upload", { data: { filename } }),
};

export const sewaService = {
  getAll: (params) => api.get("/sewa", { params }),
  getById: (id) => api.get(`/sewa/${id}`),
  getStats: () => api.get("/sewa/stats"),
  create: (data) => api.post("/sewa", data),
  update: (id, data) => api.put(`/sewa/${id}`, data),
  delete: (id) => api.delete(`/sewa/${id}`),
  // Pengembalian
  getPengembalian: (params) => api.get("/sewa/pengembalian", { params }),
  prosesPengembalian: (id, data) => api.put(`/sewa/${id}/pengembalian`, data),
  // Public
  getPublicAvailable: (params) => api.get("/sewa/public-available", { params }),
  getAvailableForMasyarakat: (params) =>
    api.get("/sewa/masyarakat/tersedia", { params }),
  getApprovedForMasyarakat: (params) =>
    api.get("/sewa/masyarakat/disetujui", { params }),
};

export const permintaanService = {
  submit: (data) => api.post("/permintaan/submit", data),
  submitForMasyarakat: (data) => api.post("/permintaan/masyarakat/submit", data),
  getForMasyarakat: (params) => api.get("/permintaan/masyarakat", { params }),
  getAll: (params) => api.get("/permintaan", { params }),
  update: (id, data) => api.put(`/permintaan/${id}`, data),
  updateStatus: (id, data) => api.put(`/permintaan/${id}/status`, data),
  delete: (id) => api.delete(`/permintaan/${id}`),
};

export const ekasmatService = {
  getAll: () => api.get("/ekasmat"),
  submit: (data) => api.post("/ekasmat/submit", data),
  update: (id, data) => api.put(`/ekasmat/${id}`, data),
  delete: (id) => api.delete(`/ekasmat/${id}`),
};

export default api;

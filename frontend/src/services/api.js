import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
      const isSessionDialogActive = sessionExpiresAt && Date.now() >= parseInt(sessionExpiresAt);
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
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  refreshToken: () => api.post("/auth/refresh-token"),
};

export const asetService = {
  getAll: (params) => api.get("/aset", { params }),
  getById: (id) => api.get(`/aset/${id}`),
  create: (data) => api.post("/aset", data),
  update: (id, data) => api.put(`/aset/${id}`, data),
  delete: (id) => api.delete(`/aset/${id}`),
  getStats: () => api.get("/aset/stats"),
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

export default api;

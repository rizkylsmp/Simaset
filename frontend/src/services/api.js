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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.hash = "#/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  register: (data) => api.post("/auth/register", data),
};

export const asetService = {
  getAll: (params) => api.get("/aset", { params }),
  getById: (id) => api.get(`/aset/${id}`),
  create: (data) => api.post("/aset", data),
  update: (id, data) => api.put(`/aset/${id}`, data),
  delete: (id) => api.delete(`/aset/${id}`),
};

export const petaService = {
  getLayers: () => api.get("/peta/layers"),
  getMarkers: (params) => api.get("/peta/markers", { params }),
};

export const riwayatService = {
  getAll: (params) => api.get("/riwayat", { params }),
};

export const notifikasiService = {
  getAll: () => api.get("/notifikasi"),
  markAsRead: (id) => api.put(`/notifikasi/${id}/read`),
};

export default api;

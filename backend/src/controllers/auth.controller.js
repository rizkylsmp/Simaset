import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User, Riwayat } from "../models/index.js";
import AuditService from "../services/audit.service.js";
import NotificationService from "../services/notification.service.js";

/**
 * Parse duration string (e.g. "2h", "30m", "1d") to milliseconds
 */
function parseDurationToMs(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 2 * 60 * 60 * 1000; // default 2 hours
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 2 * 60 * 60 * 1000;
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username dan password wajib diisi",
      });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    // Check if user is active
    if (!user.status_aktif) {
      return res.status(403).json({
        success: false,
        error: "Akun tidak aktif. Hubungi administrator.",
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    const SESSION_DURATION = process.env.JWT_EXPIRE || "2h";
    const token = jwt.sign(
      { id_user: user.id_user, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_DURATION },
    );

    // Log audit for login
    await AuditService.logLogin({
      user_id: user.id_user,
      keterangan: `User ${user.username} berhasil login`,
      req,
    });

    // Send login notification
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
    await NotificationService.notifyLogin(user, ipAddress);

    // Parse session duration to milliseconds for frontend countdown
    const durationMs = parseDurationToMs(SESSION_DURATION);

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      sessionDuration: durationMs,
      user: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Get user stats
    const totalActivities = await Riwayat.count({ where: { user_id: user.id_user } });
    const totalLogins = await Riwayat.count({ where: { user_id: user.id_user, aksi: 'LOGIN' } });

    // Count distinct active days
    const activeDaysResult = await Riwayat.findAll({
      where: { user_id: user.id_user },
      attributes: [
        [Riwayat.sequelize.fn('COUNT', Riwayat.sequelize.fn('DISTINCT', Riwayat.sequelize.fn('DATE', Riwayat.sequelize.col('created_at')))), 'days']
      ],
      raw: true
    });
    const activeDays = activeDaysResult[0]?.days || 0;

    // Get last login
    const lastLogin = await Riwayat.findOne({
      where: { user_id: user.id_user, aksi: 'LOGIN' },
      order: [['created_at', 'DESC']],
      attributes: ['created_at', 'ip_address'],
    });

    // Get recent activities
    const recentActivities = await Riwayat.findAll({
      where: { user_id: user.id_user },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id_riwayat', 'aksi', 'keterangan', 'ip_address', 'created_at'],
    });

    res.json({
      success: true,
      data: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        email: user.email,
        no_telepon: user.no_telepon,
        nip: user.nip,
        jabatan: user.jabatan,
        instansi: user.instansi,
        alamat: user.alamat,
        status_aktif: user.status_aktif,
        created_at: user.created_at,
      },
      stats: {
        totalLogin: totalLogins,
        aktivitas: totalActivities,
        hariAktif: parseInt(activeDays) || 0,
      },
      lastLogin: lastLogin ? {
        waktu: lastLogin.created_at,
        ip: lastLogin.ip_address,
      } : null,
      recentActivities: recentActivities.map(a => ({
        id: a.id_riwayat,
        aksi: a.keterangan || a.aksi,
        waktu: a.created_at,
        ip: a.ip_address || '-',
      })),
    });
  } catch (error) {
    console.error("Error get current user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update own profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, email, no_telepon, nip, jabatan, instansi, alamat } = req.body;

    const user = await User.findByPk(req.user.id_user);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    const oldData = {
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_telepon: user.no_telepon,
      nip: user.nip,
      jabatan: user.jabatan,
      instansi: user.instansi,
      alamat: user.alamat,
    };

    await user.update({
      nama_lengkap: nama_lengkap !== undefined ? nama_lengkap : user.nama_lengkap,
      email: email !== undefined ? email : user.email,
      no_telepon: no_telepon !== undefined ? no_telepon : user.no_telepon,
      nip: nip !== undefined ? nip : user.nip,
      jabatan: jabatan !== undefined ? jabatan : user.jabatan,
      instansi: instansi !== undefined ? instansi : user.instansi,
      alamat: alamat !== undefined ? alamat : user.alamat,
    });

    await AuditService.logUpdate({
      tabel: 'users',
      id_referensi: user.id_user,
      data_lama: oldData,
      data_baru: { nama_lengkap: user.nama_lengkap, email: user.email, no_telepon: user.no_telepon, nip: user.nip, jabatan: user.jabatan, instansi: user.instansi, alamat: user.alamat },
      keterangan: `User ${user.username} memperbarui profil`,
      user_id: req.user.id_user,
      req,
    });

    // Update localStorage-compatible response
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        email: user.email,
        no_telepon: user.no_telepon,
        nip: user.nip,
        jabatan: user.jabatan,
        instansi: user.instansi,
        alamat: user.alamat,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Change own password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Password lama dan baru wajib diisi' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password baru minimal 8 karakter' });
    }

    const user = await User.findByPk(req.user.id_user);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Password saat ini salah' });
    }

    user.password = newPassword;
    await user.save();

    await AuditService.logUpdate({
      tabel: 'users',
      id_referensi: user.id_user,
      data_baru: { password_changed: true },
      keterangan: `User ${user.username} mengubah password`,
      user_id: req.user.id_user,
      req,
    });

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // Log audit for logout
    await AuditService.logLogout({
      user_id: req.user.id_user,
      keterangan: `User ${req.user.username} logout`,
      req,
    });

    res.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error("Error logout:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { username, password, email, nama_lengkap, role } = req.body;

    // Validate required fields
    if (!username || !password || !email || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        error: "Semua field wajib diisi",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username sudah digunakan",
      });
    }

    const user = await User.create({
      username,
      password,
      email,
      nama_lengkap,
      role: role || "Masyarakat",
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error register:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Refresh token - extends session
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const { id_user, username, role } = req.user;

    const SESSION_DURATION = process.env.JWT_EXPIRE || "2h";
    const token = jwt.sign(
      { id_user, username, role },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_DURATION },
    );

    const durationMs = parseDurationToMs(SESSION_DURATION);

    res.json({
      success: true,
      message: "Token berhasil diperpanjang",
      token,
      sessionDuration: durationMs,
    });
  } catch (error) {
    console.error("Error refresh token:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

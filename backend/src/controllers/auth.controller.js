import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { User, Riwayat, Notifikasi } from "../models/index.js";
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

    // Check if MFA is enabled — require OTP verification
    if (user.mfa_enabled && user.mfa_secret) {
      // Issue a short-lived MFA token (5 min) so the user can complete MFA
      const mfaToken = jwt.sign(
        { id_user: user.id_user, purpose: "mfa" },
        process.env.JWT_SECRET,
        { expiresIn: "5m" },
      );

      return res.json({
        success: true,
        mfaRequired: true,
        mfaToken,
        message: "Masukkan kode OTP dari aplikasi authenticator",
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

    // Send MFA warning notification once per day if not enabled
    if (!user.mfa_enabled) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const alreadySent = await Notifikasi.findOne({
        where: {
          user_id: user.id_user,
          judul: "Aktifkan Autentikasi Dua Faktor (MFA)",
          created_at: { [Op.gte]: todayStart },
        },
      });
      if (!alreadySent) {
        await NotificationService.sendToUser({
          user_id: user.id_user,
          judul: "Aktifkan Autentikasi Dua Faktor (MFA)",
          pesan: "Akun Anda belum mengaktifkan MFA. Aktifkan MFA melalui menu Profil > Keamanan untuk meningkatkan keamanan akun Anda.",
          tipe: "warning",
          kategori: "sistem",
        });
      }
    }

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
        mfa_enabled: user.mfa_enabled || false,
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

// ==================== MFA ENDPOINTS ====================

/**
 * Helper: create a TOTP instance for a user
 */
function createTOTP(secret, username) {
  return new OTPAuth.TOTP({
    issuer: "SIMASET",
    label: username,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/**
 * Setup MFA - generate secret + QR code
 * POST /api/auth/mfa/setup
 * Protected route
 */
export const setupMfa = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user);
    if (!user) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    if (user.mfa_enabled) {
      return res.status(400).json({ success: false, error: "MFA sudah aktif" });
    }

    // Generate a new random secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: "SIMASET",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    // Store secret temporarily (not yet enabled)
    user.mfa_secret = secret.base32;
    user.mfa_enabled = false;
    await user.save();

    // Generate QR code as data URL
    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      secret: secret.base32,
      message: "Scan QR code dengan aplikasi authenticator, lalu verifikasi dengan kode OTP",
    });
  } catch (error) {
    console.error("Error setup MFA:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Verify MFA setup - confirm OTP and enable MFA
 * POST /api/auth/mfa/verify-setup
 * Protected route
 * Body: { code: "123456" }
 */
export const verifyMfaSetup = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: "Kode OTP wajib diisi" });
    }

    const user = await User.findByPk(req.user.id_user);
    if (!user || !user.mfa_secret) {
      return res.status(400).json({ success: false, error: "Setup MFA belum dimulai" });
    }

    if (user.mfa_enabled) {
      return res.status(400).json({ success: false, error: "MFA sudah aktif" });
    }

    const totp = createTOTP(user.mfa_secret, user.username);
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({ success: false, error: "Kode OTP tidak valid" });
    }

    // Enable MFA
    user.mfa_enabled = true;
    await user.save();

    await AuditService.logUpdate({
      user_id: user.id_user,
      tabel: "users",
      id_referensi: user.id_user,
      keterangan: `User ${user.username} mengaktifkan MFA`,
      req,
    });

    res.json({ success: true, message: "MFA berhasil diaktifkan" });
  } catch (error) {
    console.error("Error verify MFA setup:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Verify MFA login - verify OTP during login
 * POST /api/auth/mfa/verify
 * Public route (uses mfaToken)
 * Body: { mfaToken: "...", code: "123456" }
 */
export const verifyMfaLogin = async (req, res) => {
  try {
    const { mfaToken, code } = req.body;
    if (!mfaToken || !code) {
      return res.status(400).json({ success: false, error: "Token MFA dan kode OTP wajib diisi" });
    }

    // Verify the temporary MFA token
    let decoded;
    try {
      decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: "Token MFA tidak valid atau sudah kedaluwarsa" });
    }

    if (decoded.purpose !== "mfa") {
      return res.status(401).json({ success: false, error: "Token tidak valid" });
    }

    const user = await User.findByPk(decoded.id_user);
    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      return res.status(400).json({ success: false, error: "MFA tidak ditemukan" });
    }

    const totp = createTOTP(user.mfa_secret, user.username);
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({ success: false, error: "Kode OTP tidak valid" });
    }

    // OTP valid — issue real session JWT
    const SESSION_DURATION = process.env.JWT_EXPIRE || "2h";
    const token = jwt.sign(
      { id_user: user.id_user, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_DURATION },
    );

    await AuditService.logLogin({
      user_id: user.id_user,
      keterangan: `User ${user.username} berhasil login (MFA)`,
      req,
    });

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
    console.error("Error verify MFA login:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Disable MFA
 * POST /api/auth/mfa/disable
 * Protected route
 * Body: { password: "..." }
 */
export const disableMfa = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: "Password wajib diisi untuk menonaktifkan MFA" });
    }

    const user = await User.findByPk(req.user.id_user);
    if (!user) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    if (!user.mfa_enabled) {
      return res.status(400).json({ success: false, error: "MFA belum aktif" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Password salah" });
    }

    user.mfa_enabled = false;
    user.mfa_secret = null;
    await user.save();

    await AuditService.logUpdate({
      user_id: user.id_user,
      tabel: "users",
      id_referensi: user.id_user,
      keterangan: `User ${user.username} menonaktifkan MFA`,
      req,
    });

    res.json({ success: true, message: "MFA berhasil dinonaktifkan" });
  } catch (error) {
    console.error("Error disable MFA:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

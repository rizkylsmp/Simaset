import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.status_aktif) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id_user: user.id_user, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id_user: user.id_user,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        email: user.email,
        jabatan: user.jabatan,
        instansi: user.instansi,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side removes token)
router.post("/logout", authMiddleware, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, nama_lengkap, role } = req.body;

    // Validate required fields
    if (!username || !password || !email || !nama_lengkap) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = await User.create({
      username,
      password,
      email,
      nama_lengkap,
      role: role || "Masyarakat",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

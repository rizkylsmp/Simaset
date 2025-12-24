import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import User from "./models/User.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Static files
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/aset", require("./routes/aset.routes"));
// app.use("/api/peta", require("./routes/peta.routes"));
// app.use("/api/notifikasi", require("./routes/notifikasi.routes"));
// app.use("/api/riwayat", require("./routes/riwayat.routes"));
// app.use("/api/backup", require("./routes/backup.routes"));
// app.use("/api/users", require("./routes/user.routes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running", timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }`
      );
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });

export default app;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import sequelize from "./src/config/database.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

async function seedUsers() {
  try {
    // Drop and recreate table to update enum
    await sequelize.query('DROP TABLE IF EXISTS "users" CASCADE');
    await sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
    console.log("🗑️  Dropped existing users table and enum");

    // Sync database (recreate table with new enum)
    await sequelize.sync({ force: true });
    console.log("✅ Database synced with new schema");

    // Demo users sesuai dengan role di middleware (lowercase)
    const demoUsers = [
      {
        username: "admin",
        password: "admin123",
        email: "admin@simaset.com",
        nama_lengkap: "Admin Kantor Pertanahan",
        role: "admin",
        jabatan: "Administrator Sistem",
        instansi: "Kantor Pertanahan",
        status_aktif: true,
      },
      {
        username: "bpkad",
        password: "bpkad123",
        email: "bpkad@simaset.com",
        nama_lengkap: "Staff BPKAD",
        role: "bpkad",
        jabatan: "Operator Data Aset",
        instansi: "BPKAD",
        status_aktif: true,
      },
      {
        username: "bpn_user",
        password: "bpn123",
        email: "bpn@simaset.com",
        nama_lengkap: "Staff BPN",
        role: "bpn",
        jabatan: "Verifikator Pertanahan",
        instansi: "Badan Pertanahan Nasional",
        status_aktif: true,
      },
    ];

    for (const userData of demoUsers) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.username}`);
    }

    console.log("\n✅ All demo users created successfully!");
    console.log("\nDemo Credentials:");
    console.log("=".repeat(50));
    demoUsers.forEach((u) => {
      console.log(`Username: ${u.username.padEnd(20)} Password: ${u.password}`);
    });
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedUsers();

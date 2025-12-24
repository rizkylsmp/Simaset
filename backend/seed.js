import sequelize from "./src/config/database.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

async function seedUsers() {
  try {
    // Sync database
    await sequelize.sync();
    console.log("✅ Database synced");

    // Check if users already exist
    const userCount = await User.count();
    if (userCount > 0) {
      console.log(
        `⚠️  Database already has ${userCount} users. Skipping seed.`
      );
      process.exit(0);
    }

    const demoUsers = [
      {
        username: "admin",
        password: "admin123",
        email: "admin@sinkrona.com",
        nama_lengkap: "Administrator",
        role: "Admin",
        status_aktif: true,
      },
      {
        username: "dinas_aset",
        password: "dinas123",
        email: "dinasaset@sinkrona.com",
        nama_lengkap: "Staff Dinas Aset Pemkot",
        role: "DinasAsetPemkot",
        jabatan: "Operator Data",
        instansi: "Dinas Aset Pemkot",
        status_aktif: true,
      },
      {
        username: "bpn_user",
        password: "bpn123",
        email: "bpn@sinkrona.com",
        nama_lengkap: "Staff BPN",
        role: "BPN",
        jabatan: "Verifikator Pertanahan",
        instansi: "Badan Pertanahan Nasional",
        status_aktif: true,
      },
      {
        username: "tata_ruang",
        password: "tataruang123",
        email: "tataruang@sinkrona.com",
        nama_lengkap: "Staff Tata Ruang",
        role: "DinasTataRuang",
        jabatan: "Verifikator Tata Ruang",
        instansi: "Dinas Tata Ruang",
        status_aktif: true,
      },
      {
        username: "masyarakat_user",
        password: "public123",
        email: "masyarakat@sinkrona.com",
        nama_lengkap: "Pengguna Publik",
        role: "Masyarakat",
        nik: "1234567890123456",
        no_telepon: "08123456789",
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

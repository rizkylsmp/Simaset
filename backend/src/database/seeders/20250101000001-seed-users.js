import bcrypt from "bcryptjs";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await queryInterface.bulkInsert("users", [
    {
      username: "admin",
      password: hashedPassword,
      email: "admin@simaset.com",
      nama_lengkap: "Administrator",
      role: "Admin",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: "bpkad",
      password: await bcrypt.hash("bpkad123", 10),
      email: "bpkad@simaset.com",
      nama_lengkap: "Staff BPKAD",
      role: "bpkad",
      jabatan: "Operator Data Aset",
      instansi: "BPKAD",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: "bpn_user",
      password: await bcrypt.hash("bpn123", 10),
      email: "bpn@simaset.com",
      nama_lengkap: "Staff BPN",
      role: "bpn",
      jabatan: "Verifikator Pertanahan",
      instansi: "Badan Pertanahan Nasional",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: "masyarakat_user",
      password: await bcrypt.hash("public123", 10),
      email: "masyarakat@simaset.com",
      nama_lengkap: "Pengguna Publik",
      role: "Masyarakat",
      nik: "1234567890123456",
      no_telepon: "08123456789",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("users", null, {});
}

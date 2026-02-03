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
      username: "dinas_aset",
      password: await bcrypt.hash("dinas123", 10),
      email: "dinasaset@simaset.com",
      nama_lengkap: "Staff Dinas Aset Pemkot",
      role: "DinasAsetPemkot",
      jabatan: "Operator Data",
      instansi: "Dinas Aset Pemkot",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: "bpn_user",
      password: await bcrypt.hash("bpn123", 10),
      email: "bpn@simaset.com",
      nama_lengkap: "Staff BPN",
      role: "BPN",
      jabatan: "Verifikator Pertanahan",
      instansi: "Badan Pertanahan Nasional",
      status_aktif: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: "tata_ruang",
      password: await bcrypt.hash("tataruang123", 10),
      email: "tataruang@simaset.com",
      nama_lengkap: "Staff Tata Ruang",
      role: "DinasTataRuang",
      jabatan: "Verifikator Tata Ruang",
      instansi: "Dinas Tata Ruang",
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

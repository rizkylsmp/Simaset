"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add "Tersedia" to status ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sewa_aset_status"
      ADD VALUE IF NOT EXISTS 'Tersedia' BEFORE 'Aktif';
    `);

    // 2. Add polygon_sewa column (JSON)
    await queryInterface.addColumn("sewa_aset", "polygon_sewa", {
      type: Sequelize.JSON,
      allowNull: true,
    });

    // 3. Make nama_penyewa nullable
    await queryInterface.changeColumn("sewa_aset", "nama_penyewa", {
      type: Sequelize.STRING(150),
      allowNull: true,
    });

    // 4. Make tanggal_mulai nullable
    await queryInterface.changeColumn("sewa_aset", "tanggal_mulai", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // 5. Make tanggal_berakhir nullable
    await queryInterface.changeColumn("sewa_aset", "tanggal_berakhir", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // 6. Make nilai_sewa nullable
    await queryInterface.changeColumn("sewa_aset", "nilai_sewa", {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("sewa_aset", "polygon_sewa");

    await queryInterface.changeColumn("sewa_aset", "nama_penyewa", {
      type: Sequelize.STRING(150),
      allowNull: false,
    });

    await queryInterface.changeColumn("sewa_aset", "tanggal_mulai", {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn("sewa_aset", "tanggal_berakhir", {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.changeColumn("sewa_aset", "nilai_sewa", {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },
};

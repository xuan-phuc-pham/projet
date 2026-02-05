'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserGroup', {
      u_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      g_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Group', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserGroup');
  }
};
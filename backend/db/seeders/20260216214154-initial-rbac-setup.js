'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const timestamp = new Date();

    // 1. DEFINE ROLES
    const rolesData = [
      { id: 1, role_name: 'Admin', description: 'System Administrator with full access', createdAt: timestamp, updatedAt: timestamp },
      { id: 2, role_name: 'Moderator', description: 'Can manage content but not system settings', createdAt: timestamp, updatedAt: timestamp },
      { id: 3, role_name: 'User', description: 'Standard registered user', createdAt: timestamp, updatedAt: timestamp },
      { id: 4, role_name: 'Guest', description: 'Unregistered user', createdAt: timestamp, updatedAt: timestamp },
      { id: 5, role_name: 'Banned', description: 'Banned user', createdAt: timestamp, updatedAt: timestamp }
    ];

    // 2. DEFINE PERMISSIONS
    const permissionsData = [
      // Discussion Permissions
      { id: 1, name: 'discussion.create', createdAt: timestamp, updatedAt: timestamp },
      { id: 2, name: 'discussion.read.any', createdAt: timestamp, updatedAt: timestamp },
      { id: 3, name: 'discussion.read.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 4, name: 'discussion.edit.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 5, name: 'discussion.delete.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 6, name: 'discussion.delete.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only
      
      // Comment Permissions
      { id: 7, name: 'comment.create', createdAt: timestamp, updatedAt: timestamp },
      { id: 8, name: 'comment.read.any', createdAt: timestamp, updatedAt: timestamp },
      { id: 9, name: 'comment.read.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 10, name: 'comment.edit.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 11, name: 'comment.edit.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only
      { id: 12, name: 'comment.delete.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 13, name: 'comment.delete.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only
      
      // User Management
      { id: 14, name: 'user.create', createdAt: timestamp, updatedAt: timestamp },
      { id: 15, name: 'user.read.any', createdAt: timestamp, updatedAt: timestamp },
      { id: 16, name: 'user.read.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 17, name: 'user.edit.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 18, name: 'user.edit.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only
      { id: 19, name: 'user.delete.own', createdAt: timestamp, updatedAt: timestamp },
      { id: 20, name: 'user.delete.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only
      { id: 21, name: 'user.ban.any', createdAt: timestamp, updatedAt: timestamp }, // Admin/Mod only


    ];

    // 3. DEFINE ROLE PERMISSIONS (Linking Roles -> Permissions)
    const rolePermissionsData = [
      // Admin (Role ID 1) - Gets ALL permissions
      { r_id: 1, p_id: 1, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 2, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 3, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 4, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 5, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 6, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 7, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 8, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 9, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 10, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 11, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 12, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 13, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 14, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 15, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 16, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 17, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 18, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 19, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 20, createdAt: timestamp, updatedAt: timestamp },
      { r_id: 1, p_id: 21, createdAt: timestamp, updatedAt: timestamp },

      // Moderator (Role ID 2) - Can delete content and ban, but maybe restricted elsewhere
      { r_id: 2, p_id: 1, createdAt: timestamp, updatedAt: timestamp }, // Create discussion
      { r_id: 2, p_id: 4, createdAt: timestamp, updatedAt: timestamp }, // Delete ANY discussion
      { r_id: 2, p_id: 5, createdAt: timestamp, updatedAt: timestamp }, // Create comment
      { r_id: 2, p_id: 6, createdAt: timestamp, updatedAt: timestamp }, // Delete ANY comment
      { r_id: 2, p_id: 7, createdAt: timestamp, updatedAt: timestamp }, // Ban user

      // User (Role ID 3) - Basic CRUD on own content
      { r_id: 3, p_id: 1, createdAt: timestamp, updatedAt: timestamp }, // Create discussion
      { r_id: 3, p_id: 2, createdAt: timestamp, updatedAt: timestamp }, // Edit own
      { r_id: 3, p_id: 3, createdAt: timestamp, updatedAt: timestamp }, // Delete own
      { r_id: 3, p_id: 5, createdAt: timestamp, updatedAt: timestamp }, // Create comment
    ];

    // 4. DEFINE USERS (Passwords should be hashed in real app)
    const usersData = [
      { id: 1, username: 'admin_alice', password: 'hashed_secret_password', fname: 'Alice', lname: 'Admin', createdAt: timestamp, updatedAt: timestamp },
      { id: 2, username: 'mod_bob', password: 'hashed_secret_password', fname: 'Bob', lname: 'Moderator', createdAt: timestamp, updatedAt: timestamp },
      { id: 3, username: 'user_charlie', password: 'hashed_secret_password', fname: 'Charlie', lname: 'User', createdAt: timestamp, updatedAt: timestamp }
    ];

    // 5. DEFINE USER ROLES (Linking Users -> Roles)
    const userRolesData = [
      { u_id: 1, r_id: 1, createdAt: timestamp, updatedAt: timestamp }, // Alice is Admin
      { u_id: 2, r_id: 2, createdAt: timestamp, updatedAt: timestamp }, // Bob is Moderator
      { u_id: 3, r_id: 3, createdAt: timestamp, updatedAt: timestamp }  // Charlie is User
    ];

    // --- INSERTION TRANSACTIONS ---
    try {
      await queryInterface.bulkInsert('Roles', rolesData, {});
      await queryInterface.bulkInsert('Permissions', permissionsData, {});
      await queryInterface.bulkInsert('RolePermissions', rolePermissionsData, {});
      await queryInterface.bulkInsert('Users', usersData, {});
      await queryInterface.bulkInsert('UserRoles', userRolesData, {});
    } catch (error) {
      console.error("Seeding failed:", error);
    }
  },

  async down (queryInterface, Sequelize) {
    // Delete in reverse order to handle Foreign Key constraints
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
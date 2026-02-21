'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const timestamp = new Date();
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // =============================================
      // 1. ROLES
      // =============================================
      const rolesData = [
        { id: 1, role_name: 'Admin', description: 'System administrator with full access', createdAt: timestamp, updatedAt: timestamp },
        { id: 2, role_name: 'Moderator', description: 'Can manage content and ban users, but not system settings', createdAt: timestamp, updatedAt: timestamp },
        { id: 3, role_name: 'User', description: 'Standard registered user', createdAt: timestamp, updatedAt: timestamp },
        { id: 4, role_name: 'Guest', description: 'Unregistered visitor with read-only access', createdAt: timestamp, updatedAt: timestamp },
        { id: 5, role_name: 'Banned', description: 'Banned user with no permissions', createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // 2. PERMISSIONS
      // =============================================
      const permissionsData = [
        // Discussion permissions
        { id: 1,  name: 'discussion.create',     createdAt: timestamp, updatedAt: timestamp },
        { id: 2,  name: 'discussion.read.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 3,  name: 'discussion.read.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 4,  name: 'discussion.edit.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 5,  name: 'discussion.edit.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 6,  name: 'discussion.delete.own', createdAt: timestamp, updatedAt: timestamp },
        { id: 7,  name: 'discussion.delete.any', createdAt: timestamp, updatedAt: timestamp },

        // Comment permissions
        { id: 8,  name: 'comment.create',     createdAt: timestamp, updatedAt: timestamp },
        { id: 9,  name: 'comment.read.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 10, name: 'comment.read.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 11, name: 'comment.edit.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 12, name: 'comment.edit.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 13, name: 'comment.delete.own', createdAt: timestamp, updatedAt: timestamp },
        { id: 14, name: 'comment.delete.any', createdAt: timestamp, updatedAt: timestamp },

        // Reaction permissions
        { id: 15, name: 'reaction.create',     createdAt: timestamp, updatedAt: timestamp },
        { id: 16, name: 'reaction.delete.own', createdAt: timestamp, updatedAt: timestamp },

        // User management permissions
        { id: 17, name: 'user.create',     createdAt: timestamp, updatedAt: timestamp },
        { id: 18, name: 'user.read.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 19, name: 'user.read.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 20, name: 'user.edit.own',   createdAt: timestamp, updatedAt: timestamp },
        { id: 21, name: 'user.edit.any',   createdAt: timestamp, updatedAt: timestamp },
        { id: 22, name: 'user.delete.own', createdAt: timestamp, updatedAt: timestamp },
        { id: 23, name: 'user.delete.any', createdAt: timestamp, updatedAt: timestamp },
        { id: 24, name: 'user.ban.any',    createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // 3. ROLE → PERMISSION MAPPINGS
      // =============================================
      const rp = (r_id, p_id) => ({ r_id, p_id, createdAt: timestamp, updatedAt: timestamp });

      const rolePermissionsData = [
        // Admin (Role 1) — ALL permissions
        ...permissionsData.map(p => rp(1, p.id)),

        // Moderator (Role 2) — Content management + user moderation
        rp(2, 1),  // discussion.create
        rp(2, 2),  // discussion.read.any
        rp(2, 3),  // discussion.read.own
        rp(2, 4),  // discussion.edit.own
        rp(2, 5),  // discussion.edit.any
        rp(2, 6),  // discussion.delete.own
        rp(2, 7),  // discussion.delete.any
        rp(2, 8),  // comment.create
        rp(2, 9),  // comment.read.any
        rp(2, 10), // comment.read.own
        rp(2, 11), // comment.edit.own
        rp(2, 12), // comment.edit.any
        rp(2, 13), // comment.delete.own
        rp(2, 14), // comment.delete.any
        rp(2, 15), // reaction.create
        rp(2, 16), // reaction.delete.own
        rp(2, 18), // user.read.any
        rp(2, 19), // user.read.own
        rp(2, 20), // user.edit.own
        rp(2, 24), // user.ban.any

        // User (Role 3) — CRUD on own content
        rp(3, 1),  // discussion.create
        rp(3, 2),  // discussion.read.any
        rp(3, 3),  // discussion.read.own
        rp(3, 4),  // discussion.edit.own
        rp(3, 6),  // discussion.delete.own
        rp(3, 8),  // comment.create
        rp(3, 9),  // comment.read.any
        rp(3, 10), // comment.read.own
        rp(3, 11), // comment.edit.own
        rp(3, 13), // comment.delete.own
        rp(3, 15), // reaction.create
        rp(3, 16), // reaction.delete.own
        rp(3, 18), // user.read.any
        rp(3, 19), // user.read.own
        rp(3, 20), // user.edit.own
        rp(3, 22), // user.delete.own

        // Guest (Role 4) — Read-only
        rp(4, 2),  // discussion.read.any
        rp(4, 9),  // comment.read.any
      ];

      // =============================================
      // 4. USERS (with bcrypt-hashed passwords)
      // =============================================
      const hash = (pw) => bcrypt.hashSync(pw, 10);

      const usersData = [
        { id: 1, username: 'admin_alice',  password: hash('admin123'),  fname: 'Alice',   lname: 'Martin',   createdAt: timestamp, updatedAt: timestamp },
        { id: 2, username: 'mod_bob',      password: hash('mod123'),    fname: 'Bob',     lname: 'Dupont',   createdAt: timestamp, updatedAt: timestamp },
        { id: 3, username: 'user_charlie', password: hash('user123'),   fname: 'Charlie', lname: 'Bernard',  createdAt: timestamp, updatedAt: timestamp },
        { id: 4, username: 'user_diana',   password: hash('user123'),   fname: 'Diana',   lname: 'Leroy',    createdAt: timestamp, updatedAt: timestamp },
        { id: 5, username: 'banned_eve',   password: hash('banned123'), fname: 'Eve',     lname: 'Moreau',   createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // 5. USER → ROLE MAPPINGS
      // =============================================
      const userRolesData = [
        { u_id: 1, r_id: 1, createdAt: timestamp, updatedAt: timestamp }, // Alice  → Admin
        { u_id: 2, r_id: 2, createdAt: timestamp, updatedAt: timestamp }, // Bob    → Moderator
        { u_id: 3, r_id: 3, createdAt: timestamp, updatedAt: timestamp }, // Charlie → User
        { u_id: 4, r_id: 3, createdAt: timestamp, updatedAt: timestamp }, // Diana  → User
        { u_id: 5, r_id: 5, createdAt: timestamp, updatedAt: timestamp }, // Eve    → Banned
      ];

      // =============================================
      // 6. SAMPLE DISCUSSIONS
      // =============================================
      const discussionsData = [
        { id: 1, owner_id: 1, title: 'Welcome to the forum!', content: 'Hello everyone! This is the official welcome thread. Feel free to introduce yourselves and share what brings you here.', createdAt: timestamp, updatedAt: timestamp },
        { id: 2, owner_id: 3, title: 'Best practices for web development?', content: 'I have been learning web development for a few months now. What are some best practices you follow in your projects? Particularly interested in project structure and code organization.', createdAt: timestamp, updatedAt: timestamp },
        { id: 3, owner_id: 4, title: 'Favorite programming languages in 2026', content: 'Curious to know what programming languages everyone is using this year. I have been mostly working with JavaScript and Python. What about you?', createdAt: timestamp, updatedAt: timestamp },
        { id: 4, owner_id: 2, title: 'Forum rules and guidelines', content: 'Please read the following rules before posting:\n\n1. Be respectful to other members\n2. No spam or self-promotion\n3. Stay on topic\n4. No NSFW content\n\nViolations may result in warnings or bans.', createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // 7. SAMPLE COMMENTS
      // =============================================
      const commentsData = [
        { id: 1, user_id: 3, discussion_id: 1, content: 'Thanks for the warm welcome! Excited to be part of this community.', createdAt: timestamp, updatedAt: timestamp },
        { id: 2, user_id: 4, discussion_id: 1, content: 'Hi everyone! I am Diana, a frontend developer from Lyon. Happy to be here!', createdAt: timestamp, updatedAt: timestamp },
        { id: 3, user_id: 2, discussion_id: 1, content: 'Welcome to both of you! Do not hesitate to ask if you need anything.', createdAt: timestamp, updatedAt: timestamp },
        { id: 4, user_id: 1, discussion_id: 2, content: 'Great question! I always start with a clear folder structure and use linting from day one. Also, write tests early — it pays off.', createdAt: timestamp, updatedAt: timestamp },
        { id: 5, user_id: 4, discussion_id: 2, content: 'I would add: use version control from the start and commit often with meaningful messages.', createdAt: timestamp, updatedAt: timestamp },
        { id: 6, user_id: 3, discussion_id: 3, content: 'JavaScript is still my go-to for fullstack. TypeScript has been a game changer though!', createdAt: timestamp, updatedAt: timestamp },
        { id: 7, user_id: 1, discussion_id: 3, content: 'Rust is gaining a lot of traction for backend and systems programming. Worth checking out.', createdAt: timestamp, updatedAt: timestamp },
        { id: 8, user_id: 3, discussion_id: 4, content: 'Thanks for posting this, Bob. Clear and fair rules.', createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // 8. SAMPLE REACTIONS
      // =============================================
      const reactionDiscussionsData = [
        { user_id: 3, disscussion_id: 1, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 4, disscussion_id: 1, type: 'love',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 1, disscussion_id: 2, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 4, disscussion_id: 2, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 3, disscussion_id: 3, type: 'wow',   createdAt: timestamp, updatedAt: timestamp },
        { user_id: 1, disscussion_id: 4, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 3, disscussion_id: 4, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
      ];

      const reactionCommentsData = [
        { user_id: 1, comment_id: 1, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 4, comment_id: 1, type: 'love',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 3, comment_id: 4, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 1, comment_id: 6, type: 'like',  createdAt: timestamp, updatedAt: timestamp },
        { user_id: 2, comment_id: 7, type: 'wow',   createdAt: timestamp, updatedAt: timestamp },
      ];

      // =============================================
      // INSERT (order respects foreign key constraints)
      // =============================================
      await queryInterface.bulkInsert('Roles', rolesData, { transaction });
      await queryInterface.bulkInsert('Permissions', permissionsData, { transaction });
      await queryInterface.bulkInsert('RolePermissions', rolePermissionsData, { transaction });
      await queryInterface.bulkInsert('Users', usersData, { transaction });
      await queryInterface.bulkInsert('UserRoles', userRolesData, { transaction });
      await queryInterface.bulkInsert('Discussions', discussionsData, { transaction });
      await queryInterface.bulkInsert('Comments', commentsData, { transaction });
      await queryInterface.bulkInsert('ReactionDiscussions', reactionDiscussionsData, { transaction });
      await queryInterface.bulkInsert('ReactionComments', reactionCommentsData, { transaction });

      // =============================================
      // RESET PostgreSQL sequences after explicit ID inserts
      // =============================================
      const sequences = [
        { table: 'Roles', max: rolesData.length },
        { table: 'Permissions', max: permissionsData.length },
        { table: 'Users', max: usersData.length },
        { table: 'Discussions', max: discussionsData.length },
        { table: 'Comments', max: commentsData.length },
      ];

      for (const { table, max } of sequences) {
        await queryInterface.sequelize.query(
          `ALTER SEQUENCE "${table}_id_seq" RESTART WITH ${max + 1};`,
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Seeding failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse insertion order to respect foreign keys
    await queryInterface.bulkDelete('ReactionComments', null, {});
    await queryInterface.bulkDelete('ReactionDiscussions', null, {});
    await queryInterface.bulkDelete('Comments', null, {});
    await queryInterface.bulkDelete('Discussions', null, {});
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  },
};

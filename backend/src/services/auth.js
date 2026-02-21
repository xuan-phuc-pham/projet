const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret, jwtExpiresIn } = require('../config');
const { User, Role, Permission, Session, UserRole, sequelize } = require('../../db/models');

const SALT_ROUNDS = 10;

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

async function createSession(userId, token) {
  return Session.create({ u_id: userId, session: token });
}

async function findSession(token) {
  return Session.findOne({ where: { session: token } });
}

async function deleteSession(token) {
  return Session.destroy({ where: { session: token } });
}

async function deleteAllUserSessions(userId) {
  return Session.destroy({ where: { u_id: userId } });
}

async function getUserWithPermissions(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [{
      model: Role,
      as: 'roles',
      through: { attributes: [] },
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
      }],
    }],
  });

  if (!user) return null;

  const permissions = new Set();
  for (const role of user.roles) {
    for (const perm of role.permissions) {
      permissions.add(perm.name);
    }
  }

  return { user, permissions: Array.from(permissions) };
}

async function registerUser({ username, password, fname, lname }) {
  const transaction = await sequelize.transaction();
  try {
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      password: hashedPassword,
      fname,
      lname,
    }, { transaction });

    // Assign default "User" role (id: 3)
    await UserRole.create({
      u_id: user.id,
      r_id: 3,
    }, { transaction });

    await transaction.commit();

    return { id: user.id, username: user.username, fname: user.fname, lname: user.lname };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createSession,
  findSession,
  deleteSession,
  deleteAllUserSessions,
  getUserWithPermissions,
  registerUser,
};

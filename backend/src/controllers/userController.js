const { User, Role, UserRole, Session, sequelize } = require('../../db/models');
const { hasPermission } = require('../middleware/authorize');
const authService = require('../services/auth');

const list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'role_name'],
        },
      ],
      order: [['id', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user, permissions: req.permissions },
  });
};

const getById = async (req, res, next) => {
  try {
    // If only has read.own, verify it's their own profile
    if (
      !hasPermission(req, 'user.read.any') &&
      parseInt(req.params.id) !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own profile',
      });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'role_name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const canEditAny = hasPermission(req, 'user.edit.any');
    if (!canEditAny && parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own profile',
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = {};
    if (req.body.fname !== undefined) updates.fname = req.body.fname;
    if (req.body.lname !== undefined) updates.lname = req.body.lname;
    if (req.body.password !== undefined) {
      // Admins editing other users don't need current_password
      const isSelf = parseInt(req.params.id) === req.user.id;
      if (isSelf) {
        if (!req.body.current_password) {
          return res.status(400).json({
            success: false,
            error: 'current_password is required to change password',
          });
        }
        const valid = await authService.comparePassword(
          req.body.current_password,
          user.password,
        );
        if (!valid) {
          return res.status(403).json({ success: false, error: 'Current password is incorrect' });
        }
      }
      updates.password = await authService.hashPassword(req.body.password);
    }

    await user.update(updates);

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'role_name'],
        },
      ],
    });

    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const canDeleteAny = hasPermission(req, 'user.delete.any');
    if (!canDeleteAny && parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own account',
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent deleting admin accounts unless you're admin
    const adminRole = await authService.getRoleByName('Admin');
    const targetRoles = await UserRole.findAll({ where: { u_id: user.id } });
    const isTargetAdmin = targetRoles.some((ur) => ur.r_id === adminRole.id);
    const isRequesterAdmin = req.user.roles.some((r) => r.role_name === 'Admin');

    if (isTargetAdmin && !isRequesterAdmin) {
      return res.status(403).json({ success: false, error: 'Cannot delete an admin account' });
    }

    const transaction = await sequelize.transaction();
    try {
      await Session.destroy({ where: { u_id: user.id }, transaction });
      await UserRole.destroy({ where: { u_id: user.id }, transaction });
      await user.destroy({ transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
};

const ban = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot ban yourself' });
    }

    // Cannot ban admins
    const adminRole = await authService.getRoleByName('Admin');
    const targetRoles = await UserRole.findAll({ where: { u_id: user.id } });
    const isTargetAdmin = targetRoles.some((ur) => ur.r_id === adminRole.id);
    if (isTargetAdmin) {
      return res.status(403).json({ success: false, error: 'Cannot ban an admin' });
    }

    const transaction = await sequelize.transaction();
    try {
      // Remove all current roles
      await UserRole.destroy({ where: { u_id: user.id }, transaction });
      // Assign Banned role
      const bannedRole = await authService.getRoleByName('Banned');
      await UserRole.create({ u_id: user.id, r_id: bannedRole.id }, { transaction });
      // Invalidate all sessions
      await Session.destroy({ where: { u_id: user.id }, transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    res.json({
      success: true,
      data: { message: `User ${user.username} has been banned` },
    });
  } catch (err) {
    next(err);
  }
};

const unban = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const transaction = await sequelize.transaction();
    try {
      await UserRole.destroy({ where: { u_id: user.id }, transaction });
      // Restore to standard User role
      const userRole = await authService.getRoleByName('User');
      await UserRole.create({ u_id: user.id, r_id: userRole.id }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    res.json({
      success: true,
      data: { message: `User ${user.username} has been unbanned` },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getMe, getById, update, remove, ban, unban };

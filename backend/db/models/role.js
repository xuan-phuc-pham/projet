'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'r_id',
        otherKey: 'u_id',
        as: 'users',
      });
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'r_id',
        otherKey: 'p_id',
        as: 'permissions',
      });
    }
  }

  Role.init({
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Role',
  });

  return Role;
};

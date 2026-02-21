'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: 'r_id' });
      RolePermission.belongsTo(models.Permission, { foreignKey: 'p_id' });
    }
  }

  RolePermission.init({
    r_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    p_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RolePermission',
  });

  return RolePermission;
};

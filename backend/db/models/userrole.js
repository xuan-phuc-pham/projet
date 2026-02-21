'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsTo(models.User, { foreignKey: 'u_id' });
      UserRole.belongsTo(models.Role, { foreignKey: 'r_id' });
    }
  }

  UserRole.init({
    u_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    r_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UserRole',
  });

  return UserRole;
};

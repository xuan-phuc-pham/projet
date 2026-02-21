'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.User, { foreignKey: 'u_id', as: 'user' });
    }
  }

  Session.init({
    u_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    session: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'Session',
  });

  return Session;
};

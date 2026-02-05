'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GroupRole.init({
    g_id: DataTypes.INTEGER,
    r_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupRole',
    freezeTableName: true,
  });
  return GroupRole;
};
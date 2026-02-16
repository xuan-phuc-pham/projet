'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReactionDiscussion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ReactionDiscussion.init({
    user_id: DataTypes.INTEGER,
    disscussion_id: DataTypes.INTEGER,
    type: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'ReactionDiscussion',
  });
  return ReactionDiscussion;
};
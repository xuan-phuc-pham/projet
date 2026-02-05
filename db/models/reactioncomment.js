'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReactionComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ReactionComment.init({
    user_id: DataTypes.INTEGER,
    comment_id: DataTypes.INTEGER,
    type: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'ReactionComment',
    freezeTableName: true,
  });
  return ReactionComment;
};
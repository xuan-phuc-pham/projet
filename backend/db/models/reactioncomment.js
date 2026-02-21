'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReactionComment extends Model {
    static associate(models) {
      ReactionComment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      ReactionComment.belongsTo(models.Comment, { foreignKey: 'comment_id', as: 'comment' });
    }
  }

  ReactionComment.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike', 'love', 'wow', 'haha', 'sad', 'angry'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ReactionComment',
  });

  return ReactionComment;
};

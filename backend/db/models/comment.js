'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
      Comment.belongsTo(models.Discussion, { foreignKey: 'discussion_id', as: 'discussion' });
      Comment.hasMany(models.ReactionComment, { foreignKey: 'comment_id', as: 'reactions' });
    }
  }

  Comment.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discussion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Comment',
  });

  return Comment;
};

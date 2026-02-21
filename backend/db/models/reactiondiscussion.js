'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReactionDiscussion extends Model {
    static associate(models) {
      ReactionDiscussion.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      ReactionDiscussion.belongsTo(models.Discussion, { foreignKey: 'disscussion_id', as: 'discussion' });
    }
  }

  ReactionDiscussion.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    disscussion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike', 'love', 'wow', 'haha', 'sad', 'angry'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ReactionDiscussion',
  });

  return ReactionDiscussion;
};

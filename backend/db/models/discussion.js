'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Discussion extends Model {
    static associate(models) {
      Discussion.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
      Discussion.hasMany(models.Comment, { foreignKey: 'discussion_id', as: 'comments' });
      Discussion.hasMany(models.ReactionDiscussion, { foreignKey: 'disscussion_id', as: 'reactions' });
    }
  }

  Discussion.init({
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Discussion',
  });

  return Discussion;
};

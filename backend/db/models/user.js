'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Discussion, { foreignKey: 'owner_id', as: 'discussions' });
      User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
      User.hasMany(models.Session, { foreignKey: 'u_id', as: 'sessions' });
      User.hasMany(models.ReactionDiscussion, { foreignKey: 'user_id', as: 'discussionReactions' });
      User.hasMany(models.ReactionComment, { foreignKey: 'user_id', as: 'commentReactions' });
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'u_id',
        otherKey: 'r_id',
        as: 'roles',
      });
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};

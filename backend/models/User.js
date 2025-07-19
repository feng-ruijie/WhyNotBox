const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAdmin: { // 是否有管理权限
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
});

module.exports = User;
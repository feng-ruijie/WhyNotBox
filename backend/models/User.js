const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
   id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
  balance: { // ✅ 新增字段
    type: DataTypes.FLOAT,
    defaultValue: 10.0
  }
}, {
  tableName: 'Users',  // 硡保表名正确
  modelName: 'User',
  timestamps: true
});;

module.exports = User;
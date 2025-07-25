// backend/models/BlindBox.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlindBox = sequelize.define('BlindBox', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  remaining: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  tableName: 'blind_boxes',
  timestamps: true, // 显式启用时间戳
  modelName: 'BlindBox',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});
/*BlindBox.hasMany('Item', {
  as: 'items',
  foreignKey: 'blindBoxId'
});
*/
// 同步模型

module.exports = BlindBox;
// backend/models/Item.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  probability: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  image:{
    type: DataTypes.STRING,
    allowNull: true
  },
  blindBoxId: {
    type: DataTypes.INTEGER,
    allowNull: true, // 显式定义并设置非空
    references: {
      model: 'blind_boxes', // 引用的表名
      key: 'id' // 引用的主键字段
    }
  }
}, {
  tableName: 'items',
  modelName: 'Item',
  timestamps: true
});

// 建立关联
/*Item.belongsTo('BlindBox', {
  as: 'blindBox',
  foreignKey: 'blindBoxId'
});*/

module.exports = Item;
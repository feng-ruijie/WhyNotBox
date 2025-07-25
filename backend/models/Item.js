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
    allowNull: false
  },
  probability: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  image:{
    type: DataTypes.STRING,
    allowNull: true
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
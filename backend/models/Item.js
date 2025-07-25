// backend/models/Item.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BlindBox = require('./BlindBox');

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
  timestamps: true
});

// 建立关联
BlindBox.hasMany(Item, { foreignKey: 'blindBoxId' });
Item.belongsTo(BlindBox, { foreignKey: 'blindBoxId' });

module.exports = Item;
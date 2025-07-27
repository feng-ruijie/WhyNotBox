const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blind_box_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'blind_boxes',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_opened: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_refunded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  opened_item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Items',
      key: 'id'
    }
  }
}, {
  tableName: 'orders',
  modelName: 'Order',
  timestamps: true
});

module.exports = Order;
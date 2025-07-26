module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    blind_box_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BlindBoxes',
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
    timestamps: true,
    tableName: 'orders'
  });
  
  return Order;
};
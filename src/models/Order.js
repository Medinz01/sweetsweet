// src/models/Order.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';

export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // These can be optional now if the order is linked to an address
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // The 'address' text field can be removed if you only use structured addresses
  // address: {
  //   type: DataTypes.TEXT,
  //   allowNull: true,
  // },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending',
    validate: {
      isIn: [['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']]
    }
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sellers',
      key: 'id',
    },
  },
  userId: { // Foreign Key for the user who placed the order
    type: DataTypes.INTEGER,
    allowNull: true, // Allow NULL for guest checkouts
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  shippingAddressId: { // Foreign Key for the shipping address
    type: DataTypes.INTEGER,
    allowNull: true, // Allow NULL for guest checkouts where address isn't saved
    references: {
        model: 'Addresses',
        key: 'id'
    }
  }
}, {
  tableName: 'Orders',
  timestamps: true,
});

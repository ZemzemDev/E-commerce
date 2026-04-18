const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const OrderItem = require('./OrderItem');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    shippingAddress: {
        type: DataTypes.JSON, // JSON storage in MySQL
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    paidAt: {
        type: DataTypes.DATE,
    },
}, {
    timestamps: true,
});

// Associations
Order.belongsTo(User, { as: 'user' });
User.hasMany(Order, { as: 'orders' });

Order.hasMany(OrderItem, { as: 'orderItems' });
OrderItem.belongsTo(Order, { as: 'order' });

OrderItem.belongsTo(Product, { as: 'product' });
Product.hasMany(OrderItem, { as: 'orderItems' });

module.exports = Order;
